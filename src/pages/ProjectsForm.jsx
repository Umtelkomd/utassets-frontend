import React, { useState, useEffect, useRef, useCallback } from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import axiosInstance from '../axiosConfig';
import { toast } from 'react-toastify';
import { GoogleMap, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import './ProjectsForm.css';

const containerStyle = {
    width: '100%',
    height: '400px',
    marginBottom: '1rem'
};

const center = {
    lat: 51.7189, // Centro en Paderborn, Alemania
    lng: 8.7575
};

const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: true,
    mapTypeControl: true,
    fullscreenControl: true,
    mapTypeControlOptions: {
        style: window.google?.maps?.MapTypeControlStyle?.HORIZONTAL_BAR,
        position: window.google?.maps?.ControlPosition?.TOP_CENTER,
        mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain']
    },
    zoomControlOptions: {
        position: window.google?.maps?.ControlPosition?.RIGHT_CENTER
    },
    streetViewControlOptions: {
        position: window.google?.maps?.ControlPosition?.RIGHT_CENTER
    },
    fullscreenControlOptions: {
        position: window.google?.maps?.ControlPosition?.RIGHT_TOP
    }
};

const ProjectsForm = ({
    showModal,
    setShowModal,
    currentProject,
    fetchProjects,
    formData,
    setFormData,
    isMapLoaded
}) => {
    const [selectedLocation, setSelectedLocation] = useState(center);
    const [searchValue, setSearchValue] = useState('');
    const [mapInstance, setMapInstance] = useState(null);
    const [zoom, setZoom] = useState(12);
    const searchBoxRef = useRef(null);

    // Actualizar la ubicación seleccionada cuando cambie el proyecto actual
    useEffect(() => {
        if (currentProject?.location && currentProject.location.includes(',')) {
            const coords = currentProject.location.split(',');
            if (coords.length === 2) {
                const lat = parseFloat(coords[0].trim());
                const lng = parseFloat(coords[1].trim());
                if (!isNaN(lat) && !isNaN(lng)) {
                    const location = { lat, lng };
                    setSelectedLocation(location);

                    // Obtener dirección para mostrar en el campo de búsqueda
                    if (window.google && window.google.maps) {
                        const geocoder = new window.google.maps.Geocoder();
                        geocoder.geocode({ location }, (results, status) => {
                            if (status === 'OK' && results[0]) {
                                setSearchValue(results[0].formatted_address);
                            }
                        });
                    }
                }
            }
        } else {
            setSelectedLocation(center);
            setSearchValue('');
        }
    }, [currentProject, isMapLoaded]);

    const onMapLoad = useCallback((map) => {
        setMapInstance(map);
    }, []);

    const onSearchBoxLoad = useCallback((searchBox) => {
        searchBoxRef.current = searchBox;
    }, []);

    const onPlacesChanged = useCallback(() => {
        if (searchBoxRef.current) {
            const places = searchBoxRef.current.getPlaces();
            if (places && places.length > 0) {
                const place = places[0];
                const location = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                };
                setSelectedLocation(location);
                setFormData({
                    ...formData,
                    location: `${location.lat},${location.lng}`
                });
                if (mapInstance) {
                    mapInstance.panTo(location);
                    mapInstance.setZoom(15);
                }
                setSearchValue(place.formatted_address || place.name);
            }
        }
    }, [formData, setFormData, mapInstance]);

    const getCurrentLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setSelectedLocation(location);
                    setFormData({
                        ...formData,
                        location: `${location.lat},${location.lng}`
                    });
                    if (mapInstance) {
                        mapInstance.panTo(location);
                        mapInstance.setZoom(15);
                    }
                    // Obtener dirección reversa
                    const geocoder = new window.google.maps.Geocoder();
                    geocoder.geocode({ location }, (results, status) => {
                        if (status === 'OK' && results[0]) {
                            setSearchValue(results[0].formatted_address);
                        }
                    });
                    toast.success('Ubicación actual obtenida');
                },
                (error) => {
                    toast.error('No se pudo obtener la ubicación actual');
                    console.error('Error getting location:', error);
                }
            );
        } else {
            toast.error('Geolocalización no soportada por este navegador');
        }
    }, [formData, setFormData, mapInstance]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleMapClick = useCallback((e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        const location = { lat, lng };
        setSelectedLocation(location);
        setFormData({
            ...formData,
            location: `${lat},${lng}`
        });

        // Obtener dirección reversa para mostrar en el campo de búsqueda
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location }, (results, status) => {
            if (status === 'OK' && results[0]) {
                setSearchValue(results[0].formatted_address);
            }
        });
    }, [formData, setFormData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Preparar los datos para enviar
            const dataToSend = {
                ...formData,
                // Si endDate está vacío, enviar null
                endDate: formData.endDate || null
            };

            if (currentProject?.id) {
                // Actualización
                await axiosInstance.put(`/projects/${currentProject.id}`, dataToSend);
                toast.success('Proyecto actualizado exitosamente');
            } else {
                // Creación
                await axiosInstance.post('/projects', dataToSend);
                toast.success('Proyecto creado exitosamente');
            }

            setShowModal(false);
            setFormData({
                name: '',
                description: '',
                startDate: '',
                endDate: '',
                status: 'activo',
                location: ''
            });
            fetchProjects();
        } catch (error) {

            const errorMessage = error.response?.data?.message ||
                (currentProject?.id
                    ? 'No se pudo actualizar el proyecto'
                    : 'No se pudo crear el proyecto'
                );
            toast.error(errorMessage);
        }
    };

    if (!showModal) return null;

    return (
        <div className="projects-form">
            <div className="modal-backdrop">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>{currentProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
                        <button className="close-button" onClick={() => setShowModal(false)}>
                            <CancelIcon />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Nombre del Proyecto *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Descripción</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Ubicación</label>
                            <div className="map-search-container">
                                <div className="search-controls">
                                    {isMapLoaded && (
                                        <StandaloneSearchBox
                                            onLoad={onSearchBoxLoad}
                                            onPlacesChanged={onPlacesChanged}
                                        >
                                            <div className="search-input-container">
                                                <input
                                                    type="text"
                                                    placeholder="Buscar ubicación (ciudad, dirección, lugar...)"
                                                    value={searchValue}
                                                    onChange={(e) => setSearchValue(e.target.value)}
                                                    className="location-search-input"
                                                />
                                                <SearchIcon className="search-icon" />
                                            </div>
                                        </StandaloneSearchBox>
                                    )}
                                    <button
                                        type="button"
                                        onClick={getCurrentLocation}
                                        className="current-location-btn"
                                        title="Usar mi ubicación actual"
                                    >
                                        <MyLocationIcon />
                                    </button>
                                </div>
                            </div>

                            {isMapLoaded ? (
                                <div className="map-container">
                                    <GoogleMap
                                        mapContainerStyle={containerStyle}
                                        center={selectedLocation}
                                        zoom={zoom}
                                        options={mapOptions}
                                        onClick={handleMapClick}
                                        onLoad={onMapLoad}
                                        onZoomChanged={() => {
                                            if (mapInstance) {
                                                setZoom(mapInstance.getZoom());
                                            }
                                        }}
                                    >
                                        {selectedLocation && (
                                            <Marker
                                                position={selectedLocation}
                                                animation={window.google?.maps?.Animation?.DROP}
                                            />
                                        )}
                                    </GoogleMap>
                                    <div className="map-instructions">
                                        <p>
                                            <strong>💡 Instrucciones:</strong>
                                            <br />• Busca una ubicación en el campo de arriba
                                            <br />• Haz clic en el mapa para seleccionar una ubicación
                                            <br />• Usa el botón 📍 para obtener tu ubicación actual
                                            <br />• Usa los controles del mapa para cambiar vista (satélite, terreno, etc.)
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
                                    <p>Cargando mapa...</p>
                                </div>
                            )}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="startDate">Fecha de Inicio *</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="endDate">Fecha de Finalización</label>
                                <input
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="status">Estado *</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="activo">ACTIVO</option>
                                <option value="pendiente">PENDIENTE</option>
                                <option value="completado">COMPLETADO</option>
                                <option value="cancelado">CANCELADO</option>
                            </select>
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={() => setShowModal(false)} className="cancel-button">
                                Cancelar
                            </button>
                            <button type="submit" className="submit-button">
                                {currentProject ? 'Actualizar Proyecto' : 'Crear Proyecto'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProjectsForm; 
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ProjectsForm from './ProjectsForm';
import './Projects.css';
import LoadingSpinner from '../components/LoadingSpinner';
import * as projectService from '../services/projectService.js';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useJsApiLoader } from '@react-google-maps/api';

// Iconos
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Sort as SortIcon,
    FilterList as FilterListIcon,
    LocationOn as LocationOnIcon,
    CalendarToday as CalendarTodayIcon,
    Cancel as CancelIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';

// Coordenadas por defecto (Paderborn, Alemania)
const DEFAULT_LOCATION = {
    lat: 51.7189,
    lng: 8.7575
};

const MapPreview = ({ location }) => {
    if (!location) return null;

    let lat, lng;

    // Intentar parsear la ubicación en diferentes formatos
    if (typeof location === 'string') {
        // Si es una cadena, intentar dividir por coma
        const coords = location.split(',').map(coord => parseFloat(coord.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            [lat, lng] = coords;
        }
    } else if (location.lat && location.lng) {
        // Si es un objeto con lat y lng
        lat = parseFloat(location.lat);
        lng = parseFloat(location.lng);
    }

    // Si no se pudieron obtener coordenadas válidas, mostrar un mensaje
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        return (
            <div className="map-preview map-error">
                <LocationOnIcon />
                <p>Ubicación no disponible</p>
            </div>
        );
    }

    // Usar OpenStreetMap para la vista previa
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;

    return (
        <div className="map-preview">
            <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                allowFullScreen=""
                aria-hidden="false"
                tabIndex="0"
                title="Ubicación del proyecto"
            />
            <div className="map-coordinates">
                <LocationOnIcon />
                <span>{lat.toFixed(4)}, {lng.toFixed(4)}</span>
            </div>
        </div>
    );
};

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [currentProject, setCurrentProject] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: `${DEFAULT_LOCATION.lat},${DEFAULT_LOCATION.lng}`,
        startDate: '',
        endDate: '',
        status: 'activo'
    });

    // Cargar la API de Google Maps una sola vez a nivel superior con librerías adicionales
    const { isLoaded: isMapLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API,
        libraries: ['places', 'geometry']
    });

    /* Ubicaciones importantes para la empresa */
    const companyLocations = [
        {
            country: 'Colombia',
            city: 'Manizales',
            name: 'Oficina Central',
            description: 'Sede principal de la empresa',
            coordinates: { lat: 5.0689, lng: -75.5174 },
            address: 'Calle 23 # 23-23'
        },
        {
            country: 'Colombia',
            city: 'Manizales',
            name: 'Taller de Mantenimiento',
            description: 'Centro de reparación y mantenimiento',
            coordinates: { lat: 5.0689, lng: -75.5174 },
            address: 'Calle 24 # 24-24'
        },
        {
            country: 'Colombia',
            city: 'Bogotá',
            name: 'Oficina Central',
            description: 'Sede principal de la empresa',
            coordinates: { lat: 4.6097, lng: -74.0845 },
            address: 'Carrera 7 # 7-7'
        },
        {
            country: 'Colombia',
            city: 'Bogotá',
            name: 'Almacén de Suministros',
            description: 'Depósito de materiales y herramientas',
            coordinates: { lat: 4.6097, lng: -74.0845 },
            address: 'Carrera 8 # 8-8'
        },
        {
            country: 'Alemania',
            city: 'Berlín',
            name: 'Oficina Central',
            description: 'Sede principal en Europa',
            coordinates: { lat: 52.5200, lng: 13.4050 },
            address: 'Unter den Linden 1'
        },
        {
            country: 'Alemania',
            city: 'Berlín',
            name: 'Centro de Distribución',
            description: 'Centro logístico principal',
            coordinates: { lat: 52.5200, lng: 13.4050 },
            address: 'Friedrichstraße 2'
        },
        {
            country: 'Alemania',
            city: 'Múnich',
            name: 'Oficina Regional',
            description: 'Sede regional sur de Alemania',
            coordinates: { lat: 48.1351, lng: 11.5820 },
            address: 'Marienplatz 1'
        }
    ];

    // Agrupar ubicaciones por país y ciudad
    const locationsByCountry = companyLocations.reduce((acc, location) => {
        const country = location.country || 'Desconocido';
        const city = location.city || 'Desconocida';
        if (!acc[country]) {
            acc[country] = {};
        }
        if (!acc[country][city]) {
            acc[country][city] = [];
        }
        acc[country][city].push(location);
        return acc;
    }, {});

    const getGoogleMapsLink = (location) => {
        if (!location.coordinates || typeof location.coordinates.lat !== 'number' || typeof location.coordinates.lng !== 'number') {
            return '#'; // Evitar error si no hay coordenadas
        }
        return `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`;
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await projectService.getProjects();
            setProjects(data);
            setLoading(false);
        } catch (error) {

            toast.error('No se pudieron cargar los proyectos');
            setLoading(false);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleDeleteClick = (project) => {
        setProjectToDelete(project);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await projectService.deleteProject(projectToDelete.id);
            toast.success('Proyecto eliminado exitosamente');
            fetchProjects();
            setShowDeleteModal(false);
            setProjectToDelete(null);
        } catch (error) {

            toast.error('No se pudo eliminar el proyecto');
        }
    };

    const openViewModal = (project) => {
        setCurrentProject(project);
        setShowViewModal(true);
    };

    const openEditModal = (project) => {
        setCurrentProject(project);
        setFormData({
            name: project.name,
            description: project.description || '',
            location: project.location || '',
            startDate: formatDateForInput(project.startDate),
            endDate: formatDateForInput(project.endDate),
            status: project.status
        });
        setShowAddModal(true);
    };

    const handleAddNew = () => {
        setCurrentProject(null);
        setFormData({
            name: '',
            description: '',
            location: `${DEFAULT_LOCATION.lat},${DEFAULT_LOCATION.lng}`,
            startDate: '',
            endDate: '',
            status: 'activo'
        });
        setShowAddModal(true);
    };

    // Filtrar proyectos
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (project.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.location.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Ordenar proyectos
    const sortedProjects = [...filteredProjects].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    // Formateo de fecha
    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    // Obtener clase de estado
    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'activo':
                return 'status-active';
            case 'completado':
                return 'status-completed';
            case 'cancelado':
                return 'status-cancelled';
            case 'pendiente':
                return 'status-pending';
            default:
                return '';
        }
    };

    // Formatear estado en mayúsculas
    const formatStatus = (status) => {
        return status.toUpperCase();
    };

    if (loading) {
        return <LoadingSpinner message="Cargando proyectos..." />;
    }

    return (
        <div className="projects-container">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Gestión de Proyectos</h2>
                    <div className="header-buttons">
                        <button
                            className="add-project-button"
                            onClick={handleAddNew}
                        >
                            <AddIcon /> Nuevo Proyecto
                        </button>
                    </div>
                </div>

                <div className="search-filters-section">
                    <div className="search-box">
                        <SearchIcon className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar proyectos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filters">
                        <div className="filter">
                            <FilterListIcon className="filter-icon" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">TODOS LOS ESTADOS</option>
                                <option value="activo">ACTIVO</option>
                                <option value="completado">COMPLETADO</option>
                                <option value="pendiente">PENDIENTE</option>
                                <option value="cancelado">CANCELADO</option>
                            </select>
                        </div>

                        <div className="filter">
                            <SortIcon className="filter-icon" />
                            <select
                                value={`${sortConfig.key}-${sortConfig.direction}`}
                                onChange={(e) => {
                                    const [key, direction] = e.target.value.split('-');
                                    setSortConfig({ key, direction });
                                }}
                            >
                                <option value="name-asc">Nombre (A-Z)</option>
                                <option value="name-desc">Nombre (Z-A)</option>
                                <option value="startDate-asc">Fecha inicio (antigua)</option>
                                <option value="startDate-desc">Fecha inicio (reciente)</option>
                                <option value="endDate-asc">Fecha fin (antigua)</option>
                                <option value="endDate-desc">Fecha fin (reciente)</option>
                                <option value="status-asc">Estado (A-Z)</option>
                                <option value="status-desc">Estado (Z-A)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {sortedProjects.length === 0 ? (
                    <div className="no-items">
                        <p>No se encontraron proyectos con los filtros aplicados.</p>
                    </div>
                ) : (
                    <div className="projects-grid">
                        {sortedProjects.map((project) => (
                            <div key={project.id} className="project-card">
                                <div className="project-card-header">
                                    <h3 className="project-name">{project.name}</h3>
                                    <span className={`status-badge ${getStatusClass(project.status)}`}>
                                        {formatStatus(project.status)}
                                    </span>
                                </div>

                                <div className="project-card-body">
                                    <p className="project-description">
                                        {project.description || 'Sin descripción'}
                                    </p>

                                    {project.location && (
                                        <MapPreview location={project.location} />
                                    )}

                                    <div className="project-info">
                                        <div className="info-item">
                                            <LocationOnIcon />
                                            {project.location ? (
                                                <a
                                                    href={`https://www.google.com/maps?q=${project.location}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="location-link"
                                                >
                                                    Ver en mapa
                                                </a>
                                            ) : (
                                                'Sin ubicación'
                                            )}
                                        </div>

                                        <div className="info-item">
                                            <CalendarTodayIcon />
                                            <span>Inicio: {formatDate(project.startDate)}</span>
                                        </div>

                                        <div className="info-item">
                                            <CalendarTodayIcon />
                                            <span>Fin: {formatDate(project.endDate)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="project-card-actions">
                                    <button
                                        onClick={() => openViewModal(project)}
                                        className="btn-action view"
                                        title="Ver detalles"
                                    >
                                        <VisibilityIcon />
                                    </button>
                                    <button
                                        onClick={() => openEditModal(project)}
                                        className="btn-action edit"
                                        title="Editar"
                                    >
                                        <EditIcon />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(project)}
                                        className="btn-action delete"
                                        title="Eliminar"
                                    >
                                        <DeleteIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Ubicaciones importantes */}
            <div className="card locations-card">
                <div className="card-header">
                    <h2 className="card-title">
                        <LocationOnIcon />
                        Ubicaciones Importantes de la Empresa
                    </h2>
                </div>
                <div className="locations-container">
                    {Object.entries(locationsByCountry).map(([country, cities]) => (
                        <div key={country} className="country-group">
                            <h3 className="country-name">{country}</h3>
                            {Object.entries(cities).map(([city, locations]) => (
                                <div key={city} className="city-group">
                                    <h4 className="city-name">{city}</h4>
                                    <div className="city-locations">
                                        {locations.map((location, index) => (
                                            <a
                                                key={`${location.name}-${index}`}
                                                href={getGoogleMapsLink(location)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="location-tile"
                                                title={`Abrir ${location.name} en Google Maps`}
                                            >
                                                <div className="location-tile-content">
                                                    <div className="location-tile-header">
                                                        <LocationOnIcon className="location-icon" />
                                                        <div className="location-tile-info">
                                                            <h4>{location.name || 'Nombre no disponible'}</h4>
                                                            <p>{location.description || 'Sin descripción'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="location-tile-address">
                                                        <span>{location.address || 'Dirección no disponible'}</span>
                                                    </div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de formulario */}
            <ProjectsForm
                showModal={showAddModal}
                setShowModal={setShowAddModal}
                currentProject={currentProject}
                fetchProjects={fetchProjects}
                formData={formData}
                setFormData={setFormData}
                isMapLoaded={isMapLoaded}
            />

            {/* Modal para ver detalles del proyecto */}
            {showViewModal && currentProject && (
                <div className="modal-backdrop">
                    <div className="modal-content view-modal">
                        <div className="modal-header">
                            <h2>Detalles del Proyecto</h2>
                            <button className="close-button" onClick={() => setShowViewModal(false)}>
                                <CancelIcon />
                            </button>
                        </div>
                        <div className="project-view-content">
                            <div className="project-view-header">
                                <div className="project-title-section">
                                    <h3>{currentProject.name}</h3>
                                    <span className={`status-badge ${getStatusClass(currentProject.status)}`}>
                                        {formatStatus(currentProject.status)}
                                    </span>
                                </div>
                                <div className="project-dates">
                                    <div className="date-item">
                                        <CalendarTodayIcon />
                                        <div>
                                            <label>Fecha de Inicio</label>
                                            <p>{formatDate(currentProject.startDate)}</p>
                                        </div>
                                    </div>
                                    <div className="date-item">
                                        <CalendarTodayIcon />
                                        <div>
                                            <label>Fecha de Finalización</label>
                                            <p>{formatDate(currentProject.endDate)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="project-view-section">
                                <h4>Descripción</h4>
                                <p className="project-description">
                                    {currentProject.description || 'Sin descripción'}
                                </p>
                            </div>

                            <div className="project-view-section">
                                <h4>Ubicación</h4>
                                <div className="location-section">
                                    {currentProject.location ? (
                                        <>
                                            <MapPreview location={currentProject.location} />
                                            <div className="location-details">
                                                <a
                                                    href={`https://www.google.com/maps?q=${currentProject.location}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="view-in-maps-button"
                                                >
                                                    <LocationOnIcon />
                                                    Ver en Google Maps
                                                </a>
                                                <p className="coordinates">
                                                    Coordenadas: {currentProject.location}
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="no-location">No se ha especificado una ubicación</p>
                                    )}
                                </div>
                            </div>

                            <div className="project-view-footer">
                                <button
                                    onClick={() => {
                                        setShowViewModal(false);
                                        openEditModal(currentProject);
                                    }}
                                    className="btn-action edit"
                                >
                                    <EditIcon /> Editar Proyecto
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setProjectToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Eliminar Proyecto"
                message={`¿Estás seguro de que deseas eliminar el proyecto "${projectToDelete?.name}"? Esta acción no se puede deshacer.`}
            />
        </div>
    );
};

export default Projects; 
import React, { useState } from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import axiosInstance from '../axiosConfig';
import { toast } from 'react-toastify';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import './ProjectsForm.css';

const containerStyle = {
    width: '100%',
    height: '300px',
    marginBottom: '1rem'
};

const center = {
    lat: 51.7189, // Centro en Paderborn, Alemania
    lng: 8.7575
};

const ProjectsForm = ({
    showModal,
    setShowModal,
    currentProject,
    fetchProjects,
    formData,
    setFormData
}) => {
    const [selectedLocation, setSelectedLocation] = useState(
        currentProject?.location ? {
            lat: parseFloat(currentProject.location.split(',')[0]),
            lng: parseFloat(currentProject.location.split(',')[1])
        } : center
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleMapClick = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setSelectedLocation({ lat, lng });
        setFormData({
            ...formData,
            location: `${lat},${lng}`
        });
    };

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
                        <label>Ubicación (Haz clic en el mapa para seleccionar)</label>
                        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API}>
                            <GoogleMap
                                mapContainerStyle={containerStyle}
                                center={selectedLocation}
                                zoom={12}
                                onClick={handleMapClick}
                            >
                                {selectedLocation && (
                                    <Marker
                                        position={selectedLocation}
                                    />
                                )}
                            </GoogleMap>
                        </LoadScript>
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
    );
};

export default ProjectsForm; 
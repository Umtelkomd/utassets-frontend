import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import './MaintenanceHistory.css';

// Iconos de Material UI
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BuildIcon from '@mui/icons-material/Build';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

const MaintenanceHistory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [maintenanceHistory, setMaintenanceHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isFromInventory, setIsFromInventory] = useState(
        localStorage.getItem('fromInventory') === 'true'
    );
    const [isFromVehicle, setIsFromVehicle] = useState(false);

    const initialFormState = {
        date: new Date().toISOString().split('T')[0],
        type: 'Preventivo',
        description: '',
        cost: '',
        technician: '',
        next_maintenance_date: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Primero, intentar cargar el item desde el inventario
            const inventoryResponse = await axios.get(`${API_URL}/inventory/${id}`);
            setItem(inventoryResponse.data);

            // Verificar si es un vehículo
            if (inventoryResponse.data.category === 'Vehículo') {
                try {
                    // Intentar obtener los datos del vehículo
                    const vehicleResponse = await axios.get(`${API_URL}/vehicles/${id}`);
                    setIsFromVehicle(true);
                } catch (vehicleError) {
                    console.error('No se pudo cargar el vehículo asociado:', vehicleError);
                }
            }

            // Cargar el historial de mantenimiento
            try {
                const maintenanceResponse = await axios.get(`${API_URL}/maintenance/${id}`);
                if (maintenanceResponse.data) {
                    // Ordenar por fecha más reciente primero
                    const sortedHistory = maintenanceResponse.data.sort((a, b) =>
                        new Date(b.date) - new Date(a.date)
                    );
                    setMaintenanceHistory(sortedHistory);
                }
            } catch (maintenanceError) {
                console.error('Error cargando historial de mantenimiento:', maintenanceError);
                // Si el historial de mantenimiento no existe, lo manejamos silenciosamente
                setMaintenanceHistory([]);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            toast.error('Error al cargar los datos del item');
            // Redirigir a la página anterior
            navigate(-1);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Por favor complete todos los campos obligatorios');
            return;
        }

        setIsLoading(true);

        try {
            const formDataToSend = {
                item_id: id,
                ...formData,
                cost: parseFloat(formData.cost)
            };

            let response;
            if (editingId) {
                // Actualizar registro existente
                response = await axios.put(`${API_URL}/maintenance/${editingId}`, formDataToSend);
                toast.success('Registro de mantenimiento actualizado correctamente');
            } else {
                // Crear nuevo registro
                response = await axios.post(`${API_URL}/maintenance`, formDataToSend);
                toast.success('Registro de mantenimiento añadido correctamente');
            }

            // Actualizar fecha de último mantenimiento y próximo mantenimiento en el inventario
            await axios.put(`${API_URL}/inventory/${id}`, {
                last_maintenance_date: formData.date,
                next_maintenance_date: formData.next_maintenance_date
            });

            // Refrescar datos
            fetchData();

            // Resetear formulario
            setFormData(initialFormState);
            setShowAddForm(false);
            setEditingId(null);
        } catch (error) {
            console.error('Error al guardar mantenimiento:', error);
            toast.error('Error al guardar el registro de mantenimiento');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (maintenanceItem) => {
        setFormData({
            date: maintenanceItem.date.split('T')[0],
            type: maintenanceItem.type,
            description: maintenanceItem.description,
            cost: maintenanceItem.cost.toString(),
            technician: maintenanceItem.technician,
            next_maintenance_date: maintenanceItem.next_maintenance_date ?
                maintenanceItem.next_maintenance_date.split('T')[0] : ''
        });
        setEditingId(maintenanceItem.id);
        setShowAddForm(true);

        // Hacer scroll hacia el formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (maintenanceId) => {
        if (window.confirm('¿Estás seguro de eliminar este registro de mantenimiento?')) {
            try {
                await axios.delete(`${API_URL}/maintenance/${maintenanceId}`);
                toast.success('Registro eliminado correctamente');
                fetchData();
            } catch (error) {
                console.error('Error al eliminar:', error);
                toast.error('Error al eliminar el registro');
            }
        }
    };

    const validateForm = () => {
        return (
            formData.date &&
            formData.type &&
            formData.description
        );
    };

    const handleBack = () => {
        if (isFromVehicle) {
            navigate(`/vehicles/${id}`);
        } else if (isFromInventory) {
            navigate('/inventory');
        } else {
            navigate(-1);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (isLoading && !item) {
        return (
            <div className="page-loading-spinner">
                <p>Cargando datos...</p>
            </div>
        );
    }

    return (
        <div className="maintenance-history-page">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">
                        <BuildIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        Historial de Mantenimiento
                    </h2>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={handleBack}
                    >
                        <ArrowBackIcon /> Volver
                    </button>
                </div>

                {item && (
                    <div className="item-details">
                        <div className="item-name">{item.item_name}</div>
                        <div className="item-info">
                            <span className="item-code">{item.item_code}</span>
                            <span className="item-category">{item.category}</span>
                            <span className={`item-condition ${item.condition.toLowerCase().replace(' ', '-')}`}>
                                {item.condition}
                            </span>
                        </div>
                    </div>
                )}

                {showAddForm && (
                    <div className="maintenance-form-container">
                        <h3>{editingId ? 'Editar Registro' : 'Nuevo Registro de Mantenimiento'}</h3>
                        <form onSubmit={handleSubmit} className="maintenance-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="date">
                                        <DateRangeIcon /> Fecha*
                                    </label>
                                    <input
                                        type="date"
                                        id="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="type">
                                        <BuildIcon /> Tipo*
                                    </label>
                                    <select
                                        id="type"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="Preventivo">Preventivo</option>
                                        <option value="Correctivo">Correctivo</option>
                                        <option value="Predictivo">Predictivo</option>
                                        <option value="Rutinario">Rutinario</option>
                                        <option value="Emergencia">Emergencia</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="cost">
                                        <AttachMoneyIcon /> Costo
                                    </label>
                                    <input
                                        type="number"
                                        id="cost"
                                        name="cost"
                                        step="0.01"
                                        min="0"
                                        value={formData.cost}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="technician">
                                        <PersonIcon /> Técnico
                                    </label>
                                    <input
                                        type="text"
                                        id="technician"
                                        name="technician"
                                        value={formData.technician}
                                        onChange={handleInputChange}
                                        placeholder="Nombre del técnico"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="next_maintenance_date">
                                        <DateRangeIcon /> Próximo Mantenimiento
                                    </label>
                                    <input
                                        type="date"
                                        id="next_maintenance_date"
                                        name="next_maintenance_date"
                                        value={formData.next_maintenance_date}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="description">
                                    <DescriptionIcon /> Descripción*
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    required
                                    placeholder="Describa el mantenimiento realizado"
                                ></textarea>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setEditingId(null);
                                        setFormData(initialFormState);
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isLoading}
                                >
                                    {editingId ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="maintenance-actions">
                    {!showAddForm && (
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setFormData(initialFormState);
                                setShowAddForm(true);
                                setEditingId(null);
                            }}
                        >
                            <AddIcon /> Añadir Mantenimiento
                        </button>
                    )}
                </div>

                {maintenanceHistory.length > 0 ? (
                    <div className="history-list">
                        {maintenanceHistory.map((maintenance) => (
                            <div key={maintenance.id} className="history-item">
                                <div className="history-header">
                                    <div className="history-date">
                                        <DateRangeIcon />
                                        {formatDate(maintenance.date)}
                                    </div>
                                    <div className={`history-type ${maintenance.type.toLowerCase()}`}>
                                        {maintenance.type}
                                    </div>
                                    <div className="history-actions">
                                        <button
                                            className="btn-action edit"
                                            onClick={() => handleEdit(maintenance)}
                                            title="Editar"
                                        >
                                            <EditIcon />
                                        </button>
                                        <button
                                            className="btn-action delete"
                                            onClick={() => handleDelete(maintenance.id)}
                                            title="Eliminar"
                                        >
                                            <DeleteIcon />
                                        </button>
                                    </div>
                                </div>
                                <div className="history-description">
                                    {maintenance.description}
                                </div>
                                <div className="history-details">
                                    {maintenance.cost > 0 && (
                                        <div className="history-cost">
                                            <AttachMoneyIcon />
                                            {maintenance.cost.toFixed(2)}
                                        </div>
                                    )}
                                    {maintenance.technician && (
                                        <div className="history-technician">
                                            <PersonIcon />
                                            {maintenance.technician}
                                        </div>
                                    )}
                                    {maintenance.next_maintenance_date && (
                                        <div className="history-next-date">
                                            <DateRangeIcon />
                                            Próximo: {formatDate(maintenance.next_maintenance_date)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-history">
                        <BuildIcon style={{ fontSize: '48px', opacity: 0.5 }} />
                        <p>No hay registros de mantenimiento para este item.</p>
                        <p>Añade el primer registro usando el botón "Añadir Mantenimiento".</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaintenanceHistory;

import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './MaintenanceSchedule.css';

// Iconos
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BuildIcon from '@mui/icons-material/Build';
import InventoryIcon from '@mui/icons-material/Inventory';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ScheduleIcon from '@mui/icons-material/Schedule';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

const MaintenanceSchedule = () => {
    const [schedules, setSchedules] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentSchedule, setCurrentSchedule] = useState(null);
    const [formData, setFormData] = useState({
        assetId: '',
        assetType: 'vehicle',
        maintenanceType: 'preventivo',
        description: '',
        scheduledDate: '',
        status: 'pendiente',
        priority: 'normal',
        technician: '',
        notes: '',
    });

    useEffect(() => {
        fetchSchedules();
        fetchAssets();
    }, []);

    const fetchSchedules = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/maintenance/schedules');
            setSchedules(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar programaciones:', error);
            toast.error('No se pudieron cargar las programaciones de mantenimiento');
            setLoading(false);
        }
    };

    const fetchAssets = async () => {
        try {
            // Obtener vehículos e inventario
            const vehiclesResponse = await axios.get('/api/vehicles');
            const inventoryResponse = await axios.get('/api/inventory');

            const vehicles = vehiclesResponse.data.map(vehicle => ({
                ...vehicle,
                type: 'vehicle'
            }));

            const inventory = inventoryResponse.data.map(item => ({
                ...item,
                type: 'inventory'
            }));

            setAssets([...vehicles, ...inventory]);
        } catch (error) {
            console.error('Error al cargar activos:', error);
            toast.error('No se pudieron cargar los activos');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Si se cambia el tipo de activo, resetear el ID del activo
        if (name === 'assetType') {
            setFormData(prev => ({
                ...prev,
                assetId: ''
            }));
        }
    };

    const handleAddSchedule = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/maintenance/schedules', formData);
            toast.success('Mantenimiento programado exitosamente');
            setShowAddModal(false);
            resetForm();
            fetchSchedules();
        } catch (error) {
            console.error('Error al programar mantenimiento:', error);
            toast.error('No se pudo programar el mantenimiento');
        }
    };

    const handleEditSchedule = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/maintenance/schedules/${currentSchedule._id}`, formData);
            toast.success('Programación actualizada exitosamente');
            setShowAddModal(false);
            fetchSchedules();
        } catch (error) {
            console.error('Error al actualizar programación:', error);
            toast.error('No se pudo actualizar la programación');
        }
    };

    const handleDeleteSchedule = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta programación?')) {
            try {
                await axios.delete(`/api/maintenance/schedules/${id}`);
                toast.success('Programación eliminada exitosamente');
                fetchSchedules();
            } catch (error) {
                console.error('Error al eliminar programación:', error);
                toast.error('No se pudo eliminar la programación');
            }
        }
    };

    const openEditModal = (schedule) => {
        const asset = assets.find(a => a._id === schedule.assetId);

        setCurrentSchedule(schedule);
        setFormData({
            assetId: schedule.assetId,
            assetType: asset?.type || 'vehicle',
            maintenanceType: schedule.maintenanceType,
            description: schedule.description,
            scheduledDate: schedule.scheduledDate.split('T')[0],
            status: schedule.status,
            priority: schedule.priority,
            technician: schedule.technician,
            notes: schedule.notes || '',
        });
        setShowAddModal(true);
    };

    const resetForm = () => {
        setFormData({
            assetId: '',
            assetType: 'vehicle',
            maintenanceType: 'preventivo',
            description: '',
            scheduledDate: '',
            status: 'pendiente',
            priority: 'normal',
            technician: '',
            notes: '',
        });
        setCurrentSchedule(null);
    };

    // Filtrar activos según el tipo seleccionado
    const filteredAssets = assets.filter(asset => asset.type === formData.assetType);

    // Filtrar y buscar en las programaciones
    const filteredSchedules = schedules.filter(schedule => {
        const asset = assets.find(a => a._id === schedule.assetId);
        const assetName = asset ? (asset.plate || asset.name || 'Desconocido') : 'Desconocido';

        const matchesSearch =
            assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            schedule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            schedule.technician.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === 'all' ||
            (typeFilter === 'vehicle' && asset?.type === 'vehicle') ||
            (typeFilter === 'inventory' && asset?.type === 'inventory');

        const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
    });

    // Formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Obtener clase de estado
    const getStatusClass = (status) => {
        switch (status) {
            case 'completado':
                return 'status-completed';
            case 'pendiente':
                return 'status-pending';
            case 'en-progreso':
                return 'status-in-progress';
            case 'cancelado':
                return 'status-cancelled';
            default:
                return '';
        }
    };

    // Obtener clase de prioridad
    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'alta':
                return 'priority-high';
            case 'normal':
                return 'priority-normal';
            case 'baja':
                return 'priority-low';
            default:
                return '';
        }
    };

    // Obtener ícono de estado
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completado':
                return <CheckCircleIcon />;
            case 'pendiente':
                return <ScheduleIcon />;
            case 'en-progreso':
                return <BuildIcon />;
            case 'cancelado':
                return <CancelIcon />;
            default:
                return null;
        }
    };

    // Obtener nombre de activo
    const getAssetName = (assetId) => {
        const asset = assets.find(a => a._id === assetId);
        if (!asset) return 'Desconocido';

        return asset.type === 'vehicle'
            ? `${asset.brand} ${asset.model} (${asset.plate})`
            : asset.name;
    };

    return (
        <div className="maintenance-schedule-container">
            <div className="schedule-header">
                <h1>Programación de Mantenimientos</h1>
                <button
                    className="add-schedule-button"
                    onClick={() => {
                        resetForm();
                        setShowAddModal(true);
                    }}
                >
                    <AddIcon /> Programar Mantenimiento
                </button>
            </div>

            <div className="search-filters-section">
                <div className="search-box">
                    <SearchIcon className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar programaciones..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filters">
                    <div className="filter">
                        <FilterListIcon className="filter-icon" />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="all">Todos los tipos</option>
                            <option value="vehicle">Vehículos</option>
                            <option value="inventory">Inventario</option>
                        </select>
                    </div>

                    <div className="filter">
                        <FilterListIcon className="filter-icon" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Todos los estados</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="en-progreso">En progreso</option>
                            <option value="completado">Completado</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-container">Cargando programaciones...</div>
            ) : (
                <div className="schedule-grid">
                    {filteredSchedules.length === 0 ? (
                        <div className="no-results">No se encontraron programaciones con los filtros actuales.</div>
                    ) : (
                        filteredSchedules.map(schedule => {
                            const asset = assets.find(a => a._id === schedule.assetId);
                            const isVehicle = asset?.type === 'vehicle';

                            return (
                                <div className="schedule-card" key={schedule._id}>
                                    <div className={`schedule-priority ${getPriorityClass(schedule.priority)}`}></div>
                                    <div className="schedule-header-section">
                                        <div className="asset-type-icon">
                                            {isVehicle ? <DirectionsCarIcon /> : <InventoryIcon />}
                                        </div>
                                        <div className="schedule-title">
                                            <h3>{getAssetName(schedule.assetId)}</h3>
                                            <div className={`schedule-status ${getStatusClass(schedule.status)}`}>
                                                {getStatusIcon(schedule.status)}
                                                <span>{schedule.status}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="schedule-details">
                                        <div className="schedule-detail">
                                            <BuildIcon className="detail-icon" />
                                            <span>{schedule.maintenanceType}</span>
                                        </div>
                                        <div className="schedule-detail">
                                            <CalendarTodayIcon className="detail-icon" />
                                            <span>{formatDate(schedule.scheduledDate)}</span>
                                        </div>
                                    </div>

                                    <div className="schedule-description">
                                        <p>{schedule.description}</p>
                                    </div>

                                    <div className="schedule-footer">
                                        <div className="technician-info">
                                            <span>Técnico: {schedule.technician || 'No asignado'}</span>
                                        </div>
                                        <div className="schedule-actions">
                                            <button onClick={() => openEditModal(schedule)} className="edit-button">
                                                <EditIcon />
                                            </button>
                                            <button onClick={() => handleDeleteSchedule(schedule._id)} className="delete-button">
                                                <DeleteIcon />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Modal para añadir/editar programación */}
            {showAddModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{currentSchedule ? 'Editar Programación' : 'Nueva Programación'}</h2>
                            <button className="close-button" onClick={() => setShowAddModal(false)}>
                                <CancelIcon />
                            </button>
                        </div>
                        <form onSubmit={currentSchedule ? handleEditSchedule : handleAddSchedule}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="assetType">Tipo de Activo *</label>
                                    <select
                                        id="assetType"
                                        name="assetType"
                                        value={formData.assetType}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="vehicle">Vehículo</option>
                                        <option value="inventory">Inventario</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="assetId">Activo *</label>
                                    <select
                                        id="assetId"
                                        name="assetId"
                                        value={formData.assetId}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Seleccione un activo</option>
                                        {filteredAssets.map(asset => (
                                            <option key={asset._id} value={asset._id}>
                                                {formData.assetType === 'vehicle'
                                                    ? `${asset.brand} ${asset.model} (${asset.plate})`
                                                    : asset.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Descripción del Mantenimiento *</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="maintenanceType">Tipo de Mantenimiento</label>
                                    <select
                                        id="maintenanceType"
                                        name="maintenanceType"
                                        value={formData.maintenanceType}
                                        onChange={handleInputChange}
                                    >
                                        <option value="preventivo">Preventivo</option>
                                        <option value="correctivo">Correctivo</option>
                                        <option value="predictivo">Predictivo</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="scheduledDate">Fecha Programada *</label>
                                    <input
                                        type="date"
                                        id="scheduledDate"
                                        name="scheduledDate"
                                        value={formData.scheduledDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="priority">Prioridad</label>
                                    <select
                                        id="priority"
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                    >
                                        <option value="alta">Alta</option>
                                        <option value="normal">Normal</option>
                                        <option value="baja">Baja</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="status">Estado</label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="pendiente">Pendiente</option>
                                        <option value="en-progreso">En Progreso</option>
                                        <option value="completado">Completado</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="technician">Técnico Asignado</label>
                                <input
                                    type="text"
                                    id="technician"
                                    name="technician"
                                    value={formData.technician}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="notes">Notas Adicionales</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-button">
                                    Cancelar
                                </button>
                                <button type="submit" className="submit-button">
                                    {currentSchedule ? 'Actualizar' : 'Programar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaintenanceSchedule; 
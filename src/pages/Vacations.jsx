import React, { useState, useEffect } from 'react';
import {
    BeachAccess as VacationIcon,
    Add as AddIcon,
    Work as WorkIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    CalendarToday as CalendarIcon,
    Warning as WarningIcon,
    CheckCircle as CheckIcon,
} from '@mui/icons-material';
import axiosInstance from '../axiosConfig';
import './Vacations.css';
import { toast } from 'react-toastify';
import VacationCalendar from '../components/VacationCalendar';
import LoadingSpinner from '../components/LoadingSpinner';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const Vacations = () => {
    const [vacations, setVacations] = useState([]);
    const [users, setUsers] = useState([]);
    const [usersWithDays, setUsersWithDays] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [conflictingUsers, setConflictingUsers] = useState([]);
    const [formData, setFormData] = useState({
        userId: '',
        date: '',
        endDate: '',
        type: 'rest_day',
        description: '',
        isRange: false
    });
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        vacationId: null,
        userName: '',
        date: '',
        type: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            await Promise.all([
                fetchVacations(),
                fetchUsers(),
                fetchUsersWithDays()
            ]);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error('Error al cargar los datos de vacaciones');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchVacations = async () => {
        try {
            const response = await axiosInstance.get('/vacations');
            setVacations(response.data);
        } catch (error) {
            console.error('Error al cargar vacaciones:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get('/users');
            setUsers(response.data.filter(user => user.isActive));
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    };

    const fetchUsersWithDays = async () => {
        try {
            const response = await axiosInstance.get('/vacations/users');
            setUsersWithDays(response.data);
        } catch (error) {
            console.error('Error al cargar días disponibles:', error);
        }
    };

    const formatDateForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleDateClick = async (date) => {
        setSelectedDate(date);
        const formattedDate = formatDateForInput(date);

        setFormData(prev => ({
            ...prev,
            date: formattedDate,
            endDate: '',
            isRange: false
        }));

        // Verificar conflictos para esa fecha
        try {
            const response = await axiosInstance.get(`/vacations/conflicts/${formattedDate}`);
            setConflictingUsers(response.data);
        } catch (error) {
            console.error('Error al verificar conflictos:', error);
            setConflictingUsers([]);
        }

        setShowAddModal(true);
    };

    const handleAddVacation = async (e) => {
        e.preventDefault();

        if (!formData.userId || !formData.date || !formData.type) {
            toast.error('Por favor completa todos los campos requeridos');
            return;
        }

        // Validar rango de fechas si está habilitado
        if (formData.isRange && formData.endDate && new Date(formData.endDate) < new Date(formData.date)) {
            toast.error('La fecha de fin no puede ser anterior a la fecha de inicio');
            return;
        }

        try {
            const response = await axiosInstance.post('/vacations', formData);
            setShowAddModal(false);
            setFormData({
                userId: '',
                date: '',
                endDate: '',
                type: 'rest_day',
                description: '',
                isRange: false
            });
            setSelectedDate(null);
            setConflictingUsers([]);

            // Mostrar mensaje personalizado según la respuesta
            if (response.data.count > 1) {
                toast.success(`Se crearon ${response.data.count} días de vacación correctamente`);
            } else {
                toast.success('Vacación agregada correctamente');
            }

            fetchData();
        } catch (error) {
            console.error('Error al agregar vacación:', error);
            toast.error(error.response?.data?.message || 'Error al agregar vacación');
        }
    };

    const handleDeleteVacation = async () => {
        try {
            await axiosInstance.delete(`/vacations/${deleteModal.vacationId}`);
            toast.success('Vacación eliminada correctamente');
            fetchData();
        } catch (error) {
            console.error('Error al eliminar vacación:', error);
            toast.error('Error al eliminar vacación');
        } finally {
            closeDeleteModal();
        }
    };

    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            vacationId: null,
            userName: '',
            date: '',
            type: ''
        });
    };

    const handleVacationClick = (vacation) => {
        setDeleteModal({
            isOpen: true,
            vacationId: vacation.id,
            userName: vacation.user?.fullName || 'Usuario',
            date: formatDate(vacation.date),
            type: vacation.type === 'rest_day' ? 'día de descanso' : 'día extra trabajado'
        });
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setFormData({
            userId: '',
            date: '',
            endDate: '',
            type: 'rest_day',
            description: '',
            isRange: false
        });
        setSelectedDate(null);
        setConflictingUsers([]);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDaysColor = (availableDays) => {
        if (availableDays < 0) return 'vacation-days-negative';
        if (availableDays <= 5) return 'vacation-days-low';
        if (availableDays <= 15) return 'vacation-days-medium';
        return 'vacation-days-high';
    };

    const getDaysBetween = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const checkRangeConflicts = async (startDate, endDate) => {
        if (!startDate) return;

        try {
            const response = await axiosInstance.get('/vacations/date-range', {
                params: {
                    startDate,
                    endDate: endDate || startDate
                }
            });
            setConflictingUsers(response.data);
        } catch (error) {
            console.error('Error al verificar conflictos:', error);
            setConflictingUsers([]);
        }
    };

    if (isLoading) {
        return <LoadingSpinner message="Cargando vacaciones..." />;
    }

    return (
        <div className="vacations-page">
            <header className="page-header">
                <div className="header-title">
                    <VacationIcon />
                    <h1>Gestión de Vacaciones</h1>
                </div>
                <div className="header-info">
                    <span>Año {new Date().getFullYear()}</span>
                </div>
            </header>

            {/* Calendario de Vacaciones */}
            <div className="calendar-section">
                <h2>
                    <CalendarIcon />
                    Calendario de Vacaciones
                </h2>
                <p className="calendar-description">
                    Haz clic en cualquier día para agregar una vacación o día extra trabajado.
                    Haz clic en las burbujas de colores para eliminar vacaciones existentes.
                </p>
                <VacationCalendar
                    vacations={vacations}
                    onDateClick={handleDateClick}
                    onVacationClick={handleVacationClick}
                />
            </div>

            {/* Cards de Días Disponibles */}
            <div className="users-days-section">
                <h2>
                    <PersonIcon />
                    Días Disponibles por Persona
                </h2>
                <div className="users-days-grid">
                    {usersWithDays.map(user => (
                        <div key={user.id} className="user-days-card">
                            <div className="user-days-header">
                                <div className="user-avatar">
                                    {user.photoUrl ? (
                                        <img
                                            src={user.photoUrl}
                                            alt={user.fullName}
                                            className="user-image"
                                        />
                                    ) : (
                                        <div className="default-avatar">
                                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    )}
                                </div>
                                <div className="user-info">
                                    <h3>{user.fullName}</h3>
                                    <p>{user.email}</p>
                                </div>
                            </div>

                            <div className="user-days-stats">
                                <div className="days-stat">
                                    <span className="stat-label">Total del año</span>
                                    <span className="stat-value">{user.totalDays} días</span>
                                </div>
                                <div className="days-stat">
                                    <span className="stat-label">Días usados</span>
                                    <span className="stat-value">{user.usedRestDays} días</span>
                                </div>
                                <div className="days-stat">
                                    <span className="stat-label">Días extra</span>
                                    <span className="stat-value">+{user.extraWorkDays} días</span>
                                </div>
                                <div className={`days-stat available-days ${getDaysColor(user.availableDays)}`}>
                                    <span className="stat-label">Disponibles</span>
                                    <span className="stat-value">{user.availableDays} días</span>
                                </div>
                            </div>

                            <div className="user-days-actions">
                                <button
                                    className="btn-rest-day"
                                    onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            userId: user.id,
                                            type: 'rest_day',
                                            date: '',
                                            endDate: '',
                                            isRange: false
                                        }));
                                        setConflictingUsers([]);
                                        setShowAddModal(true);
                                    }}
                                >
                                    <VacationIcon />
                                    Día de descanso
                                </button>
                                <button
                                    className="btn-work-day"
                                    onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            userId: user.id,
                                            type: 'extra_work_day',
                                            date: '',
                                            endDate: '',
                                            isRange: false
                                        }));
                                        setConflictingUsers([]);
                                        setShowAddModal(true);
                                    }}
                                >
                                    <WorkIcon />
                                    Día extra
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal para agregar vacación */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>
                            {formData.type === 'rest_day' ? 'Agregar Día de Descanso' : 'Agregar Día Extra Trabajado'}
                        </h2>

                        {selectedDate && (
                            <div className="selected-date-info">
                                <CalendarIcon />
                                <span>Fecha seleccionada: {formatDate(selectedDate)}</span>
                            </div>
                        )}

                        {conflictingUsers.length > 0 && (
                            <div className="conflicts-warning">
                                <WarningIcon />
                                <div>
                                    <h4>
                                        {formData.isRange
                                            ? 'Personas que también estarán ausentes en el rango seleccionado:'
                                            : 'Personas que también estarán ausentes este día:'
                                        }
                                    </h4>
                                    <ul>
                                        {conflictingUsers.map(conflict => (
                                            <li key={conflict.id}>
                                                {conflict.user.fullName}
                                                {conflict.date && ` - ${formatDate(conflict.date)}`}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleAddVacation}>
                            <div className="form-group">
                                <label>
                                    <PersonIcon /> Persona:
                                </label>
                                <select
                                    value={formData.userId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                                    required
                                >
                                    <option value="">Seleccionar persona</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.fullName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>
                                    <CalendarIcon /> Fecha de inicio:
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => {
                                        const newDate = e.target.value;
                                        setFormData(prev => ({ ...prev, date: newDate }));
                                        if (newDate) {
                                            checkRangeConflicts(newDate, formData.endDate);
                                        }
                                    }}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.isRange}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            isRange: e.target.checked,
                                            endDate: e.target.checked ? prev.endDate : ''
                                        }))}
                                    />
                                    Seleccionar rango de fechas (múltiples días consecutivos)
                                </label>
                            </div>

                            {formData.isRange && (
                                <div className="form-group">
                                    <label>
                                        <CalendarIcon /> Fecha de fin:
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => {
                                            const newEndDate = e.target.value;
                                            setFormData(prev => ({ ...prev, endDate: newEndDate }));
                                            if (formData.date && newEndDate) {
                                                checkRangeConflicts(formData.date, newEndDate);
                                            }
                                        }}
                                        min={formData.date}
                                        required={formData.isRange}
                                    />
                                    {formData.date && formData.endDate && (
                                        <small className="date-range-info">
                                            Se crearán {getDaysBetween(formData.date, formData.endDate)} día(s) de vacación
                                        </small>
                                    )}
                                </div>
                            )}

                            <div className="form-group">
                                <label>Tipo:</label>
                                <div className="radio-group">
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            value="rest_day"
                                            checked={formData.type === 'rest_day'}
                                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                        />
                                        <VacationIcon />
                                        Día de descanso
                                    </label>
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            value="extra_work_day"
                                            checked={formData.type === 'extra_work_day'}
                                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                        />
                                        <WorkIcon />
                                        Día extra trabajado
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Descripción (opcional):</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Motivo o descripción adicional..."
                                    rows="3"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">
                                    <AddIcon />
                                    {formData.type === 'rest_day' ? 'Agregar Descanso' : 'Agregar Día Extra'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={handleCloseModal}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmación de eliminación */}
            {deleteModal.isOpen && (
                <DeleteConfirmationModal
                    isOpen={deleteModal.isOpen}
                    onClose={closeDeleteModal}
                    onConfirm={handleDeleteVacation}
                    itemName={`${deleteModal.userName} - ${deleteModal.date}`}
                    title="Confirmar Eliminación de Vacación"
                    message={`¿Estás seguro de que deseas eliminar este ${deleteModal.type} de ${deleteModal.userName} el ${deleteModal.date}?`}
                />
            )}
        </div>
    );
};

export default Vacations; 
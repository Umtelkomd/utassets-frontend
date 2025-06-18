import React, { useState, useEffect } from 'react';
import {
    BeachAccess as VacationIcon,
    Work as WorkIcon,
    CalendarToday as CalendarIcon,
    Description as DescriptionIcon,
    Send as SendIcon,
    Cancel as CancelIcon,
    DateRange as RangeIcon,
    Warning as WarningIcon,
    CheckCircle as CheckIcon
} from '@mui/icons-material';
import { vacationService } from '../services/vacationService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './VacationRequestForm.css';

const VacationRequestForm = ({ onClose, selectedDate = null, isPersonal = false }) => {
    const { currentUser } = useAuth();
    const [availableDays, setAvailableDays] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: selectedDate ? selectedDate : '',
        endDate: '',
        type: 'rest_day',
        description: '',
        isRange: false
    });
    const [conflicts, setConflicts] = useState([]);

    useEffect(() => {
        if (currentUser?.id) {
            fetchAvailableDays();
        }
    }, [currentUser?.id]);

    useEffect(() => {
        if (formData.date) {
            checkConflicts();
        }
    }, [formData.date, formData.endDate, formData.isRange]);

    const fetchAvailableDays = async () => {
        try {
            const data = await vacationService.getUserAvailableDays(currentUser.id);
            setAvailableDays(data);
        } catch (error) {
            console.error('Error al obtener días disponibles:', error);
        }
    };

    const checkConflicts = async () => {
        // No verificar conflictos en modo personal
        if (isPersonal || !formData.date || formData.type !== 'rest_day') {
            setConflicts([]);
            return;
        }

        try {
            if (formData.isRange && formData.endDate) {
                const conflictData = await vacationService.getVacationsByDateRange(
                    formData.date,
                    formData.endDate
                );
                setConflicts(conflictData.filter(v => v.userId !== currentUser.id));
            } else {
                const conflictData = await vacationService.getDateConflicts(formData.date);
                setConflicts(conflictData.filter(v => v.user.id !== currentUser.id));
            }
        } catch (error) {
            console.error('Error al verificar conflictos:', error);
            setConflicts([]);
        }
    };

    // Función para formatear el rango de fechas de una vacación
    const formatVacationRange = (vacation) => {
        if (vacation.startDate && vacation.endDate) {
            const start = new Date(vacation.startDate);
            const end = new Date(vacation.endDate);

            if (start.toDateString() === end.toDateString()) {
                return formatDate(vacation.startDate);
            } else {
                return `${formatDate(vacation.startDate)} - ${formatDate(vacation.endDate)}`;
            }
        } else if (vacation.date) {
            return formatDate(vacation.date);
        }
        return 'Fecha no disponible';
    };

    // Función para agrupar conflictos por usuario
    const getGroupedConflicts = () => {
        const grouped = conflicts.reduce((acc, conflict) => {
            const userName = conflict.user?.fullName || conflict.fullName || 'Usuario desconocido';
            if (!acc[userName]) {
                acc[userName] = [];
            }
            acc[userName].push(conflict);
            return acc;
        }, {});

        return Object.entries(grouped).map(([userName, userConflicts]) => ({
            userName,
            conflicts: userConflicts
        }));
    };

    // Contar días únicos con conflictos
    const getConflictDaysCount = () => {
        if (!formData.isRange || !formData.endDate) {
            return conflicts.length > 0 ? 1 : 0;
        }

        const conflictDates = new Set();
        conflicts.forEach(conflict => {
            if (conflict.startDate && conflict.endDate) {
                const start = new Date(conflict.startDate);
                const end = new Date(conflict.endDate);
                const requestStart = new Date(formData.date);
                const requestEnd = new Date(formData.endDate);

                // Encontrar superposición entre rangos
                const overlapStart = new Date(Math.max(start.getTime(), requestStart.getTime()));
                const overlapEnd = new Date(Math.min(end.getTime(), requestEnd.getTime()));

                if (overlapStart <= overlapEnd) {
                    for (let d = new Date(overlapStart); d <= overlapEnd; d.setDate(d.getDate() + 1)) {
                        conflictDates.add(d.toDateString());
                    }
                }
            }
        });

        return conflictDates.size;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.date || !formData.type) {
            toast.error('Por favor completa todos los campos requeridos');
            return;
        }

        if (formData.isRange && !formData.endDate) {
            toast.error('Por favor selecciona la fecha de fin');
            return;
        }

        if (formData.isRange && new Date(formData.endDate) < new Date(formData.date)) {
            toast.error('La fecha de fin no puede ser anterior a la fecha de inicio');
            return;
        }

        try {
            setLoading(true);

            const requestData = {
                userId: currentUser.id,
                ...formData
            };

            const response = await vacationService.createVacation(requestData);

            if (response.status === 'pending') {
                toast.success('Solicitud de vacación enviada. Esperando aprobación del administrador.');
            } else {
                toast.success(response.message);
            }

            onClose();
        } catch (error) {
            console.error('Error al enviar solicitud:', error);
            toast.error(error.response?.data?.message || 'Error al enviar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDaysBetween = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end.getTime() - start.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    return (
        <div className="vacation-request-modal-overlay">
            <div className="vacation-request-modal">
                <div className="vacation-request-header">
                    <div className="header-icon">
                        <VacationIcon />
                    </div>
                    <div className="header-content">
                        <h2>Solicitar Vacaciones</h2>
                        <p>Completa el formulario para enviar tu solicitud</p>
                    </div>
                </div>

                {availableDays && (
                    <div className="available-days-info">
                        <div className="days-summary">
                            <div className="days-item">
                                <span className="days-label">Días disponibles:</span>
                                <span className={`days-value ${availableDays.availableDays < 0 ? 'negative' :
                                    availableDays.availableDays <= 5 ? 'low' : 'normal'}`}>
                                    {availableDays.availableDays}
                                </span>
                            </div>
                            <div className="days-item">
                                <span className="days-label">Días usados:</span>
                                <span className="days-value">{availableDays.usedRestDays}</span>
                            </div>
                            <div className="days-item">
                                <span className="days-label">Días extra:</span>
                                <span className="days-value">{availableDays.extraWorkDays}</span>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="vacation-request-form">
                    {/* Selector de fecha */}
                    <div className="form-group">
                        <label>
                            <CalendarIcon />
                            Fecha de inicio *
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            required
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    {/* Toggle para rango de fechas */}
                    <div className="range-toggle-container">
                        <input
                            type="checkbox"
                            id="isRange"
                            name="isRange"
                            checked={formData.isRange}
                            onChange={handleInputChange}
                            className="range-toggle-input"
                        />
                        <label htmlFor="isRange" className="range-toggle-card">
                            <div className="toggle-indicator">
                                <RangeIcon />
                            </div>
                            <div className="toggle-content">
                                <h4>Solicitar múltiples días</h4>
                                <p>Selecciona un rango de fechas para tus vacaciones</p>
                            </div>
                            <div className="toggle-switch">
                                <div className="switch-slider"></div>
                            </div>
                        </label>
                    </div>

                    {/* Fecha de fin si es rango */}
                    {formData.isRange && (
                        <div className="form-group">
                            <label>
                                <CalendarIcon />
                                Fecha de fin *
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                required={formData.isRange}
                                min={formData.date || new Date().toISOString().split('T')[0]}
                            />
                            {formData.date && formData.endDate && (
                                <div className="date-range-info">
                                    <CalendarIcon />
                                    Solicitando {getDaysBetween(formData.date, formData.endDate)} día(s)
                                    del {formatDate(formData.date)} al {formatDate(formData.endDate)}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tipo de vacación */}
                    <div className="type-selector-container">
                        <h3 className="type-selector-title">Tipo de vacación *</h3>
                        <div className="type-options">
                            <input
                                type="radio"
                                id="rest_day"
                                name="type"
                                value="rest_day"
                                checked={formData.type === 'rest_day'}
                                onChange={handleInputChange}
                                className="type-radio-input"
                            />
                            <label htmlFor="rest_day" className="type-option-card">
                                <div className="type-indicator type-rest">
                                    <VacationIcon />
                                </div>
                                <div className="type-content">
                                    <h4>Día de descanso</h4>
                                    <p>Días de vacaciones regulares que se descuentan de tus días disponibles</p>
                                </div>
                                <div className="type-check">
                                    <CheckIcon />
                                </div>
                            </label>

                            <input
                                type="radio"
                                id="extra_work_day"
                                name="type"
                                value="extra_work_day"
                                checked={formData.type === 'extra_work_day'}
                                onChange={handleInputChange}
                                className="type-radio-input"
                            />
                            <label htmlFor="extra_work_day" className="type-option-card">
                                <div className="type-indicator type-work">
                                    <WorkIcon />
                                </div>
                                <div className="type-content">
                                    <h4>Día de trabajo extra</h4>
                                    <p>Días trabajados fuera del horario regular que se suman a tus días disponibles</p>
                                </div>
                                <div className="type-check">
                                    <CheckIcon />
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="form-group">
                        <label>
                            <DescriptionIcon />
                            Descripción (opcional)
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="3"
                            placeholder="Describe el motivo de tu solicitud (opcional)"
                        />
                    </div>

                    {/* Conflictos - Mostrar información detallada */}
                    {conflicts.length > 0 && formData.type === 'rest_day' && (
                        <div className="conflicts-warning">
                            <div className="conflicts-header">
                                <WarningIcon />
                                <div className="conflicts-title">
                                    <h4>⚠️ Conflictos Detectados</h4>
                                    <p>
                                        Hay <strong>{getConflictDaysCount()} día(s)</strong> donde otros técnicos también tienen vacaciones durante {formData.isRange && formData.endDate ? 'este período' : 'esta fecha'}:
                                    </p>
                                </div>
                            </div>

                            <div className="conflicts-details">
                                {getGroupedConflicts().map((group, groupIndex) => (
                                    <div key={groupIndex} className="conflict-user-group">
                                        <div className="conflict-user-header">
                                            <span className="conflict-user-name">👤 {group.userName}</span>
                                            <span className="conflict-count">
                                                {group.conflicts.length} conflicto{group.conflicts.length > 1 ? 's' : ''}
                                            </span>
                                        </div>

                                        <div className="conflict-dates">
                                            {group.conflicts.map((conflict, conflictIndex) => (
                                                <div key={conflictIndex} className="conflict-date-item">
                                                    <span className="conflict-date">
                                                        📅 {formatVacationRange(conflict)}
                                                    </span>
                                                    {conflict.description && (
                                                        <span className="conflict-description">
                                                            💬 {conflict.description}
                                                        </span>
                                                    )}
                                                    <span className="conflict-type">
                                                        {conflict.type === 'rest_day' ? '🏖️ Día de descanso' : '💼 Día extra trabajado'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="conflicts-footer">
                                <p>
                                    💡 <strong>Recomendación:</strong> Coordina con tu equipo antes de enviar la solicitud para evitar problemas de cobertura.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                            disabled={loading}
                        >
                            <CancelIcon />
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            <SendIcon />
                            {loading ? 'Enviando...' : 'Enviar Solicitud'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VacationRequestForm; 
import React, { useState, useEffect } from 'react';
import {
    PendingActions as PendingIcon,
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Person as PersonIcon,
    CalendarToday as CalendarIcon,
    Description as DescriptionIcon,
    BeachAccess as VacationIcon,
    Work as WorkIcon,
    Refresh as RefreshIcon,
    HourglassEmpty as PendingFirstIcon,
    HourglassFull as PendingSecondIcon,
    Block as BlockedIcon,
    Warning as WarningIcon,
    DateRange as DateRangeIcon
} from '@mui/icons-material';
import { vacationService, VacationStatus } from '../services/vacationService';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import VacationRequestCalendar from './VacationRequestCalendar';
import './PendingVacationsManager.css';

const PendingVacationsManager = ({ onUpdate }) => {
    const { currentUser } = useAuth();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [allVacations, setAllVacations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingRequest, setRejectingRequest] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
    const [approvingRequests, setApprovingRequests] = useState(new Set());
    const [selectedDates, setSelectedDates] = useState({});

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const fetchPendingRequests = async () => {
        try {
            setLoading(true);
            const data = await vacationService.getPendingVacations();
            setPendingRequests(data.pendingRequests || []);
            setAllVacations(data.allVacations || []);

            // Inicializar fechas seleccionadas (por defecto todas seleccionadas)
            const initialSelectedDates = {};
            (data.pendingRequests || []).forEach(request => {
                const requestKey = request.batchId || `single-${request.vacations[0]?.id}`;
                initialSelectedDates[requestKey] = request.dates.map(date =>
                    new Date(date).toISOString().split('T')[0]
                );
            });
            setSelectedDates(initialSelectedDates);
        } catch (error) {
            console.error('Error al cargar solicitudes pendientes:', error);
            toast.error('Error al cargar solicitudes pendientes');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveRequest = async (request) => {
        const requestKey = request.batchId || `single-${request.vacations[0]?.id}`;
        const selectedDatesForRequest = selectedDates[requestKey] || [];

        if (selectedDatesForRequest.length === 0) {
            toast.warning('Selecciona al menos un día para aprobar');
            return;
        }

        // Obtener IDs de las vacaciones correspondientes a las fechas seleccionadas
        const vacationIdsToApprove = request.vacations
            .filter(vacation => {
                const vacationDateStr = new Date(vacation.date).toISOString().split('T')[0];
                return selectedDatesForRequest.includes(vacationDateStr);
            })
            .map(vacation => vacation.id);

        try {
            setApprovingRequests(prev => new Set(prev).add(requestKey));
            const response = await vacationService.approveSelectedDaysFromRequest(vacationIdsToApprove);
            toast.success(response.message);
            fetchPendingRequests();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error al aprobar solicitud:', error);
            const errorMessage = error.response?.data?.message || 'Error al aprobar la solicitud';
            toast.error(errorMessage);
        } finally {
            setApprovingRequests(prev => {
                const newSet = new Set(prev);
                newSet.delete(requestKey);
                return newSet;
            });
        }
    };

    const handleRejectRequest = async () => {
        if (!rejectingRequest) return;

        try {
            setIsRejecting(true);

            // Rechazar todas las vacaciones de la solicitud
            for (const vacation of rejectingRequest.vacations) {
                await vacationService.rejectVacation(vacation.id, rejectReason);
            }

            toast.success('Solicitud rechazada correctamente');
            setShowRejectModal(false);
            setRejectingRequest(null);
            setRejectReason('');
            fetchPendingRequests();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error al rechazar solicitud:', error);
            toast.error('Error al rechazar la solicitud');
        } finally {
            setIsRejecting(false);
        }
    };

    const canApproveRequest = (request) => {
        if (!currentUser || currentUser.role !== 'administrador') {
            return false;
        }

        // No puede aprobar su propia solicitud
        if (request.user.id === currentUser.id) {
            return false;
        }

        // Verificar si hay al menos una vacación que se puede aprobar
        return request.vacations.some(vacation => {
            if (vacation.status === VacationStatus.PENDING) {
                return true;
            }
            if (vacation.status === VacationStatus.FIRST_APPROVED) {
                return vacation.firstApprovedBy && vacation.firstApprovedBy.id !== currentUser.id;
            }
            return false;
        });
    };

    const getRequestStatusText = (request) => {
        const statuses = request.vacations.map(v => v.status);
        const allPending = statuses.every(s => s === VacationStatus.PENDING);
        const allFirstApproved = statuses.every(s => s === VacationStatus.FIRST_APPROVED);
        const mixed = !allPending && !allFirstApproved;

        if (allPending) {
            return 'Pendiente (1ª aprobación)';
        } else if (allFirstApproved) {
            return 'Pendiente (2ª aprobación)';
        } else if (mixed) {
            return 'Estados mixtos';
        }
        return 'Pendiente';
    };

    const getRequestStatusIcon = (request) => {
        const statuses = request.vacations.map(v => v.status);
        const allPending = statuses.every(s => s === VacationStatus.PENDING);
        const allFirstApproved = statuses.every(s => s === VacationStatus.FIRST_APPROVED);

        if (allPending) {
            return <PendingFirstIcon className="status-icon pending" />;
        } else if (allFirstApproved) {
            return <PendingSecondIcon className="status-icon first-approved" />;
        } else {
            return <WarningIcon className="status-icon mixed" />;
        }
    };

    const getBlockReason = (request) => {
        if (request.user.id === currentUser?.id) {
            return 'No puedes aprobar tu propia solicitud';
        }

        const hasFirstApprovalByCurrentUser = request.vacations.some(vacation =>
            vacation.status === VacationStatus.FIRST_APPROVED &&
            vacation.firstApprovedBy && vacation.firstApprovedBy.id === currentUser?.id
        );

        if (hasFirstApprovalByCurrentUser) {
            return 'Ya diste la primera aprobación. Debe aprobar otro administrador';
        }

        return 'No se puede aprobar';
    };

    const openRejectModal = (request) => {
        setRejectingRequest(request);
        setShowRejectModal(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateRange = (dates) => {
        if (dates.length === 1) {
            return formatDate(dates[0]);
        }

        const sortedDates = [...dates].sort((a, b) => new Date(a) - new Date(b));
        const firstDate = formatDate(sortedDates[0]);
        const lastDate = formatDate(sortedDates[sortedDates.length - 1]);

        return `${firstDate} - ${lastDate}`;
    };

    const handleDatesSelected = (requestKey, selectedDatesArray) => {
        setSelectedDates(prev => ({
            ...prev,
            [requestKey]: selectedDatesArray
        }));
    };

    const getDateConflicts = (request) => {
        if (!allVacations.length) return [];

        const requestDates = request.dates.map(date =>
            new Date(date).toISOString().split('T')[0]
        );

        return allVacations.filter(v => {
            const vDate = new Date(v.date).toISOString().split('T')[0];
            return requestDates.includes(vDate) &&
                v.userId !== request.user.id &&
                !request.vacations.some(rv => rv.id === v.id) &&
                (v.status === VacationStatus.FULLY_APPROVED ||
                    v.status === VacationStatus.PENDING ||
                    v.status === VacationStatus.FIRST_APPROVED);
        });
    };

    return (
        <div className="pending-vacations-manager">
            <div className="pending-header">
                <div className="header-content">
                    <h2>
                        <PendingIcon className="header-icon" />
                        Solicitudes Pendientes
                    </h2>
                    <p>Gestiona las solicitudes de vacaciones agrupadas. Selecciona los días que quieres aprobar de cada solicitud.</p>
                    <div className="approval-info-banner">
                        <PendingSecondIcon className="info-icon" />
                        <span>Sistema de doble aprobación: cada solicitud requiere la aprobación de dos administradores diferentes</span>
                    </div>
                </div>

                <div className="header-actions">
                    <button
                        className="btn-refresh"
                        onClick={fetchPendingRequests}
                        disabled={loading}
                    >
                        <RefreshIcon />
                        Actualizar
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando solicitudes...</p>
                </div>
            ) : pendingRequests.length === 0 ? (
                <div className="empty-state">
                    <PendingIcon className="empty-icon" />
                    <h3>No hay solicitudes pendientes</h3>
                    <p>Todas las solicitudes de vacaciones han sido procesadas</p>
                </div>
            ) : (
                <div className="pending-requests-list">
                    {pendingRequests.map((request) => {
                        const requestKey = request.batchId || `single-${request.vacations[0]?.id}`;
                        const isApproving = approvingRequests.has(requestKey);
                        const selectedDatesForRequest = selectedDates[requestKey] || [];
                        const conflicts = getDateConflicts(request);

                        return (
                            <div key={requestKey} className="pending-request-item">
                                <div className="request-header">
                                    <div className="user-info">
                                        <PersonIcon className="user-icon" />
                                        <span className="user-name">{request.user.fullName}</span>
                                        <div className="request-type">
                                            {request.type === 'rest_day' ? (
                                                <>
                                                    <VacationIcon className="type-icon vacation" />
                                                    <span>Días de descanso</span>
                                                </>
                                            ) : (
                                                <>
                                                    <WorkIcon className="type-icon work" />
                                                    <span>Días de trabajo extra</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="status-info">
                                        {getRequestStatusIcon(request)}
                                        <span className="status-text">{getRequestStatusText(request)}</span>
                                    </div>
                                </div>

                                <div className="request-details">
                                    <div className="detail-item">
                                        <DateRangeIcon className="detail-icon" />
                                        <span>{formatDateRange(request.dates)} ({request.dates.length} días)</span>
                                    </div>

                                    <div className="detail-item">
                                        <CalendarIcon className="detail-icon" />
                                        <span>Solicitado el {formatDate(request.createdAt)}</span>
                                    </div>
                                </div>

                                {request.description && (
                                    <div className="request-description">
                                        <DescriptionIcon className="description-icon" />
                                        <span>{request.description}</span>
                                    </div>
                                )}

                                {/* Información sobre conflictos de fechas */}
                                {conflicts.length > 0 && (
                                    <div className="date-conflicts-info">
                                        <div className="conflicts-header">
                                            <WarningIcon className="conflicts-icon" />
                                            <span className="conflicts-title">
                                                Personas que también tienen vacaciones en las fechas solicitadas:
                                            </span>
                                        </div>
                                        <div className="conflicts-list">
                                            {conflicts.map(conflict => (
                                                <div key={conflict.id} className="conflict-item">
                                                    <PersonIcon className="conflict-person-icon" />
                                                    <span className="conflict-person-name">
                                                        {conflict.user?.fullName || 'Usuario desconocido'}
                                                    </span>
                                                    <span className="conflict-date">
                                                        {formatDate(conflict.date)}
                                                    </span>
                                                    <span className={`conflict-status ${conflict.status}`}>
                                                        {conflict.status === VacationStatus.FULLY_APPROVED && '(Aprobado)'}
                                                        {conflict.status === VacationStatus.PENDING && '(Pendiente 1ª)'}
                                                        {conflict.status === VacationStatus.FIRST_APPROVED && '(Pendiente 2ª)'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Información de aprobaciones previas */}
                                {request.firstApprovedBy && (
                                    <div className="approval-info">
                                        <div className="approval-step completed">
                                            <ApproveIcon className="approval-icon" />
                                            <span>1ª Aprobación: {request.firstApprovedBy.fullName}</span>
                                            <span className="approval-date">
                                                {new Date(request.firstApprovedDate).toLocaleDateString('es-ES')}
                                            </span>
                                        </div>
                                        {request.status === VacationStatus.FIRST_APPROVED && (
                                            <div className="approval-step pending">
                                                <PendingSecondIcon className="approval-icon" />
                                                <span>Esperando 2ª aprobación de otro administrador</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Calendario de selección */}
                                <VacationRequestCalendar
                                    requestedDates={request.dates}
                                    selectedDates={selectedDatesForRequest}
                                    onDatesSelected={(selectedDatesArray) =>
                                        handleDatesSelected(requestKey, selectedDatesArray)
                                    }
                                    type={request.type}
                                    disabled={isApproving}
                                />

                                <div className="request-actions">
                                    {canApproveRequest(request) ? (
                                        <button
                                            className="btn-approve-request"
                                            onClick={() => handleApproveRequest(request)}
                                            disabled={isApproving || selectedDatesForRequest.length === 0}
                                            title={`Aprobar ${selectedDatesForRequest.length} día(s) seleccionado(s)`}
                                        >
                                            {isApproving ? (
                                                <>
                                                    <div className="loading-spinner small"></div>
                                                    Aprobando...
                                                </>
                                            ) : (
                                                <>
                                                    <ApproveIcon />
                                                    Aprobar días seleccionados ({selectedDatesForRequest.length})
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="btn-blocked" title={getBlockReason(request)}>
                                            <BlockedIcon />
                                            <span>No disponible</span>
                                        </div>
                                    )}

                                    <button
                                        className="btn-reject"
                                        onClick={() => openRejectModal(request)}
                                        title="Rechazar toda la solicitud"
                                        disabled={isRejecting}
                                    >
                                        <RejectIcon />
                                        Rechazar solicitud
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal de rechazo */}
            {showRejectModal && (
                <div className="modal-overlay">
                    <div className="reject-modal">
                        <div className="modal-header">
                            <h3>Rechazar Solicitud</h3>
                            <p>
                                ¿Estás seguro de que quieres rechazar la solicitud de{' '}
                                <strong>{rejectingRequest?.user.fullName}</strong> de{' '}
                                <strong>{rejectingRequest?.dates.length} día(s)</strong>?
                            </p>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>
                                    <DescriptionIcon />
                                    Motivo del rechazo (opcional)
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Explica el motivo del rechazo..."
                                    rows="3"
                                />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectingRequest(null);
                                    setRejectReason('');
                                    setIsRejecting(false);
                                }}
                                disabled={isRejecting}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn-danger"
                                onClick={handleRejectRequest}
                                disabled={isRejecting}
                            >
                                {isRejecting ? (
                                    <>
                                        <div className="loading-spinner small"></div>
                                        Rechazando...
                                    </>
                                ) : (
                                    <>
                                        <RejectIcon />
                                        Confirmar Rechazo
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingVacationsManager; 
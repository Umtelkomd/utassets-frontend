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
    DateRange as DateRangeIcon,
    Event as EventIcon
} from '@mui/icons-material';
import { vacationService, VacationStatus } from '../services/vacationService';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import VacationPendingCalendar from './VacationPendingCalendar';
import './PendingVacationsManager.css';

const PendingVacationsManager = ({ onUpdate }) => {
    const { currentUser } = useAuth();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [allVacations, setAllVacations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingRequest, setRejectingRequest] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [approvingIds, setApprovingIds] = useState(new Set());
    const [isRejecting, setIsRejecting] = useState(false);

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const fetchPendingRequests = async () => {
        try {
            setLoading(true);
            const data = await vacationService.getPendingVacationsGrouped();
            setPendingRequests(data.pendingRequests || []);
            setAllVacations(data.allVacations || []);

            // Seleccionar automáticamente la primera solicitud para mostrar el calendario
            if (data.pendingRequests && data.pendingRequests.length > 0) {
                setSelectedRequest(data.pendingRequests[0]);
            }
        } catch (error) {
            console.error('Error al cargar solicitudes pendientes:', error);
            toast.error('Error al cargar solicitudes pendientes');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveRequest = async (request) => {
        try {
            setApprovingIds(prev => new Set(prev).add(request.id));
            const response = await vacationService.approvePeriodVacations(request.vacationIds);
            toast.success(response.message);
            fetchPendingRequests();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error al aprobar solicitud:', error);
            const errorMessage = error.response?.data?.message || 'Error al aprobar la solicitud';
            toast.error(errorMessage);
        } finally {
            setApprovingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(request.id);
                return newSet;
            });
        }
    };

    const handleRejectRequest = async () => {
        if (!rejectingRequest) return;

        try {
            setIsRejecting(true);
            await vacationService.rejectPeriodVacations(rejectingRequest.vacationIds, rejectReason);
            toast.success('Período de vacaciones rechazado correctamente');
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
        if (request.userId === currentUser.id) {
            return false;
        }

        // Si está en estado PENDING, cualquier admin puede dar primera aprobación
        if (request.status === VacationStatus.PENDING) {
            return true;
        }

        // Si está en estado FIRST_APPROVED, solo otro admin diferente puede dar segunda aprobación
        if (request.status === VacationStatus.FIRST_APPROVED) {
            return request.firstApprovedBy && request.firstApprovedBy.id !== currentUser.id;
        }

        return false;
    };

    const getApproveButtonText = (request) => {
        if (request.status === VacationStatus.PENDING) {
            return '1ª Aprobación';
        }
        if (request.status === VacationStatus.FIRST_APPROVED) {
            return '2ª Aprobación';
        }
        return 'Aprobar';
    };

    const getBlockReason = (request) => {
        if (request.userId === currentUser?.id) {
            return 'No puedes aprobar tu propia solicitud';
        }
        if (request.status === VacationStatus.FIRST_APPROVED &&
            request.firstApprovedBy && request.firstApprovedBy.id === currentUser?.id) {
            return 'Ya diste la primera aprobación. Debe aprobar otro administrador';
        }
        return 'No se puede aprobar';
    };

    const getStatusIcon = (request) => {
        switch (request.status) {
            case VacationStatus.PENDING:
                return <PendingFirstIcon className="status-icon pending" />;
            case VacationStatus.FIRST_APPROVED:
                return <PendingSecondIcon className="status-icon first-approved" />;
            case VacationStatus.FULLY_APPROVED:
                return <ApproveIcon className="status-icon approved" />;
            default:
                return <PendingIcon className="status-icon pending" />;
        }
    };

    const getStatusText = (request) => {
        switch (request.status) {
            case VacationStatus.PENDING:
                return 'Pendiente (1ª aprobación)';
            case VacationStatus.FIRST_APPROVED:
                return 'Pendiente (2ª aprobación)';
            case VacationStatus.FULLY_APPROVED:
                return 'Completamente aprobada';
            default:
                return 'Pendiente';
        }
    };

    const openRejectModal = (request) => {
        setRejectingRequest(request);
        setShowRejectModal(true);
    };

    const handleRequestClick = (request) => {
        setSelectedRequest(request);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateRange = (startDate, endDate) => {
        const start = formatDate(startDate);
        const end = formatDate(endDate);

        if (start === end) {
            return start;
        }

        return `${start} - ${end}`;
    };

    // Obtener conflictos para la solicitud seleccionada
    const getSelectedRequestConflicts = () => {
        if (!selectedRequest || !allVacations.length) return [];

        const startDate = new Date(selectedRequest.startDate);
        const endDate = new Date(selectedRequest.endDate);

        return allVacations.filter(vacation => {
            const vacationStartDate = new Date(vacation.startDate);
            const vacationEndDate = new Date(vacation.endDate);

            // Verificar si hay superposición entre los rangos
            const hasOverlap = vacationStartDate <= endDate && vacationEndDate >= startDate;

            return hasOverlap &&
                vacation.userId !== selectedRequest.userId &&
                vacation.type === 'rest_day' &&
                (vacation.status === VacationStatus.FULLY_APPROVED ||
                    vacation.status === VacationStatus.PENDING ||
                    vacation.status === VacationStatus.FIRST_APPROVED);
        });
    };

    return (
        <div className="pending-vacations-manager">
            <div className="pending-header">
                <div className="header-content">
                    <h2>
                        <PendingIcon className="header-icon" />
                        Solicitudes de Períodos de Vacaciones
                    </h2>
                    <p>Gestiona solicitudes agrupadas por períodos consecutivos</p>
                    <div className="approval-info-banner">
                        <PendingSecondIcon className="info-icon" />
                        <span>Sistema de doble aprobación: cada período requiere la aprobación de dos administradores diferentes</span>
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
                <div className="content-layout">
                    {/* Lista de solicitudes */}
                    <div className="requests-section">
                        <h3>
                            <EventIcon />
                            Períodos Solicitados ({pendingRequests.length})
                        </h3>

                        <div className="requests-list">
                            {pendingRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className={`request-item ${selectedRequest?.id === request.id ? 'selected' : ''}`}
                                    onClick={() => handleRequestClick(request)}
                                >
                                    <div className="item-info">
                                        <div className="item-header">
                                            <div className="user-info">
                                                <PersonIcon className="user-icon" />
                                                <span className="user-name">{request.user.fullName}</span>
                                            </div>

                                            <div className="status-info">
                                                {getStatusIcon(request)}
                                                <span className="status-text">{getStatusText(request)}</span>
                                            </div>
                                        </div>

                                        <div className="item-details">
                                            <div className="detail-item">
                                                <DateRangeIcon className="detail-icon" />
                                                <span>{formatDateRange(request.startDate, request.endDate)}</span>
                                            </div>

                                            <div className="detail-item">
                                                <CalendarIcon className="detail-icon" />
                                                <span>{request.dayCount} día(s)</span>
                                            </div>

                                            <div className="detail-item">
                                                {request.type === 'rest_day' ? (
                                                    <>
                                                        <VacationIcon className="detail-icon vacation" />
                                                        <span>Días de descanso</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <WorkIcon className="detail-icon work" />
                                                        <span>Días extra trabajados</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {request.description && (
                                            <div className="item-description">
                                                <DescriptionIcon className="description-icon" />
                                                <span>{request.description}</span>
                                            </div>
                                        )}

                                        {/* Información de aprobaciones */}
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
                                    </div>

                                    <div className="item-actions">
                                        {canApproveRequest(request) ? (
                                            <button
                                                className="btn-approve"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleApproveRequest(request);
                                                }}
                                                title={`Dar ${getApproveButtonText(request)}`}
                                                disabled={approvingIds.has(request.id)}
                                            >
                                                {approvingIds.has(request.id) ? (
                                                    <>
                                                        <div className="loading-spinner small"></div>
                                                        Aprobando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ApproveIcon />
                                                        {getApproveButtonText(request)}
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
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openRejectModal(request);
                                            }}
                                            title="Rechazar período completo"
                                            disabled={isRejecting}
                                        >
                                            <RejectIcon />
                                            Rechazar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Calendario de la solicitud seleccionada */}
                    <div className="calendar-section">
                        <h3>
                            <CalendarIcon />
                            Vista Previa del Período
                        </h3>

                        <VacationPendingCalendar
                            vacationRequest={selectedRequest}
                            conflictingVacations={getSelectedRequestConflicts()}
                            showConflicts={true}
                        />

                        {selectedRequest && getSelectedRequestConflicts().length > 0 && (
                            <div className="conflicts-summary">
                                <div className="conflicts-header">
                                    <WarningIcon className="conflicts-icon" />
                                    <h4>Conflictos Detectados</h4>
                                </div>
                                <p>
                                    Hay {getSelectedRequestConflicts().length} día(s) donde otros técnicos
                                    también tienen vacaciones durante este período.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de rechazo */}
            {showRejectModal && (
                <div className="modal-overlay">
                    <div className="reject-modal">
                        <div className="modal-header">
                            <h3>Rechazar Período de Vacaciones</h3>
                            <p>
                                ¿Estás seguro de que quieres rechazar el período de {' '}
                                <strong>{rejectingRequest?.dayCount} día(s)</strong> solicitado por{' '}
                                <strong>{rejectingRequest?.user.fullName}</strong>?
                            </p>
                            <div className="period-info">
                                <DateRangeIcon />
                                <span>{formatDateRange(rejectingRequest?.startDate, rejectingRequest?.endDate)}</span>
                            </div>
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
                                    placeholder="Explica el motivo del rechazo del período completo..."
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
                                        Rechazando período...
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
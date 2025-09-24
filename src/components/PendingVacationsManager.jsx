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

    // Definir los permisos de aprobación
    const FIRST_APPROVAL_ADMINS = ['reyalejandroh@gmail.com', 'bsandoval@umtelkomd.com'];
    const SECOND_APPROVAL_ADMIN = 'jromero@umtelkomd.com';

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const fetchPendingRequests = async () => {
        try {
            setLoading(true);
            const data = await vacationService.getPendingVacationsGrouped();
            const allRequests = data.pendingRequests || [];

            // Filtrar solicitudes según los permisos del usuario actual
            const filteredRequests = filterRequestsByPermissions(allRequests);

            setPendingRequests(filteredRequests);
            setAllVacations(data.allVacations || []);

            // Seleccionar automáticamente la primera solicitud para mostrar el calendario
            if (filteredRequests && filteredRequests.length > 0) {
                setSelectedRequest(filteredRequests[0]);
            } else {
                setSelectedRequest(null);
            }
        } catch (error) {
            console.error('Error al cargar solicitudes pendientes:', error);
            toast.error('Error al cargar solicitudes pendientes');
        } finally {
            setLoading(false);
        }
    };

    // Función para filtrar solicitudes según permisos
    const filterRequestsByPermissions = (requests) => {
        if (!currentUser || !currentUser.email) return [];

        return requests.filter(request => {
            // Solicitudes nuevas (primera aprobación pendiente)
            if (request.status === VacationStatus.PENDING) {
                return FIRST_APPROVAL_ADMINS.includes(currentUser.email);
            }

            // Solicitudes pendientes de segunda aprobación
            if (request.status === VacationStatus.FIRST_APPROVED) {
                return currentUser.email === SECOND_APPROVAL_ADMIN;
            }

            // Por defecto no mostrar
            return false;
        });
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
        if (!currentUser || currentUser.role !== 'administrador' || !currentUser.email) {
            return false;
        }

        // No puede aprobar su propia solicitud
        if (request.userId === currentUser.id) {
            return false;
        }

        // Si está en estado PENDING, solo los admins de primera aprobación pueden aprobar
        if (request.status === VacationStatus.PENDING) {
            return FIRST_APPROVAL_ADMINS.includes(currentUser.email);
        }

        // Si está en estado FIRST_APPROVED, solo el admin de segunda aprobación puede aprobar
        if (request.status === VacationStatus.FIRST_APPROVED) {
            return currentUser.email === SECOND_APPROVAL_ADMIN &&
                request.firstApprovedBy &&
                request.firstApprovedBy.id !== currentUser.id;
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
        if (!currentUser || !currentUser.email) {
            return 'Usuario no identificado';
        }

        if (request.userId === currentUser.id) {
            return 'No puedes aprobar tu propia solicitud';
        }

        if (request.status === VacationStatus.PENDING) {
            if (!FIRST_APPROVAL_ADMINS.includes(currentUser.email)) {
                return 'Solo los administradores autorizados pueden dar la primera aprobación';
            }
        }

        if (request.status === VacationStatus.FIRST_APPROVED) {
            if (currentUser.email !== SECOND_APPROVAL_ADMIN) {
                return 'Solo el administrador final puede dar la segunda aprobación';
            }
            if (request.firstApprovedBy && request.firstApprovedBy.id === currentUser.id) {
                return 'Ya diste la primera aprobación. Debe aprobar otro administrador';
            }
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
                <div className="pending-header-content">
                    <h2>
                        <PendingIcon className="pending-header-icon" />
                        Solicitudes de Períodos de Vacaciones
                    </h2>
                    <p>Gestiona solicitudes agrupadas por períodos consecutivos</p>
                    <div className="pending-approval-info-banner">
                        <PendingSecondIcon className="pending-info-icon" />
                        <span>Sistema de doble aprobación: cada período requiere la aprobación de dos administradores diferentes</span>
                    </div>

                    {/* Banner de permisos específicos */}
                    <div className="pending-permissions-info-banner">
                        <PersonIcon className="pending-permissions-icon" />
                        <div className="pending-permissions-content">
                            {currentUser?.email && FIRST_APPROVAL_ADMINS.includes(currentUser.email) ? (
                                <span>🔹 Puedes dar <strong>primera aprobación</strong> a solicitudes nuevas</span>
                            ) : currentUser?.email === SECOND_APPROVAL_ADMIN ? (
                                <span>🔹 Puedes dar <strong>segunda aprobación</strong> a solicitudes ya pre-aprobadas</span>
                            ) : (
                                <span>⚠️ No tienes permisos para aprobar solicitudes de vacaciones</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pending-header-actions">
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
                    <h3>No hay solicitudes pendientes para ti</h3>
                    {currentUser?.email && FIRST_APPROVAL_ADMINS.includes(currentUser.email) ? (
                        <p>No hay solicitudes nuevas que requieran primera aprobación</p>
                    ) : currentUser?.email === SECOND_APPROVAL_ADMIN ? (
                        <p>No hay solicitudes que requieran segunda aprobación</p>
                    ) : (
                        <p>No tienes permisos para ver solicitudes pendientes</p>
                    )}
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
                                    <h4>⚠️ Conflictos de Vacaciones Detectados</h4>
                                </div>

                                {(() => {
                                    const conflicts = getSelectedRequestConflicts();
                                    const groupedByUser = conflicts.reduce((acc, conflict) => {
                                        const userName = conflict.user?.fullName || 'Usuario desconocido';
                                        if (!acc[userName]) {
                                            acc[userName] = [];
                                        }
                                        acc[userName].push(conflict);
                                        return acc;
                                    }, {});

                                    const userCount = Object.keys(groupedByUser).length;
                                    const peopleNames = Object.keys(groupedByUser).join(', ');

                                    return (
                                        <>
                                            <p>
                                                Hay conflictos que involucran a <strong>{userCount} persona(s)</strong>:
                                            </p>
                                            <div className="conflicts-people-list">
                                                <span className="conflicts-people">👥 {peopleNames}</span>
                                            </div>

                                            <div className="conflicts-details">
                                                {Object.entries(groupedByUser).map(([userName, userConflicts]) => (
                                                    <div key={userName} className="conflict-user-group">
                                                        <div className="conflict-user-header">
                                                            <span className="conflict-user-name">👤 {userName}</span>
                                                            <span className="conflict-count">
                                                                {userConflicts.length} conflicto{userConflicts.length > 1 ? 's' : ''}
                                                            </span>
                                                        </div>

                                                        <div className="conflict-items">
                                                            {userConflicts.map((conflict, index) => (
                                                                <div key={index} className="conflict-item">
                                                                    <span className="conflict-period">
                                                                        📅 {formatDateRange(conflict.startDate, conflict.endDate)}
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

                                            <div className="conflicts-recommendation">
                                                <p>
                                                    💡 <strong>Recomendación:</strong> Coordina con las personas mencionadas antes de aprobar para evitar problemas de cobertura.
                                                </p>
                                            </div>
                                        </>
                                    );
                                })()}
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
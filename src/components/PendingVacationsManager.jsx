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
    SelectAll as SelectAllIcon,
    Clear as ClearIcon,
    Refresh as RefreshIcon,
    HourglassEmpty as PendingFirstIcon,
    HourglassFull as PendingSecondIcon,
    Block as BlockedIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import { vacationService, VacationStatus } from '../services/vacationService';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './PendingVacationsManager.css';

const PendingVacationsManager = ({ onUpdate }) => {
    const { currentUser } = useAuth();
    const [pendingVacations, setPendingVacations] = useState([]);
    const [allVacations, setAllVacations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedVacations, setSelectedVacations] = useState([]);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingVacation, setRejectingVacation] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [approvingIds, setApprovingIds] = useState(new Set());
    const [bulkApproving, setBulkApproving] = useState(false);

    useEffect(() => {
        fetchPendingVacations();
    }, []);

    const fetchPendingVacations = async () => {
        try {
            setLoading(true);
            const data = await vacationService.getPendingVacations();
            setPendingVacations(data.pendingVacations || data);
            setAllVacations(data.allVacations || []);
        } catch (error) {
            console.error('Error al cargar solicitudes pendientes:', error);
            toast.error('Error al cargar solicitudes pendientes');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (vacationId) => {
        try {
            setApprovingIds(prev => new Set(prev).add(vacationId));
            const response = await vacationService.approveVacation(vacationId);
            toast.success(response.message);
            fetchPendingVacations();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error al aprobar solicitud:', error);
            const errorMessage = error.response?.data?.message || 'Error al aprobar la solicitud';
            toast.error(errorMessage);
        } finally {
            setApprovingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(vacationId);
                return newSet;
            });
        }
    };

    const handleReject = async () => {
        if (!rejectingVacation) return;

        try {
            await vacationService.rejectVacation(rejectingVacation.id, rejectReason);
            toast.success('Solicitud rechazada correctamente');
            setShowRejectModal(false);
            setRejectingVacation(null);
            setRejectReason('');
            fetchPendingVacations();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error al rechazar solicitud:', error);
            toast.error('Error al rechazar la solicitud');
        }
    };

    // Función para determinar si un administrador puede aprobar una solicitud específica
    const canApproveVacation = (vacation) => {
        if (!currentUser || currentUser.role !== 'administrador') {
            return false;
        }

        // No puede aprobar su propia solicitud
        if (vacation.userId === currentUser.id) {
            return false;
        }

        // Si está en estado PENDING, cualquier admin puede dar primera aprobación
        if (vacation.status === VacationStatus.PENDING || (!vacation.status && !vacation.isApproved)) {
            return true;
        }

        // Si está en estado FIRST_APPROVED, solo otro admin diferente puede dar segunda aprobación
        if (vacation.status === VacationStatus.FIRST_APPROVED) {
            return vacation.firstApprovedBy && vacation.firstApprovedBy.id !== currentUser.id;
        }

        return false;
    };

    // Función para obtener el texto del botón según el estado
    const getApproveButtonText = (vacation) => {
        if (vacation.status === VacationStatus.PENDING || (!vacation.status && !vacation.isApproved)) {
            return '1ª Aprobación';
        }
        if (vacation.status === VacationStatus.FIRST_APPROVED) {
            return '2ª Aprobación';
        }
        return 'Aprobar';
    };

    // Función para obtener el motivo por el cual no se puede aprobar
    const getBlockReason = (vacation) => {
        if (vacation.userId === currentUser?.id) {
            return 'No puedes aprobar tu propia solicitud';
        }
        if (vacation.status === VacationStatus.FIRST_APPROVED &&
            vacation.firstApprovedBy && vacation.firstApprovedBy.id === currentUser?.id) {
            return 'Ya diste la primera aprobación. Debe aprobar otro administrador';
        }
        return 'No se puede aprobar';
    };

    // Función para obtener el icono del estado
    const getStatusIcon = (vacation) => {
        const status = vacation.status || (vacation.isApproved ? VacationStatus.FULLY_APPROVED : VacationStatus.PENDING);

        switch (status) {
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

    // Función para obtener el texto del estado
    const getStatusText = (vacation) => {
        const status = vacation.status || (vacation.isApproved ? VacationStatus.FULLY_APPROVED : VacationStatus.PENDING);

        switch (status) {
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

    const handleBulkApprove = async () => {
        // Filtrar solo las vacaciones que el usuario actual puede aprobar
        const approvableVacations = selectedVacations.filter(vacationId => {
            const vacation = pendingVacations.find(v => v.id === vacationId);
            return canApproveVacation(vacation);
        });

        if (approvableVacations.length === 0) {
            toast.warning('No hay solicitudes que puedas aprobar en la selección');
            return;
        }

        try {
            setBulkApproving(true);
            const response = await vacationService.approveBulkVacations(approvableVacations);
            toast.success(response.message);
            setSelectedVacations([]);
            fetchPendingVacations();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error al aprobar solicitudes:', error);
            toast.error('Error al aprobar las solicitudes');
        } finally {
            setBulkApproving(false);
        }
    };

    const handleSelectVacation = (vacationId) => {
        setSelectedVacations(prev =>
            prev.includes(vacationId)
                ? prev.filter(id => id !== vacationId)
                : [...prev, vacationId]
        );
    };

    const handleSelectAll = () => {
        if (selectedVacations.length === pendingVacations.length) {
            setSelectedVacations([]);
        } else {
            setSelectedVacations(pendingVacations.map(v => v.id));
        }
    };

    const openRejectModal = (vacation) => {
        setRejectingVacation(vacation);
        setShowRejectModal(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Contar cuántas solicitudes puede aprobar el usuario actual
    const approvableCount = selectedVacations.filter(vacationId => {
        const vacation = pendingVacations.find(v => v.id === vacationId);
        return canApproveVacation(vacation);
    }).length;

    // Función para obtener conflictos de fecha para una solicitud específica
    const getDateConflicts = (vacation) => {
        if (!allVacations.length) return [];

        const vacationDate = new Date(vacation.date).toISOString().split('T')[0];

        return allVacations.filter(v => {
            const vDate = new Date(v.date).toISOString().split('T')[0];
            return vDate === vacationDate &&
                v.userId !== vacation.userId &&
                v.id !== vacation.id &&
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
                    <p>Gestiona las solicitudes de vacaciones que requieren aprobación</p>
                    <div className="approval-info-banner">
                        <PendingSecondIcon className="info-icon" />
                        <span>Sistema de doble aprobación: cada solicitud requiere la aprobación de dos administradores diferentes</span>
                    </div>
                </div>

                <div className="header-actions">
                    <button
                        className="btn-refresh"
                        onClick={fetchPendingVacations}
                        disabled={loading}
                    >
                        <RefreshIcon />
                        Actualizar
                    </button>

                    {pendingVacations.length > 0 && (
                        <>
                            <button
                                className="btn-select-all"
                                onClick={handleSelectAll}
                            >
                                {selectedVacations.length === pendingVacations.length ? (
                                    <>
                                        <ClearIcon />
                                        Deseleccionar todo
                                    </>
                                ) : (
                                    <>
                                        <SelectAllIcon />
                                        Seleccionar todo
                                    </>
                                )}
                            </button>

                            {selectedVacations.length > 0 && approvableCount > 0 && (
                                <button
                                    className="btn-bulk-approve"
                                    onClick={handleBulkApprove}
                                    disabled={bulkApproving}
                                >
                                    {bulkApproving ? (
                                        <>
                                            <div className="loading-spinner small"></div>
                                            Procesando aprobaciones...
                                        </>
                                    ) : (
                                        <>
                                            <ApproveIcon />
                                            Aprobar disponibles ({approvableCount} de {selectedVacations.length})
                                        </>
                                    )}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando solicitudes...</p>
                </div>
            ) : pendingVacations.length === 0 ? (
                <div className="empty-state">
                    <PendingIcon className="empty-icon" />
                    <h3>No hay solicitudes pendientes</h3>
                    <p>Todas las solicitudes de vacaciones han sido procesadas</p>
                </div>
            ) : (
                <div className="pending-list">
                    {pendingVacations.map((vacation) => (
                        <div key={vacation.id} className="pending-item">
                            <div className="item-checkbox">
                                <input
                                    type="checkbox"
                                    checked={selectedVacations.includes(vacation.id)}
                                    onChange={() => handleSelectVacation(vacation.id)}
                                />
                            </div>

                            <div className="item-info">
                                <div className="item-header">
                                    <div className="user-info">
                                        <PersonIcon className="user-icon" />
                                        <span className="user-name">{vacation.user.fullName}</span>
                                    </div>

                                    <div className="status-info">
                                        {getStatusIcon(vacation)}
                                        <span className="status-text">{getStatusText(vacation)}</span>
                                    </div>
                                </div>

                                <div className="item-details">
                                    <div className="detail-item">
                                        <CalendarIcon className="detail-icon" />
                                        <span>{formatDate(vacation.date)}</span>
                                    </div>

                                    <div className="detail-item">
                                        {vacation.type === 'rest_day' ? (
                                            <>
                                                <VacationIcon className="detail-icon vacation" />
                                                <span>Día de descanso</span>
                                            </>
                                        ) : (
                                            <>
                                                <WorkIcon className="detail-icon work" />
                                                <span>Día de trabajo extra</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {vacation.description && (
                                    <div className="item-description">
                                        <DescriptionIcon className="description-icon" />
                                        <span>{vacation.description}</span>
                                    </div>
                                )}

                                {/* Información sobre conflictos de fechas */}
                                {(() => {
                                    const conflicts = getDateConflicts(vacation);
                                    if (conflicts.length > 0) {
                                        return (
                                            <div className="date-conflicts-info">
                                                <div className="conflicts-header">
                                                    <WarningIcon className="conflicts-icon" />
                                                    <span className="conflicts-title">
                                                        Personas que también tienen vacaciones este día:
                                                    </span>
                                                </div>
                                                <div className="conflicts-list">
                                                    {conflicts.map(conflict => (
                                                        <div key={conflict.id} className="conflict-item">
                                                            <PersonIcon className="conflict-person-icon" />
                                                            <span className="conflict-person-name">
                                                                {conflict.user?.fullName || 'Usuario desconocido'}
                                                            </span>
                                                            <span className={`conflict-status ${conflict.status}`}>
                                                                {conflict.status === VacationStatus.FULLY_APPROVED && '(Aprobado)'}
                                                                {conflict.status === VacationStatus.PENDING && '(Pendiente 1ª)'}
                                                                {conflict.status === VacationStatus.FIRST_APPROVED && '(Pendiente 2ª)'}
                                                            </span>
                                                            <span className="conflict-type">
                                                                {conflict.type === 'rest_day' ? (
                                                                    <>
                                                                        <VacationIcon className="conflict-type-icon vacation" />
                                                                        Descanso
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <WorkIcon className="conflict-type-icon work" />
                                                                        Extra
                                                                    </>
                                                                )}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                                {/* Información de aprobaciones */}
                                {vacation.firstApprovedBy && (
                                    <div className="approval-info">
                                        <div className="approval-step completed">
                                            <ApproveIcon className="approval-icon" />
                                            <span>1ª Aprobación: {vacation.firstApprovedBy.fullName}</span>
                                            <span className="approval-date">
                                                {new Date(vacation.firstApprovedDate).toLocaleDateString('es-ES')}
                                            </span>
                                        </div>
                                        {vacation.status === VacationStatus.FIRST_APPROVED && (
                                            <div className="approval-step pending">
                                                <PendingSecondIcon className="approval-icon" />
                                                <span>Esperando 2ª aprobación de otro administrador</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="item-actions">
                                {canApproveVacation(vacation) ? (
                                    <button
                                        className="btn-approve"
                                        onClick={() => handleApprove(vacation.id)}
                                        title={`Dar ${getApproveButtonText(vacation)}`}
                                        disabled={approvingIds.has(vacation.id)}
                                    >
                                        {approvingIds.has(vacation.id) ? (
                                            <>
                                                <div className="loading-spinner small"></div>
                                                Aprobando...
                                            </>
                                        ) : (
                                            <>
                                                <ApproveIcon />
                                                {getApproveButtonText(vacation)}
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="btn-blocked" title={getBlockReason(vacation)}>
                                        <BlockedIcon />
                                        <span>No disponible</span>
                                    </div>
                                )}

                                <button
                                    className="btn-reject"
                                    onClick={() => openRejectModal(vacation)}
                                    title="Rechazar solicitud"
                                >
                                    <RejectIcon />
                                    Rechazar
                                </button>
                            </div>
                        </div>
                    ))}
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
                                <strong>{rejectingVacation?.user.fullName}</strong> para el{' '}
                                <strong>{formatDate(rejectingVacation?.date)}</strong>?
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
                                    setRejectingVacation(null);
                                    setRejectReason('');
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn-danger"
                                onClick={handleReject}
                            >
                                <RejectIcon />
                                Confirmar Rechazo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingVacationsManager; 
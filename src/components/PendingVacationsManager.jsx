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
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { vacationService } from '../services/vacationService';
import { toast } from 'react-toastify';
import './PendingVacationsManager.css';

const PendingVacationsManager = ({ onUpdate }) => {
    const [pendingVacations, setPendingVacations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedVacations, setSelectedVacations] = useState([]);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingVacation, setRejectingVacation] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchPendingVacations();
    }, []);

    const fetchPendingVacations = async () => {
        try {
            setLoading(true);
            const data = await vacationService.getPendingVacations();
            setPendingVacations(data);
        } catch (error) {
            console.error('Error al cargar solicitudes pendientes:', error);
            toast.error('Error al cargar solicitudes pendientes');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (vacationId) => {
        try {
            await vacationService.approveVacation(vacationId);
            toast.success('Solicitud aprobada correctamente');
            fetchPendingVacations();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error al aprobar solicitud:', error);
            toast.error('Error al aprobar la solicitud');
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

    const handleBulkApprove = async () => {
        if (selectedVacations.length === 0) {
            toast.warning('Selecciona al menos una solicitud');
            return;
        }

        try {
            await vacationService.approveBulkVacations(selectedVacations);
            toast.success(`Se aprobaron ${selectedVacations.length} solicitud(es) correctamente`);
            setSelectedVacations([]);
            fetchPendingVacations();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error al aprobar solicitudes:', error);
            toast.error('Error al aprobar las solicitudes');
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

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('es-ES');
    };

    if (loading && pendingVacations.length === 0) {
        return (
            <div className="pending-manager-loading">
                <div className="loading-spinner"></div>
                <p>Cargando solicitudes pendientes...</p>
            </div>
        );
    }

    return (
        <div className="pending-vacations-manager">
            <div className="manager-header">
                <div className="header-info">
                    <h2>
                        <PendingIcon />
                        Solicitudes Pendientes
                    </h2>
                    <p>{pendingVacations.length} solicitud(es) esperando aprobación</p>
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

                            {selectedVacations.length > 0 && (
                                <button
                                    className="btn-bulk-approve"
                                    onClick={handleBulkApprove}
                                >
                                    <ApproveIcon />
                                    Aprobar seleccionadas ({selectedVacations.length})
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {pendingVacations.length === 0 ? (
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

                            <div className="item-user">
                                <div className="user-avatar">
                                    {vacation.user.photoUrl ? (
                                        <img
                                            src={vacation.user.photoUrl}
                                            alt={vacation.user.fullName}
                                        />
                                    ) : (
                                        <PersonIcon />
                                    )}
                                </div>
                                <div className="user-info">
                                    <h4>{vacation.user.fullName}</h4>
                                    <p>{vacation.user.email}</p>
                                </div>
                            </div>

                            <div className="item-details">
                                <div className="detail-row">
                                    <CalendarIcon />
                                    <span>{formatDate(vacation.date)}</span>
                                </div>

                                <div className="detail-row">
                                    {vacation.type === 'rest_day' ? (
                                        <>
                                            <VacationIcon className="type-rest" />
                                            <span>Día de descanso</span>
                                        </>
                                    ) : (
                                        <>
                                            <WorkIcon className="type-work" />
                                            <span>Día de trabajo extra</span>
                                        </>
                                    )}
                                </div>

                                {vacation.description && (
                                    <div className="detail-row description">
                                        <DescriptionIcon />
                                        <span>{vacation.description}</span>
                                    </div>
                                )}

                                <div className="detail-row timestamp">
                                    <span>Solicitado: {formatDateTime(vacation.createdAt)}</span>
                                </div>
                            </div>

                            <div className="item-actions">
                                <button
                                    className="btn-approve"
                                    onClick={() => handleApprove(vacation.id)}
                                    title="Aprobar solicitud"
                                >
                                    <ApproveIcon />
                                    Aprobar
                                </button>

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
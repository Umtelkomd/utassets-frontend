import React, { useState, useEffect } from 'react';
import {
    CalendarToday as CalendarIcon,
    CheckBox as CheckBoxIcon,
    CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    BeachAccess as VacationIcon,
    Work as WorkIcon
} from '@mui/icons-material';
import { vacationService } from '../services/vacationService';
import { toast } from 'react-toastify';
import BulkDeleteConfirmationModal from './BulkDeleteConfirmationModal';
import './CancelVacationsModal.css';

const CancelVacationsModal = ({ isOpen, onClose, user, onVacationsDeleted }) => {
    const [userVacations, setUserVacations] = useState([]);
    const [selectedVacations, setSelectedVacations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            fetchUserVacations();
        }
    }, [isOpen, user]);

    const fetchUserVacations = async () => {
        try {
            setIsLoading(true);
            const vacations = await vacationService.getUserVacations(user.id);
            const restDayVacations = vacations.filter(vacation => vacation.type === 'rest_day');
            setUserVacations(restDayVacations);
            setSelectedVacations([]);
        } catch (error) {
            console.error('Error al cargar vacaciones del usuario:', error);
            toast.error('Error al cargar las vacaciones del usuario');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVacationToggle = (vacationId) => {
        setSelectedVacations(prev => {
            if (prev.includes(vacationId)) {
                return prev.filter(id => id !== vacationId);
            } else {
                return [...prev, vacationId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedVacations.length === userVacations.length) {
            setSelectedVacations([]);
        } else {
            setSelectedVacations(userVacations.map(v => v.id));
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedVacations.length === 0) {
            toast.warning('Selecciona al menos una vacación para eliminar');
            return;
        }

        setShowConfirmation(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setIsDeleting(true);
            await vacationService.deleteBulkVacations(selectedVacations);
            toast.success(`Se eliminaron ${selectedVacations.length} día(s) de vacación correctamente`);
            onVacationsDeleted();
            handleClose();
        } catch (error) {
            console.error('Error al eliminar vacaciones:', error);
            toast.error('Error al eliminar las vacaciones seleccionadas');
        } finally {
            setIsDeleting(false);
            setShowConfirmation(false);
        }
    };

    const handleCancelDelete = () => {
        setShowConfirmation(false);
    };

    const handleClose = () => {
        setSelectedVacations([]);
        onClose();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getVacationIcon = (type) => {
        return type === 'rest_day' ? <VacationIcon /> : <WorkIcon />;
    };

    const getVacationTypeText = (type) => {
        return type === 'rest_day' ? 'Día de descanso' : 'Día extra trabajado';
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="cancel-vacations-modal">
                <div className="modal-header">
                    <h2>
                        <DeleteIcon />
                        Cancelar Días de Descanso - {user?.fullName}
                    </h2>
                    <button className="close-button" onClick={handleClose}>
                        <CloseIcon />
                    </button>
                </div>

                <div className="modal-body">
                    {isLoading ? (
                        <div className="loading-message">
                            Cargando vacaciones...
                        </div>
                    ) : userVacations.length === 0 ? (
                        <div className="no-vacations-message">
                            <VacationIcon />
                            <p>Este usuario no tiene días de descanso registrados para el año actual.</p>
                        </div>
                    ) : (
                        <>
                            <div className="vacations-header">
                                <p>Selecciona los días de vacación que deseas cancelar:</p>
                                <button
                                    className="select-all-button"
                                    onClick={handleSelectAll}
                                >
                                    {selectedVacations.length === userVacations.length ? (
                                        <>
                                            <CheckBoxIcon />
                                            Deseleccionar todo
                                        </>
                                    ) : (
                                        <>
                                            <CheckBoxOutlineBlankIcon />
                                            Seleccionar todo
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="vacations-list">
                                {userVacations.map(vacation => (
                                    <div
                                        key={vacation.id}
                                        className={`vacation-item ${selectedVacations.includes(vacation.id) ? 'selected' : ''}`}
                                        onClick={() => handleVacationToggle(vacation.id)}
                                    >
                                        <div className="vacation-checkbox">
                                            {selectedVacations.includes(vacation.id) ? (
                                                <CheckBoxIcon className="checked" />
                                            ) : (
                                                <CheckBoxOutlineBlankIcon />
                                            )}
                                        </div>

                                        <div className="vacation-info">
                                            <div className="vacation-date">
                                                <CalendarIcon />
                                                {vacation.dayCount === 1 ? (
                                                    formatDate(vacation.startDate)
                                                ) : (
                                                    `${formatDate(vacation.startDate)} - ${formatDate(vacation.endDate)} (${vacation.dayCount} días)`
                                                )}
                                            </div>

                                            <div className="vacation-type">
                                                {getVacationIcon(vacation.type)}
                                                {getVacationTypeText(vacation.type)}
                                            </div>

                                            {vacation.description && (
                                                <div className="vacation-description">
                                                    {vacation.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="selection-summary">
                                <p>
                                    {selectedVacations.length > 0
                                        ? `${selectedVacations.length} día(s) seleccionado(s) para eliminar`
                                        : 'Ningún día seleccionado'
                                    }
                                </p>
                            </div>
                        </>
                    )}
                </div>

                <div className="modal-actions">
                    {userVacations.length > 0 && (
                        <button
                            className="btn-delete"
                            onClick={handleDeleteSelected}
                            disabled={selectedVacations.length === 0 || isDeleting}
                        >
                            <DeleteIcon />
                            {isDeleting ? 'Eliminando...' : `Eliminar ${selectedVacations.length} día(s)`}
                        </button>
                    )}
                    <button
                        className="btn-secondary"
                        onClick={handleClose}
                        disabled={isDeleting}
                    >
                        Cancelar
                    </button>
                </div>
            </div>

            {/* Modal de confirmación personalizado */}
            <BulkDeleteConfirmationModal
                isOpen={showConfirmation}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                selectedCount={selectedVacations.length}
                userName={user?.fullName}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default CancelVacationsModal; 
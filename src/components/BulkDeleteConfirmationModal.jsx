import React from 'react';
import {
    Warning as WarningIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
    CalendarToday as CalendarIcon
} from '@mui/icons-material';
import './BulkDeleteConfirmationModal.css';

const BulkDeleteConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    selectedCount,
    userName,
    isDeleting = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="bulk-delete-confirmation-modal">
                <div className="modal-header">
                    <div className="warning-icon">
                        <WarningIcon />
                    </div>
                    <h2>Confirmar Eliminación</h2>
                    <button className="close-button" onClick={onClose} disabled={isDeleting}>
                        <CloseIcon />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="confirmation-message">
                        <p>
                            ¿Estás seguro de que deseas eliminar <strong>{selectedCount} día(s) de descanso</strong> de <strong>{userName}</strong>?
                        </p>
                    </div>

                    <div className="warning-details">
                        <div className="warning-item">
                            <CalendarIcon />
                            <span>Esta acción no se puede deshacer</span>
                        </div>
                        <div className="warning-item">
                            <DeleteIcon />
                            <span>Los días seleccionados serán eliminados permanentemente</span>
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button
                        className="btn-cancel"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancelar
                    </button>
                    <button
                        className="btn-delete"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        <DeleteIcon />
                        {isDeleting ? 'Eliminando...' : `Eliminar ${selectedCount} día(s)`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkDeleteConfirmationModal; 
import React from 'react';
import './DeleteConfirmationModal.css';

// Iconos de Material UI
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';

const DeleteConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    message
}) => {
    if (!isOpen) return null;

    const defaultMessage = `¿Estás seguro de eliminar "${itemName}"?`;

    return (
        <div className="modal-overlay">
            <div className="modal-content delete-modal">
                <div className="modal-header">
                    <h2>Confirmar Eliminación</h2>
                    <button className="close-button" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="warning-icon">
                        <WarningIcon />
                    </div>
                    <p>{message || defaultMessage}</p>
                    <p className="warning-text">Esta acción no se puede deshacer.</p>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="btn-danger" onClick={onConfirm}>
                        <DeleteIcon sx={{ mr: 1 }} /> Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal; 
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
    title = 'Confirmar Eliminación',
    itemName = '',
    message
}) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    };

    const handleClose = () => {
        if (typeof onClose === 'function') {
            onClose();
        }
    };

    const defaultMessage = itemName ? `¿Estás seguro de eliminar "${itemName}"?` : '¿Estás seguro de que deseas eliminar este elemento?';

    return (
        <div className="modal-overlay">
            <div className="modal-content delete-modal">
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="close-button" onClick={handleClose}>
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
                    <button className="btn-secondary" onClick={handleClose}>
                        Cancelar
                    </button>
                    <button className="btn-danger" onClick={handleConfirm}>
                        <DeleteIcon sx={{ mr: 1 }} /> Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal; 
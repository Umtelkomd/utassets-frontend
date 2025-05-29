import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import './ActionButtons.css';

const DeleteButton = ({ onDelete, itemId, itemName, className = "btn-action delete" }) => {
    const handleDelete = (e) => {
        e.preventDefault();
        if (typeof onDelete === 'function') {
            if (itemId !== undefined) {
                onDelete(itemId, itemName);
            } else {
                onDelete();
            }
        }
    };

    return (
        <button
            className={className}
            onClick={handleDelete}
            title="Eliminar"
            type="button"
        >
            <DeleteIcon />
        </button>
    );
};

export default DeleteButton; 
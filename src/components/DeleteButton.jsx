import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import './ActionButtons.css';

const DeleteButton = ({ onDelete, itemId, itemName, className = "btn-action delete" }) => {
    const handleDelete = () => {
        onDelete(itemId, itemName);
    };

    return (
        <button
            className={className}
            onClick={handleDelete}
            title="Eliminar"
        >
            <DeleteIcon />
        </button>
    );
};

export default DeleteButton; 
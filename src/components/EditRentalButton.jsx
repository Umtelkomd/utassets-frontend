import React from 'react';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import './ActionButtons.css';

const EditRentalButton = ({ rentalId, rentalType, className = "btn-action edit" }) => {
    const navigate = useNavigate();

    const handleEdit = (e) => {
        e.stopPropagation();
        if (!rentalType) {
            console.error('Tipo de rental no especificado');
            return;
        }
        navigate(`/rentals/edit/${rentalType}/${rentalId}`);
    };

    return (
        <button
            className={className}
            onClick={handleEdit}
            title="Editar alquiler"
            aria-label="Editar alquiler"
        >
            <EditIcon />
        </button>
    );
};

export default EditRentalButton;

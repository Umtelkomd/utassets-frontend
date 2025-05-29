import React from 'react';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import './ActionButtons.css';

const ViewRentalButton = ({ rentalId, rentalType, className = "btn-action view" }) => {
    const navigate = useNavigate();

    const handleView = (e) => {
        e.stopPropagation();
        if (!rentalType) {
            console.error('Tipo de rental no especificado');
            return;
        }
        navigate(`/rentals/view/${rentalType}/${rentalId}`);
    };

    return (
        <button
            className={className}
            onClick={handleView}
            title="Ver detalles"
            aria-label="Ver detalles del alquiler"
        >
            <VisibilityIcon />
        </button>
    );
};

export default ViewRentalButton; 
import React from 'react';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import './ActionButtons.css';

const ViewButton = ({ itemId, basePath = "vehicles", className = "vehicle-action-button vehicle-view-button" }) => {
    const navigate = useNavigate();

    const handleView = () => {
        navigate(`/${basePath}/${itemId}`);
    };

    return (
        <button
            className={className}
            onClick={handleView}
            title="Ver detalles"
        >
            <VisibilityIcon />
        </button>
    );
};

export default ViewButton; 
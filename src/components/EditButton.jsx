import React from 'react';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import './ActionButtons.css';

const EditButton = ({ itemId, type = 'inventory', className = "btn-action edit" }) => {
    const navigate = useNavigate();

    const handleEdit = () => {
        switch (type) {
            case 'vehicle':
                navigate(`/vehicles/edit/${itemId}`);
                break;
            case 'inventory':
            default:
                navigate(`/inventory/edit/${itemId}`);
                break;
        }
    };

    return (
        <button
            className={className}
            onClick={handleEdit}
            title="Editar"
        >
            <EditIcon />
        </button>
    );
};

export default EditButton; 
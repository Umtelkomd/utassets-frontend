import React from 'react';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import { usePermissions } from '../context/PermissionsContext';

const EditHousingButton = ({ housingId }) => {
    const navigate = useNavigate();
    const { hasPermission } = usePermissions();

    const canEdit = hasPermission('canEditHousing');

    if (!canEdit) {
        return null;
    }

    const handleEdit = () => {
        navigate(`/housing/edit/${housingId}`);
    };

    return (
        <button
            className="btn-edit"
            onClick={handleEdit}
            title="Editar vivienda"
        >
            <EditIcon /> Editar
        </button>
    );
};

export default EditHousingButton; 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';
import financingService from '../services/financingService';
import LoadingSpinner from '../components/LoadingSpinner';
import AddFinancing from './AddFinancing';

const EditFinancing = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { hasPermission } = usePermissions();
    const [financing, setFinancing] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!hasPermission('canEditFinancings')) {
            navigate('/financings');
            return;
        }

        fetchFinancing();
    }, [id]);

    const fetchFinancing = async () => {
        try {
            setIsLoading(true);
            const data = await financingService.getFinancingById(id);
            setFinancing(data);
        } catch (error) {
            console.error('Error fetching financing:', error);
            navigate('/financings');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <LoadingSpinner message="Cargando financiamiento..." />;
    }

    if (!financing) {
        return (
            <div className="error-message">
                <h2>Financiamiento no encontrado</h2>
                <button onClick={() => navigate('/financings')}>
                    Volver a Financiamientos
                </button>
            </div>
        );
    }

    // Pasar datos del financiamiento al componente AddFinancing
    return (
        <AddFinancing
            editMode={true}
            financingData={financing}
        />
    );
};

export default EditFinancing; 
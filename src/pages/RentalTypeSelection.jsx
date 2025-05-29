import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RentalTypeSelection.css';

// Iconos
import InventoryIcon from '@mui/icons-material/Inventory';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const RentalTypeSelection = () => {
    const navigate = useNavigate();

    const rentalTypes = [
        {
            id: 'item',
            title: 'Artículo',
            description: 'Alquiler de equipos, herramientas y otros artículos',
            icon: <InventoryIcon />,
            path: '/rentals/new/item'
        },
        {
            id: 'vehicle',
            title: 'Vehículo',
            description: 'Alquiler de automóviles, motocicletas y otros vehículos',
            icon: <DirectionsCarIcon />,
            path: '/rentals/new/vehicle'
        },
        {
            id: 'housing',
            title: 'Vivienda',
            description: 'Alquiler de casas, apartamentos y otros inmuebles',
            icon: <HomeIcon />,
            path: '/rentals/new/housing'
        }
    ];

    return (
        <div className="rental-type-selection">
            <div className="page-header">
                <button
                    className="btn-back"
                    onClick={() => navigate('/rentals')}
                >
                    <ArrowBackIcon /> Volver
                </button>
                <h1>Seleccionar Tipo de Alquiler</h1>
            </div>

            <div className="rental-types-grid">
                {rentalTypes.map((type) => (
                    <div
                        key={type.id}
                        className="rental-type-card"
                        onClick={() => navigate(type.path)}
                    >
                        <div className="rental-type-icon">
                            {type.icon}
                        </div>
                        <h2>{type.title}</h2>
                        <p>{type.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RentalTypeSelection; 
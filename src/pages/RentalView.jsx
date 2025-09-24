import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getRentalById } from '../services/rentalService';
import './RentalView.css';
import LoadingSpinner from '../components/LoadingSpinner';
import RentalCalendar from '../components/RentalCalendar';

// Iconos
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import BusinessIcon from '@mui/icons-material/Business';
import PhoneIcon from '@mui/icons-material/Phone';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import EditIcon from '@mui/icons-material/Edit';

const RentalView = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const [rental, setRental] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRental();
    }, [id]);

    const fetchRental = async () => {
        setIsLoading(true);
        try {
            const data = await getRentalById(id);
            console.log('Datos del rental:', data);
            setRental(data);
        } catch (error) {
            toast.error('Error al cargar los detalles del alquiler');
            console.error('Error detallado:', error);
            navigate('/rentals');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha no disponible';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Fecha inválida';
            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            };
            return date.toLocaleDateString('es-ES', options);
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return 'Error en fecha';
        }
    };

    const calculateDuration = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return diffDays;
        } catch (error) {
            console.error('Error al calcular duración:', error);
            return 0;
        }
    };

    const formatCurrency = (value) => {
        const number = Number(value);
        return isNaN(number) ? '0.00' : number.toFixed(2);
    };

    const getItemName = (rental) => {
        switch (rental.type) {
            case 'housing':
                return rental.housing?.address || 'Vivienda sin dirección';
            case 'vehicle':
                return `${rental.vehicle?.brand || ''} ${rental.vehicle?.model || ''}`.trim() || 'Vehículo sin especificar';
            case 'item':
                return rental.inventory?.itemName || 'Ítem sin nombre';
            default:
                return 'Tipo de alquiler desconocido';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'housing':
                return <HomeIcon />;
            case 'vehicle':
                return <DirectionsCarIcon />;
            case 'item':
                return <InventoryIcon />;
            default:
                return <InventoryIcon />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'housing':
                return 'Alquiler de Vivienda';
            case 'vehicle':
                return 'Alquiler de Vehículo';
            case 'item':
                return 'Alquiler de Ítem';
            default:
                return 'Alquiler';
        }
    };

    const handleEdit = () => {
        navigate(`/rentals/edit/${rental.type}/${rental.id}`);
    };

    if (isLoading) {
        return <LoadingSpinner message="Cargando detalles del alquiler..." />;
    }

    if (!rental) {
        return (
            <div className="rental-view-page">
                <div className="page-header">
                    <button
                        className="btn-back"
                        onClick={() => navigate('/rentals')}
                    >
                        <ArrowBackIcon /> Volver
                    </button>
                    <h1>Alquiler no encontrado</h1>
                </div>
                <div className="not-found">
                    <p>No se pudo cargar la información del alquiler</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rental-view-page">
            <div className="page-header">
                <button
                    className="btn-back"
                    onClick={() => navigate('/rentals')}
                >
                    <ArrowBackIcon /> Volver
                </button>
                <div className="header-title">
                    <h1>{getTypeLabel(rental.type)}</h1>
                    <span className="rental-type-badge">
                        {getTypeIcon(rental.type)}
                        {getTypeLabel(rental.type)}
                    </span>
                </div>
                <button
                    className="btn-edit"
                    onClick={handleEdit}
                >
                    <EditIcon /> Editar
                </button>
            </div>

            <div className="rental-view-content">
                {/* Información Principal */}
                <div className="info-section main-info">
                    <h2>Información Principal</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <div className="info-label">Ítem/Propiedad</div>
                            <div className="info-value main-title">{getItemName(rental)}</div>
                        </div>

                        {/* Imagen si existe */}
                        {((rental.type === 'housing' && rental.housing?.photoUrl) ||
                            (rental.type === 'vehicle' && rental.vehicle?.photoUrl) ||
                            (rental.type === 'item' && rental.inventory?.photoUrl)) && (
                                <div className="rental-image-container">
                                    <img
                                        src={
                                            rental.type === 'housing' ? rental.housing.photoUrl :
                                                rental.type === 'vehicle' ? rental.vehicle.photoUrl :
                                                    rental.inventory.photoUrl
                                        }
                                        alt={getItemName(rental)}
                                        className="rental-main-image"
                                    />
                                </div>
                            )}
                    </div>
                </div>

                {/* Información de Fechas */}
                <div className="info-section dates-section">
                    <h2><CalendarMonthIcon /> Período de Alquiler</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <div className="info-label">Fecha de Inicio</div>
                            <div className="info-value">{formatDate(rental.startDate)}</div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">Fecha de Fin</div>
                            <div className="info-value">{formatDate(rental.endDate)}</div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">Duración</div>
                            <div className="info-value">{calculateDuration(rental.startDate, rental.endDate)} días</div>
                        </div>
                    </div>

                    {/* Calendario Visual del Alquiler */}
                    <div style={{ marginTop: '1.5rem' }}>
                        <RentalCalendar
                            startDate={rental.startDate}
                            endDate={rental.endDate}
                        />
                    </div>
                </div>

                {/* Información de Costos */}
                <div className="info-section cost-section">
                    <h2><CurrencyExchangeIcon /> Información de Costos</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <div className="info-label">Costo por Día</div>
                            <div className="info-value">${formatCurrency(rental.dailyCost)}</div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">Total</div>
                            <div className="info-value total-amount">${formatCurrency(rental.total)}</div>
                        </div>
                        {rental.peopleCount > 0 && (
                            <div className="info-item">
                                <div className="info-label"><PeopleIcon /> Personas</div>
                                <div className="info-value">{rental.peopleCount}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Información Específica según el Tipo */}
                {rental.type === 'housing' && rental.housing && (
                    <div className="info-section housing-details">
                        <h2><HomeIcon /> Detalles de la Vivienda</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <div className="info-label"><LocationOnIcon /> Dirección</div>
                                <div className="info-value">{rental.housing.address}</div>
                            </div>
                            {rental.housing.squareMeters && (
                                <div className="info-item">
                                    <div className="info-label">Metros Cuadrados</div>
                                    <div className="info-value">{rental.housing.squareMeters} m²</div>
                                </div>
                            )}
                            {rental.housing.bedrooms && (
                                <div className="info-item">
                                    <div className="info-label"><BedIcon /> Habitaciones</div>
                                    <div className="info-value">{rental.housing.bedrooms}</div>
                                </div>
                            )}
                            {rental.housing.bathrooms && (
                                <div className="info-item">
                                    <div className="info-label"><BathtubIcon /> Baños</div>
                                    <div className="info-value">{rental.housing.bathrooms}</div>
                                </div>
                            )}
                            {rental.metadata?.bedrooms && (
                                <div className="info-item">
                                    <div className="info-label"><BedIcon /> Habitaciones (Metadata)</div>
                                    <div className="info-value">{rental.metadata.bedrooms}</div>
                                </div>
                            )}
                            {rental.metadata?.bathrooms && (
                                <div className="info-item">
                                    <div className="info-label"><BathtubIcon /> Baños (Metadata)</div>
                                    <div className="info-value">{rental.metadata.bathrooms}</div>
                                </div>
                            )}
                            {rental.metadata?.guestCount && (
                                <div className="info-item">
                                    <div className="info-label"><PeopleIcon /> Capacidad Huéspedes</div>
                                    <div className="info-value">{rental.metadata.guestCount} personas</div>
                                </div>
                            )}
                            {rental.metadata?.baseGuestCount && (
                                <div className="info-item">
                                    <div className="info-label">Huéspedes Base</div>
                                    <div className="info-value">{rental.metadata.baseGuestCount} personas</div>
                                </div>
                            )}
                            {rental.metadata?.amenities && rental.metadata.amenities.length > 0 && (
                                <div className="info-item full-width">
                                    <div className="info-label">Amenidades</div>
                                    <div className="info-value">{rental.metadata.amenities.join(', ')}</div>
                                </div>
                            )}
                            {rental.metadata?.rules && (
                                <div className="info-item full-width">
                                    <div className="info-label">Reglas</div>
                                    <div className="info-value">{rental.metadata.rules}</div>
                                </div>
                            )}
                            {rental.housing.description && (
                                <div className="info-item full-width">
                                    <div className="info-label">Descripción</div>
                                    <div className="info-value">{rental.housing.description}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {rental.type === 'vehicle' && rental.vehicle && (
                    <div className="info-section vehicle-details">
                        <h2><DirectionsCarIcon /> Detalles del Vehículo</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <div className="info-label">Marca</div>
                                <div className="info-value">{rental.vehicle.brand}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Modelo</div>
                                <div className="info-value">{rental.vehicle.model}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Placa</div>
                                <div className="info-value">{rental.vehicle.plate || rental.vehicle.licensePlate || 'No especificada'}</div>
                            </div>
                            {rental.vehicle.year && (
                                <div className="info-item">
                                    <div className="info-label">Año</div>
                                    <div className="info-value">{rental.vehicle.year}</div>
                                </div>
                            )}
                            {rental.vehicle.color && (
                                <div className="info-item">
                                    <div className="info-label">Color</div>
                                    <div className="info-value">{rental.vehicle.color}</div>
                                </div>
                            )}
                            {rental.vehicle.mileage && (
                                <div className="info-item">
                                    <div className="info-label">Kilometraje</div>
                                    <div className="info-value">{rental.vehicle.mileage} km</div>
                                </div>
                            )}
                            {rental.metadata?.mileage && (
                                <div className="info-item">
                                    <div className="info-label">Kilometraje (Metadata)</div>
                                    <div className="info-value">{rental.metadata.mileage} km</div>
                                </div>
                            )}
                            {rental.vehicle.fuelType && (
                                <div className="info-item">
                                    <div className="info-label">Tipo de Combustible</div>
                                    <div className="info-value">{rental.vehicle.fuelType}</div>
                                </div>
                            )}
                            {rental.vehicle.transmission && (
                                <div className="info-item">
                                    <div className="info-label">Transmisión</div>
                                    <div className="info-value">{rental.vehicle.transmission}</div>
                                </div>
                            )}
                            {rental.vehicle.engine && (
                                <div className="info-item">
                                    <div className="info-label">Motor</div>
                                    <div className="info-value">{rental.vehicle.engine}</div>
                                </div>
                            )}
                            {rental.vehicle.category && (
                                <div className="info-item">
                                    <div className="info-label">Categoría</div>
                                    <div className="info-value">{rental.vehicle.category}</div>
                                </div>
                            )}
                            {rental.vehicle.status && (
                                <div className="info-item">
                                    <div className="info-label">Estado</div>
                                    <div className="info-value">{rental.vehicle.status}</div>
                                </div>
                            )}
                            {rental.vehicle.description && (
                                <div className="info-item full-width">
                                    <div className="info-label">Descripción</div>
                                    <div className="info-value">{rental.vehicle.description}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {rental.type === 'item' && rental.inventory && (
                    <div className="info-section item-details">
                        <h2><InventoryIcon /> Detalles del Ítem</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <div className="info-label">Nombre</div>
                                <div className="info-value">{rental.inventory.itemName}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Categoría</div>
                                <div className="info-value">{rental.inventory.category}</div>
                            </div>
                            {rental.inventory.brand && (
                                <div className="info-item">
                                    <div className="info-label">Marca</div>
                                    <div className="info-value">{rental.inventory.brand}</div>
                                </div>
                            )}
                            {rental.inventory.model && (
                                <div className="info-item">
                                    <div className="info-label">Modelo</div>
                                    <div className="info-value">{rental.inventory.model}</div>
                                </div>
                            )}
                            {rental.inventory.serialNumber && (
                                <div className="info-item">
                                    <div className="info-label">Número de Serie</div>
                                    <div className="info-value">{rental.inventory.serialNumber}</div>
                                </div>
                            )}
                            {rental.inventory.condition && (
                                <div className="info-item">
                                    <div className="info-label">Condición</div>
                                    <div className="info-value">{rental.inventory.condition}</div>
                                </div>
                            )}
                            {rental.inventory.status && (
                                <div className="info-item">
                                    <div className="info-label">Estado</div>
                                    <div className="info-value">{rental.inventory.status}</div>
                                </div>
                            )}
                            {rental.inventory.location && (
                                <div className="info-item">
                                    <div className="info-label"><LocationOnIcon /> Ubicación</div>
                                    <div className="info-value">{rental.inventory.location}</div>
                                </div>
                            )}
                            {rental.inventory.purchaseDate && (
                                <div className="info-item">
                                    <div className="info-label">Fecha de Compra</div>
                                    <div className="info-value">{formatDate(rental.inventory.purchaseDate)}</div>
                                </div>
                            )}
                            {rental.inventory.purchasePrice && (
                                <div className="info-item">
                                    <div className="info-label">Precio de Compra</div>
                                    <div className="info-value">${formatCurrency(rental.inventory.purchasePrice)}</div>
                                </div>
                            )}
                            {rental.inventory.dailyRentalCost && (
                                <div className="info-item">
                                    <div className="info-label">Costo Diario Base</div>
                                    <div className="info-value">${formatCurrency(rental.inventory.dailyRentalCost)}</div>
                                </div>
                            )}
                            {rental.metadata?.condition && (
                                <div className="info-item">
                                    <div className="info-label">Condición (Metadata)</div>
                                    <div className="info-value">{rental.metadata.condition}</div>
                                </div>
                            )}
                            {rental.inventory.description && (
                                <div className="info-item full-width">
                                    <div className="info-label">Descripción</div>
                                    <div className="info-value">{rental.inventory.description}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Información del Proveedor/Dealer si existe */}
                {rental.metadata && (rental.metadata.dealerName || rental.metadata.dealerAddress || rental.metadata.dealerPhone) && (
                    <div className="info-section dealer-info">
                        <h2><BusinessIcon /> Información del Proveedor</h2>
                        <div className="info-grid">
                            {rental.metadata.dealerName && (
                                <div className="info-item">
                                    <div className="info-label">Nombre</div>
                                    <div className="info-value">{rental.metadata.dealerName}</div>
                                </div>
                            )}
                            {rental.metadata.dealerAddress && (
                                <div className="info-item">
                                    <div className="info-label"><LocationOnIcon /> Dirección</div>
                                    <div className="info-value">{rental.metadata.dealerAddress}</div>
                                </div>
                            )}
                            {rental.metadata.dealerPhone && (
                                <div className="info-item">
                                    <div className="info-label"><PhoneIcon /> Teléfono</div>
                                    <div className="info-value">{rental.metadata.dealerPhone}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Comentarios */}
                {rental.comments && (
                    <div className="info-section comments-section">
                        <h2><DescriptionIcon /> Comentarios</h2>
                        <div className="comments-content">
                            {rental.comments}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RentalView; 
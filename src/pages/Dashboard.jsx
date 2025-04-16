// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

// Iconos de Material UI
import {
    Inventory as InventoryIcon,
    Build as BuildIcon,
    Category as CategoryIcon,
    Assignment as AssignmentIcon,
    LocationOn as LocationOnIcon,
    DirectionsCar as DirectionsCarIcon,
    Map as MapIcon,
    Place as PlaceIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    TrendingUp as TrendingUpIcon,
    Add as AddIcon
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalItems: 0,
        totalCategories: 0,
        maintenanceNeeded: 0,
        itemsByCategory: [],
        itemsByCondition: [],
        itemsByLocation: [],
        recentItems: [],
        // Nuevas estadísticas para vehículos
        totalVehicles: 0,
        vehiclesByStatus: [],
        vehiclesNeedingMaintenance: 0,
        recentVehicles: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                // En un entorno real, tendríamos un endpoint específico para estadísticas
                // Aquí simularemos procesando los datos del inventario y vehículos
                const [inventoryResponse, vehiclesResponse] = await Promise.all([
                    axios.get(`${API_URL}/inventory`),
                    axios.get(`${API_URL}/vehicles`)
                ]);

                const items = inventoryResponse.data;
                const vehicles = vehiclesResponse.data;

                // Procesar datos para estadísticas
                const totalItems = items.length;

                // Obtener categorías únicas
                const categories = [...new Set(items.map(item => item.category))];
                const totalCategories = categories.length;

                // Items que necesitan mantenimiento
                const maintenanceNeeded = items.filter(item =>
                    item.condition === 'Necesita Reparación' ||
                    item.condition === 'Fuera de Servicio'
                ).length;

                // Agrupar por categoría
                const itemsByCategory = categories.map(category => {
                    const count = items.filter(item => item.category === category).length;
                    return { category, count };
                }).sort((a, b) => b.count - a.count);

                // Agrupar por condición
                const conditions = ['Excelente', 'Bueno', 'Regular', 'Necesita Reparación', 'Fuera de Servicio'];
                const itemsByCondition = conditions.map(condition => {
                    const count = items.filter(item => item.condition === condition).length;
                    return { condition, count };
                });

                // Agrupar por ubicación
                const locations = [...new Set(items.map(item => item.location))];
                const itemsByLocation = locations.map(location => {
                    const count = items.filter(item => item.location === location).length;
                    return { location, count };
                }).sort((a, b) => b.count - a.count).slice(0, 5); // Top 5 ubicaciones

                // Items más recientes (basados en la fecha de creación)
                const recentItems = [...items]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 5);

                // Estadísticas de vehículos
                const totalVehicles = vehicles.length;

                // Agrupar vehículos por estado
                const vehicleStatuses = ['Operativo', 'En Reparación', 'Fuera de Servicio'];
                const vehiclesByStatus = vehicleStatuses.map(status => {
                    const count = vehicles.filter(vehicle => vehicle.vehicleStatus === status).length;
                    return { status, count };
                });

                // Vehículos que necesitan mantenimiento (no operativos)
                const vehiclesNeedingMaintenance = vehicles.filter(
                    vehicle => vehicle.vehicleStatus !== 'Operativo'
                ).length;

                // Vehículos más recientes
                const recentVehicles = [...vehicles]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5)
                    .map(vehicle => {
                        console.log('Procesando vehículo para mostrar en dashboard:', vehicle);
                        // Asegurar que todos los campos necesarios estén presentes
                        return {
                            ...vehicle,
                            licensePlate: vehicle.licensePlate || vehicle.license_plate || vehicle.placa || 'Sin placa',
                            brand: vehicle.brand || 'Sin marca',
                            model: vehicle.model || 'Sin modelo',
                            vehicleStatus: vehicle.vehicleStatus || vehicle.condition || 'Desconocido',
                            fuelType: vehicle.fuelType || 'No especificado'
                        };
                    });

                setStats({
                    totalItems,
                    totalCategories,
                    maintenanceNeeded,
                    itemsByCategory,
                    itemsByCondition,
                    itemsByLocation,
                    recentItems,
                    totalVehicles,
                    vehiclesByStatus,
                    vehiclesNeedingMaintenance,
                    recentVehicles
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="page-loading-spinner">
                <p>Cargando estadísticas...</p>
            </div>
        );
    }

    /* Ubicaciones importantes para la empresa */
    const companyLocations = [
        {
            country: 'Colombia',
            city: 'Manizales',
            name: 'Oficina Central',
            description: 'Sede principal de la empresa',
            coordinates: { lat: 5.0689, lng: -75.5174 },
            address: 'Calle 23 # 23-23'
        },
        {
            country: 'Colombia',
            city: 'Manizales',
            name: 'Taller de Mantenimiento',
            description: 'Centro de reparación y mantenimiento',
            coordinates: { lat: 5.0689, lng: -75.5174 },
            address: 'Calle 24 # 24-24'
        },
        {
            country: 'Colombia',
            city: 'Bogotá',
            name: 'Oficina Central',
            description: 'Sede principal de la empresa',
            coordinates: { lat: 4.6097, lng: -74.0845 },
            address: 'Carrera 7 # 7-7'
        },
        {
            country: 'Colombia',
            city: 'Bogotá',
            name: 'Almacén de Suministros',
            description: 'Depósito de materiales y herramientas',
            coordinates: { lat: 4.6097, lng: -74.0845 },
            address: 'Carrera 8 # 8-8'
        },
        {
            country: 'Alemania',
            city: 'Berlín',
            name: 'Oficina Central',
            description: 'Sede principal en Europa',
            coordinates: { lat: 52.5200, lng: 13.4050 },
            address: 'Unter den Linden 1'
        },
        {
            country: 'Alemania',
            city: 'Berlín',
            name: 'Centro de Distribución',
            description: 'Centro logístico principal',
            coordinates: { lat: 52.5200, lng: 13.4050 },
            address: 'Friedrichstraße 2'
        },
        {
            country: 'Alemania',
            city: 'Múnich',
            name: 'Oficina Regional',
            description: 'Sede regional sur de Alemania',
            coordinates: { lat: 48.1351, lng: 11.5820 },
            address: 'Marienplatz 1'
        }
    ];

    // Agrupar ubicaciones por país y ciudad
    const locationsByCountry = companyLocations.reduce((acc, location) => {
        if (!acc[location.country]) {
            acc[location.country] = {};
        }
        if (!acc[location.country][location.city]) {
            acc[location.country][location.city] = [];
        }
        acc[location.country][location.city].push(location);
        return acc;
    }, {});

    const getGoogleMapsLink = (location) => {
        return `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`;
    };

    return (
        <div className="dashboard-page">
            <h1 className="dashboard-title">
                <span className="panda-logo">🐼</span>
                Dashboard Panda Assets
            </h1>

            {/* Acciones rápidas */}
            <div className="quick-actions-bar">
                <Link to="/inventory/new" className="quick-action">
                    <InventoryIcon />
                    <span>Añadir Item</span>
                </Link>
                <Link to="/inventory" className="quick-action">
                    <BuildIcon />
                    <span>Ver Inventario</span>
                </Link>
                <Link to="/vehicles" className="quick-action">
                    <DirectionsCarIcon />
                    <span>Ver Vehículos</span>
                </Link>
            </div>

            <div className="dashboard-grid">
                {/* Tarjetas de resumen */}
                <div className="summary-card total-items">
                    <div className="summary-icon">
                        <InventoryIcon />
                    </div>
                    <div className="summary-content">
                        <h3>Total de Items</h3>
                        <div className="summary-value">{stats.totalItems}</div>
                    </div>
                </div>

                <div className="summary-card total-categories">
                    <div className="summary-icon">
                        <CategoryIcon />
                    </div>
                    <div className="summary-content">
                        <h3>Categorías</h3>
                        <div className="summary-value">{stats.totalCategories}</div>
                    </div>
                </div>

                <div className="summary-card maintenance-needed">
                    <div className="summary-icon">
                        <BuildIcon />
                    </div>
                    <div className="summary-content">
                        <h3>Mantenimiento Necesario</h3>
                        <div className="summary-value">{stats.maintenanceNeeded}</div>
                    </div>
                </div>

                <div className="summary-card vehicles-card">
                    <div className="summary-icon">
                        <DirectionsCarIcon />
                    </div>
                    <div className="summary-content">
                        <h3>Vehículos</h3>
                        <div className="summary-value">{stats.totalVehicles}</div>
                    </div>
                </div>

                {/* Sección de bienvenida */}
                {stats.totalItems === 0 && (
                    <div className="empty-dashboard">
                        <div className="empty-state">
                            <div className="empty-icon">
                                <InventoryIcon />
                            </div>
                            <h3>¡Bienvenido a tu Dashboard!</h3>
                            <p>
                                Parece que aún no tienes ningún item registrado.
                                Comienza agregando tus primeros items para verlos reflejados aquí.
                            </p>
                            <div className="empty-actions">
                                <Link to="/inventory/add" className="add-button">
                                    <AddIcon />
                                    Agregar Nuevo Item
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Ubicaciones importantes */}
                <div className="dashboard-card locations-section">
                    <div className="card-header">
                        <h3>
                            <MapIcon />
                            Ubicaciones Importantes
                        </h3>
                    </div>
                    <div className="locations-container">
                        {Object.entries(locationsByCountry).map(([country, cities]) => (
                            <div key={country} className="country-group">
                                <h3 className="country-name">{country}</h3>
                                {Object.entries(cities).map(([city, locations]) => (
                                    <div key={city} className="city-group">
                                        <h4 className="city-name">{city}</h4>
                                        <div className="city-locations">
                                            {locations.map((location, index) => (
                                                <a
                                                    key={index}
                                                    href={getGoogleMapsLink(location)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="location-tile"
                                                >
                                                    <div className="location-tile-content">
                                                        <div className="location-tile-header">
                                                            <LocationOnIcon className="location-icon" />
                                                            <div className="location-tile-info">
                                                                <h4>{location.name}</h4>
                                                                <p>{location.description}</p>
                                                            </div>
                                                        </div>
                                                        <div className="location-tile-address">
                                                            <span>{location.address}</span>
                                                        </div>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resto del contenido */}
                {stats.totalItems > 0 && (
                    <>
                        {/* Distribución por categoría */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3>
                                    <CategoryIcon />
                                    Distribución por Categoría
                                </h3>
                            </div>
                            <div className="distribution-bars">
                                {stats.itemsByCategory.map((category, index) => (
                                    <div key={index} className="bar-item">
                                        <div className="bar-label">{category.category}</div>
                                        <div className="bar-container">
                                            <div
                                                className="bar-fill"
                                                style={{
                                                    width: `${(category.count / stats.totalItems) * 100}%`,
                                                    backgroundColor: getBarColor(index)
                                                }}
                                            />
                                            <div className="bar-value">{category.count}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Estado de equipos */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3>
                                    <AssignmentIcon />
                                    Estado de Equipos
                                </h3>
                            </div>
                            <div className="condition-chart">
                                {stats.itemsByCondition.map((condition, index) => (
                                    <div
                                        key={index}
                                        className="condition-segment"
                                        style={{
                                            width: `${(condition.count / stats.totalItems) * 100}%`,
                                            backgroundColor: getConditionColor(condition.condition)
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="condition-legend">
                                {stats.itemsByCondition.map((condition, index) => (
                                    <div key={index} className="legend-item">
                                        <div
                                            className="legend-color"
                                            style={{ backgroundColor: getConditionColor(condition.condition) }}
                                        />
                                        <span className="legend-label">{condition.condition}</span>
                                        <span className="legend-value">{condition.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Items recientes */}
                        {stats.recentItems.length > 0 && (
                            <div className="recent-items-container">
                                <div className="dashboard-card">
                                    <div className="card-header">
                                        <h3>
                                            <InventoryIcon />
                                            Items Recientes
                                        </h3>
                                        <Link to="/inventory" className="view-all-link">
                                            Ver todos
                                        </Link>
                                    </div>
                                    <div className="inventory-table-container">
                                        <table className="inventory-table">
                                            <thead>
                                                <tr>
                                                    <th>Código</th>
                                                    <th>Nombre</th>
                                                    <th>Categoría</th>
                                                    <th>Estado</th>
                                                    <th>Ubicación</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.recentItems.map((item) => (
                                                    <tr key={item._id}>
                                                        <td>{item.code}</td>
                                                        <td>{item.name}</td>
                                                        <td>{item.category}</td>
                                                        <td>
                                                            <span className={`status-badge ${getStatusClass(item.condition)}`}>
                                                                {item.condition}
                                                            </span>
                                                        </td>
                                                        <td>{item.location}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Vehículos recientes */}
                        {stats.recentVehicles.length > 0 && (
                            <div className="recent-vehicles">
                                <div className="dashboard-card">
                                    <div className="card-header">
                                        <h3>
                                            <DirectionsCarIcon />
                                            Vehículos Recientes
                                        </h3>
                                        <Link to="/vehicles" className="view-all-link">
                                            Ver todos
                                        </Link>
                                    </div>
                                    <div className="inventory-table-container">
                                        <table className="inventory-table">
                                            <thead>
                                                <tr>
                                                    <th>Placa</th>
                                                    <th>Marca</th>
                                                    <th>Modelo</th>
                                                    <th>Estado</th>
                                                    <th>Ubicación</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.recentVehicles.map((vehicle) => (
                                                    <tr key={vehicle.licensePlate}>
                                                        <td>{vehicle.licensePlate}</td>
                                                        <td>{vehicle.brand}</td>
                                                        <td>{vehicle.model}</td>
                                                        <td>
                                                            <span className={`status-badge ${getVehicleStatusClass(vehicle.vehicleStatus)}`}>
                                                                {vehicle.vehicleStatus}
                                                            </span>
                                                        </td>
                                                        <td>{vehicle.location}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Funciones auxiliares para colores
const getBarColor = (index) => {
    const colors = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336', '#607d8b'];
    return colors[index % colors.length];
};

const getConditionColor = (condition) => {
    switch (condition) {
        case 'Excelente': return '#4caf50';
        case 'Bueno': return '#2196f3';
        case 'Regular': return '#ff9800';
        case 'Necesita Reparación': return '#f44336';
        case 'Fuera de Servicio': return '#9e9e9e';
        default: return '#9e9e9e';
    }
};

const getVehicleStatusColor = (status) => {
    switch (status) {
        case 'Operativo': return '#4caf50';
        case 'En Reparación': return '#ff9800';
        case 'Fuera de Servicio': return '#f44336';
        default: return '#9e9e9e';
    }
};

const getStatusClass = (condition) => {
    switch (condition) {
        case 'Excelente': return 'excelente';
        case 'Bueno': return 'bueno';
        case 'Regular': return 'regular';
        case 'Necesita Reparación': return 'necesita-reparacion';
        case 'Fuera de Servicio': return 'fuera-de-servicio';
        default: return '';
    }
};

const getVehicleStatusClass = (status) => {
    switch (status) {
        case 'Operativo': return 'excelente';
        case 'En Reparación': return 'regular';
        case 'Fuera de Servicio': return 'fuera-de-servicio';
        default: return '';
    }
};

export default Dashboard;
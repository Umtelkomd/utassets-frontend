// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import './Dashboard.css';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';
import Calendar from '../components/Calendar';
import { getRentals } from '../services/rentalService';

// Importar correctamente los iconos
import {
    Inventory as InventoryIcon,
    Build as BuildIcon,
    Category as CategoryIcon,
    LocationOn as LocationOnIcon,
    DirectionsCar as DirectionsCarIcon,
    Map as MapIcon,
    Add as AddIcon,
    DonutLarge as DonutLargeIcon,
    ArrowForward as ArrowForwardIcon,
    Dashboard as DashboardIcon,
    BarChart as BarChartIcon,
    Person as PersonIcon,
    CheckCircle as CheckCircleIcon,
    ThumbUp as ThumbUpIcon,
    Warning as WarningIcon,
    Block as BlockIcon,
    HelpOutline as HelpOutlineIcon,
    Home as HomeIcon,
    CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const { hasPermission } = usePermissions();
    const [stats, setStats] = useState({
        totalItems: 0,
        totalCategories: 0,
        maintenanceNeeded: 0,
        itemsByCategory: [],
        itemsByCondition: [],
        itemsByLocation: [],
        recentItems: [],
        totalVehicles: 0,
        vehiclesByStatus: [],
        vehiclesNeedingMaintenance: 0,
        recentVehicles: [],
        totalUsers: 0,
        recentUsers: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [rentals, setRentals] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const [inventoryResponse, vehiclesResponse, usersResponse, rentalsResponse] = await Promise.all([
                    axiosInstance.get('/inventory'),
                    axiosInstance.get('/vehicles'),
                    axiosInstance.get('/users'),
                    getRentals()
                ]);

                let items = inventoryResponse.data || [];
                let vehicles = vehiclesResponse.data || [];
                const users = usersResponse.data || [];
                const rentalsData = rentalsResponse || [];

                // Si el usuario es técnico, filtrar solo los elementos asignados
                if (!hasPermission('canViewAllInventory')) {
                    items = items.filter(item =>
                        item.responsibleUsers?.some(respUser =>
                            typeof respUser === 'object' ? respUser.id === currentUser.id : respUser === currentUser.id
                        )
                    );
                    vehicles = vehicles.filter(vehicle => {
                        // Verificar si el usuario está en responsibleUsers
                        const isInResponsibleUsers = vehicle.responsibleUsers?.some(respUser => {
                            const userId = typeof respUser === 'object' ? respUser.id : respUser;
                            return userId === currentUser.id;
                        });

                        // Verificar si el usuario es el responsiblePerson
                        const isResponsiblePerson = vehicle.responsiblePerson === currentUser.fullName ||
                            vehicle.responsiblePerson === currentUser.username;

                        return isInResponsibleUsers || isResponsiblePerson;
                    });
                }

                const totalItems = items.length;
                const categories = [...new Set(items.map(item => item.category).filter(Boolean))];
                const totalCategories = categories.length;

                const maintenanceNeeded = items.filter(item =>
                    item.condition === 'Necesita Reparación' ||
                    item.condition === 'Fuera de Servicio'
                ).length;

                const itemsByCategory = categories.map(category => {
                    const count = items.filter(item => item.category === category).length;
                    return { category, count };
                }).sort((a, b) => b.count - a.count);

                const conditions = ['Excelente', 'Bueno', 'Regular', 'Necesita Reparación', 'Fuera de Servicio'];
                const itemsByCondition = conditions.map(condition => {
                    const count = items.filter(item => item.condition === condition).length;
                    return { condition, count };
                });

                // Añadimos una categoría para elementos sin condición asignada
                const noConditionCount = items.filter(item => !item.condition || !conditions.includes(item.condition)).length;
                if (noConditionCount > 0) {
                    itemsByCondition.push({ condition: 'Sin Estado', count: noConditionCount });
                }

                // Debug: Imprimir estados encontrados y conteos


                const locationsWithItems = [...new Set(items.map(item => item.location).filter(Boolean))];
                const itemsByLocation = locationsWithItems.map(location => {
                    const count = items.filter(item => item.location === location).length;
                    return { location, count };
                }).sort((a, b) => b.count - a.count);

                const recentItems = [...items]
                    .sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0))
                    .slice(0, 5);

                const totalVehicles = vehicles.length;

                const vehicleStatuses = ['Operativo', 'En Reparación', 'Fuera de Servicio'];
                const vehiclesByStatus = vehicleStatuses.map(status => {
                    const count = vehicles.filter(vehicle => vehicle.vehicleStatus === status).length;
                    return { status, count };
                });

                const vehiclesNeedingMaintenance = vehicles.filter(
                    vehicle => vehicle.vehicleStatus && vehicle.vehicleStatus !== 'Operativo'
                ).length;

                const recentVehicles = [...vehicles]
                    .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0))
                    .slice(0, 5)
                    .map(vehicle => ({
                        ...vehicle,
                        _id: vehicle._id || vehicle.licensePlate || `vehicle-${Math.random().toString(36).substr(2, 9)}`,
                        licensePlate: vehicle.licensePlate || vehicle.license_plate || vehicle.placa || 'N/A',
                        brand: vehicle.brand || 'N/A',
                        model: vehicle.model || 'N/A',
                        vehicleStatus: vehicle.vehicleStatus || vehicle.condition || 'Desconocido',
                        location: vehicle.location || 'No especificada'
                    }));

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
                    recentVehicles,
                    totalUsers: users.length,
                    recentUsers: users.slice(0, 5)
                });

                // Establecer los datos de alquileres
                setRentals(rentalsData);
            } catch (error) {

            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <LoadingSpinner message="Cargando estadísticas..." />
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
        const country = location.country || 'Desconocido';
        const city = location.city || 'Desconocida';
        if (!acc[country]) {
            acc[country] = {};
        }
        if (!acc[country][city]) {
            acc[country][city] = [];
        }
        acc[country][city].push(location);
        return acc;
    }, {});

    const getGoogleMapsLink = (location) => {
        if (!location.coordinates || typeof location.coordinates.lat !== 'number' || typeof location.coordinates.lng !== 'number') {

            return '#'; // Evitar error si no hay coordenadas
        }
        return `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`;
    };

    // Función para obtener colores sólidos para las categorías
    const getCategoryColor = (index) => {
        const colors = [
            '#34c759', // Verde
            '#0071e3', // Azul
            '#ff9500', // Naranja
            '#ff2d55', // Rosa
            '#5856d6', // Morado
            '#ffcc00', // Amarillo
            '#5ac8fa', // Azul claro
            '#af52de'  // Violeta
        ];
        return colors[index % colors.length];
    }

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <h1 className="dashboard-title">
                    <span>Umtelkomd Assets</span>
                </h1>
                <div className="dashboard-subtitle">
                    <DashboardIcon />
                    <span>Panel de Control</span>
                </div>
            </header>

            {/* Acciones rápidas */}
            <div className="quick-actions-bar">
                {hasPermission('canViewAllInventory') && (
                    <Link to="/inventory/new" className="quick-action">
                        <AddIcon />
                        <span>Añadir Item</span>
                    </Link>
                )}
                <Link to="/inventory" className="quick-action">
                    <InventoryIcon />
                    <span>Ver Inventario</span>
                </Link>
                <Link to="/vehicles" className="quick-action">
                    <DirectionsCarIcon />
                    <span>Ver Vehículos</span>
                </Link>
                <Link to="/housing" className="quick-action">
                    <HomeIcon />
                    <span>Ver Viviendas</span>
                </Link>
                {hasPermission('canAccessSettings') && (
                    <Link to="/users" className="quick-action">
                        <PersonIcon />
                        <span>Personal</span>
                    </Link>
                )}
                {/* Acceso a Reportes - COMENTADO TEMPORALMENTE HASTA QUE SE COMPLETE EL DESARROLLO
                {hasPermission('canViewReports') && (
                    <Link to="/reports" className="quick-action">
                        <WarningIcon />
                        <span>Reportes</span>
                    </Link>
                )}
                */}
            </div>

            {stats.totalItems === 0 && stats.totalVehicles === 0 ? (
                <div className="empty-dashboard">
                    <div className="empty-state">
                        <InventoryIcon className="empty-icon" />
                        <h3>¡Bienvenido a tu Dashboard!</h3>
                        <p>
                            {!hasPermission('canViewAllInventory') ? (
                                "No tienes ningún item o vehículo asignado. Contacta a un administrador para que te asigne elementos del inventario o vehículos."
                            ) : (
                                "Parece que aún no tienes ningún item registrado. Comienza agregando tus primeros items para verlos reflejados aquí."
                            )}
                        </p>
                        {hasPermission('canViewAllInventory') && (
                            <div className="empty-actions">
                                <Link to="/inventory/add" className="add-button">
                                    <AddIcon />
                                    Agregar Nuevo Item
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <div className="dashboard-grid">
                        {hasPermission('canViewAllInventory') && (
                            <>
                                <div className="summary-card total-items">
                                    <div className="summary-icon">
                                        <InventoryIcon />
                                    </div>
                                    <div className="summary-content">
                                        <h3>Total de Items</h3>
                                        <div className="summary-value">{stats.totalItems}</div>
                                        {stats.totalItems > 0 && (
                                            <Link to="/inventory" className="summary-link">
                                                <span>Ver detalles</span>
                                                <ArrowForwardIcon />
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                <div className="summary-card total-categories">
                                    <div className="summary-icon">
                                        <CategoryIcon />
                                    </div>
                                    <div className="summary-content">
                                        <h3>Categorías</h3>
                                        <div className="summary-value">{stats.totalCategories}</div>
                                        {stats.totalCategories > 0 && (
                                            <Link to="/categories" className="summary-link">
                                                <span>Ver detalles</span>
                                                <ArrowForwardIcon />
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                <div className="summary-card maintenance-needed">
                                    <div className="summary-icon">
                                        <BuildIcon />
                                    </div>
                                    <div className="summary-content">
                                        <h3>Mantenimiento Necesario</h3>
                                        <div className="summary-value">{stats.maintenanceNeeded}</div>
                                        {stats.maintenanceNeeded > 0 && (
                                            <Link to="/maintenance" className="summary-link">
                                                <span>Ver detalles</span>
                                                <ArrowForwardIcon />
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                <div className="summary-card vehicles-card">
                                    <div className="summary-icon">
                                        <DirectionsCarIcon />
                                    </div>
                                    <div className="summary-content">
                                        <h3>Vehículos</h3>
                                        <div className="summary-value">{stats.totalVehicles}</div>
                                        {stats.totalVehicles > 0 && (
                                            <Link to="/vehicles" className="summary-link">
                                                <span>Ver detalles</span>
                                                <ArrowForwardIcon />
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                <div className="summary-card users-card">
                                    {hasPermission('canAccessSettings') && (
                                        <>
                                            <div className="summary-icon">
                                                <PersonIcon />
                                            </div>
                                            <div className="summary-content">
                                                <h3>Personal</h3>
                                                <div className="summary-value">{stats.totalUsers}</div>
                                                {stats.totalUsers > 0 && (
                                                    <Link to="/users" className="summary-link">
                                                        <span>Ver detalles</span>
                                                        <ArrowForwardIcon />
                                                    </Link>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Calendario de Alquileres */}
                        {hasPermission('canViewAllRentals') && (
                            <div className="dashboard-card rental-calendar-section">
                                <div className="card-header">
                                    <h3>
                                        <CalendarTodayIcon />
                                        Calendario de Alquileres
                                    </h3>
                                    <Link to="/rentals" className="view-all-link">
                                        Ver todos
                                    </Link>
                                </div>
                                <div className="calendar-container">
                                    <Calendar rentals={rentals} />
                                </div>
                            </div>
                        )}

                        {/* Estado de equipos */}
                        {stats.itemsByCondition && stats.totalItems > 0 && (
                            <div className="dashboard-card equipment-status">
                                <div className="card-header">
                                    <h3>
                                        <DonutLargeIcon />
                                        Estado de Equipos
                                    </h3>
                                </div>
                                <div className="equipment-overview">
                                    <div className="donut-chart-container">
                                        <div className="donut-chart">
                                            {(() => {
                                                // Filtrar sólo las condiciones con elementos
                                                const conditions = stats.itemsByCondition.filter(c => c.count > 0);

                                                if (conditions.length === 0) return null;

                                                // Crear la cadena de gradiente cónico con transiciones suaves
                                                let gradientString = "";
                                                let currentAngle = 0;

                                                conditions.forEach((condition, index) => {
                                                    const percentage = (condition.count / stats.totalItems) * 100;
                                                    const color = getConditionColor(condition.condition);

                                                    // Para crear una transición más suave
                                                    if (index > 0) {
                                                        // Añadir un pequeño degradado entre segmentos (0.5% de transición)
                                                        const prevColor = getConditionColor(conditions[index - 1].condition);
                                                        gradientString += `${prevColor} ${currentAngle - 0.5}%, `;
                                                    }

                                                    // Agregar segmento al gradiente
                                                    gradientString += `${color} ${currentAngle}%, ${color} ${currentAngle + percentage}%`;

                                                    // Agregar coma si no es el último elemento
                                                    if (index < conditions.length - 1) {
                                                        gradientString += ", ";
                                                    }

                                                    currentAngle += percentage;
                                                });

                                                return (
                                                    <div
                                                        className="donut-gradient"
                                                        style={{
                                                            background: `conic-gradient(${gradientString})`
                                                        }}
                                                    ></div>
                                                );
                                            })()}
                                            <div className="donut-chart-center">
                                                <span className="donut-chart-number">{stats.totalItems}</span>
                                                <span className="donut-chart-label">Total</span>
                                            </div>
                                        </div>

                                        <div className="donut-legend">
                                            {stats.itemsByCondition.filter(c => c.count > 0).map((condition, index) => {
                                                const percentage = (condition.count / stats.totalItems) * 100;
                                                return (
                                                    <div key={`legend-${index}`} className="legend-item">
                                                        <span
                                                            className="legend-color"
                                                            style={{ backgroundColor: getConditionColor(condition.condition) }}
                                                        ></span>
                                                        <span className="legend-text">
                                                            {condition.condition}: {Math.round(percentage)}%
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="condition-cards">
                                        {stats.itemsByCondition.map((condition, index) => {
                                            const percentage = condition.count > 0 ? (condition.count / stats.totalItems) * 100 : 0;
                                            const getConditionIcon = (cond) => {
                                                switch (cond) {
                                                    case 'Excelente': return <CheckCircleIcon />;
                                                    case 'Bueno': return <ThumbUpIcon />;
                                                    case 'Regular': return <WarningIcon />;
                                                    case 'Necesita Reparación': return <BuildIcon />;
                                                    case 'Fuera de Servicio': return <BlockIcon />;
                                                    case 'Sin Estado': return <HelpOutlineIcon />;
                                                    default: return <HelpOutlineIcon />;
                                                }
                                            };

                                            return (
                                                <div
                                                    key={condition.condition || index}
                                                    className={`condition-card ${condition.count === 0 ? 'condition-empty' : ''}`}
                                                    style={{
                                                        '--card-color': getConditionColor(condition.condition)
                                                    }}
                                                >
                                                    <div className="condition-icon">
                                                        {getConditionIcon(condition.condition)}
                                                    </div>
                                                    <div className="condition-info">
                                                        <h4 className="condition-name">{condition.condition || 'Desconocido'}</h4>
                                                        <div className="condition-data">
                                                            <span className="condition-count">{condition.count}</span>
                                                            <span className="condition-percent">{Math.round(percentage)}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Items recientes */}
                        {stats.recentItems && stats.recentItems.length > 0 && (
                            <div className="dashboard-card recent-items-container">
                                <div className="card-header">
                                    <h3>
                                        <InventoryIcon />
                                        Items Recientes
                                    </h3>
                                    <Link to="/inventory" className="view-all-link">
                                        Ver todos
                                    </Link>
                                </div>
                                <div className="items-cards-grid">
                                    {stats.recentItems.map((item) => (
                                        <div className="item-card" key={item._id || `item-${item.code}`}>
                                            <div className="item-card-image">
                                                {item.photoUrl ? (
                                                    <img
                                                        src={item.photoUrl}
                                                        alt={item.itemName}
                                                        className="item-image"
                                                    />
                                                ) : (
                                                    <div className="item-image-placeholder">
                                                        <InventoryIcon />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="item-card-content">
                                                <h4 className="item-name">{item.itemName || 'N/A'}</h4>
                                                <div className="item-details">
                                                    <span className="item-category">{item.category || 'Sin categoría'}</span>
                                                    <span className={`status-badge ${getStatusClass(item.condition)}`}>
                                                        {item.condition || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="item-location">
                                                    <LocationOnIcon className="location-icon-small" />
                                                    <span>{item.location || 'Sin ubicación'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Vehículos recientes */}
                        {stats.recentVehicles && stats.recentVehicles.length > 0 && (
                            <div className="dashboard-card recent-vehicles">
                                <div className="card-header">
                                    <h3>
                                        <DirectionsCarIcon />
                                        Vehículos Recientes
                                    </h3>
                                    <Link to="/vehicles" className="view-all-link">
                                        Ver todos
                                    </Link>
                                </div>
                                <div className="items-cards-grid">
                                    {stats.recentVehicles.map((vehicle) => (
                                        <div className="item-card" key={vehicle._id || vehicle.licensePlate}>
                                            <div className="item-card-image">
                                                {vehicle.photoUrl ? (
                                                    <img
                                                        src={vehicle.photoUrl}
                                                        alt={`${vehicle.brand} ${vehicle.model}`}
                                                        className="vehicle-image"
                                                    />
                                                ) : (
                                                    <div className="item-image-placeholder">
                                                        <DirectionsCarIcon />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="item-card-content">
                                                <h4 className="item-name">{vehicle.brand} {vehicle.model}</h4>
                                                <div className="item-details">
                                                    <span className="item-category">{vehicle.licensePlate || 'N/A'}</span>
                                                    <span className={`status-badge ${getVehicleStatusClass(vehicle.vehicleStatus)}`}>
                                                        {vehicle.vehicleStatus}
                                                    </span>
                                                </div>
                                                <div className="item-location">
                                                    <LocationOnIcon className="location-icon-small" />
                                                    <span>{vehicle.location || 'Sin ubicación'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ubicaciones importantes */}
                    {companyLocations && companyLocations.length > 0 && (
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
                                                            key={`${location.name}-${index}`}
                                                            href={getGoogleMapsLink(location)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="location-tile"
                                                            title={`Abrir ${location.name} en Google Maps`}
                                                        >
                                                            <div className="location-tile-content">
                                                                <div className="location-tile-header">
                                                                    <LocationOnIcon className="location-icon" />
                                                                    <div className="location-tile-info">
                                                                        <h4>{location.name || 'Nombre no disponible'}</h4>
                                                                        <p>{location.description || 'Sin descripción'}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="location-tile-address">
                                                                    <span>{location.address || 'Dirección no disponible'}</span>
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
                    )}
                </>
            )}
        </div>
    );
};

// Funciones auxiliares para colores
const getConditionColor = (condition) => {
    switch (condition) {
        case 'Excelente': return '#34c759'; // Verde Apple
        case 'Bueno': return '#007aff'; // Azul Apple
        case 'Regular': return '#ff9500'; // Naranja Apple
        case 'Necesita Reparación': return '#ff3b30'; // Rojo Apple
        case 'Fuera de Servicio': return '#8e8e93'; // Gris Apple
        case 'Sin Estado': return '#a2a2a7'; // Gris claro Apple
        default: return '#8e8e93';
    }
};

// Función para obtener color secundario para gradientes
const getConditionColorSecondary = (condition) => {
    switch (condition) {
        case 'Excelente': return '#2daa4b'; // Verde más oscuro
        case 'Bueno': return '#0062c3'; // Azul más oscuro
        case 'Regular': return '#e67e00'; // Naranja más oscuro
        case 'Necesita Reparación': return '#e01d46'; // Rojo más oscuro
        case 'Fuera de Servicio': return '#636366'; // Gris más oscuro
        case 'Sin Estado': return '#7c7c80'; // Gris medio
        default: return '#636366';
    }
};

const getStatusClass = (condition) => {
    switch (condition) {
        case 'Excelente': return 'excelente';
        case 'Bueno': return 'bueno';
        case 'Regular': return 'regular';
        case 'Necesita Reparación': return 'necesita-reparacion';
        case 'Fuera de Servicio': return 'fuera-de-servicio';
        case 'Sin Estado': return 'sin-estado';
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
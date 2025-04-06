// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

// Iconos de Material UI
import InventoryIcon from '@mui/icons-material/Storage';
import BuildIcon from '@mui/icons-material/Build';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

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
    vehiclesByFuelType: [],
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

        // Agrupar vehículos por tipo de combustible
        const fuelTypes = ['Gasolina', 'Diésel', 'Eléctrico', 'Híbrido'];
        const vehiclesByFuelType = fuelTypes.map(fuelType => {
          const count = vehicles.filter(vehicle => vehicle.fuelType === fuelType).length;
          return { fuelType, count };
        }).sort((a, b) => b.count - a.count);

        // Vehículos que necesitan mantenimiento (no operativos)
        const vehiclesNeedingMaintenance = vehicles.filter(
          vehicle => vehicle.vehicleStatus !== 'Operativo'
        ).length;

        // Vehículos más recientes
        const recentVehicles = [...vehicles]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

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
          vehiclesByFuelType,
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

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">
        <span className="panda-logo">🐼</span>
        Dashboard Panda Assets
      </h1>

      <div className="dashboard-grid">
        {/* Tarjetas de resumen */}
        <div className="summary-card total-items">
          <div className="summary-icon">
            <InventoryIcon />
          </div>
          <div className="summary-content">
            <h3>Total Items</h3>
            <p className="summary-value">{stats.totalItems}</p>
          </div>
        </div>

        <div className="summary-card total-categories">
          <div className="summary-icon">
            <CategoryIcon />
          </div>
          <div className="summary-content">
            <h3>Categorías</h3>
            <p className="summary-value">{stats.totalCategories}</p>
          </div>
        </div>

        <div className="summary-card maintenance-needed">
          <div className="summary-icon">
            <BuildIcon />
          </div>
          <div className="summary-content">
            <h3>Necesitan Mantenimiento</h3>
            <p className="summary-value">{stats.maintenanceNeeded}</p>
          </div>
        </div>

        <div className="summary-card vehicles-card">
          <div className="summary-icon">
            <DirectionsCarIcon />
          </div>
          <div className="summary-content">
            <h3>Total Vehículos</h3>
            <p className="summary-value">{stats.totalVehicles}</p>
          </div>
        </div>

        {/* Distribución por categoría */}
        <div className="dashboard-card category-distribution">
          <div className="card-header">
            <h3>
              <CategoryIcon /> Distribución por Categoría
            </h3>
          </div>
          <div className="card-content">
            <div className="distribution-bars">
              {stats.itemsByCategory.map((cat, index) => (
                <div className="bar-item" key={index}>
                  <div className="bar-label">{cat.category}</div>
                  <div className="bar-container">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(cat.count / stats.totalItems) * 100}%`,
                        backgroundColor: getBarColor(index)
                      }}
                    ></div>
                    <span className="bar-value">{cat.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Estado de equipos */}
        <div className="dashboard-card condition-stats">
          <div className="card-header">
            <h3>
              <BuildIcon /> Estado de Equipos
            </h3>
          </div>
          <div className="card-content">
            <div className="condition-chart">
              {stats.itemsByCondition.map((condition, index) => (
                <div
                  key={index}
                  className="condition-segment"
                  style={{
                    width: `${(condition.count / stats.totalItems) * 100}%`,
                    backgroundColor: getConditionColor(condition.condition)
                  }}
                  title={`${condition.condition}: ${condition.count} items`}
                >
                </div>
              ))}
            </div>
            <div className="condition-legend">
              {stats.itemsByCondition.map((condition, index) => (
                <div key={index} className="legend-item">
                  <span
                    className="legend-color"
                    style={{ backgroundColor: getConditionColor(condition.condition) }}
                  ></span>
                  <span className="legend-label">{condition.condition}</span>
                  <span className="legend-value">{condition.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top ubicaciones */}
        <div className="dashboard-card locations-card">
          <div className="card-header">
            <h3>
              <LocationOnIcon /> Top Ubicaciones
            </h3>
          </div>
          <div className="card-content">
            <ul className="locations-list">
              {stats.itemsByLocation.map((loc, index) => (
                <li key={index} className="location-item">
                  <span className="location-name">{loc.location}</span>
                  <span className="location-count">{loc.count} items</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Nueva sección: Estado de los vehículos */}
        <div className="dashboard-card vehicle-status">
          <div className="card-header">
            <h3>
              <DirectionsCarIcon /> Estado de Vehículos
            </h3>
            <Link to="/vehicles" className="view-all-link">
              Ver todos
            </Link>
          </div>
          <div className="card-content">
            <div className="condition-chart">
              {stats.vehiclesByStatus.map((status, index) => (
                <div
                  key={index}
                  className="condition-segment"
                  style={{
                    width: `${(status.count / Math.max(1, stats.totalVehicles)) * 100}%`,
                    backgroundColor: getVehicleStatusColor(status.status)
                  }}
                  title={`${status.status}: ${status.count} vehículos`}
                >
                </div>
              ))}
            </div>
            <div className="condition-legend">
              {stats.vehiclesByStatus.map((status, index) => (
                <div key={index} className="legend-item">
                  <span
                    className="legend-color"
                    style={{ backgroundColor: getVehicleStatusColor(status.status) }}
                  ></span>
                  <span className="legend-label">{status.status}</span>
                  <span className="legend-value">{status.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Distribución de combustible */}
        <div className="dashboard-card fuel-distribution">
          <div className="card-header">
            <h3>
              <DirectionsCarIcon /> Tipos de Combustible
            </h3>
          </div>
          <div className="card-content">
            <div className="distribution-bars">
              {stats.vehiclesByFuelType.map((fuelType, index) => (
                <div className="bar-item" key={index}>
                  <div className="bar-label">{fuelType.fuelType}</div>
                  <div className="bar-container">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(fuelType.count / Math.max(1, stats.totalVehicles)) * 100}%`,
                        backgroundColor: getFuelTypeColor(index)
                      }}
                    ></div>
                    <span className="bar-value">{fuelType.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Items recientes */}
        <div className="dashboard-card recent-items">
          <div className="card-header">
            <h3>
              <TrendingUpIcon /> Items Recientes
            </h3>
            <Link to="/inventory" className="view-all-link">
              Ver todos
            </Link>
          </div>
          <div className="card-content">
            <table className="recent-items-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Ubicación</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.item_code}</td>
                    <td>{item.item_name}</td>
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

        {/* Vehículos recientes */}
        <div className="dashboard-card recent-vehicles">
          <div className="card-header">
            <h3>
              <DirectionsCarIcon /> Vehículos Recientes
            </h3>
            <Link to="/vehicles" className="view-all-link">
              Ver todos
            </Link>
          </div>
          <div className="card-content">
            <table className="recent-items-table">
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Marca/Modelo</th>
                  <th>Estado</th>
                  <th>Combustible</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentVehicles.map((vehicle, index) => (
                  <tr key={index}>
                    <td>{vehicle.licensePlate}</td>
                    <td>{vehicle.brand} {vehicle.model}</td>
                    <td>
                      <span className={`status-badge ${getVehicleStatusClass(vehicle.vehicleStatus)}`}>
                        {vehicle.vehicleStatus}
                      </span>
                    </td>
                    <td>{vehicle.fuelType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="dashboard-card quick-actions">
          <div className="card-header">
            <h3>
              <AssignmentIcon /> Acciones Rápidas
            </h3>
          </div>
          <div className="card-content">
            <div className="quick-actions-grid">
              <Link to="/inventory/new" className="quick-action-button">
                <InventoryIcon />
                <span>Añadir Item</span>
              </Link>
              <Link to="/inventory" className="quick-action-button">
                <BuildIcon />
                <span>Ver Inventario</span>
              </Link>
              <Link to="/vehicles" className="quick-action-button">
                <DirectionsCarIcon />
                <span>Ver Vehículos</span>
              </Link>
            </div>
          </div>
        </div>
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

const getFuelTypeColor = (index) => {
  const colors = ['#3f51b5', '#009688', '#e91e63', '#ffc107'];
  return colors[index % colors.length];
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
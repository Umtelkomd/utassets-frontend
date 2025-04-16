import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../axiosConfig';
import './VehicleList.css';
import { usePermissions } from '../context/PermissionsContext';

// Iconos de Material UI
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';

const API_URL = process.env.REACT_APP_API_URL;

const VehicleList = () => {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [brandFilter, setBrandFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [fuelTypeFilter, setFuelTypeFilter] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [brands, setBrands] = useState([]);
    const [fuelTypes, setFuelTypes] = useState(['Gasolina', 'Diésel', 'Eléctrico', 'Híbrido']);
    const [vehicleStatuses, setVehicleStatuses] = useState(['Operativo', 'En Reparación', 'Fuera de Servicio']);
    const { hasPermission } = usePermissions();

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get('/vehicles');
            const vehiclesData = response.data;
            console.log('vehiclesData', vehiclesData)
            setVehicles(vehiclesData);
            setFilteredVehicles(vehiclesData);

            // Extraer marcas únicas para el filtro
            const uniqueBrands = [...new Set(vehiclesData.map(vehicle => vehicle.brand))];
            setBrands(uniqueBrands);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            toast.error('Error al cargar los vehículos');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Filtrar y ordenar vehículos
        let result = [...vehicles];

        // Aplicar filtro de búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(vehicle =>
                vehicle.licensePlate.toLowerCase().includes(term) ||
                vehicle.brand.toLowerCase().includes(term) ||
                vehicle.model.toLowerCase().includes(term) ||
                (vehicle.vin && vehicle.vin.toLowerCase().includes(term))
            );
        }

        // Aplicar filtro de marca
        if (brandFilter) {
            result = result.filter(vehicle => vehicle.brand === brandFilter);
        }

        // Aplicar filtro de estado
        if (statusFilter) {
            result = result.filter(vehicle => vehicle.vehicleStatus === statusFilter);
        }

        // Aplicar filtro de tipo de combustible
        if (fuelTypeFilter) {
            result = result.filter(vehicle => vehicle.fuelType === fuelTypeFilter);
        }

        // Aplicar ordenamiento
        if (sortField) {
            result.sort((a, b) => {
                let valueA = a[sortField];
                let valueB = b[sortField];

                // Convertir a minúsculas si son strings
                if (typeof valueA === 'string') valueA = valueA.toLowerCase();
                if (typeof valueB === 'string') valueB = valueB.toLowerCase();

                if (valueA < valueB) {
                    return sortDirection === 'asc' ? -1 : 1;
                }
                if (valueA > valueB) {
                    return sortDirection === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        setFilteredVehicles(result);
    }, [vehicles, searchTerm, brandFilter, statusFilter, fuelTypeFilter, sortField, sortDirection]);

    const handleDelete = async (inventoryId, vehicle) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar el vehículo con placa "${vehicle.licensePlate}"?`)) {
            try {
                await axiosInstance.delete(`/vehicles/${vehicle.id}`);
                toast.success('Vehículo eliminado correctamente');
                fetchVehicles();
            } catch (error) {
                console.error('Error deleting vehicle:', error);
                toast.error('Error al eliminar el vehículo');
            }
        }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            // Si ya estamos ordenando por este campo, cambiar dirección
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Nuevo campo de ordenamiento
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setBrandFilter('');
        setStatusFilter('');
        setFuelTypeFilter('');
        setSortField('');
        setSortDirection('asc');
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Operativo': return 'excelente';
            case 'En Reparación': return 'regular';
            case 'Fuera de Servicio': return 'fuera-de-servicio';
            default: return '';
        }
    };

    const handleAddClick = () => {
        navigate('/vehicles/new');
    };

    if (isLoading) {
        return (
            <div className="page-loading-spinner">
                <p>Cargando vehículos...</p>
            </div>
        );
    }

    return (
        <div className="vehicle-list-container">
            <div className="vehicle-list-header">
                <h1>Vehículos</h1>
                {hasPermission('canCreateVehicle') && (
                    <button className="add-vehicle-button" onClick={handleAddClick}>
                        <AddIcon /> Nuevo Vehículo
                    </button>
                )}
            </div>

            <div className="search-section">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Buscar por marca, modelo, placa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button onClick={resetFilters} className="search-button">
                        <SearchIcon className="search-icon" />
                    </button>
                </div>
                <div className="filter-dropdown">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Todos los estados</option>
                        <option value="Operativo">Operativo</option>
                        <option value="En Reparación">En Reparación</option>
                        <option value="Fuera de Servicio">Fuera de Servicio</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="loading-section">
                    <div className="page-loading-spinner"></div>
                    <p>Cargando vehículos...</p>
                </div>
            ) : filteredVehicles.length === 0 ? (
                <div className="no-vehicles-message">
                    <p>No hay vehículos que coincidan con los criterios de búsqueda.</p>
                </div>
            ) : (
                <div className="vehicle-list">
                    {filteredVehicles.map((vehicle) => (
                        <div key={vehicle.id} className="vehicle-card">
                            <div className="vehicle-image-container">
                                <img
                                    src={vehicle.imagePath ? `${API_URL}/uploads/vehicles/${vehicle.imagePath}` : '/default-vehicle.jpg'}
                                    alt={vehicle.brand}
                                    className="vehicle-image"
                                />
                            </div>
                            <div className="vehicle-info">
                                <div className="vehicle-primary-info">
                                    <h3>{vehicle.brand} {vehicle.model}</h3>
                                    <span className={`vehicle-status status-${getStatusClass(vehicle.vehicleStatus)}`}>
                                        {vehicle.vehicleStatus}
                                    </span>
                                </div>
                                <div className="vehicle-details">
                                    <p><span className="detail-label">Placa:</span> {vehicle.licensePlate}</p>
                                    <p><span className="detail-label">Año:</span> {vehicle.year}</p>
                                    <p><span className="detail-label">Último Servicio:</span> {vehicle.lastServiceDate}</p>
                                </div>
                            </div>
                            <div className="vehicle-actions">
                                <Link
                                    to={`/vehicles/${vehicle.id}`}
                                    className="action-button view-button"
                                    title="Ver detalles"
                                >
                                    <VisibilityIcon />
                                </Link>
                                {hasPermission('canEditVehicle') && (
                                    <Link
                                        to={`/vehicles/edit/${vehicle.id}`}
                                        className="action-button edit-button"
                                        title="Editar"
                                    >
                                        <EditIcon />
                                    </Link>
                                )}
                                {hasPermission('canDeleteVehicle') && (
                                    <button
                                        onClick={() => handleDelete(vehicle.id, vehicle)}
                                        className="action-button delete-button"
                                        title="Eliminar"
                                    >
                                        <DeleteIcon />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VehicleList; 
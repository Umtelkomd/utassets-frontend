import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../axiosConfig';
import './VehicleList.css';
import '../components/FilterStyles.css';
import { usePermissions } from '../context/PermissionsContext';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ViewButton from '../components/ViewButton';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';
import { useAuth } from '../context/AuthContext';

// Iconos de Material UI
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import PersonIcon from '@mui/icons-material/Person';

const API_URL = process.env.REACT_APP_API_URL;

const VehicleList = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { hasPermission } = usePermissions();
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
    const [fuelTypes] = useState(['Gasolina', 'Diésel', 'Eléctrico', 'Híbrido']);
    const [vehicleStatuses] = useState(['Operativo', 'En Reparación', 'Fuera de Servicio']);
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        vehicle: null
    });

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('/vehicles');
            let vehicles = response.data || [];

            // Si el usuario es técnico, filtrar solo los vehículos asignados
            if (currentUser?.role === 'tecnico') {
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

            setVehicles(vehicles);
            setFilteredVehicles(vehicles);

            // Extraer marcas únicas para el filtro
            const uniqueBrands = [...new Set(vehicles.map(vehicle => vehicle.brand).filter(Boolean))];
            setBrands(uniqueBrands);
        } catch (error) {

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
            result = result.filter(vehicle => {
                const searchTerm = term.toLowerCase();
                return (
                    vehicle.brand.toLowerCase().includes(searchTerm) ||
                    vehicle.model.toLowerCase().includes(searchTerm) ||
                    vehicle.licensePlate.toLowerCase().includes(searchTerm) ||
                    (vehicle.color && vehicle.color.toLowerCase().includes(searchTerm))
                );
            });
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

    const handleDelete = async (vehicle) => {
        setDeleteModal({
            isOpen: true,
            vehicle: vehicle
        });
    };

    const confirmDelete = async () => {
        try {
            await axiosInstance.delete(`/vehicles/${deleteModal.vehicle.id}`);
            toast.success('Vehículo eliminado correctamente');
            fetchVehicles();
        } catch (error) {

            let errorMsg = 'Error al eliminar el vehículo';

            if (error.response?.data?.message) {
                errorMsg = error.response.data.message.substring(0, 100) + (error.response.data.message.length > 100 ? '...' : '');
            } else if (error.response?.data?.error) {
                errorMsg = error.response.data.error.substring(0, 100) + (error.response.data.error.length > 100 ? '...' : '');
            }

            toast.error(errorMsg);
        } finally {
            setDeleteModal({
                isOpen: false,
                vehicle: null
            });
        }
    };

    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            vehicle: null
        });
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

    const getInsuranceStatus = (expiryDate) => {
        if (!expiryDate) return '';

        const today = new Date();
        const expiry = new Date(expiryDate);
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(today.getMonth() + 1);

        if (expiry < today) {
            return 'expired';
        } else if (expiry <= oneMonthFromNow) {
            return 'warning';
        }
        return 'valid';
    };

    if (isLoading) {
        return <LoadingSpinner message="Cargando vehículos..." />;
    }

    return (
        <div className="vehicle-list-container">
            <div className="card">
                <div className="vehicle-list-header">
                    <h1>Vehículos</h1>
                    {hasPermission('canCreateVehicle') && (
                        <button className="add-vehicle-button" onClick={handleAddClick}>
                            <AddIcon /> Nuevo Vehículo
                        </button>
                    )}
                </div>

                <div className="standard-search-section">
                    <div className="standard-search-container">
                        <SearchIcon className="standard-search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar por marca, modelo, placa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="standard-search-input"
                        />
                    </div>

                    <div className="standard-filter-dropdown">
                        <FilterListIcon className="standard-filter-icon" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="standard-filter-select"
                        >
                            <option value="">Todos los estados</option>
                            {vehicleStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    <div className="standard-filter-dropdown">
                        <FilterListIcon className="standard-filter-icon" />
                        <select
                            value={brandFilter}
                            onChange={(e) => setBrandFilter(e.target.value)}
                            className="standard-filter-select"
                        >
                            <option value="">Todas las marcas</option>
                            {brands.map(brand => (
                                <option key={brand} value={brand}>{brand}</option>
                            ))}
                        </select>
                    </div>

                    <div className="standard-filter-dropdown fuel-type-filter">
                        <FilterListIcon className="standard-filter-icon" />
                        <select
                            value={fuelTypeFilter}
                            onChange={(e) => setFuelTypeFilter(e.target.value)}
                            className="standard-filter-select"
                        >
                            <option value="">Todos los combustibles</option>
                            {fuelTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {filteredVehicles.length === 0 ? (
                    <div className="no-vehicles-message">
                        {!hasPermission('canViewAllInventory') ? (
                            <p>No tienes ningún vehículo asignado. Contacta a un administrador para que te asigne vehículos.</p>
                        ) : (
                            <p>No se encontraron vehículos que coincidan con los criterios de búsqueda.</p>
                        )}
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <tbody>
                                {filteredVehicles.map((vehicle) => (
                                    <tr key={vehicle.id} className="vehicle-card-row">
                                        <td className="vehicle-card-cell">
                                            <div className="vehicle-card">
                                                <div className="vehicle-image-container">
                                                    {vehicle.photoUrl ? (
                                                        <img
                                                            src={vehicle.photoUrl}
                                                            alt={`${vehicle.brand} ${vehicle.model}`}
                                                            className="vehicle-image"
                                                        />
                                                    ) : (
                                                        <div className="no-image">Sin imagen</div>
                                                    )}
                                                </div>
                                                <div className="vehicle-info">
                                                    <div className="vehicle-primary-info">
                                                        <h3>{vehicle.brand} {vehicle.model}</h3>
                                                        <span className={`vehicle-status status-${getStatusClass(vehicle.vehicleStatus)}`}>
                                                            {vehicle.vehicleStatus}
                                                        </span>
                                                    </div>
                                                    <div className="vehicle-details">
                                                        <div className="detail-row">
                                                            <p><span className="detail-label">Placa:</span> {vehicle.licensePlate}</p>
                                                            <p><span className="detail-label">Año:</span> {vehicle.year}</p>
                                                        </div>
                                                        <div className="detail-row">
                                                            <p><span className="detail-label">Combustible:</span> {vehicle.fuelType}</p>
                                                            <p><span className="detail-label">Kilometraje:</span> {vehicle.mileage !== null && vehicle.mileage !== undefined ? `${vehicle.mileage} km` : 'No registrado'}
                                                            </p>
                                                        </div>
                                                        {vehicle.insuranceExpiryDate && (
                                                            <p className={`insurance-info insurance-${getInsuranceStatus(vehicle.insuranceExpiryDate)}`}>
                                                                <span className="detail-label">Seguro vence:</span> {new Date(vehicle.insuranceExpiryDate).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                        {vehicle.technicalRevisionExpiryDate && (
                                                            <p className={`insurance-info insurance-${getInsuranceStatus(vehicle.technicalRevisionExpiryDate)}`}>
                                                                <span className="detail-label">TÜV vence:</span> {new Date(vehicle.technicalRevisionExpiryDate).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                        {vehicle.responsibleUsers && vehicle.responsibleUsers.length > 0 && (
                                                            <div className="technicians-info">
                                                                <span className="detail-label">Técnicos:</span>
                                                                <div className="technicians-list">
                                                                    {vehicle.responsibleUsers.map((user, index) => {
                                                                        let userName = 'Usuario desconocido';

                                                                        if (typeof user === 'object') {
                                                                            if (user.fullName) {
                                                                                userName = user.fullName;
                                                                            } else if (user.name && user.last_name) {
                                                                                userName = `${user.name} ${user.last_name}`;
                                                                            } else if (user.name) {
                                                                                userName = user.name;
                                                                            } else if (user.username) {
                                                                                userName = user.username;
                                                                            }
                                                                        }

                                                                        return (
                                                                            <span key={index} className="technician-chip">
                                                                                <PersonIcon className="technician-icon" />
                                                                                {userName}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="vehicle-actions">
                                                    <ViewButton itemId={vehicle.id} />

                                                    {hasPermission('canEditVehicle') && (
                                                        <EditButton
                                                            itemId={vehicle.id}
                                                            type="vehicle"
                                                            className="vehicle-action-button vehicle-edit-button"
                                                        />
                                                    )}
                                                    {hasPermission('canDeleteVehicle') && (
                                                        <DeleteButton
                                                            onDelete={() => handleDelete(vehicle)}
                                                            itemId={vehicle.id}
                                                            itemName={vehicle.name}
                                                            className="vehicle-action-button vehicle-delete-button"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                itemName={deleteModal.vehicle ? `${deleteModal.vehicle.brand} ${deleteModal.vehicle.model} - ${deleteModal.vehicle.licensePlate}` : ''}
            />
        </div>
    );
};

export default VehicleList; 
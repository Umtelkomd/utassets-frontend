import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../axiosConfig';
import './HousingList.css';
import '../components/FilterStyles.css';
import LoadingSpinner from '../components/LoadingSpinner';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import EditHousingButton from '../components/EditHousingButton';
import DeleteButton from '../components/DeleteButton';
import { usePermissions } from '../context/PermissionsContext';
import { useAuth } from '../context/AuthContext';

// Iconos de Material UI
import {
    Add as AddIcon,
    Search as SearchIcon,
    FilterList as FilterListIcon,
    Home as HomeIcon,
    LocationOn as LocationOnIcon,
    Hotel as HotelIcon,
    Bathtub as BathtubIcon,
    SquareFoot as SquareFootIcon,
    AttachMoney as AttachMoneyIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';

const HousingList = () => {
    const { currentUser } = useAuth();
    const { hasPermission } = usePermissions();
    const [housings, setHousings] = useState([]);
    const [filteredHousings, setFilteredHousings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [bedroomsFilter, setBedroomsFilter] = useState('');
    const [availabilityFilter, setAvailabilityFilter] = useState('');
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        housing: null
    });

    useEffect(() => {
        fetchHousings();
    }, []);

    const fetchHousings = async () => {
        try {
            const response = await axiosInstance.get('/housing');
            let housingsData = response.data || [];

            // Si el usuario no tiene permiso para ver todo, filtrar solo las viviendas asignadas
            if (!hasPermission('canViewAllHousing')) {
                housingsData = housingsData.filter(housing =>
                    housing.responsibleUsers?.some(respUser =>
                        typeof respUser === 'object' ? respUser.id === currentUser.id : respUser === currentUser.id
                    )
                );
            }

            setHousings(housingsData);
            setFilteredHousings(housingsData);
        } catch (error) {
            console.error('Error al cargar las viviendas:', error);
            toast.error('Error al cargar las viviendas');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        filterHousings();
    }, [searchTerm, bedroomsFilter, availabilityFilter, housings]);

    const filterHousings = () => {
        let filtered = [...housings];

        // Filtrar por término de búsqueda
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(housing =>
                housing.address.toLowerCase().includes(searchLower)
            );
        }

        // Filtrar por número de habitaciones
        if (bedroomsFilter) {
            filtered = filtered.filter(housing =>
                housing.bedrooms === parseInt(bedroomsFilter)
            );
        }

        // Filtrar por disponibilidad
        if (availabilityFilter) {
            const isAvailable = availabilityFilter === 'available';
            filtered = filtered.filter(housing =>
                housing.isAvailable === isAvailable
            );
        }

        setFilteredHousings(filtered);
    };

    const handleDelete = async (housingId) => {
        try {
            await axiosInstance.delete(`/housing/${housingId}`);
            toast.success('Vivienda eliminada exitosamente');
            fetchHousings();
        } catch (error) {
            console.error('Error al eliminar la vivienda:', error);
            toast.error('Error al eliminar la vivienda');
        } finally {
            setDeleteModal({ isOpen: false, housing: null });
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setBedroomsFilter('');
        setAvailabilityFilter('');
    };

    const getAvailabilityStatus = (isAvailable) => {
        return isAvailable ? (
            <span className="status-badge disponible">
                <CheckCircleIcon /> Disponible
            </span>
        ) : (
            <span className="status-badge no-disponible">
                <CancelIcon /> No Disponible
            </span>
        );
    };

    if (isLoading) {
        return <LoadingSpinner message="Cargando viviendas..." />;
    }

    return (
        <div className="housing-list-page">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">
                        <HomeIcon /> Viviendas y Espacios Arrendados
                    </h2>
                    {hasPermission('canCreateHousing') && (
                        <Link to="/housing/new" className="btn btn-primary">
                            <AddIcon /> Agregar Vivienda
                        </Link>
                    )}
                </div>

                <div className="standard-search-section">
                    <div className="standard-search-container">
                        <SearchIcon className="standard-search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar por dirección..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="standard-search-input"
                        />
                    </div>

                    <div className="standard-filter-dropdown">
                        <FilterListIcon className="standard-filter-icon" />
                        <select
                            value={bedroomsFilter}
                            onChange={(e) => setBedroomsFilter(e.target.value)}
                            className="standard-filter-select"
                        >
                            <option value="">Todas las habitaciones</option>
                            <option value="1">1 habitación</option>
                            <option value="2">2 habitaciones</option>
                            <option value="3">3 habitaciones</option>
                            <option value="4">4 o más habitaciones</option>
                        </select>
                    </div>

                    <div className="standard-filter-dropdown">
                        <FilterListIcon className="standard-filter-icon" />
                        <select
                            value={availabilityFilter}
                            onChange={(e) => setAvailabilityFilter(e.target.value)}
                            className="standard-filter-select"
                        >
                            <option value="">Todas las disponibilidades</option>
                            <option value="available">Disponibles</option>
                            <option value="unavailable">No disponibles</option>
                        </select>
                    </div>

                    <button
                        className="standard-btn-secondary"
                        onClick={resetFilters}
                    >
                        Limpiar filtros
                    </button>
                </div>

                {filteredHousings.length === 0 ? (
                    <div className="no-items">
                        {!hasPermission('canViewAllHousing') ? (
                            <p>No tienes ninguna vivienda asignada. Contacta a un administrador para que te asigne viviendas.</p>
                        ) : (
                            <p>No se encontraron viviendas con los filtros aplicados.</p>
                        )}
                    </div>
                ) : (
                    <div className="items-cards-grid">
                        {filteredHousings.map((housing) => (
                            <div key={housing.id} className="item-card housing-card">
                                {housing.photoUrl && (
                                    <div className="housing-image">
                                        <img
                                            src={housing.photoUrl}
                                            alt={housing.address}
                                        />
                                    </div>
                                )}
                                <div className="item-card-content">
                                    <div className="housing-header">
                                        <h3 className="housing-address">
                                            <LocationOnIcon /> {housing.address}
                                        </h3>
                                        {getAvailabilityStatus(housing.isAvailable)}
                                    </div>

                                    <div className="housing-details">
                                        <div className="housing-detail">
                                            <HotelIcon />
                                            <span>{housing.bedrooms} Habitaciones</span>
                                        </div>
                                        <div className="housing-detail">
                                            <BathtubIcon />
                                            <span>{housing.bathrooms} Baños</span>
                                        </div>
                                        <div className="housing-detail">
                                            <SquareFootIcon />
                                            <span>{housing.squareMeters} m²</span>
                                        </div>
                                    </div>

                                    <div className="item-card-actions">
                                        {hasPermission('canEditHousing') && (
                                            <>
                                                <EditHousingButton housingId={housing.id} />
                                                <DeleteButton
                                                    onDelete={handleDelete}
                                                    itemId={housing.id}
                                                    itemName={housing.address}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, housing: null })}
                onConfirm={() => handleDelete(deleteModal.housing?.id)}
                itemName={deleteModal.housing?.address}
                itemType="vivienda"
            />
        </div>
    );
};

export default HousingList; 
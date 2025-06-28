import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getRentals, deleteRental, getRentalsByDateRange } from '../services/rentalService';
import { getInventory } from '../services/inventoryService';
import './RentalList.css';
import '../components/FilterStyles.css';
import LoadingSpinner from '../components/LoadingSpinner';
import DeleteButton from '../components/DeleteButton';
import EditRentalButton from '../components/EditRentalButton';
import ViewRentalButton from '../components/ViewRentalButton';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Calendar from '../components/Calendar';

// Iconos
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import ItemIcon from '@mui/icons-material/Inventory';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import InventoryIcon from '@mui/icons-material/Inventory';

const RentalList = () => {
    const navigate = useNavigate();
    const [rentals, setRentals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedRentalId, setSelectedRentalId] = useState(null);
    const [inventoryItems, setInventoryItems] = useState({});

    useEffect(() => {
        fetchRentals();
        fetchInventoryItems();
    }, []);

    const fetchRentals = async () => {
        setIsLoading(true);
        try {
            const data = await getRentals();
            console.log('Datos de alquileres recibidos:', data);
            setRentals(data);
        } catch (error) {
            toast.error('Error al cargar los alquileres');
            console.error('Error detallado:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchInventoryItems = async () => {
        try {
            const data = await getInventory();
            console.log('Datos de inventario recibidos:', data);
            const itemsMap = {};
            data.forEach(item => {
                itemsMap[item.id] = item;
            });
            setInventoryItems(itemsMap);
        } catch (error) {
            toast.error('Error al cargar los inventarios');
            console.error('Error detallado:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteRental(id);
            toast.success('Alquiler eliminado correctamente');
            fetchRentals();
        } catch (error) {
            toast.error('Error al eliminar el alquiler');
            console.error('Error detallado:', error);
        } finally {
            setOpenDeleteModal(false);
        }
    };

    const openDeleteConfirmation = (id) => {
        setSelectedRentalId(id);
        setOpenDeleteModal(true);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStartDateFilter('');
        setEndDateFilter('');
        setTypeFilter('all');
    };

    const applyFilters = () => {
        if (startDateFilter && endDateFilter) {
            fetchRentalsByDateRange();
        } else {
            fetchRentals();
        }
    };

    const fetchRentalsByDateRange = async () => {
        setIsLoading(true);
        try {
            // Asegurarse de que las fechas estén en formato ISO
            const formattedStartDate = new Date(startDateFilter).toISOString();
            const formattedEndDate = new Date(endDateFilter).toISOString();
            const data = await getRentalsByDateRange(formattedStartDate, formattedEndDate);
            setRentals(data);
        } catch (error) {
            toast.error('Error al buscar por fechas');
            console.error('Error detallado:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filtrar alquileres por búsqueda y tipo
    const filteredRentals = rentals.filter(rental => {
        // Filtrar por tipo primero
        if (typeFilter !== 'all' && rental.type !== typeFilter) {
            return false;
        }

        // Si no hay término de búsqueda, mostrar todos los del tipo seleccionado
        if (!searchTerm.trim()) return true;

        const searchTermLower = searchTerm.toLowerCase();

        // Obtener información específica según el tipo de alquiler
        let searchableFields = [];

        switch (rental.type) {
            case 'housing':
                const housing = rental.housing;
                searchableFields = [
                    housing?.address?.toLowerCase(),
                    housing?.description?.toLowerCase(),
                    rental.metadata?.address?.toLowerCase(),
                    rental.metadata?.bedrooms?.toString(),
                    rental.metadata?.bathrooms?.toString(),
                    rental.metadata?.guestCount?.toString(),
                    rental.metadata?.baseGuestCount?.toString(),
                    rental.metadata?.amenities?.join(' ')?.toLowerCase(),
                    rental.metadata?.rules?.toLowerCase()
                ];
                break;
            case 'vehicle':
                const vehicle = rental.vehicle;
                searchableFields = [
                    vehicle?.brand?.toLowerCase(),
                    vehicle?.model?.toLowerCase(),
                    vehicle?.plate?.toLowerCase(),
                    vehicle?.description?.toLowerCase(),
                    rental.metadata?.dealerName?.toLowerCase(),
                    rental.metadata?.dealerAddress?.toLowerCase(),
                    rental.metadata?.dealerPhone?.toLowerCase(),
                    rental.metadata?.mileage?.toString()
                ];
                break;
            case 'item':
                const inventory = rental.inventory;
                searchableFields = [
                    inventory?.itemName?.toLowerCase(),
                    inventory?.description?.toLowerCase(),
                    inventory?.category?.toLowerCase(),
                    rental.metadata?.dealerName?.toLowerCase(),
                    rental.metadata?.dealerAddress?.toLowerCase(),
                    rental.metadata?.dealerPhone?.toLowerCase()
                ];
                break;
            default:
                searchableFields = [
                    rental.inventory?.itemName?.toLowerCase(),
                    rental.vehicle?.model?.toLowerCase(),
                    rental.housing?.address?.toLowerCase()
                ];
        }

        // Formatear fechas para búsqueda
        const startDate = rental.startDate ? new Date(rental.startDate).toLocaleDateString() : '';
        const endDate = rental.endDate ? new Date(rental.endDate).toLocaleDateString() : '';

        // Buscar en todos los campos relevantes
        return (
            searchableFields.some(field => field?.includes(searchTermLower)) ||
            startDate.includes(searchTerm) ||
            endDate.includes(searchTerm) ||
            rental.dailyCost?.toString().includes(searchTerm) ||
            rental.total?.toString().includes(searchTerm) ||
            rental.comments?.toLowerCase().includes(searchTermLower)
        );
    });

    // Formatear fecha para mostrar
    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha no disponible';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Fecha inválida';
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
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
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir el día final
            return diffDays;
        } catch (error) {
            console.error('Error al calcular duración:', error);
            return 0;
        }
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

    const getCategoryName = (itemId) => {
        const item = inventoryItems[itemId];
        return item?.category || 'Categoría desconocida';
    };

    const formatCurrency = (value) => {
        const number = Number(value);
        return isNaN(number) ? '0.00' : number.toFixed(2);
    };

    const handleEdit = (rental) => {
        const editPath = `/rentals/edit/${rental.type}/${rental.id}`;
        navigate(editPath);
    };

    const handleCreateNew = (type) => {
        const createPath = `/rentals/new/${type}`;
        navigate(createPath);
    };

    if (isLoading) {
        return <LoadingSpinner message="Cargando alquileres..." />;
    }

    return (
        <div className="rental-list-page">
            <div className="page-header">
                <h1>Alquileres</h1>
                <div className="header-actions">
                    <div className="dropdown">
                        <button className="btn btn-primary dropdown-toggle">
                            <AddIcon /> Nuevo Alquiler
                        </button>
                        <div className="dropdown-menu">
                            <button
                                className="dropdown-item"
                                onClick={() => handleCreateNew('housing')}
                            >
                                <HomeIcon /> Alquiler de Vivienda
                            </button>
                            <button
                                className="dropdown-item"
                                onClick={() => handleCreateNew('vehicle')}
                            >
                                <DirectionsCarIcon /> Alquiler de Vehículo
                            </button>
                            <button
                                className="dropdown-item"
                                onClick={() => handleCreateNew('item')}
                            >
                                <InventoryIcon /> Alquiler de Item
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="standard-search-section">
                <div className="standard-search-container">
                    <SearchIcon className="standard-search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por ítem, fecha, o monto..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="standard-search-input"
                    />
                </div>

                <button
                    className="standard-btn-secondary"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <FilterListIcon /> Filtros
                </button>
            </div>

            {showFilters && (
                <div className="advanced-filters">
                    <div className="filter-group">
                        <div className="form-group">
                            <label htmlFor="typeFilter">Tipo de Alquiler</label>
                            <div className="standard-filter-dropdown">
                                <FilterListIcon className="standard-filter-icon" />
                                <select
                                    id="typeFilter"
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="standard-filter-select"
                                >
                                    <option value="all">Todos los tipos</option>
                                    <option value="housing">Vivienda</option>
                                    <option value="vehicle">Vehículo</option>
                                    <option value="item">Ítem</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="date-filters">
                        <div className="form-group">
                            <label htmlFor="startDateFilter">Desde</label>
                            <input
                                type="date"
                                id="startDateFilter"
                                value={startDateFilter}
                                onChange={(e) => setStartDateFilter(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="endDateFilter">Hasta</label>
                            <input
                                type="date"
                                id="endDateFilter"
                                value={endDateFilter}
                                onChange={(e) => setEndDateFilter(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="filter-actions">
                        <button
                            className="standard-btn-secondary"
                            onClick={handleClearFilters}
                        >
                            Limpiar
                        </button>
                        <button
                            className="btn btn-apply"
                            onClick={applyFilters}
                        >
                            Aplicar
                        </button>
                    </div>
                </div>
            )}

            {/* Calendario de alquileres */}
            <Calendar rentals={filteredRentals} />

            {filteredRentals.length === 0 ? (
                <div className="no-rentals">
                    <p>No se encontraron alquileres que coincidan con la búsqueda</p>
                </div>
            ) : (
                <div className="rental-cards">
                    {filteredRentals.map((rental) => (
                        <div key={rental.id} className="rental-card">
                            <div className="rental-header">
                                <div className="rental-image">
                                    {rental.type === 'housing' && rental.housing?.photoUrl ? (
                                        <img
                                            src={rental.housing.photoUrl}
                                            alt={rental.housing.address}
                                            className="rental-item-image"
                                        />
                                    ) : rental.type === 'vehicle' && rental.vehicle?.photoUrl ? (
                                        <img
                                            src={rental.vehicle.photoUrl}
                                            alt={`${rental.vehicle.brand} ${rental.vehicle.model}`}
                                            className="rental-item-image"
                                        />
                                    ) : rental.type === 'item' && rental.inventory?.photoUrl ? (
                                        <img
                                            src={rental.inventory.photoUrl}
                                            alt={rental.inventory.itemName}
                                            className="rental-item-image"
                                        />
                                    ) : (
                                        <div className="no-image">Sin imagen</div>
                                    )}
                                </div>
                                <div className="rental-title">
                                    <span className="rental-id">{getItemName(rental)}</span>
                                </div>
                            </div>
                            <div className="rental-body">
                                <div className="rental-dates">
                                    <CalendarMonthIcon />
                                    <div className="date-details">
                                        <div className="date-range">
                                            <span>{formatDate(rental.startDate)}</span>
                                            <span className="date-separator">→</span>
                                            <span>{formatDate(rental.endDate)}</span>
                                        </div>
                                        <span className="duration">
                                            {calculateDuration(rental.startDate, rental.endDate)} días
                                        </span>
                                    </div>
                                </div>
                                {rental.peopleCount > 0 && (
                                    <div className="rental-people">
                                        <PeopleIcon />
                                        <span>{rental.peopleCount} personas</span>
                                    </div>
                                )}
                                <div className="rental-cost">
                                    <CurrencyExchangeIcon />
                                    <div className="cost-details">
                                        <span>Costo por día: ${formatCurrency(rental.dailyCost)}</span>
                                        <span className="total-cost">Total: ${formatCurrency(rental.total)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="rental-footer">
                                <div className="rental-actions">
                                    <ViewRentalButton
                                        rentalId={rental?._id || rental?.id}
                                        rentalType={rental.type}
                                    />
                                    <EditRentalButton
                                        rentalId={rental?._id || rental?.id}
                                        rentalType={rental.type}
                                    />
                                    <DeleteButton
                                        onDelete={() => openDeleteConfirmation(rental?._id || rental?.id)}
                                        itemId={rental?._id || rental?.id}
                                        itemName={getItemName(rental)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={openDeleteModal}
                onClose={() => setOpenDeleteModal(false)}
                onConfirm={() => selectedRentalId && handleDelete(selectedRentalId)}
                title="Eliminar Alquiler"
                message="¿Estás seguro de que deseas eliminar este alquiler? Esta acción no se puede deshacer."
            />
        </div>
    );
};

export default RentalList; 
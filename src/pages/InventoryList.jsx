// src/pages/InventoryList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../axiosConfig';
import './InventoryList.css';
import '../components/FilterStyles.css';
import LoadingSpinner from '../components/LoadingSpinner';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';
import { usePermissions } from '../context/PermissionsContext';
import { useAuth } from '../context/AuthContext';

// Iconos de Material UI
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BuildIcon from '@mui/icons-material/Build';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CloseIcon from '@mui/icons-material/Close';

const InventoryList = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { hasPermission } = usePermissions();
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [categories, setCategories] = useState([]);
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [selectedCondition, setSelectedCondition] = useState('');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [newCategoryDescription, setNewCategoryDescription] = useState('');
    const [users, setUsers] = useState([]);
    const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    // Estado para el modal de confirmación de eliminación
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        itemId: null,
        itemName: ''
    });

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/categories');
            setCategories(response.data);
        } catch (error) {

            toast.error('No se pudieron cargar las categorías');
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/users');
            setUsers(response.data);
        } catch (error) {

            toast.error('No se pudieron cargar los usuarios');
        } finally {
            setIsLoadingUsers(false);
        }
    };

    useEffect(() => {
        fetchInventory();
        fetchCategories();
        fetchUsers();
    }, []);

    const fetchInventory = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/inventory');
            let items = response.data || [];

            // Si el usuario es técnico, filtrar solo los elementos asignados
            if (currentUser?.role === 'tecnico') {
                items = items.filter(item => {
                    // Verificar si el usuario está en responsibleUsers
                    const isInResponsibleUsers = item.responsibleUsers?.some(respUser => {
                        const userId = typeof respUser === 'object' ? respUser.id : respUser;
                        return userId === currentUser.id;
                    });

                    // Verificar si el usuario es el responsiblePerson
                    const isResponsiblePerson = item.responsiblePerson === currentUser.fullName ||
                        item.responsiblePerson === currentUser.username;

                    return isInResponsibleUsers || isResponsiblePerson;
                });
            }

            setItems(items);
            setFilteredItems(items);
        } catch (error) {

            toast.error('Error al cargar el inventario');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Filtrar y ordenar items
        let result = [...items];

        // Aplicar filtro de búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(item =>
                (item.itemName && item.itemName.toLowerCase().includes(term)) ||
                (item.itemCode && item.itemCode.toLowerCase().includes(term)) ||
                (item.location && item.location.toLowerCase().includes(term)) ||
                (item.responsiblePerson && item.responsiblePerson.toLowerCase().includes(term))
            );
        }

        // Aplicar filtro de categoría
        if (categoryFilter) {
            result = result.filter(item => item.category === categoryFilter);
        }

        // Aplicar filtro de condición
        if (selectedCondition) {
            result = result.filter(item => item.condition === selectedCondition);
        }

        // Aplicar ordenamiento
        if (sortField) {
            result.sort((a, b) => {
                let valueA = a[sortField] || '';
                let valueB = b[sortField] || '';

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

        setFilteredItems(result);
    }, [items, searchTerm, categoryFilter, sortField, sortDirection, selectedCondition]);

    const handleDelete = (id, itemName) => {
        setDeleteModal({
            isOpen: true,
            itemId: id,
            itemName
        });
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`/inventory/${deleteModal.itemId}`);
            toast.success('Item eliminado correctamente');
            fetchInventory();
        } catch (error) {

            let errorMsg = 'Error al eliminar el elemento';

            if (error.response?.data?.message) {
                errorMsg = error.response.data.message.substring(0, 100) + (error.response.data.message.length > 100 ? '...' : '');
            } else if (error.response?.data?.error) {
                errorMsg = error.response.data.error.substring(0, 100) + (error.response.data.error.length > 100 ? '...' : '');
            }

            toast.error(errorMsg);
        } finally {
            setDeleteModal({
                isOpen: false,
                itemId: null,
                itemName: ''
            });
        }
    };

    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            itemId: null,
            itemName: ''
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
        setCategoryFilter('');
        setSelectedCondition('');
        setSortField('');
        setSortDirection('asc');
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

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/categories', {
                name: newCategory,
                description: newCategoryDescription
            });
            toast.success('Categoría agregada correctamente');
            setShowCategoryModal(false);
            setNewCategory('');
            setNewCategoryDescription('');
            fetchCategories();
        } catch (error) {

            if (error.response && error.response.data === "Ya existe una categoría con ese nombre") {
                toast.error('Ya existe una categoría con ese nombre');
            } else {
                toast.error('Error al agregar la categoría');
            }
        }
    };

    const renderResponsibleUsers = (item) => {
        // Si el item tiene responsibleUsers, mostrarlos
        if (item.responsibleUsers && item.responsibleUsers.length > 0) {
            return (
                <div className="responsible-users">
                    {item.responsibleUsers.map((user, index) => {
                        // Verificar si user es un objeto o solo un ID
                        const userId = typeof user === 'object' ? user.id : user;
                        const userData = users.find(u => u.id === userId);
                        const userName = userData ?
                            (userData.fullName || userData.name || userData.username) :
                            (typeof user === 'object' ? user.name : 'Usuario desconocido');

                        return (
                            <span key={index} className="user-chip">
                                <PersonIcon className="user-icon" />
                                {userName}
                            </span>
                        );
                    })}
                </div>
            );
        }

        // Si no hay responsibleUsers, mostrar responsiblePerson (campo anterior)
        return item.responsiblePerson || 'Sin asignar';
    };

    if (isLoading) {
        return <LoadingSpinner message="Cargando inventario..." />;
    }

    return (
        <div className="inventory-list-page">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Inventario de Equipos y Herramientas</h2>
                    <div className="header-buttons">
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowCategoryModal(true)}
                        >
                            <AddIcon /> Agregar Categoría
                        </button>
                        <Link to="/inventory/new" className="btn btn-primary">
                            <AddIcon /> Agregar Item
                        </Link>
                    </div>
                </div>

                <div className="standard-search-section">
                    <div className="standard-search-container">
                        <SearchIcon className="standard-search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, código, ubicación..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="standard-search-input"
                        />
                    </div>

                    <div className="standard-filter-dropdown">
                        <FilterListIcon className="standard-filter-icon" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="standard-filter-select"
                        >
                            <option value="">Todas las categorías</option>
                            {categories.map((category, index) => (
                                <option key={category.id || category._id || index} value={category.name || category}>
                                    {category.name || category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="standard-filter-dropdown">
                        <FilterListIcon className="standard-filter-icon" />
                        <select
                            value={selectedCondition}
                            onChange={(e) => setSelectedCondition(e.target.value)}
                            className="standard-filter-select"
                        >
                            <option value="">Todos los estados</option>
                            <option value="Excelente">Excelente</option>
                            <option value="Bueno">Bueno</option>
                            <option value="Regular">Regular</option>
                            <option value="Necesita Reparación">Necesita Reparación</option>
                            <option value="Fuera de Servicio">Fuera de Servicio</option>
                        </select>
                    </div>

                    <button
                        className="standard-btn-secondary"
                        onClick={resetFilters}
                    >
                        Limpiar filtros
                    </button>
                </div>

                {filteredItems.length === 0 ? (
                    <div className="no-items">
                        {!hasPermission('canViewAllInventory') ? (
                            <p>No tienes ningún item asignado. Contacta a un administrador para que te asigne elementos del inventario.</p>
                        ) : (
                            <p>No se encontraron items con los filtros aplicados.</p>
                        )}
                    </div>
                ) : (
                    <div className="items-cards-grid">
                        {filteredItems.map((item) => (
                            <div key={item.id} className="item-card">
                                <div className="item-card-image">
                                    {item.photoUrl ? (
                                        <img
                                            src={item.photoUrl}
                                            alt={item.itemName}
                                            className="item-image"
                                        />
                                    ) : (
                                        <div className="item-image-placeholder">
                                            <span>Sin imagen</span>
                                        </div>
                                    )}
                                </div>
                                <div className="item-card-content">
                                    <div className="item-card-header">
                                        <span className="item-code">{item.itemCode}</span>
                                        <span className={`status-badge ${getStatusClass(item.condition)}`}>
                                            {item.condition}
                                        </span>
                                    </div>
                                    <h3 className="item-name">{item.itemName}</h3>
                                    <div className="item-details">
                                        <div className="item-detail">
                                            <span className="detail-label">Categoría:</span>
                                            <span className="detail-value">{item.category}</span>
                                        </div>
                                        <div className="item-detail">
                                            <span className="detail-label">Cantidad:</span>
                                            <span className="detail-value">{item.quantity}</span>
                                        </div>
                                        <div className="item-detail">
                                            <span className="detail-label">Ubicación:</span>
                                            <span className="detail-value">{item.location || 'No especificado'}</span>
                                        </div>
                                        <div className="detail-group">
                                            <span className="detail-label">Responsables:</span>
                                            {renderResponsibleUsers(item)}
                                        </div>
                                    </div>
                                    <div className="item-card-actions">
                                        {hasPermission('canAccessSettings') && (
                                            <>
                                                <EditButton itemId={item.id} />
                                                <DeleteButton
                                                    onDelete={handleDelete}
                                                    itemId={item.id}
                                                    itemName={item.itemName}
                                                />
                                            </>
                                        )}
                                        {/* Mostrar botón de mantenimiento solo para vehículos o equipos que lo requieran */}
                                        {(item.category === 'Vehículo' || item.category === 'Maquinaria' || item.category === 'Equipo') && (
                                            <button
                                                className="btn-action maintain"
                                                onClick={() => navigate(`/maintenance/history/${item.id}`)}
                                                title="Historial de mantenimiento"
                                            >
                                                <BuildIcon />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal para agregar categoría */}
            {showCategoryModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Agregar Nueva Categoría</h2>
                            <button className="close-button" onClick={() => setShowCategoryModal(false)}>
                                <CancelIcon />
                            </button>
                        </div>
                        <form onSubmit={handleAddCategory}>
                            <div className="form-group">
                                <label htmlFor="newCategory">Nombre de la Categoría *</label>
                                <input
                                    type="text"
                                    id="newCategory"
                                    name="newCategory"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    required
                                    placeholder="Ej: Equipo Electrónico"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="newCategoryDescription">Descripción</label>
                                <textarea
                                    id="newCategoryDescription"
                                    name="newCategoryDescription"
                                    value={newCategoryDescription}
                                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                                    placeholder="Descripción opcional de la categoría"
                                    rows="3"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowCategoryModal(false)} className="cancel-button">
                                    Cancelar
                                </button>
                                <button type="submit" className="submit-button">
                                    Agregar Categoría
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmación de eliminación */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                itemName={deleteModal.itemName}
                message={`¿Estás seguro de que deseas eliminar "${deleteModal.itemName}"?`}
            />
        </div>
    );
};

export default InventoryList;
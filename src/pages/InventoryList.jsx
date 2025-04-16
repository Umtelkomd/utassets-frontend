// src/pages/InventoryList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../axiosConfig';
import './InventoryList.css';

// Iconos de Material UI
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BuildIcon from '@mui/icons-material/Build';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import CancelIcon from '@mui/icons-material/Cancel';

const InventoryList = () => {
    const navigate = useNavigate();
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

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            toast.error('No se pudieron cargar las categorías');
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            toast.error('No se pudieron cargar los usuarios');
        }
    };

    useEffect(() => {
        fetchInventory();
        fetchCategories();
        fetchUsers();
    }, []);

    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            const [inventoryResponse, categoriesResponse] = await Promise.all([
                axios.get('/inventory'),
                axios.get('/categories')
            ]);

            console.log('Datos de inventario recibidos:', inventoryResponse.data);

            // Asegurar que los datos tienen la estructura esperada
            const processedItems = inventoryResponse.data.map(item => {
                // Verificar si el item tiene la estructura esperada
                if (!item.name && !item.item_name) {
                    console.warn('Item sin nombre encontrado:', item);
                }
                if (!item.code && !item.item_code) {
                    console.warn('Item sin código encontrado:', item);
                }

                // Manejar el caso especial de vehículos
                if (item.category === 'Vehículo') {
                    console.log('==== DATOS DE VEHÍCULO RECIBIDOS (ORIGINAL) ====');
                    console.log(JSON.stringify(item, null, 2));

                    // Verificar todos los campos disponibles y sus valores
                    console.log('==== PROPIEDADES DEL VEHÍCULO ====');
                    Object.keys(item).forEach(key => {
                        console.log(`${key}: ${JSON.stringify(item[key])}`);
                    });

                    console.log('de aca.', item)

                    // Crear un objeto con los campos que necesitamos, evitando errores de null/undefined
                    const camposVehiculo = {
                        carName: item.itemName || null,
                        year: item.year || null,
                        licensePlate: item.licensePlate || null,
                        license_plate: item.license_plate || null,
                        placa: item.placa || null,
                        vehicleStatus: item.vehicleStatus || null,
                        condition: item.condition || null,
                        item_name: item.item_name || null,
                        name: item.name || null,
                        item_code: item.item_code || null,
                        code: item.code || null
                    };

                    return {
                        ...item,
                        id: item.id || item._id,
                        itemName: item.itemName,
                        itemCode: item.itemCode || 0,
                        category: item.category || 'Vehículo',
                        quantity: item.quantity || 1,
                        condition: item.condition || 'Desconocido',
                        location: item.location || 'Sin ubicación',
                        responsiblePerson: item.responsiblePerson || item.responsible_person || 'Sin asignar',
                        acquisitionDate: item.acquisitionDate || null,
                        lastMaintenanceDate: item.lastMaintenanceDate || null,
                        nextMaintenanceDate: item.nextMaintenanceDate || null,
                        notes: item.notes || null,
                        imagePath: item.imagePath || null
                    };
                }

                // Si los datos vienen en otro formato (name en lugar de item_name, etc.), normalizarlos
                return {
                    ...item,
                    id: item.id || item._id,
                    itemName: item.itemName || item.name || 'Sin nombre',
                    itemCode: item.itemCode || item.code || 'Sin código',
                    category: item.category || 'Sin categoría',
                    quantity: item.quantity || 0,
                    condition: item.condition || 'Desconocido',
                    location: item.location || 'Sin ubicación',
                    responsiblePerson: item.responsiblePerson || item.responsible_person || 'Sin asignar',
                    acquisitionDate: item.acquisitionDate || null,
                    lastMaintenanceDate: item.lastMaintenanceDate || null,
                    nextMaintenanceDate: item.nextMaintenanceDate || null,
                    notes: item.notes || null,
                    imagePath: item.imagePath || null
                };
            });

            setItems(processedItems);
            setFilteredItems(processedItems);
            setCategories(categoriesResponse.data);
        } catch (error) {
            console.error('Error fetching data:', error);
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

    const handleDelete = async (id, itemName) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar "${itemName}"?`)) {
            try {
                await axios.delete(`/inventory/${id}`);
                toast.success('Item eliminado correctamente');
                fetchInventory();
            } catch (error) {
                console.error('Error deleting item:', error);
                toast.error('Error al eliminar el item');
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
            console.error('Error al agregar categoría:', error);
            if (error.response && error.response.data === "Ya existe una categoría con ese nombre") {
                toast.error('Ya existe una categoría con ese nombre');
            } else {
                toast.error('Error al agregar la categoría');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="page-loading-spinner">
                <p>Cargando inventario...</p>
            </div>
        );
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

                <div className="filter-controls">
                    <div className="search-box">
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, código, ubicación..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-options">
                        <div className="filter-group">
                            <FilterListIcon />
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">Todas las categorías</option>
                                {categories.map((category) => (
                                    <option key={category.id || category._id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <FilterListIcon />
                            <select
                                value={selectedCondition}
                                onChange={(e) => setSelectedCondition(e.target.value)}
                                className="filter-select"
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
                            className="btn btn-secondary btn-sm"
                            onClick={resetFilters}
                        >
                            Limpiar filtros
                        </button>
                    </div>
                </div>

                {filteredItems.length === 0 ? (
                    <div className="no-items">
                        <p>No se encontraron items con los filtros aplicados.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Imagen</th>
                                    <th className="sortable" onClick={() => handleSort('itemCode')}>
                                        Código
                                        {sortField === 'itemCode' && (
                                            <SortIcon className={`sort-icon ${sortDirection}`} />
                                        )}
                                    </th>
                                    <th className="sortable" onClick={() => handleSort('itemName')}>
                                        Nombre
                                        {sortField === 'itemName' && (
                                            <SortIcon className={`sort-icon ${sortDirection}`} />
                                        )}
                                    </th>
                                    <th className="sortable" onClick={() => handleSort('category')}>
                                        Categoría
                                        {sortField === 'category' && (
                                            <SortIcon className={`sort-icon ${sortDirection}`} />
                                        )}
                                    </th>
                                    <th className="sortable" onClick={() => handleSort('quantity')}>
                                        Cantidad
                                        {sortField === 'quantity' && (
                                            <SortIcon className={`sort-icon ${sortDirection}`} />
                                        )}
                                    </th>
                                    <th className="sortable" onClick={() => handleSort('condition')}>
                                        Estado
                                        {sortField === 'condition' && (
                                            <SortIcon className={`sort-icon ${sortDirection}`} />
                                        )}
                                    </th>
                                    <th className="sortable" onClick={() => handleSort('location')}>
                                        Ubicación
                                        {sortField === 'location' && (
                                            <SortIcon className={`sort-icon ${sortDirection}`} />
                                        )}
                                    </th>
                                    <th className="sortable" onClick={() => handleSort('responsiblePerson')}>
                                        Responsable
                                        {sortField === 'responsiblePerson' && (
                                            <SortIcon className={`sort-icon ${sortDirection}`} />
                                        )}
                                    </th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="item-image-container">
                                                {item.imagePath ? (
                                                    <img
                                                        src={`${process.env.REACT_APP_API_URL}/uploads/inventory/${item.imagePath}`}
                                                        alt={item.itemName}
                                                        className="item-image"
                                                    />
                                                ) : (
                                                    <div className="no-image-placeholder">
                                                        Sin imagen
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>{item.itemCode}</td>
                                        <td className="item-name">{item.itemName}</td>
                                        <td>{item.category}</td>
                                        <td>{item.quantity}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(item.condition)}`}>
                                                {item.condition}
                                            </span>
                                        </td>
                                        <td>{item.location}</td>
                                        <td>
                                            {item.responsibleUsers ? (
                                                <div className="responsible-users">
                                                    {item.responsibleUsers.map(user => {
                                                        const userData = users.find(u => u.id === user.id);
                                                        return (
                                                            <span key={user.id} className="user-chip">
                                                                {userData ? `${userData.fullName}` : 'Usuario no encontrado'}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                item.responsiblePerson || 'Sin asignar'
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-action edit"
                                                    onClick={() => navigate(`/inventory/edit/${item.id}`)}
                                                    title="Editar"
                                                >
                                                    <EditIcon />
                                                </button>
                                                <button
                                                    className="btn-action delete"
                                                    onClick={() => handleDelete(item.id, item.itemName)}
                                                    title="Eliminar"
                                                >
                                                    <DeleteIcon />
                                                </button>
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
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
        </div>
    );
};

export default InventoryList;
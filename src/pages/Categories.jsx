import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import './Categories.css';
import LoadingSpinner from '../components/LoadingSpinner';

// Importar iconos
import {
    Category as CategoryIcon,
    Add as AddIcon,
    ArrowBack as ArrowBackIcon,
    Inventory as InventoryIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get('/inventory');
                const items = response.data || [];

                // Extraer categorías únicas
                const uniqueCategories = [...new Set(items.map(item => item.category).filter(Boolean))];

                // Obtener conteo de items por categoría
                const categoriesWithCount = uniqueCategories.map(category => {
                    const itemsInCategory = items.filter(item => item.category === category);
                    return {
                        name: category,
                        count: itemsInCategory.length,
                        items: itemsInCategory
                    };
                }).sort((a, b) => a.name.localeCompare(b.name)); // Ordenar alfabéticamente

                setCategories(categoriesWithCount);
            } catch (err) {

                setError('No se pudieron cargar las categorías. Por favor, intente nuevamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Función para obtener colores para las categorías
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
    };

    if (loading) {
        return (
            <LoadingSpinner message="Cargando categorías..." />
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Reintentar</button>
            </div>
        );
    }

    return (
        <div className="categories-page">
            <div className="categories-header">
                <div className="header-left">
                    <Link to="/" className="back-link">
                        <ArrowBackIcon />
                        <span>Volver al Dashboard</span>
                    </Link>
                    <h1>
                        <CategoryIcon />
                        Categorías
                    </h1>
                </div>
                <div className="header-right">
                    <Link to="/categories/add" className="add-category-btn">
                        <AddIcon />
                        Nueva Categoría
                    </Link>
                </div>
            </div>

            <div className="categories-summary">
                <div className="summary-card">
                    <div className="summary-icon">
                        <CategoryIcon />
                    </div>
                    <div className="summary-content">
                        <h3>Total de Categorías</h3>
                        <div className="summary-value">{categories.length}</div>
                    </div>
                </div>
            </div>

            {categories.length === 0 ? (
                <div className="empty-state">
                    <CategoryIcon className="empty-icon" />
                    <h3>No hay categorías disponibles</h3>
                    <p>No se encontraron categorías. Comience añadiendo nuevas categorías a sus items.</p>
                    <Link to="/inventory/new" className="add-button">
                        <AddIcon />
                        Añadir Nuevo Item
                    </Link>
                </div>
            ) : (
                <div className="categories-grid">
                    {categories.map((category, index) => (
                        <div
                            key={category.name}
                            className="category-card"
                            style={{ '--category-color': getCategoryColor(index) }}
                        >
                            <div className="category-card-header">
                                <h3>{category.name}</h3>
                                <div className="category-actions">
                                    <button className="category-action-btn edit">
                                        <EditIcon />
                                    </button>
                                    <button className="category-action-btn delete">
                                        <DeleteIcon />
                                    </button>
                                </div>
                            </div>
                            <div className="category-card-content">
                                <div className="category-stat">
                                    <span className="stat-label">Items:</span>
                                    <span className="stat-value">{category.count}</span>
                                </div>
                                <Link
                                    to={`/inventory?category=${encodeURIComponent(category.name)}`}
                                    className="view-items-link"
                                >
                                    <InventoryIcon />
                                    Ver Items
                                </Link>
                            </div>
                            <div className="category-items-preview">
                                <h4>Items Recientes:</h4>
                                <ul>
                                    {category.items.slice(0, 3).map(item => (
                                        <li key={item._id || item.itemCode}>
                                            <Link to={`/inventory/${item._id}`}>
                                                {item.itemName || item.itemCode || 'Item sin nombre'}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                {category.count > 3 && (
                                    <div className="more-items">
                                        + {category.count - 3} más...
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Categories; 
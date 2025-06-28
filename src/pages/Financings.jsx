import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';
import financingService, { financingCalculations } from '../services/financingService';
import LoadingSpinner from '../components/LoadingSpinner';
import './Financings.css';

// Material UI Icons
import {
    Add as AddIcon,
    FilterList as FilterListIcon,
    Search as SearchIcon,
    DirectionsCar as DirectionsCarIcon,
    Inventory as InventoryIcon,
    Home as HomeIcon,
    MonetizationOn as MonetizationOnIcon,
    Schedule as ScheduleIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    TrendingUp as TrendingUpIcon,
    AccountBalance as AccountBalanceIcon,
    Assessment as AssessmentIcon,
    Clear as ClearIcon
} from '@mui/icons-material';

const Financings = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { hasPermission } = usePermissions();

    const [financings, setFinancings] = useState([]);
    const [filteredFinancings, setFilteredFinancings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [summary, setSummary] = useState(null);

    // Filtros
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        assetType: '',
        lender: ''
    });

    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchFinancings();
        fetchSummary();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [financings, filters]);

    const fetchFinancings = async () => {
        try {
            setIsLoading(true);
            const data = await financingService.getFinancings();
            setFinancings(data);
        } catch (error) {
            console.error('Error fetching financings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const data = await financingService.getFinancingSummary();
            setSummary(data);
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    };

    const applyFilters = () => {
        let filtered = [...financings];

        // Filtro de búsqueda
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(financing =>
                financing.assetName?.toLowerCase().includes(searchLower) ||
                financing.assetReference?.toLowerCase().includes(searchLower) ||
                financing.lender?.toLowerCase().includes(searchLower) ||
                financing.notes?.toLowerCase().includes(searchLower)
            );
        }

        // Filtro por estado
        if (filters.status) {
            filtered = filtered.filter(financing => financing.status === filters.status);
        }

        // Filtro por tipo de activo
        if (filters.assetType) {
            filtered = filtered.filter(financing => financing.assetType === filters.assetType);
        }

        // Filtro por prestamista
        if (filters.lender) {
            filtered = filtered.filter(financing =>
                financing.lender?.toLowerCase().includes(filters.lender.toLowerCase())
            );
        }

        setFilteredFinancings(filtered);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            status: '',
            assetType: '',
            lender: ''
        });
    };

    const handleDeleteFinancing = async (id) => {
        if (window.confirm('¿Está seguro de que desea eliminar este financiamiento?')) {
            try {
                await financingService.deleteFinancing(id);
                fetchFinancings();
                fetchSummary();
            } catch (error) {
                console.error('Error deleting financing:', error);
                alert('Error al eliminar el financiamiento');
            }
        }
    };

    const getAssetIcon = (assetType) => {
        switch (assetType) {
            case 'vehicle': return <DirectionsCarIcon />;
            case 'inventory': return <InventoryIcon />;
            case 'housing': return <HomeIcon />;
            default: return <MonetizationOnIcon />;
        }
    };

    const getAssetTypeLabel = (assetType) => {
        switch (assetType) {
            case 'vehicle': return 'Vehículo';
            case 'inventory': return 'Inventario';
            case 'housing': return 'Vivienda';
            default: return 'Activo';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return <TrendingUpIcon />;
            case 'completed': return <CheckCircleIcon />;
            case 'cancelled': return <CancelIcon />;
            case 'defaulted': return <WarningIcon />;
            default: return <ScheduleIcon />;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'active': return 'Activo';
            case 'completed': return 'Completado';
            case 'cancelled': return 'Cancelado';
            case 'defaulted': return 'En Mora';
            default: return 'Desconocido';
        }
    };

    if (isLoading) {
        return <LoadingSpinner message="Cargando financiamientos..." />;
    }

    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    return (
        <div className="financings-page">
            {/* Header Profesional */}
            <div className="financings-page-header">
                <div className="financings-header-content">
                    <div className="financings-header-left">
                        <div className="financings-page-title">
                            <div className="financings-page-title-icon">
                                <AccountBalanceIcon />
                            </div>
                            <h1>Gestión de Financiamientos</h1>
                        </div>
                        <p className="financings-page-subtitle">
                            Control y seguimiento de todos los financiamientos activos y completados
                        </p>
                    </div>
                    <div className="financings-header-actions">
                        <button
                            className={`filter-toggle-button ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <FilterListIcon />
                            Filtros
                            {hasActiveFilters && <span className="filter-count">({Object.values(filters).filter(v => v).length})</span>}
                        </button>
                        {hasPermission('canCreateFinancings') && (
                            <Link to="/financings/new" className="add-financing-button">
                                <AddIcon />
                                Nuevo Financiamiento
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Dashboard de Estadísticas */}
            {summary && (
                <div className="dashboard-stats">
                    <div className="stats-grid">
                        <div className="stat-card primary">
                            <div className="stat-header">
                                <h3 className="stat-title">Financiamientos Activos</h3>
                                <div className="stat-icon primary">
                                    <TrendingUpIcon />
                                </div>
                            </div>
                            <div className="stat-value">{summary.totalActive || 0}</div>
                            <p className="stat-description">Préstamos en curso</p>
                        </div>

                        <div className="stat-card success">
                            <div className="stat-header">
                                <h3 className="stat-title">Total Financiado</h3>
                                <div className="stat-icon success">
                                    <MonetizationOnIcon />
                                </div>
                            </div>
                            <div className="stat-value">
                                {financingCalculations.formatCurrency(summary.totalFinanced || 0)}
                            </div>
                            <p className="stat-description">Capital total otorgado</p>
                        </div>

                        <div className="stat-card warning">
                            <div className="stat-header">
                                <h3 className="stat-title">Total Pagado</h3>
                                <div className="stat-icon warning">
                                    <CheckCircleIcon />
                                </div>
                            </div>
                            <div className="stat-value">
                                {financingCalculations.formatCurrency(summary.totalPaid || 0)}
                            </div>
                            <p className="stat-description">Pagos recibidos</p>
                        </div>

                        <div className="stat-card danger">
                            <div className="stat-header">
                                <h3 className="stat-title">Pagos Vencidos</h3>
                                <div className="stat-icon danger">
                                    <WarningIcon />
                                </div>
                            </div>
                            <div className="stat-value">
                                {financingCalculations.formatCurrency(summary.totalOverdue || 0)}
                            </div>
                            <p className="stat-description">Requieren atención</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filtros Mejorados */}
            {showFilters && (
                <div className="financings-filters-section">
                    <div className="financings-filters-header">
                        <h3 className="financings-filters-title">Filtrar Financiamientos</h3>
                        {hasActiveFilters && (
                            <button className="clear-filters-button" onClick={clearFilters}>
                                <ClearIcon />
                                Limpiar Filtros
                            </button>
                        )}
                    </div>
                    <div className="filters-grid">
                        <div className="filter-group">
                            <label className="filter-label">Buscar</label>
                            <div className="search-input-wrapper">
                                <SearchIcon className="search-icon" />
                                <input
                                    type="text"
                                    className="filter-input search-input"
                                    placeholder="Buscar por activo, prestamista o notas..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">Estado</label>
                            <select
                                className="filter-input"
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="">Todos los estados</option>
                                <option value="active">Activo</option>
                                <option value="completed">Completado</option>
                                <option value="cancelled">Cancelado</option>
                                <option value="defaulted">En Mora</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">Tipo de Activo</label>
                            <select
                                className="filter-input"
                                value={filters.assetType}
                                onChange={(e) => handleFilterChange('assetType', e.target.value)}
                            >
                                <option value="">Todos los tipos</option>
                                <option value="vehicle">Vehículos</option>
                                <option value="inventory">Inventario</option>
                                <option value="housing">Viviendas</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">Prestamista</label>
                            <input
                                type="text"
                                className="filter-input"
                                placeholder="Filtrar por prestamista..."
                                value={filters.lender}
                                onChange={(e) => handleFilterChange('lender', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Contenido Principal */}
            <div className="financings-content">
                <div className="financings-content-header">
                    <h2 className="financings-content-title">
                        Lista de Financiamientos
                    </h2>
                    <p className="financings-content-subtitle">
                        {filteredFinancings.length} financiamiento{filteredFinancings.length !== 1 ? 's' : ''} encontrado{filteredFinancings.length !== 1 ? 's' : ''}
                        {hasActiveFilters && ' (filtrados)'}
                    </p>
                </div>

                {filteredFinancings.length === 0 ? (
                    <div className="financings-empty-state">
                        <AccountBalanceIcon className="financings-empty-icon" />
                        <h3 className="financings-empty-title">
                            {financings.length === 0 ? 'No hay financiamientos registrados' : 'No se encontraron resultados'}
                        </h3>
                        <p className="financings-empty-description">
                            {financings.length === 0
                                ? 'Comience creando su primer financiamiento para realizar el seguimiento de préstamos y pagos.'
                                : 'Intente ajustar los filtros para encontrar lo que busca, o revise los criterios de búsqueda.'
                            }
                        </p>
                        {hasPermission('canCreateFinancings') && financings.length === 0 && (
                            <Link to="/financings/new" className="add-financing-button">
                                <AddIcon />
                                Crear Primer Financiamiento
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="financings-grid">
                        {filteredFinancings.map((financing) => (
                            <div key={financing.id} className="financing-card">
                                <div className="card-header">
                                    <div className="asset-info">
                                        <div className="asset-icon">
                                            {getAssetIcon(financing.assetType)}
                                        </div>
                                        <div className="asset-details">
                                            <h3>{financing.assetName || `${getAssetTypeLabel(financing.assetType)} #${financing.assetId}`}</h3>
                                            <p>{financing.assetReference || 'Sin referencia'}</p>
                                        </div>
                                    </div>
                                    <div className={`status-badge ${financing.status}`}>
                                        {getStatusIcon(financing.status)}
                                        <span>{getStatusLabel(financing.status)}</span>
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="financing-metrics">
                                        <div className="metric">
                                            <div className="metric-label">Financiado</div>
                                            <div className="metric-value">
                                                {financingCalculations.formatCurrency((financing.loanAmount || 0) - (financing.downPayment || 0))}
                                            </div>
                                        </div>
                                        <div className="metric">
                                            <div className="metric-label">Progreso</div>
                                            <div className="metric-value">
                                                {financing.summary ? (financing.summary.percentageComplete || 0).toFixed(1) : '0.0'}%
                                            </div>
                                        </div>
                                    </div>

                                    <div className="financing-details">
                                        <div className="detail-row">
                                            <span className="detail-label">Prestamista:</span>
                                            <span className="detail-value">{financing.lender}</span>
                                        </div>
                                        {financing.summary && (
                                            <>
                                                <div className="detail-row">
                                                    <span className="detail-label">Pagado:</span>
                                                    <span className="detail-value">
                                                        {financingCalculations.formatCurrency(financing.summary.totalPaid || 0)}
                                                    </span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">Saldo:</span>
                                                    <span className="detail-value">
                                                        {financingCalculations.formatCurrency(financing.summary.remainingBalance || 0)}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {financing.summary && financing.summary.nextPaymentDate && (
                                        <div className={`next-payment-section ${financing.summary.isOverdue ? 'overdue' : ''}`}>
                                            <div className="payment-label">
                                                {financing.summary.isOverdue ? 'Pago Vencido' : 'Próximo Pago'}
                                            </div>
                                            <div className="payment-amount">
                                                {financingCalculations.formatCurrency(financing.summary.nextPaymentAmount || 0)}
                                            </div>
                                            <div className="payment-date">
                                                {financingCalculations.formatDate(financing.summary.nextPaymentDate)}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="card-actions">
                                    <button
                                        className="action-button primary"
                                        onClick={() => navigate(`/financings/${financing.id}`)}
                                    >
                                        <VisibilityIcon />
                                        Ver
                                    </button>
                                    {hasPermission('canEditFinancings') && (
                                        <button
                                            className="action-button secondary"
                                            onClick={() => navigate(`/financings/${financing.id}/edit`)}
                                        >
                                            <EditIcon />
                                            Editar
                                        </button>
                                    )}
                                    {hasPermission('canDeleteFinancings') && (financing.paymentsMade === 0 || !financing.paymentsMade) && (
                                        <button
                                            className="action-button danger"
                                            onClick={() => handleDeleteFinancing(financing.id)}
                                        >
                                            <DeleteIcon />
                                            Eliminar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Financings; 
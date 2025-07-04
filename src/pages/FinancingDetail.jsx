import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';
import financingService, { financingCalculations } from '../services/financingService';
import LoadingSpinner from '../components/LoadingSpinner';
import './FinancingDetail.css';

// Material UI Icons
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Payment as PaymentIcon,
    AccountBalance as AccountBalanceIcon,
    DirectionsCar as DirectionsCarIcon,
    Inventory as InventoryIcon,
    Home as HomeIcon,
    TrendingUp as TrendingUpIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    Warning as WarningIcon,
    MonetizationOn as MonetizationOnIcon,
    CalendarToday as CalendarTodayIcon,
    Business as BusinessIcon,
    Info as InfoIcon,
    Timeline as TimelineIcon,
    BarChart as BarChartIcon
} from '@mui/icons-material';

const FinancingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { hasPermission } = usePermissions();

    const [financing, setFinancing] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('overview');
    const [paymentToRecord, setPaymentToRecord] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        fetchFinancing();
    }, [id]);

    const fetchFinancing = async () => {
        try {
            setIsLoading(true);
            const data = await financingService.getFinancingById(id);
            setFinancing(data);
        } catch (error) {
            console.error('Error fetching financing:', error);
            if (error.response?.status === 404) {
                navigate('/financings');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteFinancing = async () => {
        if (window.confirm('¿Está seguro de que desea eliminar este financiamiento?')) {
            try {
                await financingService.deleteFinancing(id);
                navigate('/financings');
            } catch (error) {
                console.error('Error deleting financing:', error);
                alert('Error al eliminar el financiamiento');
            }
        }
    };

    const handleRecordPayment = async (paymentData) => {
        try {
            await financingService.recordPayment(paymentToRecord.id, paymentData);
            setShowPaymentModal(false);
            setPaymentToRecord(null);
            await fetchFinancing(); // Refresh data
        } catch (error) {
            console.error('Error recording payment:', error);
            alert('Error al registrar el pago');
            throw error; // Re-throw para que el modal maneje el error
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#007aff';
            case 'completed': return '#34c759';
            case 'cancelled': return '#8e8e93';
            case 'defaulted': return '#ff3b30';
            default: return '#8e8e93';
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
        return <LoadingSpinner message="Cargando detalles del financiamiento..." />;
    }

    // ✅ SIMPLIFICADO: Solo usar datos calculados del backend
    const getTotalToPay = () => {
        return financing.calculations?.totalToPay || 0;
    };

    const getTotalInterest = () => {
        return financing.calculations?.totalInterest || 0;
    };

    if (!financing) {
        return (
            <div className="financing-detail-error">
                <h2>Financiamiento no encontrado</h2>
                <Link to="/financings">Volver a Financiamientos</Link>
            </div>
        );
    }

    return (
        <div className="financing-detail-page">
            {/* Header */}
            <div className="financing-detail-header">
                <div className="financing-header-navigation">
                    <button
                        className="financing-back-button"
                        onClick={() => navigate('/financings')}
                    >
                        <ArrowBackIcon />
                        Volver a Financiamientos
                    </button>
                </div>

                <div className="financing-header-content">
                    <div className="financing-detail-info">
                        <div className="financing-detail-asset-icon">
                            {getAssetIcon(financing.assetType)}
                        </div>
                        <div className="financing-detail-title">
                            <h1>{financing.assetName || `${getAssetTypeLabel(financing.assetType)} #${financing.assetId}`}</h1>
                            <p className="financing-detail-asset-reference">{financing.assetReference}</p>
                            <div className="financing-detail-status" style={{ color: getStatusColor(financing.status) }}>
                                {getStatusLabel(financing.status)}
                            </div>
                        </div>
                    </div>

                    {hasPermission('canEditFinancings') && (
                        <div className="financing-header-actions">
                            <button
                                className="financing-action-button edit"
                                onClick={() => navigate(`/financings/${id}/edit`)}
                            >
                                <EditIcon />
                                Editar
                            </button>
                            {financing.paymentsMade === 0 && hasPermission('canDeleteFinancings') && (
                                <button
                                    className="financing-action-button delete"
                                    onClick={handleDeleteFinancing}
                                >
                                    <DeleteIcon />
                                    Eliminar
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            {financing.summary && (
                <div className="financing-summary-section">
                    <div className="financing-summary-cards">
                        <div className="financing-summary-card">
                            <div className="financing-summary-icon">
                                <MonetizationOnIcon />
                            </div>
                            <div className="financing-summary-content">
                                <h3>Monto Financiado</h3>
                                <div className="financing-summary-value">
                                    {financingCalculations.formatCurrency(financing.summary.totalFinanced)}
                                </div>
                                <div className="financing-summary-subtext">
                                    Cuota inicial: {financingCalculations.formatCurrency(financing.downPayment || 0)}
                                </div>
                            </div>
                        </div>

                        <div className="financing-summary-card">
                            <div className="financing-summary-icon">
                                <CheckCircleIcon />
                            </div>
                            <div className="financing-summary-content">
                                <h3>Total Pagado</h3>
                                <div className="financing-summary-value">
                                    {financingCalculations.formatCurrency(financing.summary.totalPaid)}
                                </div>
                                <div className="financing-summary-subtext">
                                    {financing.summary.paymentsMade} de {financing.termMonths} cuotas
                                </div>
                            </div>
                        </div>

                        <div className="financing-summary-card">
                            <div className="financing-summary-icon">
                                <TrendingUpIcon />
                            </div>
                            <div className="financing-summary-content">
                                <h3>Saldo Restante</h3>
                                <div className="financing-summary-value">
                                    {financingCalculations.formatCurrency(financing.summary.remainingBalance)}
                                </div>
                                <div className="financing-summary-subtext">
                                    {financing.summary.paymentsRemaining} cuotas restantes
                                </div>
                            </div>
                        </div>

                        {financing.summary.nextPaymentDate && (
                            <div className={`financing-summary-card ${financing.summary.isOverdue ? 'overdue' : ''}`}>
                                <div className="financing-summary-icon">
                                    {financing.summary.isOverdue ? <WarningIcon /> : <ScheduleIcon />}
                                </div>
                                <div className="financing-summary-content">
                                    <h3>{financing.summary.isOverdue ? 'Pago Vencido' : 'Próximo Pago'}</h3>
                                    <div className="financing-summary-value">
                                        {financingCalculations.formatCurrency(financing.summary.nextPaymentAmount)}
                                    </div>
                                    <div className="financing-summary-subtext">
                                        {financingCalculations.formatDate(financing.summary.nextPaymentDate)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="financing-progress-section">
                        <div className="financing-progress-header">
                            <span>Progreso del Financiamiento</span>
                            <span>{financing.summary.percentageComplete.toFixed(1)}%</span>
                        </div>
                        <div className="financing-progress-bar">
                            <div
                                className="financing-progress-fill"
                                style={{ width: `${financing.summary.percentageComplete}%` }}
                            ></div>
                        </div>
                        <div className="financing-progress-details">
                            <span>{financing.summary.monthsRemaining} meses restantes</span>
                            <span>Finaliza: {financingCalculations.formatDate(financing.endDate)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="financing-detail-tabs">
                <button
                    className={`financing-tab ${selectedTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('overview')}
                >
                    <InfoIcon />
                    Información General
                </button>
                <button
                    className={`financing-tab ${selectedTab === 'payments' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('payments')}
                >
                    <PaymentIcon />
                    Tabla de Pagos
                </button>
                <button
                    className={`financing-tab ${selectedTab === 'amortization' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('amortization')}
                >
                    <TimelineIcon />
                    Tabla de Amortización
                </button>
                <button
                    className={`financing-tab ${selectedTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('analytics')}
                >
                    <BarChartIcon />
                    Análisis
                </button>
            </div>

            {/* Tab Content */}
            <div className="financing-tab-content">
                {selectedTab === 'overview' && (
                    <div className="financing-overview-content">
                        <div className="financing-info-grid">
                            <div className="financing-info-section">
                                <h3>
                                    <BusinessIcon />
                                    Información del Prestamista
                                </h3>
                                <div className="financing-info-item">
                                    <span className="financing-label">Prestamista:</span>
                                    <span className="financing-value">{financing.lender}</span>
                                </div>
                                <div className="financing-info-item">
                                    <span className="financing-label">Tasa de Interés:</span>
                                    <span className="financing-value">{financing.interestRate}% anual</span>
                                </div>
                                <div className="financing-info-item">
                                    <span className="financing-label">Plazo:</span>
                                    <span className="financing-value">{financing.termMonths} meses</span>
                                </div>
                                <div className="financing-info-item">
                                    <span className="financing-label">Cuota Mensual:</span>
                                    <span className="financing-value">{financingCalculations.formatCurrency(financing.monthlyPayment || 0)}</span>
                                </div>
                            </div>

                            <div className="financing-info-section">
                                <h3>
                                    <CalendarTodayIcon />
                                    Fechas Importantes
                                </h3>
                                <div className="financing-info-item">
                                    <span className="financing-label">Fecha de Inicio:</span>
                                    <span className="financing-value">{financingCalculations.formatDate(financing.startDate)}</span>
                                </div>
                                <div className="financing-info-item">
                                    <span className="financing-label">Fecha de Finalización:</span>
                                    <span className="financing-value">{financingCalculations.formatDate(financing.endDate)}</span>
                                </div>
                                <div className="financing-info-item">
                                    <span className="financing-label">Creado el:</span>
                                    <span className="financing-value">{financingCalculations.formatDate(financing.createdAt)}</span>
                                </div>
                                <div className="financing-info-item">
                                    <span className="financing-label">Creado por:</span>
                                    <span className="financing-value">{financing.createdBy?.fullName || 'Sistema'}</span>
                                </div>
                            </div>

                            {financing.notes && (
                                <div className="financing-info-section financing-notes-section">
                                    <h3>
                                        <InfoIcon />
                                        Notas Adicionales
                                    </h3>
                                    <div className="financing-notes-content">
                                        {financing.notes}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {selectedTab === 'payments' && (
                    <div className="financing-payments-content">
                        <div className="financing-payments-header">
                            <h3>Historial de Pagos</h3>
                            {hasPermission('canRecordPayments') && (
                                <div className="financing-payments-actions">
                                    <button className="financing-action-button primary">
                                        <PaymentIcon />
                                        Registrar Pago Masivo
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="payments-table-container">
                            <table className="payments-table">
                                <thead>
                                    <tr>
                                        <th>Cuota #</th>
                                        <th>Fecha Programada</th>
                                        <th>Monto Programado</th>
                                        <th>Capital</th>
                                        <th>Interés</th>
                                        <th>Saldo Restante</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {financing.payments?.map((payment) => (
                                        <tr key={payment.id} className={`payment-row ${payment.status}`}>
                                            <td>{payment.paymentNumber}</td>
                                            <td>{financingCalculations.formatDate(payment.scheduledDate)}</td>
                                            <td>{financingCalculations.formatCurrency(payment.scheduledAmount)}</td>
                                            <td>{financingCalculations.formatCurrency(payment.principalAmount)}</td>
                                            <td>{financingCalculations.formatCurrency(payment.interestAmount)}</td>
                                            <td>{financingCalculations.formatCurrency(payment.remainingBalance)}</td>
                                            <td>
                                                <span className={`status-badge ${payment.status}`}>
                                                    {financingCalculations.getPaymentStatus(payment)}
                                                </span>
                                            </td>
                                            <td>
                                                {payment.status === 'pending' && hasPermission('canRecordPayments') && (
                                                    <button
                                                        className="record-payment-btn"
                                                        onClick={() => {
                                                            setPaymentToRecord(payment);
                                                            setShowPaymentModal(true);
                                                        }}
                                                    >
                                                        Registrar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedTab === 'amortization' && (
                    <div className="financing-amortization-content">
                        <div className="financing-amortization-header">
                            <h3>Tabla de Amortización</h3>
                            <div className="financing-amortization-summary">
                                <span>Total de intereses: {financingCalculations.formatCurrency(getTotalInterest())}</span>
                                <span> | Total a pagar: {financingCalculations.formatCurrency(getTotalToPay())}</span>
                            </div>
                        </div>

                        <div className="financing-amortization-table-container">
                            <table className="financing-amortization-table">
                                <thead>
                                    <tr>
                                        <th>Cuota #</th>
                                        <th>Fecha</th>
                                        <th>Cuota</th>
                                        <th>Capital</th>
                                        <th>Interés</th>
                                        <th>Saldo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {financing.amortizationTable?.map((payment, index) => (
                                        <tr key={index} className={index < financing.paymentsMade ? 'paid' : ''}>
                                            <td>{payment.paymentNumber}</td>
                                            <td>{financingCalculations.formatDate(payment.scheduledDate)}</td>
                                            <td>{financingCalculations.formatCurrency(payment.scheduledAmount)}</td>
                                            <td>{financingCalculations.formatCurrency(payment.principalAmount)}</td>
                                            <td>{financingCalculations.formatCurrency(payment.interestAmount)}</td>
                                            <td>{financingCalculations.formatCurrency(payment.remainingBalance)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedTab === 'analytics' && (
                    <div className="financing-analytics-content">
                        <div className="financing-analytics-grid">
                            <div className="financing-analytics-card">
                                <h3>Resumen Financiero</h3>
                                <div className="financing-analytics-stats">
                                    <div className="financing-stat-item">
                                        <span className="financing-stat-label">Total del Préstamo:</span>
                                        <span className="financing-stat-value">{financingCalculations.formatCurrency(financing.loanAmount || 0)}</span>
                                    </div>
                                    <div className="financing-stat-item">
                                        <span className="financing-stat-label">Cuota Inicial:</span>
                                        <span className="financing-stat-value">{financingCalculations.formatCurrency(financing.downPayment || 0)}</span>
                                    </div>
                                    <div className="financing-stat-item">
                                        <span className="financing-stat-label">Monto Financiado:</span>
                                        <span className="financing-stat-value">{financingCalculations.formatCurrency((financing.loanAmount || 0) - (financing.downPayment || 0))}</span>
                                    </div>
                                    <div className="financing-stat-item">
                                        <span className="financing-stat-label">Total de Intereses:</span>
                                        <span className="financing-stat-value">{financingCalculations.formatCurrency(getTotalInterest())}</span>
                                    </div>
                                    <div className="financing-stat-item">
                                        <span className="financing-stat-label">Total a Pagar:</span>
                                        <span className="financing-stat-value">{financingCalculations.formatCurrency(getTotalToPay())}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="financing-analytics-card">
                                <h3>Progreso de Pagos</h3>
                                <div className="financing-progress-chart">
                                    <div className={`financing-progress-segment paid ${(financing.summary?.percentageComplete || 0) < 5 ? 'tiny-segment' :
                                        (financing.summary?.percentageComplete || 0) < 15 ? 'small-segment' : ''
                                        }`} style={{
                                            width: `${financing.summary?.percentageComplete || 0}%`
                                        }}>
                                        {(financing.summary?.percentageComplete || 0) >= 5 &&
                                            `Pagado (${(financing.summary?.percentageComplete || 0).toFixed(1)}%)`
                                        }
                                    </div>
                                    <div className={`financing-progress-segment remaining ${(100 - (financing.summary?.percentageComplete || 0)) < 5 ? 'tiny-segment' :
                                        (100 - (financing.summary?.percentageComplete || 0)) < 15 ? 'small-segment' : ''
                                        }`} style={{
                                            width: `${100 - (financing.summary?.percentageComplete || 0)}%`
                                        }}>
                                        {(100 - (financing.summary?.percentageComplete || 0)) >= 5 &&
                                            `Restante (${(100 - (financing.summary?.percentageComplete || 0)).toFixed(1)}%)`
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && paymentToRecord && (
                <PaymentModal
                    payment={paymentToRecord}
                    onRecord={handleRecordPayment}
                    onClose={() => {
                        setShowPaymentModal(false);
                        setPaymentToRecord(null);
                    }}
                />
            )}
        </div>
    );
};

// Modal para registrar pagos
const PaymentModal = ({ payment, onRecord, onClose }) => {
    const [formData, setFormData] = useState({
        actualAmount: payment.scheduledAmount,
        actualDate: new Date().toISOString().split('T')[0],
        paymentMethod: '',
        reference: '',
        notes: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return; // Evitar envíos múltiples

        setIsSubmitting(true);

        try {
            await onRecord(formData);
        } catch (error) {
            console.error('Error submitting payment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="payment-modal">
                <div className="modal-header">
                    <h3>Registrar Pago - Cuota #{payment.paymentNumber}</h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="payment-form">
                    <div className="form-group">
                        <label>Monto Pagado:</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.actualAmount}
                            onChange={(e) => setFormData({ ...formData, actualAmount: parseFloat(e.target.value) })}
                            required
                        />
                        <small>Monto programado: {financingCalculations.formatCurrency(payment.scheduledAmount)}</small>
                    </div>

                    <div className="form-group">
                        <label>Fecha de Pago:</label>
                        <input
                            type="date"
                            value={formData.actualDate}
                            onChange={(e) => setFormData({ ...formData, actualDate: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Método de Pago:</label>
                        <select
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        >
                            <option value="">Seleccionar método</option>
                            <option value="transferencia">Transferencia Bancaria</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="cheque">Cheque</option>
                            <option value="debito">Débito Automático</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Referencia:</label>
                        <input
                            type="text"
                            value={formData.reference}
                            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                            placeholder="Número de transacción, cheque, etc."
                        />
                    </div>

                    <div className="form-group">
                        <label>Notas:</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Observaciones adicionales..."
                            rows="3"
                        />
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Procesando...
                                </>
                            ) : (
                                'Registrar Pago'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FinancingDetail; 
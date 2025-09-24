import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';
import financingService, { financingCalculations } from '../services/financingService';
import { financingUtils } from '../utils/financingUtils';
import axiosInstance from '../axiosConfig';
import LoadingSpinner from '../components/LoadingSpinner';
import './AddFinancing.css';

// Material UI Icons
import {
    ArrowBack as ArrowBackIcon,
    AccountBalance as AccountBalanceIcon,
    DirectionsCar as DirectionsCarIcon,
    Inventory as InventoryIcon,
    Home as HomeIcon,
    Calculate as CalculateIcon,
    MonetizationOn as MonetizationOnIcon,
    CalendarToday as CalendarTodayIcon,
    Business as BusinessIcon,
    Info as InfoIcon,
    Timeline as TimelineIcon
} from '@mui/icons-material';

const AddFinancing = ({ editMode = false, financingData = null }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const { hasPermission } = usePermissions();

    // Obtener datos pre-seleccionados de la query string o state
    const queryParams = new URLSearchParams(location.search);
    const preSelectedAssetType = queryParams.get('assetType') || location.state?.assetType;
    const preSelectedAssetId = queryParams.get('assetId') || location.state?.assetId;
    const preSelectedAssetName = queryParams.get('assetName') || location.state?.assetName;

    const [formData, setFormData] = useState({
        assetType: editMode && financingData ? financingData.assetType : (preSelectedAssetType || ''),
        assetId: editMode && financingData ? financingData.assetId : (preSelectedAssetId || ''),
        assetName: editMode && financingData ? financingData.assetName : (preSelectedAssetName || ''),
        assetReference: editMode && financingData ? financingData.assetReference : '',
        loanAmount: editMode && financingData ? financingData.loanAmount : '',
        downPayment: editMode && financingData ? financingData.downPayment : '',
        interestRate: editMode && financingData ? financingData.interestRate : '',
        termMonths: editMode && financingData ? financingData.termMonths : '',
        startDate: editMode && financingData ?
            new Date(financingData.startDate).toISOString().split('T')[0] :
            new Date().toISOString().split('T')[0],
        lender: editMode && financingData ? financingData.lender : '',
        notes: editMode && financingData ? financingData.notes : ''
    });

    const [assets, setAssets] = useState([]);
    const [calculation, setCalculation] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        if (!hasPermission('canCreateFinancings')) {
            navigate('/financings');
            return;
        }
        fetchAssets();
    }, []);

    // Calcular automáticamente cuando cambian los valores
    useEffect(() => {
        if (formData.loanAmount && formData.interestRate && formData.termMonths) {
            calculateFinancing();
        } else {
            setCalculation(null);
        }
    }, [formData.loanAmount, formData.downPayment, formData.interestRate, formData.termMonths, formData.startDate]);

    const fetchAssets = async () => {
        try {
            const [vehiclesRes, inventoryRes, housingRes] = await Promise.all([
                axiosInstance.get('/vehicles'),
                axiosInstance.get('/inventory'),
                axiosInstance.get('/housing')
            ]);

            const allAssets = [
                ...vehiclesRes.data.map(v => ({
                    id: v.id,
                    type: 'vehicle',
                    name: `${v.brand} ${v.model} ${v.year}`,
                    reference: v.licensePlate,
                    available: !v.hasActiveFinancing
                })),
                ...inventoryRes.data.map(i => ({
                    id: i.id,
                    type: 'inventory',
                    name: i.itemName,
                    reference: i.itemCode,
                    available: !i.hasActiveFinancing
                })),
                ...housingRes.data.map(h => ({
                    id: h.id,
                    type: 'housing',
                    name: h.address,
                    reference: h.propertyType,
                    available: !h.hasActiveFinancing
                }))
            ];

            setAssets(allAssets);

            // Si hay un activo pre-seleccionado, obtener su información
            if (preSelectedAssetId && preSelectedAssetType) {
                const selectedAsset = allAssets.find(
                    asset => asset.id === parseInt(preSelectedAssetId) && asset.type === preSelectedAssetType
                );
                if (selectedAsset) {
                    setFormData(prev => ({
                        ...prev,
                        assetName: selectedAsset.name,
                        assetReference: selectedAsset.reference
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching assets:', error);
        }
    };

    const calculateFinancing = async () => {
        try {
            setIsCalculating(true);
            const calculationData = await financingService.calculateFinancingScenarios({
                loanAmount: parseFloat(formData.loanAmount),
                downPayment: parseFloat(formData.downPayment) || 0,
                interestRate: parseFloat(formData.interestRate),
                termMonths: parseInt(formData.termMonths),
                startDate: formData.startDate
            });
            setCalculation(calculationData.baseCalculation);
        } catch (error) {
            console.error('Error calculating financing:', error);
            setCalculation(null);
        } finally {
            setIsCalculating(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Limpiar errores cuando el usuario corrija
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }

        // Si cambia el tipo o ID del activo, actualizar información
        if (name === 'assetId' && formData.assetType) {
            const selectedAsset = assets.find(
                asset => asset.id === parseInt(value) && asset.type === formData.assetType
            );
            if (selectedAsset) {
                setFormData(prev => ({
                    ...prev,
                    assetName: selectedAsset.name,
                    assetReference: selectedAsset.reference,
                    [name]: value
                }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.assetType) newErrors.assetType = 'Debe seleccionar un tipo de activo';
        if (!formData.assetId) newErrors.assetId = 'Debe seleccionar un activo';
        if (!formData.loanAmount || parseFloat(formData.loanAmount) <= 0) {
            newErrors.loanAmount = 'El monto del préstamo debe ser mayor a 0';
        }
        if (formData.downPayment && parseFloat(formData.downPayment) >= parseFloat(formData.loanAmount)) {
            newErrors.downPayment = 'La cuota inicial debe ser menor al monto del préstamo';
        }
        if (!formData.interestRate || parseFloat(formData.interestRate) < 0) {
            newErrors.interestRate = 'La tasa de interés debe ser mayor o igual a 0';
        }
        if (!formData.termMonths || parseInt(formData.termMonths) <= 0) {
            newErrors.termMonths = 'El plazo debe ser mayor a 0 meses';
        }
        if (!formData.startDate) newErrors.startDate = 'Debe seleccionar una fecha de inicio';
        if (!formData.lender.trim()) newErrors.lender = 'Debe especificar el prestamista';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const submitData = {
                ...formData,
                loanAmount: parseFloat(formData.loanAmount),
                downPayment: parseFloat(formData.downPayment) || 0,
                interestRate: parseFloat(formData.interestRate),
                termMonths: parseInt(formData.termMonths),
                assetId: parseInt(formData.assetId)
            };

            let result;
            if (editMode && financingData) {
                result = await financingService.updateFinancing(financingData.id, submitData);
            } else {
                result = await financingService.createFinancing(submitData);
            }

            navigate(`/financings/${result.id}`);
        } catch (error) {
            console.error(`Error ${editMode ? 'updating' : 'creating'} financing:`, error);
            alert(`Error al ${editMode ? 'actualizar' : 'crear'} el financiamiento. Verifique los datos e intente nuevamente.`);
        } finally {
            setIsSubmitting(false);
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

    const filteredAssets = assets.filter(asset =>
        !formData.assetType || asset.type === formData.assetType
    );

    const availableAssets = filteredAssets.filter(asset => asset.available);

    if (!hasPermission('canCreateFinancings')) {
        return (
            <div className="access-denied">
                <h2>Acceso Denegado</h2>
                <p>No tienes permisos para crear financiamientos</p>
            </div>
        );
    }

    return (
        <div className="add-financing-page">
            <div className="page-header">
                <button
                    className="back-button"
                    onClick={() => navigate('/financings')}
                >
                    <ArrowBackIcon />
                    Volver a Financiamientos
                </button>
                <div className="page-title">
                    <AccountBalanceIcon />
                    <h1>{editMode ? 'Editar Financiamiento' : 'Nuevo Financiamiento'}</h1>
                </div>
            </div>

            <div className="add-financing-container">
                <div className="financing-form-section">
                    <form onSubmit={handleSubmit} className="financing-form">
                        {/* Paso 1: Selección de Activo */}
                        <div className="form-step">
                            <div className="step-header">
                                <div className="step-number">1</div>
                                <h3>Seleccionar Activo a Financiar</h3>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tipo de Activo *</label>
                                    <select
                                        name="assetType"
                                        value={formData.assetType}
                                        onChange={handleInputChange}
                                        className={errors.assetType ? 'error' : ''}
                                        required
                                    >
                                        <option value="">Seleccionar tipo</option>
                                        <option value="vehicle">Vehículo</option>
                                        <option value="inventory">Inventario</option>
                                        <option value="housing">Vivienda</option>
                                    </select>
                                    {errors.assetType && <span className="error-message">{errors.assetType}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Activo *</label>
                                    <select
                                        name="assetId"
                                        value={formData.assetId}
                                        onChange={handleInputChange}
                                        className={errors.assetId ? 'error' : ''}
                                        disabled={!formData.assetType}
                                        required
                                    >
                                        <option value="">Seleccionar activo</option>
                                        {availableAssets.map(asset => (
                                            <option key={`${asset.type}-${asset.id}`} value={asset.id}>
                                                {asset.name} - {asset.reference}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.assetId && <span className="error-message">{errors.assetId}</span>}
                                    {formData.assetType && availableAssets.length === 0 && (
                                        <span className="info-message">
                                            No hay activos disponibles para financiar de este tipo
                                        </span>
                                    )}
                                </div>
                            </div>

                            {formData.assetName && (
                                <div className="selected-asset-preview">
                                    <div className="asset-icon">
                                        {getAssetIcon(formData.assetType)}
                                    </div>
                                    <div className="asset-info">
                                        <h4>{formData.assetName}</h4>
                                        <p>{formData.assetReference}</p>
                                        <span className="asset-type">{getAssetTypeLabel(formData.assetType)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Paso 2: Términos Financieros */}
                        <div className="form-step">
                            <div className="step-header">
                                <div className="step-number">2</div>
                                <h3>Términos del Financiamiento</h3>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Monto del Préstamo *</label>
                                    <input
                                        type="number"
                                        name="loanAmount"
                                        value={formData.loanAmount}
                                        onChange={handleInputChange}
                                        className={errors.loanAmount ? 'error' : ''}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                    {errors.loanAmount && <span className="error-message">{errors.loanAmount}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Cuota Inicial</label>
                                    <input
                                        type="number"
                                        name="downPayment"
                                        value={formData.downPayment}
                                        onChange={handleInputChange}
                                        className={errors.downPayment ? 'error' : ''}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                    />
                                    {errors.downPayment && <span className="error-message">{errors.downPayment}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tasa de Interés Anual (%) *</label>
                                    <input
                                        type="number"
                                        name="interestRate"
                                        value={formData.interestRate}
                                        onChange={handleInputChange}
                                        className={errors.interestRate ? 'error' : ''}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        required
                                    />
                                    {errors.interestRate && <span className="error-message">{errors.interestRate}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Plazo (meses) *</label>
                                    <input
                                        type="number"
                                        name="termMonths"
                                        value={formData.termMonths}
                                        onChange={handleInputChange}
                                        className={errors.termMonths ? 'error' : ''}
                                        placeholder="12"
                                        min="1"
                                        max="360"
                                        required
                                    />
                                    {errors.termMonths && <span className="error-message">{errors.termMonths}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fecha de Inicio *</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className={errors.startDate ? 'error' : ''}
                                        required
                                    />
                                    {errors.startDate && <span className="error-message">{errors.startDate}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Prestamista *</label>
                                    <input
                                        type="text"
                                        name="lender"
                                        value={formData.lender}
                                        onChange={handleInputChange}
                                        className={errors.lender ? 'error' : ''}
                                        placeholder="Nombre de la institución financiera"
                                        required
                                    />
                                    {errors.lender && <span className="error-message">{errors.lender}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Paso 3: Información Adicional */}
                        <div className="form-step">
                            <div className="step-header">
                                <div className="step-number">3</div>
                                <h3>Información Adicional</h3>
                            </div>

                            <div className="form-group full-width">
                                <label>Notas</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Observaciones, condiciones especiales, etc."
                                    rows="4"
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => navigate('/financings')}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="submit-button"
                                disabled={isSubmitting || !calculation}
                            >
                                {isSubmitting ? <LoadingSpinner size="small" /> :
                                    (editMode ? 'Actualizar Financiamiento' : 'Crear Financiamiento')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Calculadora en tiempo real */}
                <div className="calculation-section">
                    <div className="calculation-card">
                        <div className="calculation-header">
                            <CalculateIcon />
                            <h3>Calculadora de Financiamiento</h3>
                        </div>

                        {isCalculating ? (
                            <div className="calculating">
                                <LoadingSpinner size="small" />
                                <span>Calculando...</span>
                            </div>
                        ) : calculation ? (
                            <div className="calculation-results">
                                <div className="calculation-summary">
                                    <div className="summary-item highlight">
                                        <span className="label">Cuota Mensual:</span>
                                        <span className="value">
                                            {financingCalculations.formatCurrency(calculation.monthlyPayment)}
                                        </span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Total a Pagar:</span>
                                        <span className="value">
                                            {financingCalculations.formatCurrency(calculation.totalAmount)}
                                        </span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Total Intereses:</span>
                                        <span className="value">
                                            {financingCalculations.formatCurrency(calculation.totalInterest)}
                                        </span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Monto Financiado:</span>
                                        <span className="value">
                                            {financingCalculations.formatCurrency(
                                                (parseFloat(formData.loanAmount) || 0) - (parseFloat(formData.downPayment) || 0)
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="payment-breakdown">
                                    <h4>Desglose del Primer Pago</h4>
                                    {calculation.paymentSchedule && calculation.paymentSchedule[0] && (
                                        <div className="breakdown-details">
                                            <div className="breakdown-item">
                                                <span>Capital:</span>
                                                <span>{financingCalculations.formatCurrency(calculation.paymentSchedule[0].principalAmount)}</span>
                                            </div>
                                            <div className="breakdown-item">
                                                <span>Interés:</span>
                                                <span>{financingCalculations.formatCurrency(calculation.paymentSchedule[0].interestAmount)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="important-dates">
                                    <h4>Fechas Importantes</h4>
                                    <div className="dates-list">
                                        <div className="date-item">
                                            <span>Primer Pago:</span>
                                            <span>{calculation.paymentSchedule && calculation.paymentSchedule[0] ?
                                                financingCalculations.formatDate(calculation.paymentSchedule[0].scheduledDate) : 'N/A'}</span>
                                        </div>
                                        <div className="date-item">
                                            <span>Último Pago:</span>
                                            <span>{calculation.paymentSchedule && calculation.paymentSchedule.length > 0 ?
                                                financingCalculations.formatDate(calculation.paymentSchedule[calculation.paymentSchedule.length - 1].scheduledDate) : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="no-calculation">
                                <p>Complete los campos de monto, tasa de interés y plazo para ver los cálculos</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddFinancing; 
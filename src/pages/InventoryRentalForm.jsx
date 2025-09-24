import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './RentalForm.css';
import LoadingSpinner from '../components/LoadingSpinner';
import DateRangeCalendar from '../components/DateRangeCalendar';
import axiosInstance from '../axiosConfig';
import { getInventory } from '../services/inventoryService';

// Iconos
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import InventoryIcon from '@mui/icons-material/Inventory';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DescriptionIcon from '@mui/icons-material/Description';

const InventoryRentalForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const initialFormState = {
        inventoryId: '',
        startDate: null,
        endDate: null,
        days: 0,
        dailyCost: 0,
        total: 0,
        comments: '',
        metadata: {}
    };

    const [formData, setFormData] = useState(initialFormState);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [rentalDates, setRentalDates] = useState([]);

    useEffect(() => {
        fetchInventoryItems();
        if (isEditing) {
            fetchRentalData();
        }
    }, [id]);

    const fetchInventoryItems = async () => {
        try {
            const items = await getInventory();
            setInventoryItems(items);
        } catch (error) {
            toast.error('Error al cargar los items del inventario');
            console.error('Error:', error);
        }
    };

    const fetchRentalData = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(`/rentals/${id}`);
            const rental = response.data;

            setFormData({
                inventoryId: rental.inventoryId || rental.itemId, // Soporte para ambos nombres por compatibilidad
                startDate: new Date(rental.startDate),
                endDate: new Date(rental.endDate),
                days: rental.days || calculateDays(new Date(rental.startDate), new Date(rental.endDate)),
                dailyCost: rental.dailyCost,
                total: rental.total,
                comments: rental.comments || '',
                metadata: rental.metadata || {}
            });

            fetchRentalDates(rental.inventoryId || rental.itemId);
        } catch (error) {
            toast.error('Error al cargar los datos del alquiler');
            navigate('/rentals');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRentalDates = async (inventoryId) => {
        try {
            const response = await axiosInstance.get(`/rentals/item/${inventoryId}/dates`);
            setRentalDates(response.data);
        } catch (error) {
            console.error('Error al cargar fechas de alquiler:', error);
        }
    };

    const calculateDailyCost = (total, startDate, endDate) => {
        if (!total || !startDate || !endDate) return 0;

        // Normalizar fechas a medianoche para evitar problemas de horas
        const normalizedStartDate = new Date(startDate);
        normalizedStartDate.setHours(0, 0, 0, 0);

        const normalizedEndDate = new Date(endDate);
        normalizedEndDate.setHours(0, 0, 0, 0);

        const diffTime = normalizedEndDate.getTime() - normalizedStartDate.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const dailyCost = days > 0 ? total / days : 0;

        return Number(dailyCost.toFixed(2));
    };

    const calculateDays = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;

        // Normalizar fechas a medianoche para evitar problemas de horas
        const normalizedStartDate = new Date(startDate);
        normalizedStartDate.setHours(0, 0, 0, 0);

        const normalizedEndDate = new Date(endDate);
        normalizedEndDate.setHours(0, 0, 0, 0);

        const diffTime = normalizedEndDate.getTime() - normalizedStartDate.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        return days;
    };

    const formatDateForServer = (date) => {
        if (!date) return null;

        // Crear una nueva fecha en la zona horaria local y formatearla
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const calculateTotal = (dailyCost, startDate, endDate) => {
        if (!dailyCost || !startDate || !endDate) return 0;

        // Normalizar fechas a medianoche para evitar problemas de horas
        const normalizedStartDate = new Date(startDate);
        normalizedStartDate.setHours(0, 0, 0, 0);

        const normalizedEndDate = new Date(endDate);
        normalizedEndDate.setHours(0, 0, 0, 0);

        const diffTime = normalizedEndDate.getTime() - normalizedStartDate.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const total = days * dailyCost;

        return Number(total.toFixed(2));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDateChange = (start, end) => {
        const calculatedDays = calculateDays(start, end);

        setFormData(prev => ({
            ...prev,
            startDate: start,
            endDate: end,
            days: calculatedDays,
            total: calculateTotal(prev.dailyCost, start, end)
        }));
    };

    const handleCostChange = (e) => {
        const { name, value } = e.target;
        const numericValue = parseFloat(value) || 0;

        if (name === 'dailyCost') {
            setFormData(prev => ({
                ...prev,
                dailyCost: numericValue,
                total: calculateTotal(numericValue, prev.startDate, prev.endDate)
            }));
        } else if (name === 'total') {
            setFormData(prev => ({
                ...prev,
                total: numericValue,
                dailyCost: calculateDailyCost(numericValue, prev.startDate, prev.endDate)
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.inventoryId) newErrors.inventoryId = 'Debe seleccionar un inventario';
        if (!formData.startDate) newErrors.startDate = 'La fecha de inicio es requerida';
        if (!formData.endDate) newErrors.endDate = 'La fecha de fin es requerida';
        if (formData.dailyCost <= 0) newErrors.dailyCost = 'El costo diario debe ser mayor a 0';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Por favor, corrige los errores del formulario');
            return;
        }

        setIsLoading(true);

        try {
            const rentalData = {
                type: 'item',
                inventoryId: parseInt(formData.inventoryId, 10),
                startDate: formatDateForServer(formData.startDate),
                endDate: formatDateForServer(formData.endDate),
                days: formData.days,
                dailyCost: parseFloat(formData.dailyCost),
                total: parseFloat(formData.total),
                comments: formData.comments,
                metadata: formData.metadata
            };


            if (isEditing) {
                await axiosInstance.put(`/rentals/${id}`, rentalData);
                toast.success('Alquiler actualizado correctamente');
            } else {
                await axiosInstance.post('/rentals', rentalData);
                toast.success('Alquiler creado correctamente');
            }

            navigate('/rentals');
        } catch (error) {
            console.error('Error al guardar el alquiler:', error);
            toast.error('Error al guardar el alquiler');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <LoadingSpinner message="Cargando datos..." />;
    }

    return (
        <div className="rental-form-page">
            <div className="page-header">
                <button
                    className="btn-back"
                    onClick={() => navigate('/rentals/new')}
                >
                    <ArrowBackIcon /> Volver
                </button>
                <h1>{isEditing ? 'Editar Alquiler de Inventario' : 'Nuevo Alquiler de Inventario'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="rental-form">
                <div className="form-section">
                    <h2><InventoryIcon /> Información del Inventario</h2>
                    <div className="form-group">
                        <label htmlFor="inventoryId">Inventario a Alquilar*</label>
                        <select
                            id="inventoryId"
                            name="inventoryId"
                            value={formData.inventoryId}
                            onChange={handleInputChange}
                            className={errors.inventoryId ? 'error' : ''}
                        >
                            <option value="">Seleccione un inventario</option>
                            {inventoryItems.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.itemName} - {item.category}
                                </option>
                            ))}
                        </select>
                        {errors.inventoryId && <div className="error-message">{errors.inventoryId}</div>}
                    </div>
                </div>

                <div className="form-section">
                    <h2><CalendarMonthIcon /> Fechas y Costos</h2>
                    <div className="form-row">
                        <div className="form-group">
                            <DateRangeCalendar
                                startDate={formData.startDate}
                                endDate={formData.endDate}
                                onChange={handleDateChange}
                                errors={errors}
                            />
                            {formData.startDate && formData.endDate && (
                                <div className="days-info">
                                    <span className="days-count">
                                        📅 {calculateDays(formData.startDate, formData.endDate)} día{calculateDays(formData.startDate, formData.endDate) !== 1 ? 's' : ''} seleccionado{calculateDays(formData.startDate, formData.endDate) !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-row">

                        <div className="form-group">
                            <label htmlFor="dailyCost">Costo por día (€)*</label>
                            <div className="input-with-currency">
                                <input
                                    type="number"
                                    id="dailyCost"
                                    name="dailyCost"
                                    value={formData.dailyCost}
                                    onChange={handleCostChange}
                                    className={errors.dailyCost ? 'error' : ''}
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                />
                                <span className="currency-symbol">€</span>
                            </div>
                            {errors.dailyCost && <div className="error-message">{errors.dailyCost}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="total">Costo total (€)</label>
                            <div className="input-with-currency">
                                <input
                                    type="number"
                                    id="total"
                                    name="total"
                                    value={formData.total}
                                    onChange={handleCostChange}
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                />
                                <span className="currency-symbol">€</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h2><DescriptionIcon /> Información Adicional</h2>
                    <div className="form-group">
                        <label htmlFor="comments">Comentarios</label>
                        <textarea
                            id="comments"
                            name="comments"
                            value={formData.comments}
                            onChange={handleInputChange}
                            rows="3"
                            placeholder="Información adicional relevante..."
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/rentals')}
                    >
                        <CancelIcon /> Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                    >
                        <SaveIcon /> {isEditing ? 'Actualizar' : 'Crear'} Alquiler
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InventoryRentalForm; 
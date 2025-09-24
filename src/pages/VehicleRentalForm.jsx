import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './RentalForm.css';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';
import DateRangeCalendar from '../components/DateRangeCalendar';
import axiosInstance from '../axiosConfig';

// Iconos
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BusinessIcon from '@mui/icons-material/Business';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const VehicleRentalForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { hasPermission } = usePermissions();
    const isEditing = !!id;

    const initialFormState = {
        vehicleId: '',
        startDate: null,
        endDate: null,
        days: 0,
        dailyCost: 0,
        total: 0,
        dealerName: '',
        dealerAddress: '',
        dealerPhone: '',
        comments: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [vehicles, setVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showCalendar, setShowCalendar] = useState(false);
    const [rentalDates, setRentalDates] = useState([]);

    useEffect(() => {
        fetchVehicles();
        if (isEditing) {
            fetchRentalData();
        }
    }, [id]);

    const fetchVehicles = async () => {
        try {
            const response = await axiosInstance.get('/vehicles');
            setVehicles(response.data);
        } catch (error) {
            toast.error('Error al cargar los vehículos');
        }
    };

    const fetchRentalData = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(`/rentals/${id}`);
            const rental = response.data;

            setFormData({
                vehicleId: rental.vehicleId,
                startDate: new Date(rental.startDate),
                endDate: new Date(rental.endDate),
                days: rental.days || calculateDays(new Date(rental.startDate), new Date(rental.endDate)),
                dailyCost: rental.dailyCost,
                total: rental.total,
                dealerName: rental.metadata?.dealerName || '',
                dealerAddress: rental.metadata?.dealerAddress || '',
                dealerPhone: rental.metadata?.dealerPhone || '',
                comments: rental.comments || ''
            });

            fetchRentalDates(rental.vehicleId);
        } catch (error) {
            toast.error('Error al cargar los datos del alquiler');
            navigate('/rentals');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRentalDates = async (vehicleId) => {
        try {
            const response = await axiosInstance.get(`/rentals/vehicle/${vehicleId}/dates`);
            setRentalDates(response.data);
        } catch (error) {
            console.error('Error al cargar fechas de alquiler:', error);
        }
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

    const handleDateChange = (startDate, endDate) => {
        const calculatedDays = calculateDays(startDate, endDate);

        setFormData(prev => ({
            ...prev,
            startDate,
            endDate,
            days: calculatedDays,
            total: calculateTotal(prev.dailyCost, startDate, endDate)
        }));
    };

    const formatDateForServer = (date) => {
        if (!date) return null;

        // Crear una nueva fecha en la zona horaria local y formatearla
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.vehicleId) newErrors.vehicleId = 'Seleccione un vehículo';
        if (!formData.startDate) newErrors.startDate = 'La fecha de inicio es requerida';
        if (!formData.endDate) newErrors.endDate = 'La fecha de fin es requerida';
        if (!formData.dailyCost || formData.dailyCost <= 0) newErrors.dailyCost = 'El costo por día debe ser mayor a 0';
        if (!formData.dealerName.trim()) newErrors.dealerName = 'El nombre del concesionario es requerido';
        if (!formData.dealerAddress.trim()) newErrors.dealerAddress = 'La dirección del concesionario es requerida';
        if (!formData.dealerPhone.trim()) newErrors.dealerPhone = 'El teléfono del concesionario es requerido';

        if (formData.startDate && formData.endDate) {
            if (new Date(formData.startDate) > new Date(formData.endDate)) {
                newErrors.dateRange = 'La fecha de inicio no puede ser posterior a la fecha de fin';
            }
        }

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
                type: 'vehicle',
                vehicleId: parseInt(formData.vehicleId, 10),
                startDate: formatDateForServer(formData.startDate),
                endDate: formatDateForServer(formData.endDate),
                days: formData.days,
                dailyCost: parseFloat(formData.dailyCost),
                total: parseFloat(formData.total),
                metadata: {
                    dealerName: formData.dealerName,
                    dealerAddress: formData.dealerAddress,
                    dealerPhone: formData.dealerPhone
                },
                comments: formData.comments
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
                <h1>{isEditing ? 'Editar Alquiler de Vehículo' : 'Nuevo Alquiler de Vehículo'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="rental-form">
                <div className="form-section">
                    <h2><DirectionsCarIcon /> Información del Vehículo</h2>
                    <div className="form-group">
                        <label htmlFor="vehicleId">Vehículo*</label>
                        <select
                            id="vehicleId"
                            name="vehicleId"
                            value={formData.vehicleId}
                            onChange={handleInputChange}
                            className={errors.vehicleId ? 'error' : ''}
                        >
                            <option value="">Seleccione un vehículo</option>
                            {vehicles.map(vehicle => (
                                <option key={vehicle.id} value={vehicle.id}>
                                    {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
                                </option>
                            ))}
                        </select>
                        {errors.vehicleId && <div className="error-message">{errors.vehicleId}</div>}
                    </div>
                </div>

                <div className="form-section">
                    <h2><CalendarMonthIcon /> Fechas y Costos</h2>
                    <DateRangeCalendar
                        startDate={formData.startDate}
                        endDate={formData.endDate}
                        onChange={handleDateChange}
                        errors={errors}
                    />

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
                                    placeholder="0"
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
                                    placeholder="0"
                                />
                                <span className="currency-symbol">€</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h2><BusinessIcon /> Información del Concesionario</h2>
                    <div className="form-group">
                        <label htmlFor="dealerName">Nombre del Concesionario*</label>
                        <input
                            type="text"
                            id="dealerName"
                            name="dealerName"
                            value={formData.dealerName}
                            onChange={handleInputChange}
                            className={errors.dealerName ? 'error' : ''}
                        />
                        {errors.dealerName && <div className="error-message">{errors.dealerName}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="dealerAddress">Dirección*</label>
                        <input
                            type="text"
                            id="dealerAddress"
                            name="dealerAddress"
                            value={formData.dealerAddress}
                            onChange={handleInputChange}
                            className={errors.dealerAddress ? 'error' : ''}
                        />
                        {errors.dealerAddress && <div className="error-message">{errors.dealerAddress}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="dealerPhone">Teléfono*</label>
                        <input
                            type="tel"
                            id="dealerPhone"
                            name="dealerPhone"
                            value={formData.dealerPhone}
                            onChange={handleInputChange}
                            className={errors.dealerPhone ? 'error' : ''}
                        />
                        {errors.dealerPhone && <div className="error-message">{errors.dealerPhone}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="comments">Comentarios</label>
                        <textarea
                            id="comments"
                            name="comments"
                            value={formData.comments}
                            onChange={handleInputChange}
                            rows="3"
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

export default VehicleRentalForm; 
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './RentalForm.css';
import 'react-calendar/dist/Calendar.css';
import axiosInstance from '../axiosConfig';
import DateRangeCalendar from '../components/DateRangeCalendar';

// Iconos
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';

const HousingRentalForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const initialFormState = {
        housingId: '',
        startDate: null,
        endDate: null,
        days: 0,
        dailyCost: 0,
        total: 0,
        guestCount: 1,
        address: '',
        comments: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [houses, setHouses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchHouses();
        if (isEditing) {
            fetchRentalData();
        }
    }, [id]);

    const fetchHouses = async () => {
        try {
            const response = await axiosInstance.get('/housing');
            setHouses(response.data);
        } catch (error) {
            toast.error('Error al cargar las viviendas');
        }
    };

    const fetchRentalData = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(`/rentals/${id}`);
            const rental = response.data;

            setFormData({
                housingId: rental.housingId,
                startDate: new Date(rental.startDate),
                endDate: new Date(rental.endDate),
                days: rental.days || calculateDays(new Date(rental.startDate), new Date(rental.endDate)),
                dailyCost: rental.dailyCost,
                total: rental.total,
                guestCount: rental.guestCount || 1,
                address: rental.address || '',
                comments: rental.comments || ''
            });
        } catch (error) {
            toast.error('Error al cargar los datos del alquiler');
            navigate('/rentals');
        } finally {
            setIsLoading(false);
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

    const calculateDailyCost = (total, startDate, endDate, guestCount) => {
        if (!total || !startDate || !endDate) return 0;

        // Normalizar fechas a medianoche para evitar problemas de horas
        const normalizedStartDate = new Date(startDate);
        normalizedStartDate.setHours(0, 0, 0, 0);

        const normalizedEndDate = new Date(endDate);
        normalizedEndDate.setHours(0, 0, 0, 0);

        const diffTime = normalizedEndDate.getTime() - normalizedStartDate.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const dailyCost = (days * guestCount) > 0 ? total / (days * guestCount) : 0;

        return Number(dailyCost.toFixed(2));
    };

    const calculateTotal = (dailyCost, startDate, endDate, guestCount) => {
        if (!dailyCost || !startDate || !endDate) return 0;

        // Normalizar fechas a medianoche para evitar problemas de horas
        const normalizedStartDate = new Date(startDate);
        normalizedStartDate.setHours(0, 0, 0, 0);

        const normalizedEndDate = new Date(endDate);
        normalizedEndDate.setHours(0, 0, 0, 0);

        const diffTime = normalizedEndDate.getTime() - normalizedStartDate.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const total = days * dailyCost * guestCount;

        return Number(total.toFixed(2));
    };

    const handleCostChange = (e) => {
        const { name, value } = e.target;
        const numericValue = parseFloat(value) || 0;

        if (name === 'dailyCost') {
            setFormData(prev => ({
                ...prev,
                dailyCost: numericValue,
                total: calculateTotal(numericValue, prev.startDate, prev.endDate, prev.guestCount)
            }));
        } else if (name === 'total') {
            setFormData(prev => ({
                ...prev,
                total: numericValue,
                dailyCost: calculateDailyCost(numericValue, prev.startDate, prev.endDate, prev.guestCount)
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
            total: calculateTotal(prev.dailyCost, startDate, endDate, prev.guestCount)
        }));
    };

    const handleGuestCountChange = (e) => {
        const { value } = e.target;
        const guestCount = parseInt(value) || 1;

        setFormData(prev => ({
            ...prev,
            guestCount,
            total: calculateTotal(prev.dailyCost, prev.startDate, prev.endDate, guestCount)
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

        if (!formData.housingId) newErrors.housingId = 'Seleccione una vivienda';
        if (!formData.startDate) newErrors.startDate = 'La fecha de inicio es requerida';
        if (!formData.endDate) newErrors.endDate = 'La fecha de fin es requerida';
        if (!formData.dailyCost || formData.dailyCost <= 0) newErrors.dailyCost = 'El costo por día debe ser mayor a 0';
        if (!formData.guestCount || formData.guestCount < 1) newErrors.guestCount = 'El número de huéspedes debe ser al menos 1';

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
                type: 'housing',
                housingId: formData.housingId,
                startDate: formatDateForServer(formData.startDate),
                endDate: formatDateForServer(formData.endDate),
                days: formData.days,
                dailyCost: parseFloat(formData.dailyCost),
                total: parseFloat(formData.total),
                metadata: {
                    guestCount: parseInt(formData.guestCount)
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

    return (
        <div className="rental-form-page">
            <div className="page-header">
                <button
                    className="btn-back"
                    onClick={() => navigate('/rentals/new')}
                >
                    <ArrowBackIcon /> Volver
                </button>
                <h1>{isEditing ? 'Editar Alquiler de Vivienda' : 'Nuevo Alquiler de Vivienda'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="rental-form">
                <div className="form-section">
                    <h2><HomeIcon /> Información de la Vivienda</h2>
                    <div className="form-group">
                        <label htmlFor="housingId">Vivienda*</label>
                        <select
                            id="housingId"
                            name="housingId"
                            value={formData.housingId}
                            onChange={handleInputChange}
                            className={errors.housingId ? 'error' : ''}
                        >
                            <option value="">Seleccione una vivienda</option>
                            {houses.map(house => (
                                <option key={house.id} value={house.id}>
                                    {house.address}
                                </option>
                            ))}
                        </select>
                        {errors.housingId && <div className="error-message">{errors.housingId}</div>}
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
                            <label htmlFor="guestCount">Número de huéspedes*</label>
                            <input
                                type="number"
                                id="guestCount"
                                name="guestCount"
                                value={formData.guestCount}
                                onChange={handleGuestCountChange}
                                className={errors.guestCount ? 'error' : ''}
                                min="1"
                            />
                            {errors.guestCount && <div className="error-message">{errors.guestCount}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="dailyCost">Costo por día por huésped (€)*</label>
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
                        <label htmlFor="comments">Comentarios adicionales</label>
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

export default HousingRentalForm; 
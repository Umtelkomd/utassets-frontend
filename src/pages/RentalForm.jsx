import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createRental, getRentalFields, RentalType } from '../services/rentalService';
import { getInventory } from '../services/inventoryService';
import './RentalForm.css';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';
import DateRangeCalendar from '../components/DateRangeCalendar';

// Iconos
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import DescriptionIcon from '@mui/icons-material/Description';

const RentalForm = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { hasPermission } = usePermissions();

    const [formData, setFormData] = useState({
        type: type || RentalType.ITEM,
        objectId: '',
        startDate: null,
        endDate: null,
        dailyCost: 0,
        metadata: {},
        comments: ''
    });

    const [inventoryItems, setInventoryItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [rentalFields, setRentalFields] = useState({});

    useEffect(() => {
        fetchInventoryItems();
        fetchRentalFields();
    }, [type]);

    const fetchInventoryItems = async () => {
        try {
            const items = await getInventory();
            setInventoryItems(items);
        } catch (error) {
            toast.error('Error al cargar los items del inventario');
            console.error('Error:', error);
        }
    };

    const fetchRentalFields = async () => {
        try {
            const { fields } = await getRentalFields(type || RentalType.ITEM);
            setRentalFields(fields);
        } catch (error) {
            toast.error('Error al cargar los campos del formulario');
            console.error('Error:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('metadata.')) {
            const metadataField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                metadata: {
                    ...prev.metadata,
                    [metadataField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleDateChange = (start, end) => {
        setFormData(prev => ({
            ...prev,
            startDate: start,
            endDate: end
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            if (!formData.startDate || !formData.endDate) {
                throw new Error('Las fechas son requeridas');
            }

            const rentalData = {
                ...formData,
                objectId: Number(formData.objectId),
                dailyCost: Number(formData.dailyCost),
                startDate: formatDateForServer(formData.startDate),
                endDate: formatDateForServer(formData.endDate)
            };

            await createRental(rentalData);
            toast.success('Alquiler creado exitosamente');
            navigate('/rentals');
        } catch (error) {
            console.error('Error al crear el alquiler:', error);
            if (error instanceof Error) {
                toast.error(error.message);
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Error al crear el alquiler');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderMetadataFields = () => {
        return Object.entries(rentalFields).map(([field, config]) => {
            const { type, required, description } = config;
            const value = formData.metadata?.[field] || '';

            switch (type) {
                case 'number':
                    return (
                        <div key={field} className="form-group">
                            <label htmlFor={`metadata.${field}`}>
                                {description} {required && '*'}
                            </label>
                            <input
                                type="number"
                                id={`metadata.${field}`}
                                name={`metadata.${field}`}
                                value={value}
                                onChange={handleInputChange}
                                required={required}
                                min={config.min}
                                className="form-control"
                            />
                        </div>
                    );
                case 'string':
                    return (
                        <div key={field} className="form-group">
                            <label htmlFor={`metadata.${field}`}>
                                {description} {required && '*'}
                            </label>
                            <input
                                type="text"
                                id={`metadata.${field}`}
                                name={`metadata.${field}`}
                                value={value}
                                onChange={handleInputChange}
                                required={required}
                                className="form-control"
                            />
                        </div>
                    );
                case 'array':
                    return (
                        <div key={field} className="form-group">
                            <label htmlFor={`metadata.${field}`}>
                                {description} {required && '*'}
                            </label>
                            <input
                                type="text"
                                id={`metadata.${field}`}
                                name={`metadata.${field}`}
                                value={Array.isArray(value) ? value.join(', ') : value}
                                onChange={handleInputChange}
                                required={required}
                                placeholder="Separar valores con comas"
                                className="form-control"
                            />
                        </div>
                    );
                default:
                    return null;
            }
        });
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    const rentalType = type || '';
    const rentalTypeDisplay = rentalType.charAt(0).toUpperCase() + rentalType.slice(1);

    return (
        <div className="rental-form-container">
            <div className="page-header">
                <button
                    className="btn-back"
                    onClick={() => navigate('/rentals')}
                >
                    <ArrowBackIcon /> Volver
                </button>
                <h1>Nuevo Alquiler - {rentalTypeDisplay}</h1>
            </div>

            <form onSubmit={handleSubmit} className="rental-form">
                <div className="form-section">
                    <h2>Información Básica</h2>

                    <div className="form-group">
                        <label htmlFor="objectId">Item a Alquilar *</label>
                        <select
                            id="objectId"
                            name="objectId"
                            value={formData.objectId}
                            onChange={handleInputChange}
                            required
                            className="form-control"
                        >
                            <option value="">Seleccionar item</option>
                            {inventoryItems.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.itemName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <DateRangeCalendar
                            startDate={formData.startDate}
                            endDate={formData.endDate}
                            onChange={handleDateChange}
                            errors={errors}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="dailyCost">Costo Diario *</label>
                        <input
                            type="number"
                            id="dailyCost"
                            name="dailyCost"
                            value={formData.dailyCost}
                            onChange={handleInputChange}
                            required
                            min="0"
                            step="0.01"
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="comments">Comentarios</label>
                        <textarea
                            id="comments"
                            name="comments"
                            value={formData.comments}
                            onChange={handleInputChange}
                            className="form-control"
                            rows={3}
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h2>Información Específica</h2>
                    {renderMetadataFields()}
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => navigate('/rentals')}
                    >
                        <CancelIcon /> Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn-save"
                        disabled={isLoading}
                    >
                        <SaveIcon /> Guardar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RentalForm; 
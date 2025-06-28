import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../axiosConfig';
import './VehicleForm.css';
import { usePermissions } from '../context/PermissionsContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import config from '../config';

// Componentes de Material UI
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';

const VehicleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { hasPermission } = usePermissions();

    const isEditing = !!id;
    const isViewing = id && window.location.pathname.includes('/vehicles/') && !window.location.pathname.includes('/edit/');

    // Verificar permisos para editar o crear
    const canEdit = hasPermission('canEditVehicle');
    const canCreate = hasPermission('canCreateVehicle');

    // Determinar si el usuario tiene permisos para la acción actual
    const hasRequiredPermission = (!isEditing && canCreate) || (isEditing && !isViewing && canEdit) || isViewing;

    // Verificar si venimos desde la vista de inventario
    // Si estamos en modo edición después de visualización, conservar el contexto
    const isFromInventory = window.location.pathname.includes('/inventory/') ||
        localStorage.getItem('fromInventory') === 'true';

    useEffect(() => {
        return () => {
            // Cleanup function if needed
        };
    });

    // Configurar el contexto al montar el componente
    useEffect(() => {
        const currentPath = window.location.pathname;

        // Si estamos en una ruta de inventario, guardar el contexto
        if (currentPath.includes('/inventory/') || currentPath.includes('/inventory/edit/')) {

            localStorage.setItem('fromInventory', 'true');
        }

        // No limpiar el localStorage en la función de limpieza
        // Lo manejaremos en los handlers de navegación
    }, []);

    // Mejorar la detección de contexto para el botón de editar
    const handleEditButtonClick = () => {
        // Vamos a preservar explícitamente el contexto al navegar a la edición
        if (isFromInventory) {
            // Estamos usando replaceItem para asegurarnos de que el valor se actualiza
            localStorage.setItem('fromInventory', 'true');
        }
        navigate(`/vehicles/edit/${id}`);
    };

    // Obtener el título y subtítulo basado en el modo
    const getPageTitle = () => {
        if (isViewing) {
            return (
                <>
                    <DirectionsCarIcon sx={{ mr: 1 }} />
                    Detalles del Vehículo
                </>
            );
        } else if (isEditing) {
            return (
                <>
                    <DriveFileRenameOutlineIcon sx={{ mr: 1 }} />
                    Editar Vehículo
                </>
            );
        } else {
            return (
                <>
                    <AddIcon sx={{ mr: 1 }} />
                    Registrar Nuevo Vehículo
                </>
            );
        }
    };

    const [users, setUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoadingUsers(true);
            try {
                const response = await axiosInstance.get('/users');
                setUsers(response.data);
            } catch (error) {

                toast.error('Error al cargar la lista de personal');
            } finally {
                setIsLoadingUsers(false);
            }
        };

        fetchUsers();
    }, []);

    const initialFormState = {
        brand: '',
        model: '',
        licensePlate: '',
        mileage: 0,
        year: new Date().getFullYear(),
        vehicleStatus: 'Operativo',
        fuelType: 'Gasolina',
        notes: '',
        photoUrl: null,
        responsibleUsers: []
    };

    const [formData, setFormData] = useState(initialFormState);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const vehicleStatuses = ['Operativo', 'En Reparación', 'Fuera de Servicio'];
    const fuelTypes = ['Gasolina', 'Diésel', 'Eléctrico', 'Híbrido'];
    const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchVehicleData = async () => {
                setIsLoading(true);
                try {

                    const response = await axiosInstance.get(`/vehicles/${id}`);
                    const vehicle = response.data;




                    // Función para ajustar la fecha y mostrar el día correcto
                    const adjustDate = (dateStr) => {
                        if (!dateStr) return null;
                        const date = new Date(dateStr);
                        const offsetMinutes = date.getTimezoneOffset();
                        const adjustedDate = new Date(date.getTime() - offsetMinutes * 60 * 1000);
                        const year = adjustedDate.getFullYear();
                        const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
                        const day = String(adjustedDate.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                    };

                    // Asegurar que responsibleUsers sea un array de objetos completos
                    const formattedResponsibleUsers = vehicle.responsibleUsers?.map(user => {
                        if (typeof user === 'object') {
                            return {
                                id: user.id,
                                fullName: user.fullName,
                                name: user.name,
                                last_name: user.last_name,
                                username: user.username,
                                email: user.email,
                                role: user.role,
                                isActive: user.isActive
                            };
                        } else {
                            return { id: user };
                        }
                    }) || [];


                    setFormData({
                        brand: vehicle.brand || '',
                        model: vehicle.model || '',
                        year: vehicle.year || new Date().getFullYear(),
                        licensePlate: vehicle.licensePlate || '',
                        color: vehicle.color || '',
                        vehicleStatus: vehicle.vehicleStatus || 'Operativo',
                        mileage: vehicle.mileage || 0,
                        fuelType: vehicle.fuelType || 'Gasolina',
                        insuranceExpiryDate: adjustDate(vehicle.insuranceExpiryDate),
                        technicalRevisionExpiryDate: adjustDate(vehicle.technicalRevisionExpiryDate),
                        notes: vehicle.notes || '',
                        photoUrl: vehicle.photoUrl || null,
                        responsibleUsers: formattedResponsibleUsers
                    });

                    if (vehicle.photoUrl) {
                        setImagePreview(vehicle.photoUrl);
                    }
                } catch (error) {

                    toast.error('Error al cargar los datos del vehículo');
                    navigate('/vehicles');
                } finally {
                    setIsLoading(false);
                }
            };

            fetchVehicleData();
        }
    }, [id, navigate]);

    // Redirigir si el usuario no tiene permisos para la acción actual
    useEffect(() => {
        if (!hasRequiredPermission) {
            if (!isEditing && !canCreate) {
                toast.error('No tienes permisos para crear vehículos');
                navigate('/vehicles');
            } else if (isEditing && !isViewing && !canEdit) {
                toast.error('No tienes permisos para editar vehículos');
                navigate(`/vehicles/${id}`); // Redirigir a vista de detalle
            }
        }
    }, [hasRequiredPermission, isEditing, isViewing, canCreate, canEdit, navigate, id]);

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else if (name === 'responsibleUsers') {
            // Convertir los valores seleccionados a objetos con id
            const selectedValues = Array.from(e.target.selectedOptions, option => ({
                id: parseInt(option.value)
            }));
            setFormData(prev => ({
                ...prev,
                [name]: selectedValues
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        // Limpiar el error cuando el usuario modifica el campo
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar el tipo de archivo
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                toast.error('Por favor, selecciona una imagen en formato JPG o PNG');
                e.target.value = ''; // Limpiar el input
                return;
            }

            // Validar el tamaño (máximo 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB en bytes
            if (file.size > maxSize) {
                toast.error('La imagen no debe superar los 5MB');
                e.target.value = ''; // Limpiar el input
                return;
            }

            setSelectedFile(file);
            setFormData(prev => ({ ...prev, photoUrl: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.brand.trim()) {
            newErrors.brand = 'La marca es requerida';
        }

        if (!formData.model.trim()) {
            newErrors.model = 'El modelo es requerido';
        }

        if (!formData.licensePlate.trim()) {
            newErrors.licensePlate = 'La placa es requerida';
        }

        if (!formData.year || isNaN(formData.year)) {
            newErrors.year = 'El año debe ser un número válido';
        }

        if (!formData.vehicleStatus) {
            newErrors.vehicleStatus = 'El estado del vehículo es requerido';
        }

        if (!formData.fuelType) {
            newErrors.fuelType = 'El tipo de combustible es requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar el formulario
        if (!validateForm()) {
            toast.error('Por favor, corrige los errores del formulario');
            return;
        }

        setIsLoading(true);

        try {
            // Crear un FormData para enviar todos los datos
            const formDataToSend = new FormData();

            // Agregar la imagen si existe
            if (formData.photoUrl instanceof File) {
                formDataToSend.append('image', formData.photoUrl);
            }

            // Agregar todos los campos del vehículo
            Object.keys(formData).forEach(key => {
                if (key === 'photoUrl' && formData[key] instanceof File) {
                    // La imagen ya se agregó como 'image'
                    return;
                }
                if (key === 'responsibleUsers') {
                    // Enviar los usuarios completos como JSON string
                    const usersToSend = formData[key].map(user => ({
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        fullName: user.fullName,
                        role: user.role,
                        isActive: user.isActive
                    }));
                    formDataToSend.append(key, JSON.stringify(usersToSend));
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            });

            if (isEditing) {
                await axiosInstance.put(`/vehicles/${id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Vehículo actualizado correctamente');
            } else {
                await axiosInstance.post('/vehicles', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Vehículo creado correctamente');
            }

            navigate('/vehicles');
        } catch (error) {
            console.error('Error al guardar el vehículo:', error);
            toast.error('Error al guardar el vehículo. Por favor, inténtelo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    // Para el botón de volver
    const handleGoBack = () => {
        // Determinar la ruta de regreso basada en el contexto
        if (isFromInventory) {
            localStorage.removeItem('fromInventory');
            navigate('/inventory');
        } else {
            navigate('/vehicles');
        }
    };

    const toggleUserSelection = (userId) => {
        setFormData(prev => {
            const currentUsers = prev.responsibleUsers || [];
            const isSelected = currentUsers.some(user => user.id === userId);
            const selectedUser = users.find(u => u.id === userId);

            if (isSelected) {
                return {
                    ...prev,
                    responsibleUsers: currentUsers.filter(user => user.id !== userId)
                };
            } else {
                return {
                    ...prev,
                    responsibleUsers: [...currentUsers, selectedUser]
                };
            }
        });
        // Cerrar el dropdown después de seleccionar un usuario
        setIsUsersDropdownOpen(false);
    };

    const removeUser = (userId) => {
        setFormData(prev => ({
            ...prev,
            responsibleUsers: prev.responsibleUsers.filter(user => user.id !== userId)
        }));
    };

    if (isLoading) {
        return <LoadingSpinner message="Cargando datos..." />;
    }

    return (
        <div className="vehicle-form-page">
            <div className="vehicle-form">
                <div className="form-header">
                    <h1 className="form-title">{getPageTitle()}</h1>
                    {isViewing && canEdit && (
                        <button
                            className="btn-primary"
                            onClick={handleEditButtonClick}
                        >
                            <DriveFileRenameOutlineIcon sx={{ mr: 1 }} /> Editar Vehículo
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <LoadingSpinner message="Cargando..." />
                ) : (
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="form-grid">
                            <div className="vehicle-image">
                                <h3 className="image-label">Imagen del Vehículo</h3>
                                <div className="image-container">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Vista previa del vehículo" />
                                    ) : formData.photoUrl ? (
                                        <img src={formData.photoUrl} alt="Imagen actual del vehículo" />
                                    ) : (
                                        <div className="no-image">
                                            <DirectionsCarIcon />
                                            <span>No hay imagen disponible</span>
                                        </div>
                                    )}
                                </div>

                                {!isViewing && (
                                    <div className="image-upload">
                                        <label htmlFor="vehicle-image" className="upload-button">
                                            {imagePreview ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                                        </label>
                                        <input
                                            type="file"
                                            id="vehicle-image"
                                            name="photoUrl"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden-input"
                                        />
                                        <span className="file-name">
                                            {selectedFile ? selectedFile.name : (formData.photoUrl ? 'Imagen actual' : 'Ningún archivo seleccionado')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="vehicle-info">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="brand">Marca*</label>
                                        <input
                                            type="text"
                                            id="brand"
                                            name="brand"
                                            value={formData.brand}
                                            onChange={handleInputChange}
                                            className={`form-control ${errors.brand ? 'error' : ''}`}
                                            disabled={isViewing}
                                            readOnly={isViewing}
                                        />
                                        {errors.brand && <div className="error-message">{errors.brand}</div>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="model">Modelo*</label>
                                        <input
                                            type="text"
                                            id="model"
                                            name="model"
                                            value={formData.model}
                                            onChange={handleInputChange}
                                            className={`form-control ${errors.model ? 'error' : ''}`}
                                            disabled={isViewing}
                                            readOnly={isViewing}
                                        />
                                        {errors.model && <div className="error-message">{errors.model}</div>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="year">Año*</label>
                                        <input
                                            type="number"
                                            id="year"
                                            name="year"
                                            value={formData.year}
                                            onChange={handleInputChange}
                                            className={`form-control ${errors.year ? 'error' : ''}`}
                                            min="1900"
                                            max={new Date().getFullYear() + 1}
                                            disabled={isViewing}
                                            readOnly={isViewing}
                                        />
                                        {errors.year && <div className="error-message">{errors.year}</div>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="licensePlate">Placa*</label>
                                        <input
                                            type="text"
                                            id="licensePlate"
                                            name="licensePlate"
                                            value={formData.licensePlate}
                                            onChange={handleInputChange}
                                            className={`form-control ${errors.licensePlate ? 'error' : ''}`}
                                            disabled={isViewing}
                                            readOnly={isViewing}
                                        />
                                        {errors.licensePlate && <div className="error-message">{errors.licensePlate}</div>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="color">Color</label>
                                        <input
                                            type="text"
                                            id="color"
                                            name="color"
                                            value={formData.color}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            disabled={isViewing}
                                            readOnly={isViewing}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="vehicleStatus">Estado*</label>
                                        <select
                                            id="vehicleStatus"
                                            name="vehicleStatus"
                                            value={formData.vehicleStatus}
                                            onChange={handleInputChange}
                                            className={`form-control ${errors.vehicleStatus ? 'error' : ''}`}
                                            disabled={isViewing}
                                        >
                                            {vehicleStatuses.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                        {errors.vehicleStatus && <div className="error-message">{errors.vehicleStatus}</div>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="mileage">Kilometraje</label>
                                        <input
                                            type="number"
                                            id="mileage"
                                            name="mileage"
                                            value={formData.mileage}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            min={0}
                                            disabled={isViewing}
                                            readOnly={isViewing}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="fuelType">Tipo de Combustible</label>
                                        <select
                                            id="fuelType"
                                            name="fuelType"
                                            value={formData.fuelType}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            disabled={isViewing}
                                        >
                                            {fuelTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="insuranceExpiryDate">Vencimiento de Seguro</label>
                                        <input
                                            type="date"
                                            id="insuranceExpiryDate"
                                            name="insuranceExpiryDate"
                                            value={formData.insuranceExpiryDate || ''}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            disabled={isViewing}
                                            readOnly={isViewing}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="technicalRevisionExpiryDate">Vencimiento TÜV</label>
                                        <input
                                            type="date"
                                            id="technicalRevisionExpiryDate"
                                            name="technicalRevisionExpiryDate"
                                            value={formData.technicalRevisionExpiryDate || ''}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            disabled={isViewing}
                                            readOnly={isViewing}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="responsibleUsers">Técnicos Responsables</label>
                                        {isViewing ? (
                                            Array.isArray(formData.responsibleUsers) && formData.responsibleUsers.length > 0 && (
                                                <div className="technicians-info">
                                                    <span className="detail-label">Técnicos:</span>
                                                    <div className="technicians-list">
                                                        {formData.responsibleUsers.map((user, index) => {
                                                            let userName = 'Usuario desconocido';

                                                            if (typeof user === 'object') {
                                                                if (user.fullName) {
                                                                    userName = user.fullName;
                                                                } else if (user.name && user.last_name) {
                                                                    userName = `${user.name} ${user.last_name}`;
                                                                } else if (user.name) {
                                                                    userName = user.name;
                                                                } else if (user.username) {
                                                                    userName = user.username;
                                                                }
                                                            }

                                                            return (
                                                                <span key={index} className="technician-chip">
                                                                    <PersonIcon className="technician-icon" />
                                                                    {userName}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        ) : (
                                            <>
                                                <div className="users-select-container">
                                                    <div
                                                        className="users-select-input"
                                                        onClick={() => setIsUsersDropdownOpen(!isUsersDropdownOpen)}
                                                    >
                                                        <div className="selected-users">
                                                            {formData.responsibleUsers.length > 0 ? (
                                                                formData.responsibleUsers.map(user => {
                                                                    const userData = users.find(u => u.id === user.id);
                                                                    return (
                                                                        <span key={user.id} className="user-chip">
                                                                            {userData ? (userData.fullName) : 'Usuario no encontrado'}
                                                                            <button
                                                                                type="button"
                                                                                className="remove-user"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    removeUser(user.id);
                                                                                }}
                                                                            >
                                                                                <CloseIcon />
                                                                            </button>
                                                                        </span>
                                                                    );
                                                                })
                                                            ) : (
                                                                <span className="placeholder">Seleccione técnicos responsables</span>
                                                            )}
                                                        </div>
                                                        <ArrowDropDownIcon className="dropdown-icon" />
                                                    </div>

                                                    {isUsersDropdownOpen && (
                                                        <div className="users-dropdown">
                                                            {users.map(user => (
                                                                <div
                                                                    key={user.id}
                                                                    className={`user-option ${formData.responsibleUsers.some(u => u.id === user.id) ? 'selected' : ''}`}
                                                                    onClick={() => toggleUserSelection(user.id)}
                                                                >
                                                                    <PersonIcon className="user-icon" />
                                                                    <span>{user.fullName || (user.name && user.last_name ? `${user.name} ${user.last_name}` : user.name || user.username || 'Usuario sin nombre')}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <small className="vehicle-form-help">Puedes seleccionar múltiples técnicos responsables</small>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <label htmlFor="notes">Notas</label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        rows="4"
                                        disabled={isViewing}
                                        readOnly={isViewing}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="form-buttons">
                            <button type="button" className="btn-secondary" onClick={handleGoBack}>
                                <ArrowBackIcon sx={{ mr: 1 }} /> Volver
                            </button>

                            {!isViewing && (
                                <button type="button" className="btn-primary" onClick={handleSubmit}>
                                    <SaveIcon sx={{ mr: 1 }} /> Guardar
                                </button>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default VehicleForm; 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../axiosConfig';
import './HousingForm.css';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePermissions } from '../context/PermissionsContext';
import { useAuth } from '../context/AuthContext';

// Iconos de Material UI
import {
    Home as HomeIcon,
    LocationOn as LocationOnIcon,
    Hotel as HotelIcon,
    Bathtub as BathtubIcon,
    SquareFoot as SquareFootIcon,
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
    Person as PersonIcon,
    ArrowDropDown as ArrowDropDownIcon,
    Close as CloseIcon,
    AddPhotoAlternate as AddPhotoIcon,
    Edit as EditIcon
} from '@mui/icons-material';

const HousingForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { hasPermission } = usePermissions();

    const isEditing = window.location.pathname.includes('/edit/');
    const isViewing = window.location.pathname.includes('/view/');

    // Verificar permisos
    const canEdit = hasPermission('canEditHousing');
    const canCreate = hasPermission('canCreateHousing');
    const hasRequiredPermission = (!isEditing && !isViewing && canCreate) || (isEditing && canEdit) || isViewing;

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [users, setUsers] = useState([]);
    const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(false);
    const [formData, setFormData] = useState({
        address: '',
        bedrooms: '',
        bathrooms: '',
        squareMeters: '',
        isAvailable: true,
        responsibleUsers: [],
        photoUrl: null
    });
    const [errors, setErrors] = useState({});
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersResponse] = await Promise.all([
                    axiosInstance.get('/users')
                ]);

                setUsers(usersResponse.data || []);

                if (isEditing) {
                    const housingResponse = await axiosInstance.get(`/housing/${id}`);
                    const housingData = housingResponse.data;

                    // Convertir responsibleUsers a formato consistente
                    const responsibleUsers = housingData.responsibleUsers?.map(user =>
                        typeof user === 'object' ? user : { id: user }
                    ) || [];

                    setFormData({
                        ...housingData,
                        responsibleUsers
                    });
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
                toast.error('Error al cargar los datos');
                if (isEditing) {
                    navigate('/housing');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, isEditing, navigate]);

    useEffect(() => {
        if (formData.photoUrl) {
            setPreviewUrl(formData.photoUrl);
        } else {
            setPreviewUrl(null);
        }
    }, [formData.photoUrl]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.address?.trim()) {
            newErrors.address = 'La dirección es requerida';
        }

        if (!formData.bedrooms || formData.bedrooms < 0) {
            newErrors.bedrooms = 'El número de habitaciones debe ser válido';
        }

        if (!formData.bathrooms || formData.bathrooms < 0) {
            newErrors.bathrooms = 'El número de baños debe ser válido';
        }

        if (!formData.squareMeters || formData.squareMeters <= 0) {
            newErrors.squareMeters = 'Los metros cuadrados deben ser mayores a 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Limpiar error del campo cuando se modifica
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Por favor, corrige los errores del formulario');
            return;
        }

        setIsSubmitting(true);

        try {
            // Crear un FormData para enviar todos los datos
            const formDataToSend = new FormData();

            // Agregar la imagen si existe
            if (formData.photoUrl instanceof File) {
                formDataToSend.append('image', formData.photoUrl);
            }

            // Agregar todos los campos de la vivienda
            Object.keys(formData).forEach(key => {
                if (key === 'photoUrl' && formData[key] instanceof File) {
                    // La imagen ya se agregó como 'image'
                    return;
                }
                if (key === 'responsibleUsers') {
                    // Enviar los usuarios como JSON string
                    formDataToSend.append(key, JSON.stringify(formData[key]));
                } else if (key === 'isAvailable') {
                    // Enviar isAvailable como string explícita
                    formDataToSend.append(key, formData[key] ? 'true' : 'false');
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            });

            if (isEditing) {
                await axiosInstance.put(`/housing/${id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Vivienda actualizada exitosamente');
            } else {
                await axiosInstance.post('/housing', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Vivienda creada exitosamente');
            }

            navigate('/housing');
        } catch (error) {
            console.error('Error al guardar la vivienda:', error);
            toast.error('Error al guardar la vivienda');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoBack = () => {
        navigate('/housing');
    };

    const toggleUserSelection = (userId) => {
        setFormData(prev => {
            const currentUsers = prev.responsibleUsers || [];
            const isSelected = currentUsers.some(user => user.id === userId);

            if (isSelected) {
                return {
                    ...prev,
                    responsibleUsers: currentUsers.filter(user => user.id !== userId)
                };
            } else {
                return {
                    ...prev,
                    responsibleUsers: [...currentUsers, { id: userId }]
                };
            }
        });
    };

    const removeUser = (userId) => {
        setFormData(prev => ({
            ...prev,
            responsibleUsers: prev.responsibleUsers.filter(user => user.id !== userId)
        }));
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

            setFormData(prev => ({ ...prev, photoUrl: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (isLoading) {
        return <LoadingSpinner message="Cargando datos..." />;
    }

    if (!hasRequiredPermission) {
        return (
            <div className="no-permission">
                <h2>No tienes permisos para {isEditing ? 'editar' : 'crear'} viviendas</h2>
                <button onClick={handleGoBack} className="btn-secondary">
                    <ArrowBackIcon /> Volver
                </button>
            </div>
        );
    }

    return (
        <div className="housing-form-page">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">
                        <HomeIcon />
                        {isEditing ? 'Editar Vivienda' : isViewing ? 'Ver Vivienda' : 'Nueva Vivienda'}
                    </h2>
                    <button onClick={handleGoBack} className="btn-secondary">
                        <ArrowBackIcon /> Volver
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="housing-form">
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label htmlFor="address">
                                <LocationOnIcon /> Dirección
                            </label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Ingrese la dirección completa"
                                disabled={isViewing}
                                className={errors.address ? 'error' : ''}
                            />
                            {errors.address && <div className="error-message">{errors.address}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="bedrooms">
                                <HotelIcon /> Habitaciones
                            </label>
                            <input
                                type="number"
                                id="bedrooms"
                                name="bedrooms"
                                value={formData.bedrooms}
                                onChange={handleInputChange}
                                placeholder="0"
                                min="0"
                                disabled={isViewing}
                                className={errors.bedrooms ? 'error' : ''}
                            />
                            {errors.bedrooms && <div className="error-message">{errors.bedrooms}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="bathrooms">
                                <BathtubIcon /> Baños
                            </label>
                            <input
                                type="number"
                                id="bathrooms"
                                name="bathrooms"
                                value={formData.bathrooms}
                                onChange={handleInputChange}
                                placeholder="0"
                                min="0"
                                disabled={isViewing}
                                className={errors.bathrooms ? 'error' : ''}
                            />
                            {errors.bathrooms && <div className="error-message">{errors.bathrooms}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="squareMeters">
                                <SquareFootIcon /> Metros Cuadrados
                            </label>
                            <input
                                type="number"
                                id="squareMeters"
                                name="squareMeters"
                                value={formData.squareMeters}
                                onChange={handleInputChange}
                                placeholder="0"
                                min="0"
                                step="0.01"
                                disabled={isViewing}
                                className={errors.squareMeters ? 'error' : ''}
                            />
                            {errors.squareMeters && <div className="error-message">{errors.squareMeters}</div>}
                        </div>

                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="isAvailable"
                                    checked={formData.isAvailable}
                                    onChange={handleInputChange}
                                    disabled={isViewing}
                                />
                                Disponible
                            </label>
                        </div>

                        {hasPermission('canAssignUsers') && (
                            <div className="form-group full-width">
                                <label htmlFor="responsibleUsers">
                                    <PersonIcon /> Técnicos Responsables
                                </label>
                                <div className="users-select-container">
                                    <div
                                        className="users-select-input"
                                        onClick={() => !isViewing && setIsUsersDropdownOpen(!isUsersDropdownOpen)}
                                    >
                                        <div className="selected-users">
                                            {formData.responsibleUsers?.length > 0 ? (
                                                formData.responsibleUsers.map(userId => {
                                                    const user = users.find(u => u.id === userId.id);
                                                    return user ? (
                                                        <div key={user.id} className="user-chip">
                                                            <span>{user.fullName || `${user.name} ${user.lastName}`}</span>
                                                            {!isViewing && (
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
                                                            )}
                                                        </div>
                                                    ) : null;
                                                })
                                            ) : (
                                                <span className="placeholder">Seleccione técnicos responsables</span>
                                            )}
                                        </div>
                                        {!isViewing && <ArrowDropDownIcon className="dropdown-icon" />}
                                    </div>

                                    {isUsersDropdownOpen && !isViewing && (
                                        <div className="users-dropdown">
                                            {users.map(user => (
                                                <div
                                                    key={user.id}
                                                    className={`user-option ${formData.responsibleUsers.some(u => u.id === user.id) ? 'selected' : ''}`}
                                                    onClick={() => toggleUserSelection(user.id)}
                                                >
                                                    <PersonIcon className="user-icon" />
                                                    <span>{user.fullName || `${user.name} ${user.lastName}`}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {errors.responsibleUsers && <div className="error-message">{errors.responsibleUsers}</div>}
                                <small className="form-help">Puedes seleccionar múltiples técnicos responsables</small>
                            </div>
                        )}

                        <div className="form-group full-width">
                            <label>Foto de la Vivienda</label>
                            <div className="image-upload-container">
                                {previewUrl ? (
                                    <div className="image-preview">
                                        <img src={previewUrl} alt="Vivienda" />
                                        {!isViewing && (
                                            <div className="image-actions">
                                                <label className="btn-icon" title="Cambiar imagen">
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                                        onChange={handleFileChange}
                                                        style={{ display: 'none' }}
                                                    />
                                                    <EditIcon />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    !isViewing && (
                                        <label className="image-upload-placeholder">
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                onChange={handleFileChange}
                                                style={{ display: 'none' }}
                                            />
                                            <AddPhotoIcon />
                                            <span>Agregar foto</span>
                                        </label>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    {!isViewing && (
                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isSubmitting}
                            >
                                <SaveIcon />
                                {isSubmitting ? 'Guardando...' : 'Guardar Vivienda'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default HousingForm; 
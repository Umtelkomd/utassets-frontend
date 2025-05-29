import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import axiosInstance from '../axiosConfig';
import './InventoryForm.css';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';
import config from '../config';

// Componentes de Material UI
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const API_URL = process.env.REACT_APP_API_URL || config.apiUrl;

const InventoryForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const isEditing = !!id;
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [newCategoryDescription, setNewCategoryDescription] = useState('');
    const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const initialFormState = {
        itemName: '',
        itemCode: '',
        category: '',
        quantity: 1,
        condition: 'Bueno',
        location: '',
        acquisitionDate: null,
        responsibleUsers: [],
        notes: '',
        photoUrl: null
    };

    const [formData, setFormData] = useState(initialFormState);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_URL}/categories`);
            setCategories(response.data);
        } catch (error) {

            toast.error('No se pudieron cargar las categorías');
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get('/users');
            setUsers(response.data);
        } catch (error) {

            toast.error('No se pudieron cargar los usuarios');
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchUsers();

        if (isEditing && id) {

            const fetchItemData = async () => {
                setIsLoading(true);
                try {
                    const response = await axiosInstance.get(`/inventory/${id}`);
                    const item = response.data;



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

                    // Asegurar que responsibleUsers sea un array de objetos con id
                    const formattedResponsibleUsers = item.responsibleUsers?.map(user => ({
                        id: typeof user === 'object' ? user.id : user
                    })) || [];

                    setFormData({
                        itemName: item.itemName || '',
                        itemCode: item.itemCode || '',
                        category: item.category || '',
                        quantity: item.quantity || 1,
                        condition: item.condition || 'Bueno',
                        location: item.location || '',
                        acquisitionDate: adjustDate(item.acquisitionDate),
                        responsibleUsers: formattedResponsibleUsers,
                        notes: item.notes || '',
                        photoUrl: item.photoUrl || null
                    });

                    if (item.photoUrl) {
                        setImagePreview(item.photoUrl);
                    }
                } catch (error) {

                    toast.error('Error al cargar los datos del item');
                    navigate('/inventory');
                } finally {
                    setIsLoading(false);
                }
            };

            fetchItemData();
        }

        // Si es un técnico y está creando un nuevo item, asignarlo automáticamente como responsable
        if (!isEditing && currentUser?.role === 'tecnico') {
            setFormData(prev => ({
                ...prev,
                responsibleUsers: [{ id: currentUser.id }]
            }));
        }
    }, [id, isEditing, navigate, currentUser]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
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

        if (!formData.itemName.trim()) newErrors.itemName = 'El nombre del item es requerido';
        if (!formData.itemCode.trim()) newErrors.itemCode = 'El código del item es requerido';
        if (!formData.category) newErrors.category = 'La categoría es requerida';
        if (formData.quantity < 1) newErrors.quantity = 'La cantidad debe ser al menos 1';
        if (!formData.location.trim()) newErrors.location = 'La ubicación es requerida';
        if (!formData.responsibleUsers.length) newErrors.responsibleUsers = 'El responsable es requerido';

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
                await axiosInstance.put(`/inventory/${id}`, formDataToSend);
                toast.success('Item actualizado correctamente');
            } else {
                await axiosInstance.post('/inventory', formDataToSend);
                toast.success('Item creado correctamente');
            }

            navigate('/inventory');
        } catch (error) {
            console.error('Error al guardar el item:', error);
            toast.error('Error al guardar el item. Por favor, inténtelo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/categories`, {
                name: newCategory,
                description: newCategoryDescription
            });
            toast.success('Categoría agregada correctamente');
            setShowCategoryModal(false);
            setNewCategory('');
            setNewCategoryDescription('');
            fetchCategories();
        } catch (error) {

            if (error.response && error.response.data.message === "Ya existe una categoría con ese nombre") {
                toast.error('Ya existe una categoría con ese nombre');
            } else {
                toast.error('Error al agregar la categoría');
            }
        }
    };

    const toggleUserSelection = (userId) => {
        setFormData(prev => {
            const currentUsers = prev.responsibleUsers || [];
            const isSelected = currentUsers.some(user => user.id === userId);
            const userData = users.find(u => u.id === userId);

            if (isSelected) {
                return {
                    ...prev,
                    responsibleUsers: currentUsers.filter(user => user.id !== userId)
                };
            } else {
                return {
                    ...prev,
                    responsibleUsers: [...currentUsers, userData]
                };
            }
        });
        // Cerrar el dropdown después de seleccionar un usuario
        setIsUsersDropdownOpen(false);
    };

    if (isLoading && isEditing) {
        return <LoadingSpinner message="Cargando datos..." />;
    }

    const removeUser = (userId) => {
        setFormData(prev => ({
            ...prev,
            responsibleUsers: prev.responsibleUsers.filter(user => user.id !== userId)
        }));
    };

    return (
        <div className="inventory-form-page">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">
                        {isEditing ? 'Editar Item' : 'Añadir Nuevo Item'}
                    </h2>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate('/inventory')}
                    >
                        <ArrowBackIcon /> Volver
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="inventory-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="itemName">Nombre del Item*</label>
                            <input
                                type="text"
                                id="itemName"
                                name="itemName"
                                className={`form-control ${errors.itemName ? 'error' : ''}`}
                                value={formData.itemName}
                                onChange={handleInputChange}
                                placeholder="Ej: Taladro Eléctrico"
                            />
                            {errors.itemName && <div className="error-message">{errors.itemName}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="itemCode">Código*</label>
                            <input
                                type="text"
                                id="itemCode"
                                name="itemCode"
                                className={`form-control ${errors.itemCode ? 'error' : ''}`}
                                value={formData.itemCode}
                                onChange={handleInputChange}
                                placeholder="Ej: TOOL-001"
                            />
                            {errors.itemCode && <div className="error-message">{errors.itemCode}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="category">Categoría*</label>
                            <select
                                id="category"
                                name="category"
                                className={`form-control ${errors.category ? 'error' : ''}`}
                                value={formData.category}
                                onChange={handleInputChange}
                            >
                                <option value="">Seleccione una categoría</option>
                                {categories.length > 0 ? (
                                    categories.map((cat) => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))
                                ) : (
                                    <option value="" disabled>No hay categorías disponibles. Por favor, agregue una categoría primero.</option>
                                )}
                            </select>
                            <button
                                type="button"
                                className="btn btn-link"
                                onClick={() => setShowCategoryModal(true)}
                                style={{ marginTop: '0.5rem' }}
                            >
                                <AddIcon /> Agregar Nueva Categoría
                            </button>
                            {errors.category && <div className="error-message">{errors.category}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="quantity">Cantidad*</label>
                            <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                className={`form-control ${errors.quantity ? 'error' : ''}`}
                                value={formData.quantity}
                                onChange={handleInputChange}
                                min="1"
                            />
                            {errors.quantity && <div className="error-message">{errors.quantity}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="condition">Estado*</label>
                            <select
                                id="condition"
                                name="condition"
                                className="form-control"
                                value={formData.condition}
                                onChange={handleInputChange}
                            >
                                <option value="Excelente">Excelente</option>
                                <option value="Bueno">Bueno</option>
                                <option value="Regular">Regular</option>
                                <option value="Necesita Reparación">Necesita Reparación</option>
                                <option value="Fuera de Servicio">Fuera de Servicio</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="location">Ubicación*</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                className={`form-control ${errors.location ? 'error' : ''}`}
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="Ej: Almacén Principal"
                            />
                            {errors.location && <div className="error-message">{errors.location}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="acquisitionDate">Fecha de Adquisición</label>
                            <input
                                type="date"
                                id="acquisitionDate"
                                name="acquisitionDate"
                                className="form-control"
                                value={formData.acquisitionDate || ''}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="responsibleUsers">Técnicos Responsables*</label>
                            {currentUser?.role === 'tecnico' && !isEditing ? (
                                <div className="users-select-container">
                                    <div className="users-select-input disabled">
                                        <div className="selected-users">
                                            {formData.responsibleUsers.map(user => {
                                                const userData = users.find(u => u.id === user.id);
                                                return (
                                                    <span key={user.id} className="user-chip">
                                                        {userData ? (userData.fullName) : 'Usuario no encontrado'}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <small className="form-help">Como técnico, serás automáticamente asignado como responsable</small>
                                </div>
                            ) : (
                                <>
                                    <div className={`users-select-container ${errors.responsibleUsers ? 'error' : ''}`}>
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
                                                        <span>{user.fullName || `${user.name} ${user.last_name}`}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {errors.responsibleUsers && <div className="error-message">{errors.responsibleUsers}</div>}
                                    <small className="vehicle-form-help">Puedes seleccionar múltiples técnicos responsables</small>
                                </>
                            )}
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="notes">Notas</label>
                            <textarea
                                id="notes"
                                name="notes"
                                className="form-control"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Información adicional relevante"
                                rows="3"
                            />
                        </div>

                        <div className="form-group image-upload-group">
                            <label htmlFor="photoUrl">Imagen del Item</label>
                            <div className="image-upload">
                                <label htmlFor="item-image" className="upload-button">
                                    {imagePreview ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                                </label>
                                <input
                                    type="file"
                                    id="item-image"
                                    name="photoUrl"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden-input"
                                />
                                <span className="file-name">
                                    {selectedFile ? selectedFile.name : (formData.photoUrl ? 'Imagen actual' : 'Ningún archivo seleccionado')}
                                </span>
                            </div>
                            {imagePreview && (
                                <div className="image-preview-container">
                                    <img src={imagePreview} alt="Vista previa" className="image-preview" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            <SaveIcon /> {isLoading ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/inventory')}
                            disabled={isLoading}
                        >
                            <CancelIcon /> Cancelar
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal para agregar categoría */}
            {showCategoryModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Agregar Nueva Categoría</h2>
                            <button className="close-button" onClick={() => setShowCategoryModal(false)}>
                                <CancelIcon />
                            </button>
                        </div>
                        <form onSubmit={handleAddCategory}>
                            <div className="form-group">
                                <label htmlFor="newCategory">Nombre de la Categoría *</label>
                                <input
                                    type="text"
                                    id="newCategory"
                                    name="newCategory"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    required
                                    placeholder="Ej: Equipo Electrónico"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="newCategoryDescription">Descripción</label>
                                <textarea
                                    id="newCategoryDescription"
                                    name="newCategoryDescription"
                                    value={newCategoryDescription}
                                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                                    placeholder="Descripción opcional de la categoría"
                                    rows="3"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowCategoryModal(false)} className="cancel-button">
                                    Cancelar
                                </button>
                                <button type="submit" className="submit-button">
                                    Agregar Categoría
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryForm;
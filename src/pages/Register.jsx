import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import GoogleLoginButton from '../components/GoogleLoginButton';
import './Register.css';
import axios from '../axiosConfig';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        fullName: '',
        birthDate: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        photoUrl: null
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const { register } = useAuth();
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'El nombre es requerido';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'El apellido es requerido';
        }

        if (!formData.birthDate) {
            newErrors.birthDate = 'La fecha de nacimiento es requerida';
        } else {
            const birthDate = new Date(formData.birthDate);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();

            if (age < 18) {
                newErrors.birthDate = 'Debes tener al menos 18 años';
            }
        }

        if (!formData.email) {
            newErrors.email = 'El correo electrónico es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'El correo electrónico no es válido';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        if (formData.phone && !/^\+?[1-9]\d{1,14}$/.test(formData.phone)) {
            newErrors.phone = 'El número de teléfono no es válido (formato: +123456789)';
        }

        if (formData.photoUrl && formData.photoUrl.size > 5 * 1024 * 1024) {
            newErrors.photoUrl = 'La imagen no debe superar los 5MB';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        console.log(process.env.REACT_APP_API_URL);
        const { name, value, files } = e.target;

        if (name === 'photoUrl') {
            const file = files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    setErrors(prev => ({
                        ...prev,
                        photoUrl: 'La imagen no debe superar los 5MB'
                    }));
                    return;
                }
                if (!file.type.startsWith('image/')) {
                    setErrors(prev => ({
                        ...prev,
                        photoUrl: 'El archivo debe ser una imagen'
                    }));
                    return;
                }
                setFormData(prev => ({
                    ...prev,
                    photoUrl: file
                }));

                // Crear preview de la imagen
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImagePreview(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        } else {
            setFormData(prev => {
                const updatedData = {
                    ...prev,
                    [name]: value
                };

                // Actualizar fullName cuando cambie firstName o lastName
                if (name === 'firstName' || name === 'lastName') {
                    updatedData.fullName = name === 'firstName'
                        ? value + ' ' + prev.lastName
                        : prev.firstName + ' ' + value;
                }

                return updatedData;
            });
        }

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            photoUrl: null
        }));
        setImagePreview(null);

        // Limpiar el input de archivo
        const fileInput = document.getElementById('photoUrl');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Crear un FormData para enviar todos los datos incluida la imagen
            const submitData = new FormData();

            // Agregar los campos del formulario
            submitData.append('username', formData.email); // Usamos el email como username
            submitData.append('email', formData.email);
            submitData.append('password', formData.password);
            submitData.append('fullName', formData.fullName);
            submitData.append('birthDate', formData.birthDate);

            // Agregar teléfono si está presente
            if (formData.phone) {
                submitData.append('phone', formData.phone);
            }

            // Si hay una imagen, agregarla directamente al FormData
            if (formData.photoUrl instanceof File) {
                submitData.append('image', formData.photoUrl); // Cambié 'photoUrl' por 'image' que es lo que espera el backend
            }

            // Enviar la petición al backend (ruta corregida)
            const response = await axios.post('/users/register', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success(response.data.message || 'Registro exitoso. Revisa tu correo electrónico para confirmar tu cuenta.');

            // Mostrar información adicional sobre la confirmación
            setTimeout(() => {
                toast.info('Revisa tu bandeja de entrada (y carpeta de spam) para el correo de confirmación.', {
                    autoClose: 7000,
                });
            }, 2000);

            navigate('/login');
        } catch (error) {
            console.error('Error en el registro:', error);
            toast.error(error.response?.data?.message || 'Error en el registro');
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const EyeOpenIcon = (
        <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
        </svg>
    );

    const EyeClosedIcon = (
        <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
        </svg>
    );

    return (
        <div className="register-container">
            <div className="register-content-wrapper">
                <div className="register-background-content">
                    <h2>Únete a UT Assets</h2>
                    <ul>
                        <li>Gestiona tus activos de manera eficiente</li>
                        <li>Control total sobre tu inventario</li>
                        <li>Reportes en tiempo real</li>
                        <li>Interfaz intuitiva y fácil de usar</li>
                    </ul>
                </div>
                <div className="register-form-container">
                    <h2>Registro</h2>

                    {/* Botón de Google OAuth */}
                    {/* <GoogleLoginButton isSubmitting={isSubmitting} /> */}

                    {/* Separador */}
                    <div className="auth-divider">
                        <span>o registrarse con email</span>
                    </div>

                    <form className="register-form" onSubmit={handleSubmit} noValidate encType="multipart/form-data">
                        {errors.general && (
                            <div className="error-message general-error">
                                {errors.general}
                            </div>
                        )}
                        <div className="form-group">
                            <label htmlFor="firstName">Nombres</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                placeholder="Ingresa tus nombres"
                                aria-invalid={!!errors.firstName}
                                aria-describedby={errors.firstName ? "firstName-error" : undefined}
                            />
                            {errors.firstName && (
                                <span className="error-message" id="firstName-error">
                                    {errors.firstName}
                                </span>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Apellidos</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                placeholder="Ingresa tus apellidos"
                                aria-invalid={!!errors.lastName}
                                aria-describedby={errors.lastName ? "lastName-error" : undefined}
                            />
                            {errors.lastName && (
                                <span className="error-message" id="lastName-error">
                                    {errors.lastName}
                                </span>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="birthDate">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                id="birthDate"
                                name="birthDate"
                                value={formData.birthDate}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                aria-invalid={!!errors.birthDate}
                                aria-describedby={errors.birthDate ? "birthDate-error" : undefined}
                            />
                            {errors.birthDate && (
                                <span className="error-message" id="birthDate-error">
                                    {errors.birthDate}
                                </span>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Correo Electrónico</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                placeholder="ejemplo@correo.com"
                                aria-invalid={!!errors.email}
                                aria-describedby={errors.email ? "email-error" : undefined}
                            />
                            {errors.email && (
                                <span className="error-message" id="email-error">
                                    {errors.email}
                                </span>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Teléfono (Opcional)</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                placeholder="+123456789"
                                aria-invalid={!!errors.phone}
                                aria-describedby={errors.phone ? "phone-error" : undefined}
                            />
                            {errors.phone && (
                                <span className="error-message" id="phone-error">
                                    {errors.phone}
                                </span>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>
                            <div className="password-input-container">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    placeholder="••••••••"
                                    aria-invalid={!!errors.password}
                                    aria-describedby={errors.password ? "password-error" : undefined}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={togglePasswordVisibility}
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPassword ? EyeOpenIcon : EyeClosedIcon}
                                </button>
                            </div>
                            {errors.password && (
                                <span className="error-message" id="password-error">
                                    {errors.password}
                                </span>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                placeholder="••••••••"
                                aria-invalid={!!errors.confirmPassword}
                                aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                            />
                            {errors.confirmPassword && (
                                <span className="error-message" id="confirmPassword-error">
                                    {errors.confirmPassword}
                                </span>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="photoUrl">Foto de Perfil (Opcional)</label>
                            <input
                                type="file"
                                id="photoUrl"
                                name="photoUrl"
                                onChange={handleChange}
                                disabled={isSubmitting}
                                accept="image/*"
                                aria-invalid={!!errors.photoUrl}
                                aria-describedby={errors.photoUrl ? "photoUrl-error" : undefined}
                            />
                            {errors.photoUrl && (
                                <span className="error-message" id="photoUrl-error">
                                    {errors.photoUrl}
                                </span>
                            )}
                            {imagePreview && (
                                <div className="image-preview-container">
                                    <div className="image-preview">
                                        <img
                                            src={imagePreview}
                                            alt="Vista previa"
                                            className="preview-image"
                                        />
                                        <button
                                            type="button"
                                            className="remove-image-btn"
                                            onClick={removeImage}
                                            aria-label="Eliminar imagen"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <p className="preview-text">Vista previa de tu foto</p>
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="register-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Registrando...' : 'Registrarse'}
                        </button>
                        <div className="login-link">
                            ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register; 
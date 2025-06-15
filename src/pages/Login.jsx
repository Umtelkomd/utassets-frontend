import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import GoogleLoginButton from '../components/GoogleLoginButton';
import '../pages/Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, currentUser, isAuthInitialized } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Manejar parámetros de URL para mostrar mensajes apropiados
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        console.log('Parámetros URL detectados:', Object.fromEntries(urlParams.entries()));

        if (urlParams.get('expired') === 'true') {
            toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', {
                position: 'top-right',
                autoClose: 5000,
            });
        } else if (urlParams.get('invalid') === 'true') {
            toast.error('Sesión inválida. Por favor, inicia sesión nuevamente.', {
                position: 'top-right',
                autoClose: 5000,
            });
        } else if (urlParams.get('unauthorized') === 'true') {
            toast.error('Acceso no autorizado. Por favor, inicia sesión.', {
                position: 'top-right',
                autoClose: 5000,
            });
        } else if (urlParams.get('session') === 'expired') {
            toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', {
                position: 'top-right',
                autoClose: 5000,
            });
        } else if (urlParams.get('error') === 'google_auth_failed') {
            toast.error('Error en la autenticación con Google. Inténtalo de nuevo.', {
                position: 'top-right',
                autoClose: 5000,
            });
        } else if (urlParams.get('error') === 'server_error') {
            toast.error('Error del servidor. Inténtalo más tarde.', {
                position: 'top-right',
                autoClose: 5000,
            });
        }

        // Limpiar los parámetros de la URL sin recargar la página
        if (urlParams.toString()) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, [location.search, navigate]);

    // Redirigir si el usuario ya está autenticado
    useEffect(() => {
        if (isAuthInitialized && currentUser) {
            console.log('Usuario ya autenticado, redirigiendo a dashboard...');
            navigate('/', { replace: true });
        }
    }, [currentUser, isAuthInitialized, navigate]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'El correo electrónico es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'El correo electrónico no es válido';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar error del campo que se está editando
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const response = await login({
                email: formData.email.trim(),
                password: formData.password
            });

            if (response.success) {
                toast.success(`¡Bienvenido, ${response.user.fullName || response.user.email}!`, {
                    position: 'top-right',
                    autoClose: 3000
                });
                navigate('/');
            } else {
                // Limpiar solo el campo de contraseña
                setFormData(prev => ({
                    ...prev,
                    password: ''
                }));

                setErrors({
                    general: response.error
                });

                toast.error(response.error, {
                    position: 'top-right',
                    autoClose: 3000
                });
            }
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
        <div className="login-container">
            <div className="login-content-wrapper">
                <div className="login-background-content">
                    <h2>Bienvenido a UT Assets</h2>
                    <ul>
                        <li>Gestiona tus activos de manera eficiente</li>
                        <li>Control total sobre tu inventario</li>
                        <li>Reportes en tiempo real</li>
                        <li>Interfaz intuitiva y fácil de usar</li>
                    </ul>
                </div>
                <div className="login-form-container">
                    <h2>Iniciar Sesión</h2>

                    {/* Botón de Google OAuth */}
                    {/* <GoogleLoginButton isSubmitting={isSubmitting} /> */}

                    {/* Separador */}
                    <div className="auth-divider">
                        <span>o</span>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit} noValidate>
                        {errors.general && (
                            <div className="error-message general-error">
                                {errors.general}
                            </div>
                        )}
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
                        <button
                            type="submit"
                            className="login-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>
                        <div className="register-link">
                            ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login; 
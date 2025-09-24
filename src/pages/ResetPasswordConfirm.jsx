import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import './ResetPassword.css';
import config from '../config';

const API_URL = process.env.REACT_APP_API_URL || config.apiUrl;

const ResetPasswordConfirm = () => {
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        token: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setError('Token de recuperación no válido. Por favor, solicita un nuevo enlace de recuperación.');
            return;
        }
        setFormData(prev => ({ ...prev, token }));
    }, [searchParams]);

    const validateForm = () => {
        if (!formData.newPassword) {
            setError('La nueva contraseña es requerida.');
            return false;
        }
        
        if (formData.newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return false;
        }
        
        if (!formData.confirmPassword) {
            setError('Confirma tu nueva contraseña.');
            return false;
        }
        
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return false;
        }
        
        return true;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        try {
            setLoading(true);
            
            await axios.post(`${API_URL}/users/reset-password`, {
                token: formData.token,
                newPassword: formData.newPassword
            });

            toast.success('¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión.', {
                position: 'top-right',
                autoClose: 5000,
            });
            
            navigate('/login');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al restablecer la contraseña. El enlace puede haber expirado.';
            setError(errorMessage);
            toast.error(errorMessage, {
                position: 'top-right',
                autoClose: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        if (field === 'newPassword') {
            setShowPassword(prev => !prev);
        } else {
            setShowConfirmPassword(prev => !prev);
        }
    };

    const EyeOpenIcon = (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
        </svg>
    );

    const EyeClosedIcon = (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27z" />
        </svg>
    );

    if (!formData.token) {
        return (
            <div className="reset-password-container">
                <div className="reset-password-form-container">
                    <div className="reset-password-header">
                        <div className="panda-logo">
                            <span>Utassets</span>
                        </div>
                        <h1>Enlace Inválido</h1>
                        <div className="error-message">
                            {error || 'Token de recuperación no válido. Por favor, solicita un nuevo enlace.'}
                        </div>
                        <div className="back-to-login">
                            <Link to="/reset-password">Solicitar Nuevo Enlace</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="reset-password-container">
            <div className="reset-password-form-container">
                <div className="reset-password-header">
                    <div className="panda-logo">
                        <span>Utassets</span>
                    </div>
                    <h1>Nueva Contraseña</h1>
                    <p className="reset-password-subtitle">
                        Introduce tu nueva contraseña
                    </p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="reset-password-form">
                    <div className="form-group">
                        <label htmlFor="newPassword">Nueva Contraseña</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                disabled={loading}
                                minLength="6"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => togglePasswordVisibility('newPassword')}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? EyeOpenIcon : EyeClosedIcon}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                        <div className="password-input-container">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                disabled={loading}
                                minLength="6"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => togglePasswordVisibility('confirmPassword')}
                                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showConfirmPassword ? EyeOpenIcon : EyeClosedIcon}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="reset-password-button"
                        disabled={loading}
                    >
                        {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                    </button>
                </form>

                <div className="back-to-login">
                    <Link to="/login">Volver a Iniciar Sesión</Link>
                </div>
            </div>

            <div className="reset-password-background">
                <div className="reset-password-background-content">
                    <h2>Nueva Contraseña</h2>
                    <p>Elige una contraseña segura para proteger tu cuenta.</p>
                    <ul>
                        <li>Usa al menos 6 caracteres</li>
                        <li>Combina letras, números y símbolos</li>
                        <li>Evita información personal</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordConfirm;
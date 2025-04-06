import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { register, currentUser, userToken } = useAuth();
    const navigate = useNavigate();

    // Redireccionar si el usuario ya está autenticado
    useEffect(() => {
        if (currentUser && userToken) {
            navigate('/');
        }
    }, [currentUser, userToken, navigate]);

    const validateForm = () => {
        if (!fullName || !email || !password || !confirmPassword) {
            setError('Por favor, completa todos los campos.');
            return false;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return false;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Por favor, introduce un correo electrónico válido.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            await register(email, password, fullName);
            navigate('/');
        } catch (err) {
            if (err.response?.status === 400 && err.response?.data?.message?.includes('ya está en uso')) {
                setError('Este correo electrónico ya está registrado. Prueba iniciar sesión.');
            } else {
                setError(err.response?.data?.message || 'Error al registrar usuario. Inténtalo de nuevo.');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-form-container">
                <div className="register-header">
                    <div className="panda-logo">
                        🐼 <span>Panda Assets</span>
                    </div>
                    <h1>Crear Cuenta</h1>
                    <p className="register-subtitle">
                        Regístrate para gestionar los activos de la empresa
                    </p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label htmlFor="fullName">Nombre Completo</label>
                        <input
                            type="text"
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            placeholder="Tu nombre completo"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="ejemplo@correo.com"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Mínimo 6 caracteres"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? 'Ocultar' : 'Mostrar'}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Repite tu contraseña"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="register-button"
                        disabled={loading}
                    >
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>

                <div className="login-link">
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
                </div>
            </div>

            <div className="register-background">
                <div className="register-background-content">
                    <h2>Únete a nuestro sistema de gestión de activos</h2>
                    <ul>
                        <li>Interfaz intuitiva y moderna</li>
                        <li>Informes detallados</li>
                        <li>Notificaciones automáticas</li>
                        <li>Soporte técnico prioritario</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Register; 
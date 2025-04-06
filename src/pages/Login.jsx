import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, currentUser, userToken } = useAuth();
    const navigate = useNavigate();

    // Redireccionar si el usuario ya está autenticado
    useEffect(() => {
        console.log("Login - Estado de autenticación:", {
            currentUser: currentUser ? 'existe' : 'no existe',
            userToken: userToken ? 'existe' : 'no existe'
        });

        if (currentUser || userToken) {
            console.log("Usuario ya autenticado, redirigiendo a /");
            navigate('/');
        }
    }, [currentUser, userToken, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Por favor, completa todos los campos.');
            return;
        }

        try {
            setLoading(true);
            const result = await login(email, password);
            console.log("Login exitoso:", result);
            navigate('/');
        } catch (err) {
            console.error("Error en login:", err);
            setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form-container">
                <div className="login-header">
                    <div className="panda-logo">
                        🐼 <span>Panda Assets</span>
                    </div>
                    <h1>Iniciar Sesión</h1>
                    <p className="login-subtitle">
                        Ingresa a tu cuenta para gestionar los activos de la empresa
                    </p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
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
                                placeholder="Tu contraseña"
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

                    <div className="forgot-password">
                        <Link to="/reset-password">¿Olvidaste tu contraseña?</Link>
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="register-link">
                    ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
                </div>
            </div>

            <div className="login-background">
                <div className="login-background-content">
                    <h2>Gestiona tus activos con facilidad</h2>
                    <ul>
                        <li>Inventario completo</li>
                        <li>Mantenimiento programado</li>
                        <li>Asignación a proyectos</li>
                        <li>Control de vehículos</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Login; 
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ResetPassword.css';
import config from '../config';

const API_URL = process.env.REACT_APP_API_URL || config.apiUrl;

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!email) {
            setError('Por favor, introduce tu correo electrónico.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Por favor, introduces un correo electrónico válido.');
            return;
        }

        try {
            setLoading(true);
            // Usar axios directamente para enviar la solicitud de reset
            await axios.post(`${API_URL}/users/forgot-password`, { email });

            setMessage('Se ha enviado un correo electrónico para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada.');
            setEmail('');
        } catch (err) {

            setError(err.response?.data?.message || 'Error al enviar el correo electrónico. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-container">
            <div className="reset-password-form-container">
                <div className="reset-password-header">
                    <div className="panda-logo">
                        <span>Utassets</span>
                    </div>
                    <h1>Restablecer Contraseña</h1>
                    <p className="reset-password-subtitle">
                        Introduce tu correo electrónico para recibir instrucciones
                    </p>
                </div>

                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}

                <form onSubmit={handleSubmit} className="reset-password-form">
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

                    <button
                        type="submit"
                        className="reset-password-button"
                        disabled={loading}
                    >
                        {loading ? 'Enviando...' : 'Enviar Instrucciones'}
                    </button>
                </form>

                <div className="back-to-login">
                    <Link to="/login">Volver a Iniciar Sesión</Link>
                </div>
            </div>

            <div className="reset-password-background">
                <div className="reset-password-background-content">
                    <h2>¿Olvidaste tu contraseña?</h2>
                    <p>No te preocupes, te enviaremos instrucciones para restablecerla.</p>
                    <ul>
                        <li>Recibirás un correo con un enlace seguro</li>
                        <li>Sigue las instrucciones para crear una nueva contraseña</li>
                        <li>Mantén tus credenciales en un lugar seguro</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword; 
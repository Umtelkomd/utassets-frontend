import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../axiosConfig';
import './ConfirmEmail.css';

const ConfirmEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const confirmEmail = async () => {
            const token = searchParams.get('token');

            // Log para debuggear
            console.log('🔍 ConfirmEmail - Token recibido:', token);
            console.log('🔍 ConfirmEmail - URL actual:', window.location.href);
            console.log('🔍 ConfirmEmail - Search params:', Object.fromEntries(searchParams.entries()));

            if (!token) {
                console.error('❌ No se encontró token en la URL');
                setStatus('error');
                setMessage('Token de confirmación no válido.');
                return;
            }

            try {
                const response = await axios.post('/users/confirm-email', { token });

                setStatus('success');
                setMessage(response.data.message || 'Email confirmado exitosamente');
                toast.success('¡Email confirmado exitosamente! Ya puedes iniciar sesión.');

                // Redirigir al login después de 3 segundos
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Error al confirmar el email');
                toast.error(error.response?.data?.message || 'Error al confirmar el email');
            }
        };

        confirmEmail();
    }, [searchParams, navigate]);

    const handleResendEmail = async () => {
        // Esta funcionalidad podría implementarse si guardamos el email del usuario
        toast.info('Para reenviar el correo, regresa a la página de registro.');
    };

    return (
        <div className="confirm-email-container">
            <div className="confirm-email-content">
                <div className="confirm-email-card">
                    {status === 'loading' && (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <h2>Confirmando tu email...</h2>
                            <p>Por favor espera mientras verificamos tu cuenta.</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="success-state">
                            <div className="success-icon">✅</div>
                            <h2>¡Email confirmado exitosamente!</h2>
                            <p>{message}</p>
                            <p>Serás redirigido al inicio de sesión automáticamente...</p>
                            <Link to="/login" className="login-button">
                                Ir a Iniciar Sesión
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="error-state">
                            <div className="error-icon">❌</div>
                            <h2>Error de confirmación</h2>
                            <p>{message}</p>
                            <div className="error-actions">
                                <Link to="/register" className="register-button">
                                    Registrarse de nuevo
                                </Link>
                                <Link to="/login" className="login-button">
                                    Ir a Iniciar Sesión
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfirmEmail; 
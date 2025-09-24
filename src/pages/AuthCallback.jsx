import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { validateTokenWithServer } from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(true);
    const { checkTokenValidity } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            setIsProcessing(true);
            const googleAuth = searchParams.get('google_auth');
            const error = searchParams.get('error');

            console.log('AuthCallback - URL completa:', window.location.href);
            console.log('AuthCallback - parámetros:', { googleAuth, error });
            console.log('AuthCallback - todos los parámetros:', Object.fromEntries(searchParams.entries()));

            if (googleAuth === 'success') {
                try {
                    // Esperar un poco para que la cookie se establezca completamente
                    console.log('Esperando establecimiento de cookie...');
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    console.log('Validando autenticación con Google...');
                    const validation = await validateTokenWithServer();

                    if (validation.isValid && validation.user) {
                        console.log('Usuario validado exitosamente:', validation.user);

                        // Actualizar localStorage para mantener sincronización
                        localStorage.setItem('user', JSON.stringify(validation.user));

                        // Disparar evento personalizado para que AuthContext revalide
                        window.dispatchEvent(new CustomEvent('google-auth-success', {
                            detail: { user: validation.user }
                        }));

                        toast.success('¡Autenticación con Google exitosa!', {
                            position: 'top-right',
                            autoClose: 3000,
                        });

                        // Redirigir al dashboard después de un breve delay
                        setTimeout(() => {
                            console.log('Redirigiendo a dashboard...');
                            navigate('/', { replace: true });
                        }, 1500);
                    } else {
                        console.error('Validación falló:', validation);
                        throw new Error('No se pudo validar la autenticación');
                    }
                } catch (error) {
                    console.error('Error al completar autenticación de Google:', error);

                    // Si es un error 401, significa que la sesión no se estableció correctamente
                    if (error.response?.status === 401) {
                        toast.error('La sesión no se pudo establecer correctamente. Intenta iniciar sesión manualmente.', {
                            position: 'top-right',
                            autoClose: 5000,
                        });
                    } else {
                        toast.error('Error al completar la autenticación. Inténtalo de nuevo.', {
                            position: 'top-right',
                            autoClose: 5000,
                        });
                    }

                    navigate('/login', { replace: true });
                } finally {
                    setIsProcessing(false);
                }
            } else if (error) {
                setIsProcessing(false);
                let errorMessage = 'Error en la autenticación con Google.';

                switch (error) {
                    case 'google_auth_failed':
                        errorMessage = 'Error en la autenticación con Google. Inténtalo de nuevo.';
                        break;
                    case 'server_error':
                        errorMessage = 'Error del servidor. Inténtalo más tarde.';
                        break;
                    default:
                        errorMessage = 'Error desconocido. Inténtalo de nuevo.';
                }

                toast.error(errorMessage, {
                    position: 'top-right',
                    autoClose: 5000,
                });
                navigate('/login', { replace: true });
            } else {
                // No hay parámetros reconocidos, redirigir a login
                setIsProcessing(false);
                console.log('No hay parámetros de autenticación, redirigiendo a login');
                toast.info('No se encontraron parámetros de autenticación válidos.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
                navigate('/login', { replace: true });
            }
        };

        handleCallback();
    }, [searchParams, navigate, checkTokenValidity]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#f5f5f5'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #3498db',
                    borderRadius: '50%',
                    animation: 'spin 2s linear infinite',
                    margin: '0 auto 1rem'
                }}></div>
                <h3 style={{ margin: '0 0 0.5rem', color: '#333' }}>
                    {isProcessing ? 'Completando autenticación...' : 'Redirigiendo...'}
                </h3>
                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                    {isProcessing
                        ? 'Por favor espera mientras procesamos tu información.'
                        : 'Serás redirigido automáticamente.'
                    }
                </p>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AuthCallback; 
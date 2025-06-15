import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { validateTokenWithServer } from '../axiosConfig';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const handleCallback = async () => {
            setIsProcessing(true);
            const googleAuth = searchParams.get('google_auth');
            const error = searchParams.get('error');

            console.log('AuthCallback - parámetros:', { googleAuth, error });

            if (googleAuth === 'success') {
                try {
                    // Esperar un poco para que la cookie se establezca completamente
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    console.log('Validando autenticación con Google...');
                    const validation = await validateTokenWithServer();

                    if (validation.isValid && validation.user) {
                        console.log('Usuario validado exitosamente:', validation.user);

                        // Actualizar localStorage para mantener sincronización
                        localStorage.setItem('user', JSON.stringify(validation.user));

                        toast.success('¡Autenticación con Google exitosa!', {
                            position: 'top-right',
                            autoClose: 3000,
                        });

                        // Redirigir al dashboard después de un breve delay
                        setTimeout(() => {
                            navigate('/', { replace: true });
                        }, 1000);
                    } else {
                        throw new Error('No se pudo validar la autenticación');
                    }
                } catch (error) {
                    console.error('Error al completar autenticación de Google:', error);
                    toast.error('Error al completar la autenticación. Inténtalo de nuevo.', {
                        position: 'top-right',
                        autoClose: 5000,
                    });
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
                navigate('/login', { replace: true });
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

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
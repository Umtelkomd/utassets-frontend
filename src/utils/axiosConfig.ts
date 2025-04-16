import axios from 'axios';
import { toast } from 'react-toastify';

// Crear una instancia de Axios con la URL base
const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5050/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 segundos de timeout
});

// Interceptor para añadir el token de autenticación a las peticiones
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Si el error es de autenticación (401), redirigir a login
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }

        // Manejar otros errores comunes
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    toast.error(data.message || 'Error en la solicitud');
                    break;
                case 403:
                    toast.error('No tienes permisos para realizar esta acción');
                    break;
                case 404:
                    toast.error('Recurso no encontrado');
                    break;
                case 500:
                    toast.error('Error interno del servidor');
                    break;
                default:
                    toast.error('Ha ocurrido un error inesperado');
            }
        } else if (error.request) {
            toast.error('No se pudo conectar con el servidor');
        } else {
            toast.error('Error al procesar la solicitud');
        }

        return Promise.reject(error);
    }
);

export default apiClient; 
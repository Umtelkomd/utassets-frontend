import axios from 'axios';
import config from './config';

// Configurar la URL base de la API usando config.js
const API_URL = config.apiUrl;
// const isProduction = process.env.NODE_ENV === 'production';
const isProduction = false; // Forzar mostrar logs siempre

// Crear instancia de axios con la URL base
const instance = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación y manejar headers
instance.interceptors.request.use(
  (config) => {
    // Mostrar siempre la solicitud en consola
    console.log(`Enviando solicitud a: ${config.url}`, config);
    
    // Intentar obtener token de ambas posibles claves (para compatibilidad)
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      
      // Verificar token expirado antes de enviar
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < currentTime) {
          console.warn('Token expirado, redirigiendo al login');
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login?expired=true';
          return Promise.reject(new Error('Token expirado'));
        }
      } catch (e) {
        // Error al decodificar token, probablemente inválido
        console.error('Error al decodificar token:', e);
      }
    }

    // Si los datos son FormData, asegurarse de que el Content-Type sea multipart/form-data
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    
    // Sanitizar datos para prevenir XSS
    if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
      config.data = JSON.parse(
        JSON.stringify(config.data)
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
      );
    }

    return config;
  },
  (error) => {
    console.error('Error en la configuración de la solicitud:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
instance.interceptors.response.use(
  (response) => {
    console.log(`Respuesta recibida de ${response.config.url} con estado: ${response.status}`, response);
    return response;
  },
  (error) => {
    // Mostrar información detallada sobre el error para debug
    console.error('Error completo:', error);
    
    if (error.response) {
      console.error(`Error en respuesta de ${error.config?.url}:`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // La petición fue hecha y el servidor respondió con un código de estado
      // que no está en el rango 2xx
      
      if (error.response.status === 401) {
        // Token expirado o inválido, redirigir a login
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login?session=expired';
      } else if (error.response.status === 403) {
        // Acceso prohibido, redirigir a una página de acceso denegado
        window.location.href = '/forbidden';
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('Error de conexión, no se recibió respuesta:', error.request);
      
      // Mostrar mensaje al usuario sobre problemas de conexión
      const event = new CustomEvent('api-connection-error', { detail: { message: 'Error de conexión con el servidor' } });
      window.dispatchEvent(event);
    } else {
      // Algo ocurrió en la configuración de la petición que provocó un error
      console.error('Error en la configuración de la petición:', error.message);
    }
    return Promise.reject(error);
  }
);

export default instance; 
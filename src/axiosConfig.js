import axios from 'axios';

// Configurar la URL base de la API
// const API_URL = process.env.REACT_APP_API_URL || 'https://utassets-backend.onrender.com/api';
const API_URL = 'https://utassets-backend.onrender.com/api';
const isProduction = process.env.NODE_ENV === 'production';

// Crear instancia de axios con la URL base
const instance = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
  // Solo usar withCredentials en producción o si realmente se necesita para cookies cruzadas
  withCredentials: isProduction,
});

// Interceptor para añadir el token de autenticación y manejar headers
instance.interceptors.request.use(
  (config) => {
    if (!isProduction) {
      console.log(`Enviando solicitud a: ${config.url}`);
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      
      // Verificar token expirado antes de enviar
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < currentTime) {
          if (!isProduction) {
            console.warn('Token expirado, redirigiendo al login');
          }
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login?expired=true';
          return Promise.reject(new Error('Token expirado'));
        }
      } catch (e) {
        // Error al decodificar token, probablemente inválido
        if (!isProduction) {
          console.error('Error al decodificar token:', e);
        }
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
    if (!isProduction) {
      console.error('Error en la configuración de la solicitud:', error);
    }
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
instance.interceptors.response.use(
  (response) => {
    if (!isProduction) {
      console.log(`Respuesta recibida de ${response.config.url} con estado: ${response.status}`);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // La petición fue hecha y el servidor respondió con un código de estado
      // que no está en el rango 2xx
      if (!isProduction) {
        console.error(`Error en respuesta de ${error.config?.url}:`, {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      
      if (error.response.status === 401) {
        // Token expirado o inválido, redirigir a login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?session=expired';
      } else if (error.response.status === 403) {
        // Acceso prohibido, redirigir a una página de acceso denegado
        window.location.href = '/forbidden';
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      if (!isProduction) {
        console.error('Error de conexión, no se recibió respuesta');
      }
      // Mostrar mensaje al usuario sobre problemas de conexión
      const event = new CustomEvent('api-connection-error', { detail: { message: 'Error de conexión con el servidor' } });
      window.dispatchEvent(event);
    } else {
      // Algo ocurrió en la configuración de la petición que provocó un error
      if (!isProduction) {
        console.error('Error en la configuración de la petición:', error.message);
      }
    }
    return Promise.reject(error);
  }
);

export default instance; 
import axios from 'axios';

// Configurar la URL base de la API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';
console.log('URL base de la API configurada:', API_URL);

// Crear instancia de axios con la URL base
const instance = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para añadir el token de autenticación y manejar headers
instance.interceptors.request.use(
  (config) => {
    console.log(`Enviando solicitud a: ${config.baseURL}${config.url}`, config.method);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Token incluido en la solicitud');
    } else {
      console.warn('No se encontró token de autenticación');
    }

    // Si los datos son FormData, asegurarse de que el Content-Type sea multipart/form-data
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
      console.log('Configurando headers para FormData');
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
    console.log(`Respuesta recibida de ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      // La petición fue hecha y el servidor respondió con un código de estado
      // que no está en el rango 2xx
      console.error(`Error en respuesta de ${error.config?.url}:`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      
      if (error.response.status === 401) {
        // Token expirado o inválido, redirigir a login
        console.error('Error 401: Unauthorized - Sesión expirada o token inválido');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('Error de conexión, no se recibió respuesta:', error.request);
    } else {
      // Algo ocurrió en la configuración de la petición que provocó un error
      console.error('Error en la configuración de la petición:', error.message);
    }
    return Promise.reject(error);
  }
);

export default instance; 
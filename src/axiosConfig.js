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
  withCredentials: true, // Habilitar cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para verificar si el token está expirado
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp && payload.exp < currentTime;
  } catch (e) {
    console.error('Error al decodificar token:', e);
    return true; // Si no se puede decodificar, considerar expirado
  }
};

// Función para hacer logout automático
const performAutoLogout = (reason = 'expired') => {
  console.warn(`Realizando logout automático: ${reason}`);
  
  // Verificar si hay datos de sesión antes de limpiar
  const hadToken = localStorage.getItem('token') || localStorage.getItem('authToken');
  const hadUser = localStorage.getItem('user');
  
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
    // Disparar evento personalizado para notificar a otros componentes
    window.dispatchEvent(new CustomEvent('auto-logout', { 
      detail: { reason, message: 'Sesión expirada. Por favor, inicia sesión nuevamente.' }
    }));
    
    // Redirigir solo si no estamos ya en login (incluyendo bas
  // Solo disparar eventos y redirigir si realmente había una sesión activa
  if (hadToken || hadUser) {
    // Disparar evento personalizado para notificar a otros componentes
    window.dispatchEvent(new CustomEvent('auto-logout', { 
      detail: { reason, message: 'Sesión expirada. Por favor, inicia sesión nuevamente.' }
    }));
    
    // Obtener la URL base actual y construir la ruta de login correctamente
    const currentPath = window.location.pathname;
    const basePath = process.env.PUBLIC_URL || '';
    
    // Redirigir solo si no estamos ya en login
    if (!currentPath.includes('/login')) {
      window.location.href = `${basePath}/login?${reason}=true`;
    }
  }
};

// Interceptor para añadir el token de autenticación y manejar headers
instance.interceptors.request.use(
  (config) => {
    // Mostrar siempre la solicitud en consola
    if (!isProduction) {
      console.log(`Enviando solicitud a: ${config.url}`, config);
    }
    
    // Intentar obtener token de ambas posibles claves (para compatibilidad)
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      // Verificar si el token está expirado antes de enviar la request
      if (isTokenExpired(token)) {
        performAutoLogout('expired');
        return Promise.reject(new Error('Token expirado'));
      }
      
      config.headers['Authorization'] = `Bearer ${token}`;
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
    if (!isProduction) {
      console.log(`Respuesta recibida de ${response.config.url} con estado: ${response.status}`, response);
    }
    return response;
  },
  (error) => {
    // Mostrar información detallada sobre el error para debug
    if (!isProduction) {
      console.error('Error completo:', error);
    }
    
    if (error.response) {
      if (!isProduction) {
        console.error(`Error en respuesta de ${error.config?.url}:`, {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      // Manejar diferentes códigos de error
      switch (error.response.status) {
        case 401:
          // Solo realizar logout automático si NO es una solicitud de login
          const isLoginRequest = error.config?.url?.includes('/auth/login');
          const isAuthMeRequest = error.config?.url?.includes('/auth/me');
          
          if (!isLoginRequest) {
            // Para /auth/me, solo hacer logout si había un token almacenado
            if (isAuthMeRequest) {
              const hasStoredToken = localStorage.getItem('token') || localStorage.getItem('authToken');
              if (hasStoredToken) {
                // Token expirado, inválido o no autorizado
                const errorMessage = error.response.data?.message || 'No autorizado';
                if (errorMessage.toLowerCase().includes('token') || 
                    errorMessage.toLowerCase().includes('expired') ||
                    errorMessage.toLowerCase().includes('invalid')) {
                  performAutoLogout('invalid');
                } else {
                  performAutoLogout('unauthorized');
                }
              }
              // Si no hay token almacenado, no hacer logout automático
            } else {
              // Para otras rutas, hacer logout normalmente
              const errorMessage = error.response.data?.message || 'No autorizado';
              if (errorMessage.toLowerCase().includes('token') || 
                  errorMessage.toLowerCase().includes('expired') ||
                  errorMessage.toLowerCase().includes('invalid')) {
                performAutoLogout('invalid');
              } else {
                performAutoLogout('unauthorized');
              }
            }
          }
          // Si es una solicitud de login, dejar que el componente maneje el error
          break;
          
        case 403:
          // Acceso prohibido - usuario sin permisos suficientes
          console.warn('Acceso prohibido - permisos insuficientes');
          window.dispatchEvent(new CustomEvent('access-forbidden', { 
            detail: { message: 'No tienes permisos para realizar esta acción' }
          }));
          break;
          
        case 404:
          // Recurso no encontrado
          console.warn('Recurso no encontrado:', error.config?.url);
          break;
          
        case 500:
          // Error interno del servidor
          console.error('Error interno del servidor');
          window.dispatchEvent(new CustomEvent('server-error', { 
            detail: { message: 'Error interno del servidor. Intenta nuevamente.' }
          }));
          break;
          
        default:
          // Otros errores HTTP
          if (!isProduction) {
            console.error(`Error HTTP ${error.response.status}:`, error.response.data);
          }
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('Error de conexión, no se recibió respuesta:', error.request);
      
      // Mostrar mensaje al usuario sobre problemas de conexión
      window.dispatchEvent(new CustomEvent('api-connection-error', { 
        detail: { message: 'Error de conexión con el servidor. Verifica tu conexión a internet.' }
      }));
    } else {
      // Algo ocurrió en la configuración de la petición que provocó un error
      console.error('Error en la configuración de la petición:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Función para verificar la validez del token con el servidor
export const validateTokenWithServer = async () => {
  try {
    const response = await instance.get('/auth/me');
    return { isValid: true, user: response.data };
  } catch (error) {
    return { isValid: false, error: error.response?.data?.message || 'Token inválido' };
  }
};

export default instance; 
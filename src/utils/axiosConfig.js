import axios from 'axios';

// Obtener la URL base de las variables de entorno
const baseURL = process.env.REACT_APP_API_URL || '';

// No necesitamos añadir /api manualmente ya que viene en la variable de entorno
console.log('URL base configurada para API:', baseURL);

// Crear una instancia de Axios con la URL base
const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Aumentar timeout para permitir peticiones más lentas
  timeout: 10000
});

// Convertir los datos a JSON string para logs más detallados
const stringifyDataForLogs = (data) => {
  try {
    return typeof data === 'object' ? JSON.stringify(data) : data;
  } catch (e) {
    return 'Error al serializar datos';
  }
};

// Interceptor para añadir el token de autenticación a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log para depuración con URL completa
    console.log(`Realizando petición a: ${config.url}`);
    console.log(`URL completa: ${baseURL}${config.url}`);
    console.log(`Método: ${config.method.toUpperCase()}`);
    
    // Log detallado de la data que se envía (solo para POST/PUT)
    if (config.data && ['post', 'put'].includes(config.method)) {
      console.log(`Datos enviados: ${stringifyDataForLogs(config.data)}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Error en la configuración de la petición:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => {
    // Log para depuración
    console.log(`Respuesta exitosa de: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    // Log detallado del error para depuración
    console.error('Error en petición:', {
      url: error.config?.url || 'No disponible',
      fullUrl: error.config?.baseURL + error.config?.url || 'No disponible',
      method: error.config?.method || 'No disponible',
      status: error.response?.status || 'No disponible',
      data: error.response?.data || 'No disponible',
      headers: error.config?.headers || 'No disponible',
      requestData: error.config?.data ? stringifyDataForLogs(error.config.data) : 'No disponible',
      message: error.message || 'No disponible'
    });
    
    // Verificar si el error es de autenticación (401)
    if (error.response && error.response.status === 401) {
      // Comprobar si es una ruta de reportes para manejar de forma especial durante integración
      const url = error.config?.url || '';
      const isReportsRoute = url.includes('/reports') || url.includes('/comments');
      
      if (isReportsRoute) {
        // Durante la integración, solo mostrar advertencia sin cerrar sesión para rutas de reportes
        console.warn('Error 401 en ruta de reportes:', url);
        console.warn('Posible problema de integración con backend, no se cerrará sesión');
      } else {
        // Para otras rutas, cerrar sesión normalmente
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    // Personalizar errores específicos para algunos tipos de fallos comunes
    if (error.code === 'ECONNABORTED') {
      error.message = 'Tiempo de espera agotado al conectar con el servidor';
    } else if (!error.response) {
      error.message = 'No se pudo conectar con el servidor, verifique su conexión';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 
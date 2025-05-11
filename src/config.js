// Configuración centralizada de la aplicación
const config = {
  // URL base de la API - Reemplaza con la URL de tu API en producción
  apiUrl: (() => {
    // Obtener la URL base del entorno o usar la URL por defecto
    const url = process.env.REACT_APP_API_URL || 'https://utassets-backend.onrender.com/api';
    // Asegurarse de que la URL termine con /api
    return url.endsWith('/api') ? url : `${url}/api`;
  })(),
  
  // URL base de la aplicación - Usada para rutas absolutas
  baseUrl: '/utassets',
  
  // Otras configuraciones
  appName: 'UTAssets',
  isProduction: process.env.NODE_ENV === 'production',
};

export default config; 
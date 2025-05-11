// Configuración centralizada de la aplicación
const config = {
  // URL base de la API - Reemplaza con la URL de tu API en producción
  apiUrl: (() => {
    // Obtener la URL base del entorno o usar la URL por defecto
    let apiUrl = process.env.REACT_APP_API_URL || 'https://utassets-backend.onrender.com/api';
    console.log('URL base configurada para API (config.js):', apiUrl);
    return apiUrl;
  })(),
  
  // URL base de la aplicación - Usada para rutas absolutas
  baseUrl: '/utassets',
  
  // Otras configuraciones
  appName: 'UTAssets',
  isProduction: process.env.NODE_ENV === 'production',
};

export default config; 
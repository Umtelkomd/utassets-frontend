// Configuración centralizada de la aplicación
const config = {
  // URL base de la API
  apiUrl: (() => {
    const baseApiUrl = process.env.REACT_APP_API_URL || 'https://utassets-backend.onrender.com';
    const finalUrl = baseApiUrl.endsWith('/api') ? baseApiUrl : `${baseApiUrl}/api`;
    return finalUrl;
  })(),
  
  // URL base de la aplicación - Usada para rutas absolutas
  baseUrl: process.env.PUBLIC_URL || '',
  
  // Otras configuraciones
  appName: 'UTAssets',
  isProduction: false, // Forzar modo desarrollo para mostrar logs
  
  // Configuración de debug
  debug: {
    showAllLogs: true,
    logApiCalls: true,
    logErrors: true
  }
};

export default config;
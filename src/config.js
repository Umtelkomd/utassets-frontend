// Configuración centralizada de la aplicación
const config = {
  // URL base de la API
  apiUrl: (() => {
    const baseApiUrl = process.env.REACT_APP_API_URL || 'https://utassets-backend.onrender.com';
    const finalUrl = baseApiUrl.endsWith('/api') ? baseApiUrl : `${baseApiUrl}/api`;
    console.log('URL base configurada para API (config.js):', finalUrl);
    return finalUrl;
  })(),
  
  // URL base de la aplicación - Usada para rutas absolutas
  baseUrl: '/utassets',
  
  // Otras configuraciones
  appName: 'UTAssets',
  isProduction: process.env.NODE_ENV === 'production',
};

export default config;
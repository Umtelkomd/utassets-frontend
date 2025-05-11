// Script para generar el archivo .env.production
const fs = require('fs');

// URL de la API en producción
const REACT_APP_API_URL = 'https://utassets-backend.onrender.com';
// Si tienes otras variables de entorno para producción, añádelas aquí

// Contenido del archivo .env.production
const envFileContent = `REACT_APP_API_URL=${REACT_APP_API_URL}
NODE_ENV=production
`;

// Escribir el archivo
fs.writeFileSync('.env.production', envFileContent);

console.log('✅ Archivo .env.production generado correctamente'); 
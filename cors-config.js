/**
 * Configuración CORS para el backend
 * Añade este archivo a tu proyecto backend y asegúrate de importarlo y usarlo 
 * en tu archivo principal (app.js, server.js o index.js)
 */

const corsOptions = {
  // Orígenes permitidos (frontend)
  origin: [
    'http://localhost:3000',           // Desarrollo local
    'http://127.0.0.1:3000',           // Alternativa desarrollo local
    'https://tu-dominio.com',          // Producción (reemplaza con tu dominio real)
    'http://tu-ip-publica'             // IP pública (reemplaza con tu IP)
  ],
  // Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  // Cabeceras permitidas
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  // Cabeceras expuestas al cliente
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  // ¿Permitir cookies?
  credentials: true,
  // Tiempo de caché para la respuesta preflight OPTIONS (en segundos)
  maxAge: 86400
};

module.exports = corsOptions;

/**
 * Ejemplo de uso en tu servidor Express:
 * 
 * const express = require('express');
 * const cors = require('cors');
 * const corsOptions = require('./cors-config');
 * 
 * const app = express();
 * 
 * // Aplicar CORS con las opciones definidas
 * app.use(cors(corsOptions));
 * 
 * // Resto de tu configuración y rutas...
 */ 
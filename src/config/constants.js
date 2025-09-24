// URL base de la API
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://utassets-backend.onrender.com/api';

// Otros endpoints
export const AUTH_ENDPOINT = `${API_BASE_URL}/auth`;
export const INVENTORY_ENDPOINT = `${API_BASE_URL}/inventory`;
export const RENTAL_ENDPOINT = `${API_BASE_URL}/rentals`;

// Configuración de la aplicación
export const APP_CONFIG = {
    APP_NAME: 'UT Assets',
    VERSION: '1.0.0',
    DEFAULT_LANGUAGE: 'es',
    DATE_FORMAT: 'DD/MM/YYYY',
    CURRENCY: 'USD',
    CURRENCY_SYMBOL: '$'
}; 
// Constantes relacionadas con la API y endpoints

// Endpoints principales
export const API_ENDPOINTS = {
    // Autenticación
    AUTH: '/auth',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    
    // Recursos principales
    USERS: '/users',
    VEHICLES: '/vehicles',
    INVENTORY: '/inventory',
    PROJECTS: '/projects',
    RENTALS: '/rentals',
    FINANCINGS: '/financings',
    CATEGORIES: '/categories',
    
    // Reportes (múltiples posibilidades debido a inconsistencias del backend)
    REPORTS: ['/reports', '/report'],
    COMMENTS: ['/comments', '/comment']
};

// Configuración de timeouts
export const API_CONFIG = {
    TIMEOUT: 15000, // 15 segundos
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 segundo
};

// Códigos de estado HTTP más comunes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};
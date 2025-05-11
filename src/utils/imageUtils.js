import config from '../config';

// Función para obtener la URL base de la API sin el /api
export const getBaseUrl = () => {
    // Si viene de las variables de entorno, quitar /api si existe
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL.replace(/\/api$/, '');
    }
    
    // Si viene del config, quitar /api siempre (sabemos que termina en /api)
    return config.apiUrl.replace(/\/api$/, '');
};

// Función para construir la URL completa de una imagen
export const getImageUrl = (path, type = 'users') => {
    if (!path) return null;
    return `${getBaseUrl()}/uploads/${type}/${path}`;
};

// Tipos de imágenes disponibles
export const IMAGE_TYPES = {
    USERS: 'users',
    VEHICLES: 'vehicles',
    INVENTORY: 'inventory'
}; 
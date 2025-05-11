import config from '../config';

// Función para obtener la URL base de la API sin el /api
export const getBaseUrl = () => {
    return process.env.REACT_APP_API_URL?.replace('/api', '') || config.apiUrl.replace('/api', '');
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
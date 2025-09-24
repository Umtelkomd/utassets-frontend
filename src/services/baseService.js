import apiClient from '../axiosConfig';

/**
 * Servicio base genérico para operaciones CRUD comunes
 * Reduce la duplicación de código en todos los servicios
 */
export class BaseService {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    async getAll() {
        try {
            const response = await apiClient.get(this.endpoint);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener ${this.endpoint}:`, error);
            throw error;
        }
    }

    async getById(id) {
        try {
            const response = await apiClient.get(`${this.endpoint}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener ${this.endpoint}/${id}:`, error);
            throw error;
        }
    }

    async create(data) {
        try {
            const response = await apiClient.post(this.endpoint, data);
            return response.data;
        } catch (error) {
            console.error(`Error al crear en ${this.endpoint}:`, error);
            throw error;
        }
    }

    async update(id, data) {
        try {
            const response = await apiClient.put(`${this.endpoint}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar ${this.endpoint}/${id}:`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            await apiClient.delete(`${this.endpoint}/${id}`);
        } catch (error) {
            console.error(`Error al eliminar ${this.endpoint}/${id}:`, error);
            throw error;
        }
    }
}

/**
 * Función helper para intentar múltiples endpoints
 * Útil cuando el backend tiene rutas inconsistentes
 */
export const tryMultipleEndpoints = async (method, paths, data = null) => {
    let lastError = null;

    for (const path of paths) {
        try {
            let response;

            switch (method.toLowerCase()) {
                case 'get':
                    response = await apiClient.get(path);
                    break;
                case 'post':
                    response = await apiClient.post(path, data);
                    break;
                case 'put':
                    response = await apiClient.put(path, data);
                    break;
                case 'delete':
                    response = await apiClient.delete(path);
                    break;
                default:
                    throw new Error(`Método HTTP no soportado: ${method}`);
            }

            return response.data;
        } catch (error) {
            console.warn(`Falló ruta ${path}:`, error.message);
            lastError = error;
        }
    }

    throw lastError || new Error('Todas las rutas fallaron');
};

/**
 * Función helper para validar campos requeridos
 */
export const validateRequiredFields = (data, requiredFields) => {
    for (const field of requiredFields) {
        if (!data[field]) {
            throw new Error(`Campo requerido faltante: ${field}`);
        }
    }
};

export default BaseService;
// @ts-check

/**
 * @typedef {Object} RentalItem
 * @property {string} [id]
 * @property {string} [_id]
 * @property {string} itemId
 * @property {string} startDate
 * @property {string} endDate
 * @property {number} dailyCost
 * @property {number} [peopleCount]
 * @property {number} total
 */

/**
 * @typedef {Object} AvailabilityParams
 * @property {string} itemId
 * @property {string} startDate
 * @property {string} endDate
 */

import apiClient from '../axiosConfig';

export const RentalType = {
    ITEM: 'item',
    VEHICLE: 'vehicle',
    HOUSING: 'housing'
};

/**
 * @returns {Promise<RentalItem[]>}
 */
export const getRentals = async () => {
    try {
        const response = await apiClient.get('/rentals');
        return response.data;
    } catch (error) {
        console.error('Error al obtener alquileres:', error);
        throw error;
    }
};

/**
 * @param {string} id
 * @returns {Promise<RentalItem>}
 */
export const getRentalById = async (id) => {
    try {
        const response = await apiClient.get(`/rentals/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener alquiler ${id}:`, error);
        throw error;
    }
};

/**
 * @param {Omit<RentalItem, 'id' | '_id'>} rentalData
 * @returns {Promise<RentalItem>}
 */
export const createRental = async (rentalData) => {
    try {
        const response = await apiClient.post('/rentals', rentalData);
        return response.data;
    } catch (error) {
        console.error('Error al crear alquiler:', error);
        throw error;
    }
};

/**
 * @param {string} id
 * @param {Partial<RentalItem>} rentalData
 * @returns {Promise<RentalItem>}
 */
export const updateRental = async (id, rentalData) => {
    try {
        const response = await apiClient.put(`/rentals/${id}`, rentalData);
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar alquiler ${id}:`, error);
        throw error;
    }
};

/**
 * @param {string} id
 * @returns {Promise<void>}
 */
export const deleteRental = async (id) => {
    try {
        await apiClient.delete(`/rentals/${id}`);
    } catch (error) {
        console.error(`Error al eliminar alquiler ${id}:`, error);
        throw error;
    }
};

/**
 * @param {string} itemId
 * @returns {Promise<RentalItem[]>}
 */
export const getRentalsByItemId = async (itemId) => {
    try {
        const response = await apiClient.get(`/rentals/item/${itemId}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener alquileres del ítem ${itemId}:`, error);
        throw error;
    }
};

/**
 * @param {string} startDate
 * @param {string} endDate
 * @returns {Promise<RentalItem[]>}
 */
export const getRentalsByDateRange = async (startDate, endDate) => {
    try {
        const response = await apiClient.get('/rentals/date-range', {
            params: { startDate, endDate }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener alquileres por rango de fechas:', error);
        throw error;
    }
};

/**
 * @param {string} type
 * @returns {Promise<RentalItem[]>}
 */
export const getRentalsByType = async (type) => {
    try {
        const response = await apiClient.get(`/rentals/type/${type}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener alquileres de tipo ${type}:`, error);
        throw error;
    }
};

/**
 * @param {string} objectId
 * @returns {Promise<RentalItem[]>}
 */
export const getRentalsByObject = async (objectId) => {
    try {
        const response = await apiClient.get(`/rentals/object/${objectId}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener alquileres del objeto ${objectId}:`, error);
        throw error;
    }
};

/**
 * @param {string} itemId
 * @param {string} startDate
 * @param {string} endDate
 * @returns {Promise<{available: boolean}>}
 */
export const checkAvailability = async (itemId, startDate, endDate) => {
    try {
        const response = await apiClient.get('/rentals/availability', {
            params: {
                itemId,
                startDate,
                endDate
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al verificar disponibilidad:', error);
        throw error;
    }
};

/**
 * @param {string} type
 * @returns {Promise<RentalItem[]>}
 */
export const getRentalFields = async (type) => {
    try {
        const response = await apiClient.get('/rentals/fields', {
            params: { type }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener campos del alquiler:', error);
        throw error;
    }
}; 
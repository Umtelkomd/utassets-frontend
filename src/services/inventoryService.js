import { BaseService } from './baseService';
import { API_BASE_URL } from '../config/constants';
import axios from 'axios';
import apiClient from '../axiosConfig';

const INVENTORY_ENDPOINT = `${API_BASE_URL}/inventory`;

/**
 * Normaliza un objeto de inventario para asegurarse de que tenga un formato consistente
 * @param {Object} item - El objeto de inventario a normalizar
 * @returns {Object} El objeto normalizado
 */
const normalizeInventoryItem = (item) => {
    // Normalizar responsibleUsers para asegurar formato correcto
    let responsibleUsers = [];
    if (item.responsibleUsers) {
        if (typeof item.responsibleUsers === 'string') {
            try {
                responsibleUsers = JSON.parse(item.responsibleUsers);
            } catch (e) {
                responsibleUsers = [];
            }
        } else if (Array.isArray(item.responsibleUsers)) {
            responsibleUsers = item.responsibleUsers.map(user => {
                if (typeof user === 'string') {
                    return { id: user, name: 'Usuario' };
                }
                return {
                    id: user.id || user._id || '',
                    name: user.name || user.fullName || user.username || ''
                };
            });
        }
    }

    return {
        id: item.id || item._id || '',
        itemName: item.itemName || item.name || '',
        itemCode: item.itemCode || item.code || '',
        category: item.category || '',
        quantity: Number(item.quantity) || 1,
        condition: item.condition || 'Bueno',
        location: item.location || '',
        acquisitionDate: item.acquisitionDate || null,
        responsibleUsers: responsibleUsers,
        notes: item.notes || '',
        imagePath: item.imagePath || null
    };
};

// Servicios de inventario con normalización
export const getInventory = async () => {
    try {
        // Intentar con el endpoint directo primero (por compatibilidad)
        const response = await axios.get(INVENTORY_ENDPOINT);
        return response.data.map(item => normalizeInventoryItem(item));
    } catch (error) {
        console.error('Error al obtener items del inventario:', error);
        // Si falla, intentar con apiClient
        try {
            const response = await apiClient.get('/inventory');
            return response.data.map(item => normalizeInventoryItem(item));
        } catch (secondError) {
            console.error('Error con apiClient también:', secondError);
            throw error;
        }
    }
};

export const getInventoryItemById = async (id) => {
    try {
        const response = await apiClient.get(`/inventory/${id}`);
        return normalizeInventoryItem(response.data);
    } catch (error) {
        console.error(`Error al obtener item ${id}:`, error);
        throw error;
    }
};

export const createInventoryItem = async (itemData) => {
    try {
        const response = await apiClient.post('/inventory', itemData);
        return normalizeInventoryItem(response.data);
    } catch (error) {
        throw error;
    }
};

export const updateInventoryItem = async (id, itemData) => {
    try {
        const response = await apiClient.put(`/inventory/${id}`, itemData);
        return normalizeInventoryItem(response.data);
    } catch (error) {
        throw error;
    }
};

export const deleteInventoryItem = async (id) => {
    try {
        await apiClient.delete(`/inventory/${id}`);
        return { success: true, id };
    } catch (error) {
        throw error;
    }
};

export const getCategories = async () => {
    try {
        const response = await apiClient.get('/categories');
        return response.data;
    } catch (error) {
        throw error;
    }
};
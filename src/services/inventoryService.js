import apiClient from '../utils/axiosConfig';

export const getInventory = async () => {
    try {
        const response = await apiClient.get('/inventory');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getInventoryItemById = async (id) => {
    try {
        const response = await apiClient.get(`/inventory/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createInventoryItem = async (itemData) => {
    try {
        const response = await apiClient.post('/inventory', itemData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateInventoryItem = async (id, itemData) => {
    try {
        const response = await apiClient.put(`/inventory/${id}`, itemData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteInventoryItem = async (id) => {
    try {
        await apiClient.delete(`/inventory/${id}`);
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
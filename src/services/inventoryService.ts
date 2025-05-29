import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import apiClient from '../utils/axiosConfig';

const INVENTORY_ENDPOINT = `${API_BASE_URL}/inventory`;

export interface InventoryItem {
    id: number;
    itemName: string;
    category: string;
    description?: string;
    dailyCost: number;
    status: string;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
}

export const getInventory = async () => {
    try {
        const response = await axios.get(INVENTORY_ENDPOINT);
        return response.data;
    } catch (error) {
        console.error('Error al obtener items del inventario:', error);
        throw error;
    }
};

export const getInventoryItemById = async (id: number) => {
    try {
        const response = await axios.get(`${INVENTORY_ENDPOINT}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener item ${id}:`, error);
        throw error;
    }
};

export const createInventoryItem = async (itemData: Omit<InventoryItem, 'id' | '_id'>): Promise<InventoryItem> => {
    try {
        const response = await apiClient.post<InventoryItem>('/inventory', itemData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateInventoryItem = async (id: string, itemData: Partial<InventoryItem>): Promise<InventoryItem> => {
    try {
        const response = await apiClient.put<InventoryItem>(`/inventory/${id}`, itemData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/inventory/${id}`);
    } catch (error) {
        throw error;
    }
};

export const getCategories = async (): Promise<Category[]> => {
    try {
        const response = await apiClient.get<Category[]>('/categories');
        return response.data;
    } catch (error) {
        throw error;
    }
}; 
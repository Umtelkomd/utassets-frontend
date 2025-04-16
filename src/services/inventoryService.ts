import apiClient from '../utils/axiosConfig';

export interface InventoryItem {
    id?: string;
    _id?: string;
    item_name: string;
    item_code: string;
    category: string;
    quantity: number;
    condition: string;
    location: string;
    responsible_person: string;
    brand?: string;
    model?: string;
    year?: number;
    license_plate?: string;
    fuel_type?: string;
    last_maintenance?: string;
    next_maintenance?: string;
    notes?: string;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
}

export const getInventoryItems = async (): Promise<InventoryItem[]> => {
    try {
        const response = await apiClient.get<InventoryItem[]>('/inventory');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getInventoryItemById = async (id: string): Promise<InventoryItem> => {
    try {
        const response = await apiClient.get<InventoryItem>(`/inventory/${id}`);
        return response.data;
    } catch (error) {
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
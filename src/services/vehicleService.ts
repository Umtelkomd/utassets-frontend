import apiClient from '../utils/axiosConfig';

export interface Vehicle {
    id?: string;
    _id?: string;
    item_name: string;
    item_code: string;
    category: string;
    quantity: number;
    condition: string;
    location: string;
    responsible_person: string;
    brand: string;
    model: string;
    year: number;
    license_plate: string;
    fuel_type: string;
    last_maintenance: string;
    next_maintenance: string;
    notes: string;
}

export const getVehicles = async (): Promise<Vehicle[]> => {
    try {
        const response = await apiClient.get<Vehicle[]>('/vehicles');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getVehicleById = async (id: string): Promise<Vehicle> => {
    try {
        const response = await apiClient.get<Vehicle>(`/vehicles/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createVehicle = async (vehicleData: Omit<Vehicle, 'id' | '_id'>): Promise<Vehicle> => {
    try {
        const response = await apiClient.post<Vehicle>('/vehicles', vehicleData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateVehicle = async (id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    try {
        const response = await apiClient.put<Vehicle>(`/vehicles/${id}`, vehicleData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteVehicle = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/vehicles/${id}`);
    } catch (error) {
        throw error;
    }
}; 
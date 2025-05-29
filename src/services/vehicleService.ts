import apiClient from '../utils/axiosConfig';

export interface Vehicle {
    id?: string;
    _id?: string;
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    color?: string | null;
    vehicleStatus: string;
    mileage?: number | null;
    fuelType: string;
    insuranceExpiryDate?: Date | null;
    technicalRevisionExpiryDate?: Date | null;
    notes?: string | null;
    imagePath?: string | null;
    responsibleUsers?: any[];
    createdAt?: Date;
    updatedAt?: Date;
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
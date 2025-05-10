import apiClient from '../utils/axiosConfig';

export const getVehicles = async () => {
    try {
        const response = await apiClient.get('/vehicles');
        return response.data;
    } catch (error) {
        
        throw error;
    }
};

export const getVehicleById = async (id) => {
    try {
        const response = await apiClient.get(`/vehicles/${id}`);
        return response.data;
    } catch (error) {
        
        throw error;
    }
};

export const createVehicle = async (vehicleData) => {
    try {
        const response = await apiClient.post('/vehicles', vehicleData);
        return response.data;
    } catch (error) {
        
        throw error;
    }
};

export const updateVehicle = async (id, vehicleData) => {
    try {
        const response = await apiClient.put(`/vehicles/${id}`, vehicleData);
        return response.data;
    } catch (error) {
        
        throw error;
    }
};

export const deleteVehicle = async (id) => {
    try {
        await apiClient.delete(`/vehicles/${id}`);
    } catch (error) {
        
        throw error;
    }
}; 
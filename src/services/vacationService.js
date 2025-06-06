import axiosInstance from '../axiosConfig';

export const vacationService = {
    // Obtener todas las vacaciones del año actual
    getAllVacations: async (year = null) => {
        try {
            const params = year ? { year } : {};
            const response = await axiosInstance.get('/vacations', { params });
            return response.data;
        } catch (error) {
            console.error('Error al obtener vacaciones:', error);
            throw error;
        }
    },

    // Obtener vacaciones de un usuario específico
    getUserVacations: async (userId, year = null) => {
        try {
            const params = year ? { year } : {};
            const response = await axiosInstance.get(`/vacations/users/${userId}`, { params });
            return response.data;
        } catch (error) {
            console.error('Error al obtener vacaciones del usuario:', error);
            throw error;
        }
    },

    // Obtener días disponibles de un usuario
    getUserAvailableDays: async (userId, year = null) => {
        try {
            const params = year ? { year } : {};
            const response = await axiosInstance.get(`/vacations/users/${userId}/available-days`, { params });
            return response.data;
        } catch (error) {
            console.error('Error al obtener días disponibles:', error);
            throw error;
        }
    },

    // Obtener resumen de días disponibles de todos los usuarios
    getAllUsersAvailableDays: async (year = null) => {
        try {
            const params = year ? { year } : {};
            const response = await axiosInstance.get('/vacations/users', { params });
            return response.data;
        } catch (error) {
            console.error('Error al obtener días disponibles de todos los usuarios:', error);
            throw error;
        }
    },

    // Crear una nueva vacación (puede ser múltiples días)
    createVacation: async (vacationData) => {
        try {
            const response = await axiosInstance.post('/vacations', vacationData);
            return response.data;
        } catch (error) {
            console.error('Error al crear vacación:', error);
            throw error;
        }
    },

    // Eliminar una vacación
    deleteVacation: async (vacationId) => {
        try {
            const response = await axiosInstance.delete(`/vacations/${vacationId}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar vacación:', error);
            throw error;
        }
    },

    // Obtener conflictos para una fecha específica
    getDateConflicts: async (date) => {
        try {
            const response = await axiosInstance.get(`/vacations/conflicts/${date}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener conflictos de fecha:', error);
            throw error;
        }
    },

    // Obtener vacaciones por rango de fechas
    getVacationsByDateRange: async (startDate, endDate) => {
        try {
            const response = await axiosInstance.get('/vacations/date-range', {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener vacaciones por rango de fechas:', error);
            throw error;
        }
    }
}; 
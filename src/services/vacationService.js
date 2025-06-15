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

    // Crear una nueva vacación/solicitud (puede ser múltiples días)
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

    // Eliminar múltiples vacaciones
    deleteBulkVacations: async (vacationIds) => {
        try {
            const response = await axiosInstance.delete('/vacations/bulk/multiple', {
                data: { vacationIds }
            });
            return response.data;
        } catch (error) {
            console.error('Error al eliminar vacaciones múltiples:', error);
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
    },

    // ========== NUEVAS FUNCIONES PARA GESTIÓN DE SOLICITUDES ==========

    // Obtener solicitudes de vacaciones pendientes (solo para administradores)
    getPendingVacations: async (year = null) => {
        try {
            const params = year ? { year } : {};
            const response = await axiosInstance.get('/vacations/pending', { params });
            return response.data;
        } catch (error) {
            console.error('Error al obtener solicitudes pendientes:', error);
            throw error;
        }
    },

    // Aprobar una solicitud de vacación
    approveVacation: async (vacationId) => {
        try {
            const response = await axiosInstance.put(`/vacations/${vacationId}/approve`);
            return response.data;
        } catch (error) {
            console.error('Error al aprobar vacación:', error);
            throw error;
        }
    },

    // Rechazar una solicitud de vacación
    rejectVacation: async (vacationId, reason = '') => {
        try {
            const response = await axiosInstance.delete(`/vacations/${vacationId}/reject`, {
                data: { reason }
            });
            return response.data;
        } catch (error) {
            console.error('Error al rechazar vacación:', error);
            throw error;
        }
    },

    // Aprobar múltiples solicitudes de vacación
    approveBulkVacations: async (vacationIds) => {
        try {
            const response = await axiosInstance.put('/vacations/approve/bulk', {
                vacationIds
            });
            return response.data;
        } catch (error) {
            console.error('Error al aprobar vacaciones múltiples:', error);
            throw error;
        }
    }
}; 
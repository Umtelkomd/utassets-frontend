import axiosInstance from '../axiosConfig';

// Estados de vacaciones para referencia
export const VacationStatus = {
    PENDING: 'pending',                 // Pendiente de aprobación
    FIRST_APPROVED: 'first_approved',   // Aprobada por el primer administrador  
    FULLY_APPROVED: 'fully_approved',   // Aprobada por ambos administradores
    REJECTED: 'rejected'                // Rechazada
};

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

    // ========== FUNCIONES PARA GESTIÓN DE SOLICITUDES CON DOBLE APROBACIÓN ==========

    // Obtener solicitudes de vacaciones pendientes (incluye pending y first_approved)
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

    // Obtener solicitudes de vacaciones pendientes agrupadas por períodos
    getPendingVacationsGrouped: async (year = null) => {
        try {
            const params = year ? { year } : {};
            const response = await axiosInstance.get('/vacations/pending/grouped', { params });
            return response.data;
        } catch (error) {
            console.error('Error al obtener solicitudes pendientes agrupadas:', error);
            throw error;
        }
    },

    // Aprobar un período completo de vacaciones
    approvePeriodVacations: async (vacationIds) => {
        try {
            const response = await axiosInstance.put('/vacations/approve/period', {
                vacationIds
            });
            return response.data;
        } catch (error) {
            console.error('Error al aprobar período de vacaciones:', error);
            throw error;
        }
    },

    // Rechazar un período completo de vacaciones
    rejectPeriodVacations: async (vacationIds, reason = '') => {
        try {
            const response = await axiosInstance.delete('/vacations/reject/period', {
                data: { vacationIds, reason }
            });
            return response.data;
        } catch (error) {
            console.error('Error al rechazar período de vacaciones:', error);
            throw error;
        }
    },

    // Aprobar una solicitud de vacación (sistema de doble aprobación)
    // - Si está en estado 'pending', pasa a 'first_approved'
    // - Si está en estado 'first_approved', pasa a 'fully_approved'
    approveVacation: async (vacationId) => {
        try {
            const response = await axiosInstance.put(`/vacations/${vacationId}/approve`);
            return response.data;
        } catch (error) {
            console.error('Error al aprobar vacación:', error);
            throw error;
        }
    },

    // Rechazar una solicitud de vacación (marca como 'rejected')
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

    // Aprobar múltiples solicitudes de vacación (ADVERTENCIA: Con doble aprobación puede ser confuso)
    // Este método procesa cada solicitud según su estado actual
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
    },

    // ========== FUNCIONES AUXILIARES PARA EL NUEVO SISTEMA ==========

    // Obtener el texto legible del estado de vacación
    getStatusText: (status) => {
        switch (status) {
            case VacationStatus.PENDING:
                return 'Pendiente de primera aprobación';
            case VacationStatus.FIRST_APPROVED:
                return 'Pendiente de segunda aprobación';
            case VacationStatus.FULLY_APPROVED:
                return 'Completamente aprobada';
            case VacationStatus.REJECTED:
                return 'Rechazada';
            default:
                return 'Estado desconocido';
        }
    },

    // Obtener el color del estado para la UI
    getStatusColor: (status) => {
        switch (status) {
            case VacationStatus.PENDING:
                return '#f39c12'; // Naranja
            case VacationStatus.FIRST_APPROVED:
                return '#3498db'; // Azul
            case VacationStatus.FULLY_APPROVED:
                return '#27ae60'; // Verde
            case VacationStatus.REJECTED:
                return '#e74c3c'; // Rojo
            default:
                return '#95a5a6'; // Gris
        }
    },

    // Verificar si una vacación necesita aprobaciones
    needsApproval: (vacation) => {
        return vacation.status === VacationStatus.PENDING || 
               vacation.status === VacationStatus.FIRST_APPROVED;
    },

    // Verificar si una vacación está completamente aprobada
    isFullyApproved: (vacation) => {
        return vacation.status === VacationStatus.FULLY_APPROVED;
    },

    // Verificar si una vacación está rechazada
    isRejected: (vacation) => {
        return vacation.status === VacationStatus.REJECTED;
    }
}; 
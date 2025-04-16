import apiClient from '../utils/axiosConfig';

export interface MaintenanceSchedule {
    id?: string;
    _id?: string;
    item_id: string;
    item_name: string;
    item_code: string;
    maintenance_type: string;
    scheduled_date: string;
    completed_date?: string;
    responsible_person: string;
    status: 'Pendiente' | 'En Progreso' | 'Completado' | 'Cancelado';
    priority: 'Alta' | 'Media' | 'Baja';
    location: string;
    technician?: string;
    notes?: string;
}

export const getMaintenanceSchedules = async (): Promise<MaintenanceSchedule[]> => {
    try {
        const response = await apiClient.get<MaintenanceSchedule[]>('/maintenance-schedules');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMaintenanceScheduleById = async (id: string): Promise<MaintenanceSchedule> => {
    try {
        const response = await apiClient.get<MaintenanceSchedule>(`/maintenance-schedules/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createMaintenanceSchedule = async (
    scheduleData: Omit<MaintenanceSchedule, 'id' | '_id'>
): Promise<MaintenanceSchedule> => {
    try {
        const response = await apiClient.post<MaintenanceSchedule>('/maintenance-schedules', scheduleData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateMaintenanceSchedule = async (
    id: string,
    scheduleData: Partial<MaintenanceSchedule>
): Promise<MaintenanceSchedule> => {
    try {
        const response = await apiClient.put<MaintenanceSchedule>(`/maintenance-schedules/${id}`, scheduleData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteMaintenanceSchedule = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/maintenance-schedules/${id}`);
    } catch (error) {
        throw error;
    }
};

export const completeMaintenanceSchedule = async (id: string): Promise<MaintenanceSchedule> => {
    try {
        const response = await apiClient.put<MaintenanceSchedule>(`/maintenance-schedules/${id}/complete`);
        return response.data;
    } catch (error) {
        throw error;
    }
}; 
import apiClient from '../utils/axiosConfig';

export interface Project {
    id?: string;
    _id?: string;
    name: string;
    project_code: string;
    description: string;
    location: string;
    start_date: string;
    end_date?: string;
    manager: string;
    status: 'activo' | 'completado' | 'cancelado' | 'en pausa';
    team: string[];
    created_at?: string;
    updated_at?: string;
}

export const getProjects = async (): Promise<Project[]> => {
    try {
        const response = await apiClient.get<Project[]>('/projects');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getProjectById = async (id: string): Promise<Project> => {
    try {
        const response = await apiClient.get<Project>(`/projects/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createProject = async (projectData: Omit<Project, 'id' | '_id' | 'created_at' | 'updated_at'>): Promise<Project> => {
    try {
        const response = await apiClient.post<Project>('/projects', projectData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateProject = async (id: string, projectData: Partial<Project>): Promise<Project> => {
    try {
        const response = await apiClient.put<Project>(`/projects/${id}`, projectData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteProject = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/projects/${id}`);
    } catch (error) {
        throw error;
    }
};

export const assignTeamMember = async (projectId: string, userId: string): Promise<Project> => {
    try {
        const response = await apiClient.post<Project>(`/projects/${projectId}/team`, { userId });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const removeTeamMember = async (projectId: string, userId: string): Promise<Project> => {
    try {
        const response = await apiClient.delete<Project>(`/projects/${projectId}/team/${userId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}; 
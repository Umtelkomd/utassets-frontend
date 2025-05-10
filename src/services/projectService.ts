import apiClient from '../utils/axiosConfig';

export interface Project {
    id: number;
    name: string;
    description: string | null;
    location: string;
    startDate: Date;
    endDate: Date | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export const getProjects = async (): Promise<Project[]> => {
    try {
        const response = await apiClient.get<Project[]>('/projects');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getProject = async (id: number): Promise<Project> => {
    try {
        const response = await apiClient.get<Project>(`/projects/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    try {
        const response = await apiClient.post<Project>('/projects', projectData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateProject = async (id: number, projectData: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Project> => {
    try {
        const response = await apiClient.put<Project>(`/projects/${id}`, projectData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteProject = async (id: number): Promise<void> => {
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
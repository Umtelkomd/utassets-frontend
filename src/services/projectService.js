import { BaseService } from './baseService';
import apiClient from '../axiosConfig';

// Crear instancia del servicio base para proyectos
const projectService = new BaseService('/projects');

// Métodos básicos CRUD usando BaseService
export const getProjects = projectService.getAll.bind(projectService);
export const getProject = projectService.getById.bind(projectService);
export const createProject = projectService.create.bind(projectService);
export const updateProject = projectService.update.bind(projectService);
export const deleteProject = projectService.delete.bind(projectService);

export const assignTeamMember = async (projectId, userId) => {
    try {
        const response = await apiClient.post(`/projects/${projectId}/team`, { userId });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const removeTeamMember = async (projectId, userId) => {
    try {
        const response = await apiClient.delete(`/projects/${projectId}/team/${userId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
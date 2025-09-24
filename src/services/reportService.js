import { tryMultipleEndpoints, validateRequiredFields } from './baseService';

// Obtener todos los reportes
export const getReports = async () => {
    try {
        const possiblePaths = [
            '/reports',
            '/report'
        ];

        return await tryMultipleEndpoints('get', possiblePaths);
    } catch (error) {
        console.error('Error al obtener reportes:', error);
        throw error;
    }
};

// Obtener un reporte por ID
export const getReportById = async (id) => {
    try {
        const possiblePaths = [
            `/reports/${id}`,
            `/report/${id}`
        ];

        return await tryMultipleEndpoints('get', possiblePaths);
    } catch (error) {
        console.error(`Error al obtener reporte ID ${id}:`, error);
        throw error;
    }
};

// Crear un nuevo reporte
export const createReport = async (reportData) => {
    try {
        // Validar campos requeridos usando el helper
        validateRequiredFields(reportData, ['title', 'description', 'priority']);

        const possiblePaths = [
            '/reports',
            '/report'
        ];

        return await tryMultipleEndpoints('post', possiblePaths, reportData);
    } catch (error) {
        console.error('Error detallado al crear reporte:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                data: error.config?.data
            }
        });

        // Reescribir el error para proporcionar más contexto
        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido al crear reporte';
        const enhancedError = new Error(errorMessage);
        throw enhancedError;
    }
};

// Actualizar un reporte
export const updateReport = async (id, reportData) => {
    try {
        const possiblePaths = [
            `/reports/${id}`,
            `/report/${id}`
        ];

        return await tryMultipleEndpoints('put', possiblePaths, reportData);
    } catch (error) {
        console.error(`Error al actualizar reporte ID ${id}:`, error);
        throw error;
    }
};

// Eliminar un reporte
export const deleteReport = async (id) => {
    try {
        const possiblePaths = [
            `/reports/${id}`,
            `/report/${id}`
        ];

        await tryMultipleEndpoints('delete', possiblePaths);
    } catch (error) {
        console.error(`Error al eliminar reporte ID ${id}:`, error);
        throw error;
    }
};

// Añadir un comentario a un reporte
export const addComment = async (reportId, commentData) => {
    try {
        const possiblePaths = [
            `/reports/${reportId}/comments`,
            `/report/${reportId}/comments`,
            `/reports/${reportId}/comment`,
            `/comments/${reportId}`
        ];

        return await tryMultipleEndpoints('post', possiblePaths, commentData);
    } catch (error) {
        console.error(`Error al añadir comentario al reporte ID ${reportId}:`, error);
        throw error;
    }
};

// Obtener comentarios de un reporte
export const getReportComments = async (reportId) => {
    try {
        const possiblePaths = [
            `/comments/report/${reportId}`,
            `/reports/${reportId}/comments`
        ];

        return await tryMultipleEndpoints('get', possiblePaths);
    } catch (error) {
        console.error(`Error al obtener comentarios del reporte ID ${reportId}:`, error);
        throw error;
    }
};

// Actualizar un comentario
export const updateComment = async (commentId, commentData) => {
    try {
        const possiblePaths = [
            `/comments/${commentId}`,
            `/comment/${commentId}`
        ];

        return await tryMultipleEndpoints('put', possiblePaths, commentData);
    } catch (error) {
        console.error(`Error al actualizar comentario ID ${commentId}:`, error);
        throw error;
    }
};

// Eliminar un comentario
export const deleteComment = async (commentId) => {
    try {
        const possiblePaths = [
            `/comments/${commentId}`,
            `/comment/${commentId}`
        ];

        await tryMultipleEndpoints('delete', possiblePaths);
    } catch (error) {
        console.error(`Error al eliminar comentario ID ${commentId}:`, error);
        throw error;
    }
};

// Obtener los reportes asociados a un elemento
export const getItemReports = async (itemType, itemId) => {
    try {
        const possiblePaths = [
            `/reports/item/${itemType}/${itemId}`,
            `/report/item/${itemType}/${itemId}`
        ];

        return await tryMultipleEndpoints('get', possiblePaths);
    } catch (error) {
        console.error(`Error al obtener reportes del item ${itemType} ID ${itemId}:`, error);
        throw error;
    }
};
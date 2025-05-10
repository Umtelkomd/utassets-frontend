import apiClient from '../utils/axiosConfig';

export interface ReportComment {
    id: number;
    reportId: number;
    userId: number;
    userName: string;
    userRole: string;
    content: string;
    createdAt: Date;
}

export interface Report {
    id: number;
    title: string;
    description: string;
    status: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';
    priority: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
    createdBy: {
        id: number;
        name: string;
        role: string;
    };
    assignedTo?: {
        id: number;
        name: string;
        role: string;
    };
    createdAt: Date;
    updatedAt: Date;
    comments: ReportComment[];
    relatedItemId?: number;
    relatedItemType?: 'INVENTARIO' | 'VEHICULO';
    relatedItemName?: string;
}

export interface CreateReportDTO {
    title: string;
    description: string;
    priority: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
    relatedItemId?: number;
    relatedItemType?: 'INVENTARIO' | 'VEHICULO';
}

export interface UpdateReportDTO {
    title?: string;
    description?: string;
    status?: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';
    priority?: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
    assignedToId?: number;
}

export interface CreateCommentDTO {
    content: string;
}

export interface UpdateCommentDTO {
    content: string;
}

// Función para probar múltiples rutas
const tryMultipleEndpoints = async <T>(method: string, paths: string[], data?: any): Promise<T> => {
    let lastError = null;

    // Intentar cada ruta en orden
    for (const path of paths) {
        try {
            console.log(`Intentando ${method.toUpperCase()} a: ${path}`);
            let response;

            switch (method.toLowerCase()) {
                case 'get':
                    response = await apiClient.get<T>(path);
                    break;
                case 'post':
                    response = await apiClient.post<T>(path, data);
                    break;
                case 'put':
                    response = await apiClient.put<T>(path, data);
                    break;
                case 'delete':
                    response = await apiClient.delete<T>(path);
                    break;
                default:
                    throw new Error(`Método HTTP no soportado: ${method}`);
            }

            console.log(`Éxito con ruta: ${path}`);
            return response.data;
        } catch (error) {
            console.warn(`Falló ruta ${path}:`, error.message);
            lastError = error;
        }
    }

    // Si llegamos aquí, todas las rutas fallaron
    throw lastError || new Error('Todas las rutas fallaron');
};

// Obtener todos los reportes
export const getReports = async (): Promise<Report[]> => {
    try {
        // Probar diferentes rutas (sin duplicar /api)
        const possiblePaths = [
            '/reports',
            '/report'
        ];

        return await tryMultipleEndpoints('get', possiblePaths);
    } catch (error: any) {
        console.error('Error al obtener reportes:', error);
        throw error;
    }
};

// Obtener un reporte por ID
export const getReportById = async (id: number): Promise<Report> => {
    try {
        const possiblePaths = [
            `/reports/${id}`,
            `/report/${id}`
        ];

        return await tryMultipleEndpoints('get', possiblePaths);
    } catch (error: any) {
        console.error(`Error al obtener reporte ID ${id}:`, error);
        throw error;
    }
};

// Crear un nuevo reporte
export const createReport = async (reportData: CreateReportDTO): Promise<Report> => {
    try {
        console.log('Enviando datos para crear reporte:', reportData);

        // Asegurarse de que los campos requeridos estén presentes
        const requiredFields = ['title', 'description', 'priority'];
        for (const field of requiredFields) {
            if (!reportData[field]) {
                console.error(`Campo requerido faltante: ${field}`);
                throw new Error(`Campo requerido faltante: ${field}`);
            }
        }

        // Imprimir los datos exactos que se enviarán al servidor
        console.log('Payload exacto para crear reporte:', JSON.stringify(reportData, null, 2));

        const possiblePaths = [
            '/reports',
            '/report'
        ];

        return await tryMultipleEndpoints('post', possiblePaths, reportData);
    } catch (error: any) {
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
export const updateReport = async (id: number, reportData: UpdateReportDTO): Promise<Report> => {
    try {
        const possiblePaths = [
            `/reports/${id}`,
            `/report/${id}`
        ];

        return await tryMultipleEndpoints('put', possiblePaths, reportData);
    } catch (error: any) {
        console.error(`Error al actualizar reporte ID ${id}:`, error);
        throw error;
    }
};

// Eliminar un reporte
export const deleteReport = async (id: number): Promise<void> => {
    try {
        const possiblePaths = [
            `/reports/${id}`,
            `/report/${id}`
        ];

        await tryMultipleEndpoints('delete', possiblePaths);
    } catch (error: any) {
        console.error(`Error al eliminar reporte ID ${id}:`, error);
        throw error;
    }
};

// Añadir un comentario a un reporte
export const addComment = async (reportId: number, commentData: CreateCommentDTO): Promise<ReportComment> => {
    try {
        const possiblePaths = [
            `/reports/${reportId}/comments`,
            `/report/${reportId}/comments`,
            `/reports/${reportId}/comment`,
            `/comments/${reportId}`
        ];

        return await tryMultipleEndpoints('post', possiblePaths, commentData);
    } catch (error: any) {
        console.error(`Error al añadir comentario al reporte ID ${reportId}:`, error);
        throw error;
    }
};

// Obtener comentarios de un reporte
export const getReportComments = async (reportId: number): Promise<ReportComment[]> => {
    try {
        const possiblePaths = [
            `/comments/report/${reportId}`,
            `/reports/${reportId}/comments`
        ];

        return await tryMultipleEndpoints('get', possiblePaths);
    } catch (error: any) {
        console.error(`Error al obtener comentarios del reporte ID ${reportId}:`, error);
        throw error;
    }
};

// Actualizar un comentario
export const updateComment = async (commentId: number, commentData: UpdateCommentDTO): Promise<ReportComment> => {
    try {
        const possiblePaths = [
            `/comments/${commentId}`,
            `/comment/${commentId}`
        ];

        return await tryMultipleEndpoints('put', possiblePaths, commentData);
    } catch (error: any) {
        console.error(`Error al actualizar comentario ID ${commentId}:`, error);
        throw error;
    }
};

// Eliminar un comentario
export const deleteComment = async (commentId: number): Promise<void> => {
    try {
        const possiblePaths = [
            `/comments/${commentId}`,
            `/comment/${commentId}`
        ];

        await tryMultipleEndpoints('delete', possiblePaths);
    } catch (error: any) {
        console.error(`Error al eliminar comentario ID ${commentId}:`, error);
        throw error;
    }
};

// Obtener los reportes asociados a un elemento
export const getItemReports = async (itemType: 'INVENTARIO' | 'VEHICULO', itemId: number): Promise<Report[]> => {
    try {
        const possiblePaths = [
            `/reports/item/${itemType}/${itemId}`,
            `/report/item/${itemType}/${itemId}`
        ];

        return await tryMultipleEndpoints('get', possiblePaths);
    } catch (error: any) {
        console.error(`Error al obtener reportes del item ${itemType} ID ${itemId}:`, error);
        throw error;
    }
}; 
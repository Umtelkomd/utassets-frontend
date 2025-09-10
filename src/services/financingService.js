import axiosInstance from '../axiosConfig';

export const financingService = {
    // Financiamientos
    getFinancings: async (params = {}) => {
        const response = await axiosInstance.get('/financings', { params });
        return response.data;
    },

    getFinancingById: async (id) => {
        const response = await axiosInstance.get(`/financings/${id}`);
        return response.data;
    },

    createFinancing: async (financingData) => {
        const response = await axiosInstance.post('/financings', financingData);
        return response.data;
    },

    updateFinancing: async (id, financingData) => {
        const response = await axiosInstance.put(`/financings/${id}`, financingData);
        return response.data;
    },

    deleteFinancing: async (id) => {
        const response = await axiosInstance.delete(`/financings/${id}`);
        return response.data;
    },

    getFinancingSummary: async () => {
        const response = await axiosInstance.get('/financings/summary');
        return response.data;
    },

    getOverdueFinancings: async () => {
        const response = await axiosInstance.get('/financings/overdue');
        return response.data;
    },

    getFinancingsDueSoon: async (days = 7) => {
        const response = await axiosInstance.get('/financings/due-soon', { params: { days } });
        return response.data;
    },

    calculateFinancingScenarios: async (calculationData) => {
        const response = await axiosInstance.post('/financings/calculate-scenarios', calculationData);
        return response.data;
    },

    // Pagos
    getPayments: async (params = {}) => {
        const response = await axiosInstance.get('/payments', { params });
        return response.data;
    },

    getPaymentById: async (id) => {
        const response = await axiosInstance.get(`/payments/${id}`);
        return response.data;
    },

    recordPayment: async (paymentId, paymentData) => {
        const response = await axiosInstance.post(`/payments/${paymentId}/record`, paymentData);
        return response.data;
    },

    recordMultiplePayments: async (paymentsData) => {
        const response = await axiosInstance.post('/payments/record-multiple', { payments: paymentsData });
        return response.data;
    },

    updatePayment: async (id, paymentData) => {
        const response = await axiosInstance.put(`/payments/${id}`, paymentData);
        return response.data;
    },

    getOverduePayments: async () => {
        const response = await axiosInstance.get('/payments/overdue');
        return response.data;
    },

    getUpcomingPayments: async (days = 7) => {
        const response = await axiosInstance.get('/payments/upcoming', { params: { days } });
        return response.data;
    },

    getPaymentSummary: async (financingId) => {
        const response = await axiosInstance.get(`/payments/financing/${financingId}/summary`);
        return response.data;
    },

    getMonthlyPaymentSummary: async (year, month) => {
        const response = await axiosInstance.get('/payments/monthly-summary', {
            params: { year, month }
        });
        return response.data;
    },

    markOverduePayments: async () => {
        const response = await axiosInstance.post('/payments/mark-overdue');
        return response.data;
    }
};

// Funciones auxiliares para formateo y utilidades (sin cálculos duplicados)
export const financingCalculations = {
    // ✅ ELIMINADO: Cálculos duplicados - ahora solo utilidades de formateo

    formatCurrency: (amount, currency = 'EUR') => {
        // ✅ CORREGIDO: Convertir a número de forma más flexible
        let numericAmount = 0;
        
        if (amount === null || amount === undefined) {
            numericAmount = 0;
        } else if (typeof amount === 'string') {
            // Convertir string a número
            numericAmount = parseFloat(amount) || 0;
        } else if (typeof amount === 'number') {
            numericAmount = amount;
        } else {
            // Intentar convertir cualquier otro tipo
            numericAmount = parseFloat(String(amount)) || 0;
        }
        
        // Asegurar que sea un número finito
        if (!isFinite(numericAmount)) {
            numericAmount = 0;
        }
        
        try {
            return new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(numericAmount);
        } catch (error) {
            console.warn('Error formatting currency:', error, 'Amount:', amount, 'Converted:', numericAmount);
            return `€0,00`;
        }
    },

    formatDate: (date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    calculateDaysUntil: (targetDate) => {
        const today = new Date();
        const target = new Date(targetDate);
        const timeDiff = target.getTime() - today.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    },

    getPaymentStatus: (payment) => {
        if (payment.status === 'paid') return 'Pagado';
        if (payment.status === 'overdue') return 'Vencido';
        if (payment.status === 'partial') return 'Pago Parcial';
        
        const today = new Date();
        const scheduledDate = new Date(payment.scheduledDate);
        
        if (scheduledDate < today) return 'Vencido';
        if (scheduledDate.toDateString() === today.toDateString()) return 'Vence Hoy';
        
        const daysUntil = Math.ceil((scheduledDate - today) / (1000 * 3600 * 24));
        if (daysUntil <= 7) return `Vence en ${daysUntil} días`;
        
        return 'Pendiente';
    },

    getFinancingStatusColor: (status) => {
        switch (status) {
            case 'active': return '#007aff';
            case 'completed': return '#34c759';
            case 'cancelled': return '#8e8e93';
            case 'defaulted': return '#ff3b30';
            default: return '#8e8e93';
        }
    },

    getPaymentStatusColor: (payment) => {
        if (payment.status === 'paid') return '#34c759';
        if (payment.status === 'overdue') return '#ff3b30';
        if (payment.status === 'partial') return '#ff9500';
        
        const today = new Date();
        const scheduledDate = new Date(payment.scheduledDate);
        
        if (scheduledDate < today) return '#ff3b30';
        if (scheduledDate.toDateString() === today.toDateString()) return '#ff9500';
        
        const daysUntil = Math.ceil((scheduledDate - today) / (1000 * 3600 * 24));
        if (daysUntil <= 7) return '#ff9500';
        
        return '#007aff';
    }
};

export default financingService; 
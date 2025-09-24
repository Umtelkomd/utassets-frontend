// Exportar todas las utilidades desde un punto central
export * from './validation';
export * from './format';
export * from './dateUtils';
export * from './cookieUtils';
export * from './financingUtils';

// Utilidades generales
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};
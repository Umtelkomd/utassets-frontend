/**
 * Utilidades de formateo de datos
 */
import { DATE_CONFIG, CURRENCY_CONFIG } from '../constants';

// Formatear fecha
export const formatDate = (date, format = DATE_CONFIG.FORMAT) => {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return format
        .replace('DD', day)
        .replace('MM', month)
        .replace('YYYY', year)
        .replace('HH', hours)
        .replace('mm', minutes);
};

// Formatear moneda
export const formatCurrency = (amount, currency = CURRENCY_CONFIG.CURRENCY) => {
    if (isNaN(amount)) return CURRENCY_CONFIG.SYMBOL + '0.00';
    
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: CURRENCY_CONFIG.DECIMAL_PLACES
    }).format(amount);
};

// Formatear número con separadores de miles
export const formatNumber = (number) => {
    if (isNaN(number)) return '0';
    return new Intl.NumberFormat('es-CO').format(number);
};

// Formatear texto a título (primera letra mayúscula)
export const toTitleCase = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Formatear texto a formato de nombre propio
export const formatProperName = (str) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Formatear placa de vehículo
export const formatLicensePlate = (plate) => {
    if (!plate) return '';
    const clean = plate.replace(/\s+/g, '').toUpperCase();
    if (clean.length === 6) {
        return `${clean.slice(0, 3)} ${clean.slice(3)}`;
    }
    return clean;
};

// Formatear teléfono
export const formatPhone = (phone) => {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
    
    if (clean.length === 10) {
        return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
    } else if (clean.length === 12 && clean.startsWith('57')) {
        return `+57 ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8)}`;
    }
    
    return phone;
};

// Truncar texto
export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

// Formatear estado para mostrar
export const formatStatus = (status) => {
    const statusMap = {
        'ACTIVE': 'Activo',
        'INACTIVE': 'Inactivo',
        'PENDING': 'Pendiente',
        'COMPLETED': 'Completado',
        'CANCELLED': 'Cancelado',
        'ACTIVO': 'Activo',
        'INACTIVO': 'Inactivo',
        'PENDIENTE': 'Pendiente',
        'COMPLETADO': 'Completado',
        'CANCELADO': 'Cancelado'
    };
    
    return statusMap[status?.toUpperCase()] || status || 'Sin estado';
};
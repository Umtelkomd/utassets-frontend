/**
 * Utilidades de validación comunes
 */

// Validar email
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validar teléfono colombiano
export const isValidPhone = (phone) => {
    const phoneRegex = /^(\+57|57)?[1-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
};

// Validar placa de vehículo colombiana
export const isValidLicensePlate = (plate) => {
    const plateRegex = /^[A-Z]{3}[0-9]{3}$/;
    return plateRegex.test(plate.replace(/\s+/g, '').toUpperCase());
};

// Validar que un string no esté vacío
export const isNotEmpty = (value) => {
    return value && value.toString().trim().length > 0;
};

// Validar que un número sea positivo
export const isPositiveNumber = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
};

// Validar fecha futura
export const isFutureDate = (date) => {
    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate > today;
};

// Validar rango de fechas
export const isValidDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start < end;
};

// Validador genérico de campos requeridos
export const validateRequiredFields = (data, fields) => {
    const missingFields = [];
    
    fields.forEach(field => {
        if (!data[field] || data[field].toString().trim() === '') {
            missingFields.push(field);
        }
    });
    
    return {
        isValid: missingFields.length === 0,
        missingFields
    };
};
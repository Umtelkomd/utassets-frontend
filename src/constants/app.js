// Constantes generales de la aplicación

// Información de la aplicación
export const APP_INFO = {
    NAME: 'UTAssets',
    VERSION: '1.0.0',
    DESCRIPTION: 'Sistema de gestión de activos'
};

// Configuración de fechas
export const DATE_CONFIG = {
    FORMAT: 'DD/MM/YYYY',
    DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
    LOCALE: 'es',
    TIMEZONE: 'America/Bogota'
};

// Configuración de moneda
export const CURRENCY_CONFIG = {
    CURRENCY: 'USD',
    SYMBOL: '$',
    DECIMAL_PLACES: 2
};

// Estados de elementos
export const STATUS = {
    ACTIVE: 'ACTIVO',
    INACTIVE: 'INACTIVO',
    PENDING: 'PENDIENTE',
    COMPLETED: 'COMPLETADO',
    CANCELLED: 'CANCELADO'
};

// Prioridades
export const PRIORITY = {
    LOW: 'BAJA',
    MEDIUM: 'MEDIA',
    HIGH: 'ALTA',
    CRITICAL: 'CRITICA'
};

// Tipos de elementos
export const ITEM_TYPES = {
    INVENTORY: 'INVENTARIO',
    VEHICLE: 'VEHICULO',
    HOUSING: 'VIVIENDA'
};

// Roles de usuario
export const USER_ROLES = {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    USER: 'USER',
    VIEWER: 'VIEWER'
};
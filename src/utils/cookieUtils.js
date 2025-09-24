/**
 * Obtiene el valor de una cookie por nombre
 * @param {string} name - Nombre de la cookie
 * @returns {string|null} - Valor de la cookie o null si no existe
 */
export const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null;
};

/**
 * Establece una cookie
 * @param {string} name - Nombre de la cookie
 * @param {string} value - Valor de la cookie
 * @param {number} days - Días hasta expirar (opcional)
 */
export const setCookie = (name, value, days = 90) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

/**
 * Elimina una cookie
 * @param {string} name - Nombre de la cookie
 */
export const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

/**
 * Verifica si una cookie específica existe
 * @param {string} name - Nombre de la cookie
 * @returns {boolean} - True si la cookie existe
 */
export const cookieExists = (name) => {
    return getCookie(name) !== null;
}; 
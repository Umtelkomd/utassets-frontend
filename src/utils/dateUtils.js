/**
 * Calcula el número de días laborables entre dos fechas (excluyendo sábados y domingos)
 * Esta función debe coincidir exactamente con la del backend
 * @param {Date|string} startDate - Fecha de inicio
 * @param {Date|string} endDate - Fecha de fin
 * @returns {number} Número de días laborables
 */
export function calculateWorkingDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    throw new Error(
      "La fecha de inicio no puede ser posterior a la fecha de fin",
    );
  }

  let count = 0;
  let currentDate = new Date(start);

  // Incluir el día de inicio si no es fin de semana
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay(); // 0 = Domingo, 6 = Sábado

    // Solo contar si no es sábado (6) ni domingo (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }

    // Avanzar al siguiente día
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
}

/**
 * Verifica si una fecha es un día de media jornada (24 y 31 de diciembre)
 * @param {Date|string} date - Fecha a verificar
 * @returns {boolean} true si es día de media jornada
 */
export function isHalfWorkDay(date) {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.getMonth(); // 0 = Enero, 11 = Diciembre

  // 24 de diciembre o 31 de diciembre
  return month === 11 && (day === 24 || day === 31);
}

/**
 * Calcula el número de días laborables entre dos fechas, excluyendo festivos
 * Considera días de media jornada (24 y 31 de diciembre) como 0.5 días
 * @param {Date|string} startDate - Fecha de inicio
 * @param {Date|string} endDate - Fecha de fin
 * @param {Array} holidays - Array de festivos (objetos con propiedad date)
 * @returns {number} Número de días laborables excluyendo festivos (puede incluir decimales)
 */
export function calculateWorkingDaysExcluding(
  startDate,
  endDate,
  holidays = [],
) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    throw new Error(
      "La fecha de inicio no puede ser posterior a la fecha de fin",
    );
  }

  // Convertir festivos a timestamps para comparación más eficiente
  const holidayTimestamps = holidays.map((holiday) => {
    const d = new Date(holiday.date || holiday);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  let count = 0;
  let currentDate = new Date(start);

  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();

    // Solo contar si no es fin de semana
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Verificar si no es festivo
      const currentTimestamp = new Date(currentDate).setHours(0, 0, 0, 0);
      if (!holidayTimestamps.includes(currentTimestamp)) {
        // Verificar si es día de media jornada (24 o 31 de diciembre)
        if (isHalfWorkDay(currentDate)) {
          count += 0.5;
        } else {
          count += 1;
        }
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
}

/**
 * Verifica si una fecha es un día laborable (lunes a viernes)
 * @param {Date|string} date - Fecha a verificar
 * @returns {boolean} true si es día laborable, false si es fin de semana
 */
export function isWorkingDay(date) {
  const day = new Date(date);
  const dayOfWeek = day.getDay();
  return dayOfWeek !== 0 && dayOfWeek !== 6; // No es domingo ni sábado
}

/**
 * Calcula días naturales entre dos fechas (incluyendo fines de semana)
 * Solo usar para propósitos de alquiler, NO para vacaciones
 * @param {Date|string} startDate - Fecha de inicio
 * @param {Date|string} endDate - Fecha de fin
 * @returns {number} Número total de días
 */
export function calculateNaturalDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Formatea una fecha para mostrar
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formatea un rango de fechas
 * @param {Date|string} startDate - Fecha de inicio
 * @param {Date|string} endDate - Fecha de fin
 * @returns {string} Rango formateado
 */
export function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start.toDateString() === end.toDateString()) {
    return formatDate(startDate);
  }

  const startFormatted = start.toLocaleDateString("es-ES", {
    day: "numeric",
    month: start.getMonth() === end.getMonth() ? undefined : "short",
  });
  const endFormatted = end.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `${startFormatted} - ${endFormatted}`;
}

import React, { useState } from 'react';
import {
    CalendarToday as CalendarIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    BeachAccess as VacationIcon,
    Work as WorkIcon
} from '@mui/icons-material';
import './VacationRequestCalendar.css';

const VacationRequestCalendar = ({
    requestedDates,
    onDatesSelected,
    selectedDates = [],
    type,
    disabled = false
}) => {
    const [localSelectedDates, setLocalSelectedDates] = useState(new Set(selectedDates));

    // Convertir fechas a objetos Date si no lo son
    const dates = requestedDates.map(date => new Date(date));
    dates.sort((a, b) => a.getTime() - b.getTime());

    // Obtener el rango de fechas para mostrar el calendario
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[dates.length - 1]);

    // Obtener el primer día del mes del rango
    const firstDayOfCalendar = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const lastDayOfCalendar = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);

    // Ajustar para mostrar desde domingo
    const startOfWeek = new Date(firstDayOfCalendar);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date(lastDayOfCalendar);
    endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));

    // Generar todos los días del calendario
    const calendarDays = [];
    const currentDate = new Date(startOfWeek);

    while (currentDate <= endOfWeek) {
        calendarDays.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const handleDateToggle = (date) => {
        if (disabled) return;

        const dateStr = date.toISOString().split('T')[0];
        const newSelected = new Set(localSelectedDates);

        if (newSelected.has(dateStr)) {
            newSelected.delete(dateStr);
        } else {
            newSelected.add(dateStr);
        }

        setLocalSelectedDates(newSelected);
        onDatesSelected(Array.from(newSelected));
    };

    const isDateRequested = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return requestedDates.some(reqDate => {
            const reqDateStr = new Date(reqDate).toISOString().split('T')[0];
            return reqDateStr === dateStr;
        });
    };

    const isDateSelected = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return localSelectedDates.has(dateStr);
    };

    const isCurrentMonth = (date, targetDate) => {
        return date.getMonth() === targetDate.getMonth() &&
            date.getFullYear() === targetDate.getFullYear();
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getMonthYear = (date) => {
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long'
        });
    };

    // Obtener meses únicos en el rango
    const uniqueMonths = [];
    dates.forEach(date => {
        const monthYear = getMonthYear(date);
        if (!uniqueMonths.includes(monthYear)) {
            uniqueMonths.push(monthYear);
        }
    });

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    return (
        <div className="vacation-request-calendar">
            <div className="calendar-header">
                <div className="calendar-title">
                    <CalendarIcon />
                    <span>Días solicitados</span>
                    {type === 'rest_day' ? (
                        <VacationIcon className="type-icon vacation" />
                    ) : (
                        <WorkIcon className="type-icon work" />
                    )}
                </div>
                <div className="calendar-legend">
                    <div className="legend-item">
                        <div className="legend-color requested"></div>
                        <span>Solicitado</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color selected"></div>
                        <span>Aprobado</span>
                    </div>
                </div>
            </div>

            <div className="calendar-months">
                {uniqueMonths.map(monthYear => {
                    const monthDate = dates.find(date => getMonthYear(date) === monthYear);

                    return (
                        <div key={monthYear} className="calendar-month">
                            <div className="month-header">
                                <h4>{monthYear}</h4>
                            </div>

                            <div className="calendar-grid">
                                <div className="calendar-days-header">
                                    {dayNames.map(day => (
                                        <div key={day} className="calendar-day-header">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                <div className="calendar-days">
                                    {calendarDays
                                        .filter(date => isCurrentMonth(date, monthDate))
                                        .map((date, index) => {
                                            const isRequested = isDateRequested(date);
                                            const isSelected = isDateSelected(date);
                                            const isToday = date.toDateString() === new Date().toDateString();

                                            return (
                                                <div
                                                    key={index}
                                                    className={`calendar-day ${isRequested ? 'requested' : ''
                                                        } ${isSelected ? 'selected' : ''
                                                        } ${isToday ? 'today' : ''
                                                        } ${!isRequested ? 'disabled' : ''
                                                        } ${disabled ? 'calendar-disabled' : ''
                                                        }`}
                                                    onClick={() => {
                                                        if (isRequested) {
                                                            handleDateToggle(date);
                                                        }
                                                    }}
                                                    title={
                                                        isRequested
                                                            ? `${formatDate(date)} - ${isSelected ? 'Aprobado' : 'Pendiente'}`
                                                            : formatDate(date)
                                                    }
                                                >
                                                    <div className="day-number">
                                                        {date.getDate()}
                                                    </div>
                                                    {isRequested && (
                                                        <div className="day-indicator">
                                                            {isSelected ? (
                                                                <CheckIcon className="check-icon" />
                                                            ) : (
                                                                <div className="pending-dot"></div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="calendar-summary">
                <div className="summary-item">
                    <span className="summary-label">Total solicitado:</span>
                    <span className="summary-value">{requestedDates.length} días</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Para aprobar:</span>
                    <span className="summary-value selected">{localSelectedDates.size} días</span>
                </div>
            </div>
        </div>
    );
};

export default VacationRequestCalendar; 
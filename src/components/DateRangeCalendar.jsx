import React, { useState, useEffect } from 'react';
import './RentalCalendar.css'; // Usar los mismos estilos que RentalCalendar

// Iconos
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EventIcon from '@mui/icons-material/Event';

const DateRangeCalendar = ({
    startDate,
    endDate,
    onChange,
    errors = {},
    className = ''
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendarDays, setCalendarDays] = useState([]);

    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    useEffect(() => {
        generateCalendar();
    }, [currentMonth, startDate, endDate]);

    const generateCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startOfWeek = new Date(firstDay);
        startOfWeek.setDate(firstDay.getDate() - firstDay.getDay());

        const days = [];
        const current = new Date(startOfWeek);

        for (let i = 0; i < 42; i++) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        setCalendarDays(days);
    };

    const calculateDays = (start, end) => {
        if (!start || !end) return 0;

        const normalizedStartDate = new Date(start);
        normalizedStartDate.setHours(0, 0, 0, 0);

        const normalizedEndDate = new Date(end);
        normalizedEndDate.setHours(0, 0, 0, 0);

        const diffTime = normalizedEndDate.getTime() - normalizedStartDate.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        return days;
    };

    const getDayStatus = (date) => {
        if (!startDate || !endDate) return 'normal';

        const start = new Date(startDate);
        const end = new Date(endDate);
        const current = new Date(date);

        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        current.setHours(0, 0, 0, 0);

        if (current.getTime() === start.getTime()) return 'start';
        if (current.getTime() === end.getTime()) return 'end';
        if (current >= start && current <= end) return 'rental';

        return 'normal';
    };

    const isCurrentMonth = (date) => {
        return date.getMonth() === currentMonth.getMonth();
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const navigateMonth = (direction) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(currentMonth.getMonth() + direction);
        setCurrentMonth(newMonth);
    };

    const handleDayClick = (date) => {
        // Evitar seleccionar fechas pasadas
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) return;

        const clickedDate = new Date(date);
        clickedDate.setHours(0, 0, 0, 0);

        if (!startDate || (startDate && endDate)) {
            // Primera fecha o reiniciar selección
            onChange(clickedDate, null);
        } else {
            // Segunda fecha
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);

            if (clickedDate < start) {
                // Si la fecha clickeada es anterior al inicio, intercambiar
                onChange(clickedDate, start);
            } else {
                // Fecha final normal
                onChange(start, clickedDate);
            }
        }
    };

    const dayCount = calculateDays(startDate, endDate);

    return (
        <div className={`date-range-calendar ${className}`}>
            <div className="form-group">
                <label>Fechas de Alquiler*</label>

                <div className="rental-calendar">
                    <div className="calendar-header">
                        <div className="calendar-title">
                            <EventIcon className="calendar-icon" />
                            <h3>Seleccionar Fechas</h3>
                        </div>
                        {startDate && endDate && (
                            <div className="rental-summary">
                                <div className="rental-period">
                                    <div className="period-text">Período seleccionado</div>
                                    <div className="period-duration">{dayCount} día{dayCount !== 1 ? 's' : ''}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="calendar-navigation">
                        <button
                            type="button"
                            className="nav-button"
                            onClick={() => navigateMonth(-1)}
                        >
                            <ChevronLeftIcon />
                        </button>
                        <h4 className="month-year">
                            {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h4>
                        <button
                            type="button"
                            className="nav-button"
                            onClick={() => navigateMonth(1)}
                        >
                            <ChevronRightIcon />
                        </button>
                    </div>

                    <div className="calendar-grid">
                        <div className="day-names">
                            {dayNames.map(day => (
                                <div key={day} className="day-name">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="calendar-days">
                            {calendarDays.map((date, index) => {
                                const dayStatus = getDayStatus(date);
                                const isPastDate = date < new Date().setHours(0, 0, 0, 0);

                                return (
                                    <div
                                        key={index}
                                        className={`
                                            calendar-day 
                                            ${dayStatus}
                                            ${!isCurrentMonth(date) ? 'other-month' : ''}
                                            ${isToday(date) ? 'today' : ''}
                                            ${isPastDate ? 'past-date' : ''}
                                        `}
                                        onClick={() => !isPastDate && handleDayClick(date)}
                                        style={{
                                            cursor: isPastDate ? 'not-allowed' : 'pointer',
                                            opacity: isPastDate ? 0.3 : 1
                                        }}
                                    >
                                        <span className="day-number">
                                            {date.getDate()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {startDate && endDate && (
                        <div className="calendar-legend">
                            <div className="legend-item">
                                <div className="legend-color start-color"></div>
                                <span>Inicio</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color rental-color"></div>
                                <span>Período</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color end-color"></div>
                                <span>Fin</span>
                            </div>
                        </div>
                    )}
                </div>

                {errors.startDate && <div className="error-message">{errors.startDate}</div>}
                {errors.endDate && <div className="error-message">{errors.endDate}</div>}
                {errors.dateRange && <div className="error-message">{errors.dateRange}</div>}
            </div>
        </div>
    );
};

export default DateRangeCalendar; 
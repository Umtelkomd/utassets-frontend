import React, { useState, useEffect } from 'react';
import './RentalCalendar.css';

// Iconos
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EventIcon from '@mui/icons-material/Event';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';

const RentalCalendar = ({ startDate, endDate }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendarDays, setCalendarDays] = useState([]);

    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    useEffect(() => {
        if (startDate) {
            setCurrentMonth(new Date(startDate));
        }
    }, [startDate]);

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

    const getDayStatus = (date) => {
        if (!startDate || !endDate) return 'normal';

        const start = new Date(startDate);
        const end = new Date(endDate);
        const current = new Date(date);

        // Normalizar fechas para comparación (solo día, mes, año)
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

    const formatDateRange = () => {
        if (!startDate || !endDate) return '';

        const start = new Date(startDate);
        const end = new Date(endDate);

        const options = { day: 'numeric', month: 'short' };
        return `${start.toLocaleDateString('es-ES', options)} - ${end.toLocaleDateString('es-ES', options)}`;
    };

    const calculateDays = () => {
        if (!startDate || !endDate) return 0;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    return (
        <div className="rental-calendar">
            <div className="calendar-header">
                <div className="calendar-title">
                    <EventIcon className="calendar-icon" />
                    <h3>Calendario de Alquiler</h3>
                </div>

                {startDate && endDate && (
                    <div className="rental-summary">
                        <div className="rental-period">
                            <span className="period-text">{formatDateRange()}</span>
                            <span className="period-duration">{calculateDays()} días</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="calendar-navigation">
                <button
                    className="nav-button"
                    onClick={() => navigateMonth(-1)}
                >
                    <ChevronLeftIcon />
                </button>

                <h4 className="month-year">
                    {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h4>

                <button
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
                        const status = getDayStatus(date);
                        const isCurrentMonthDay = isCurrentMonth(date);
                        const isTodayDate = isToday(date);

                        return (
                            <div
                                key={index}
                                className={`calendar-day 
                                    ${status} 
                                    ${!isCurrentMonthDay ? 'other-month' : ''} 
                                    ${isTodayDate ? 'today' : ''}
                                `}
                            >
                                <span className="day-number">
                                    {date.getDate()}
                                </span>

                                {status === 'start' && (
                                    <div className="day-indicator start-indicator">
                                        <PlayArrowIcon />
                                    </div>
                                )}

                                {status === 'end' && (
                                    <div className="day-indicator end-indicator">
                                        <StopIcon />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="calendar-legend">
                <div className="legend-item">
                    <div className="legend-color start-color"></div>
                    <span>Inicio</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color rental-color"></div>
                    <span>Período de Alquiler</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color end-color"></div>
                    <span>Fin</span>
                </div>
            </div>
        </div>
    );
};

export default RentalCalendar; 
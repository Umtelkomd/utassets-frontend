import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Calendar.css';

// Iconos para los diferentes tipos de alquileres
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import InventoryIcon from '@mui/icons-material/Inventory';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VisibilityIcon from '@mui/icons-material/Visibility';

const Calendar = ({ rentals = [] }) => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [hoveredRental, setHoveredRental] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const today = new Date();

    // Calcular días hasta el vencimiento
    const getDaysUntilExpiry = (endDate) => {
        const end = new Date(endDate);
        const diffTime = end.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Obtener color según días restantes
    const getRentalColor = (endDate) => {
        const daysLeft = getDaysUntilExpiry(endDate);
        if (daysLeft < 0) return 'rental-calendar-expired';
        if (daysLeft <= 5) return 'rental-calendar-urgent';
        if (daysLeft <= 15) return 'rental-calendar-warning';
        return 'rental-calendar-safe';
    };

    // Obtener ícono según tipo de alquiler
    const getRentalIcon = (type) => {
        switch (type) {
            case 'housing':
                return <HomeIcon />;
            case 'vehicle':
                return <DirectionsCarIcon />;
            case 'item':
                return <InventoryIcon />;
            default:
                return <InventoryIcon />;
        }
    };

    // Obtener nombre del item
    const getItemName = (rental) => {
        switch (rental.type) {
            case 'housing':
                return rental.housing?.address || 'Vivienda sin dirección';
            case 'vehicle':
                return `${rental.vehicle?.brand || ''} ${rental.vehicle?.model || ''}`.trim() || 'Vehículo sin especificar';
            case 'item':
                return rental.inventory?.itemName || 'Ítem sin nombre';
            default:
                return 'Tipo de alquiler desconocido';
        }
    };

    // Obtener imagen del item
    const getItemImage = (rental) => {
        switch (rental.type) {
            case 'housing':
                return rental.housing?.photoUrl;
            case 'vehicle':
                return rental.vehicle?.photoUrl;
            case 'item':
                return rental.inventory?.photoUrl;
            default:
                return null;
        }
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('es-ES', options);
    };

    // Navegación del calendario
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Obtener días del mes
    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Días del mes anterior
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const prevMonthDay = new Date(year, month, -i);
            days.push({
                date: prevMonthDay,
                isCurrentMonth: false,
                rentals: []
            });
        }

        // Días del mes actual
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDay = new Date(year, month, day);
            const dayRentals = rentals.filter(rental => {
                const startDate = new Date(rental.startDate);
                const endDate = new Date(rental.endDate);
                return currentDay >= startDate && currentDay <= endDate;
            });

            days.push({
                date: currentDay,
                isCurrentMonth: true,
                rentals: dayRentals
            });
        }

        // Días del próximo mes para completar la grilla
        const remainingCells = 42 - days.length;
        for (let day = 1; day <= remainingCells; day++) {
            const nextMonthDay = new Date(year, month + 1, day);
            days.push({
                date: nextMonthDay,
                isCurrentMonth: false,
                rentals: []
            });
        }

        return days;
    };

    // Manejar hover de la burbuja
    const handleRentalHover = (rental, event) => {
        const rect = event.currentTarget.getBoundingClientRect();

        // Usar coordenadas del viewport que funcionan con position: fixed
        const viewportX = rect.left + rect.width / 2;
        const viewportY = rect.top + rect.height / 2;

        // Ajustar para que el tooltip no se salga de la pantalla
        const tooltipWidth = 280; // max-width del tooltip
        const tooltipHeight = 200; // altura estimada del tooltip

        let x = viewportX + 10;
        let y = viewportY - 10;

        // Ajustar si se sale por la derecha
        if (x + tooltipWidth > window.innerWidth) {
            x = viewportX - tooltipWidth - 10;
        }

        // Ajustar si se sale por arriba
        if (y - tooltipHeight < 0) {
            y = viewportY + 30;
        }

        setHoveredRental(rental);
        setTooltipPosition({ x: x, y: y });
    };

    const handleRentalLeave = () => {
        setHoveredRental(null);
    };

    // Navegar a ver rental
    const handleViewRental = (rental) => {
        const viewPath = `/rentals/view/${rental.type}/${rental._id || rental.id}`;
        navigate(viewPath);
    };

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const days = getDaysInMonth();

    useEffect(() => {
        const handleScroll = () => {
            if (hoveredRental) {
                setHoveredRental(null);
            }
        };

        // Agregar listeners para window y para posibles contenedores con scroll
        window.addEventListener('scroll', handleScroll, true);
        document.addEventListener('scroll', handleScroll, true);

        // También detectar scroll en elementos padre
        const dashboardPage = document.querySelector('.dashboard-page');
        if (dashboardPage) {
            dashboardPage.addEventListener('scroll', handleScroll, true);
        }

        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            document.removeEventListener('scroll', handleScroll, true);
            if (dashboardPage) {
                dashboardPage.removeEventListener('scroll', handleScroll, true);
            }
        };
    }, [hoveredRental]);

    return (
        <div className="rental-calendar-container">
            <div className="rental-calendar-header">
                <div className="rental-calendar-navigation">
                    <button
                        className="rental-calendar-nav-button"
                        onClick={goToPreviousMonth}
                        aria-label="Mes anterior"
                    >
                        <ChevronLeftIcon />
                    </button>

                    <div className="rental-calendar-current-month">
                        <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                        <button className="rental-calendar-today-button" onClick={goToToday}>
                            Hoy
                        </button>
                    </div>

                    <button
                        className="rental-calendar-nav-button"
                        onClick={goToNextMonth}
                        aria-label="Siguiente mes"
                    >
                        <ChevronRightIcon />
                    </button>
                </div>

                <div className="rental-calendar-legend">
                    <div className="rental-calendar-legend-item">
                        <div className="rental-calendar-legend-bubble rental-calendar-safe"></div>
                        <span>Más de 15 días</span>
                    </div>
                    <div className="rental-calendar-legend-item">
                        <div className="rental-calendar-legend-bubble rental-calendar-warning"></div>
                        <span>Menos de 15 días</span>
                    </div>
                    <div className="rental-calendar-legend-item">
                        <div className="rental-calendar-legend-bubble rental-calendar-urgent"></div>
                        <span>Menos de 5 días</span>
                    </div>
                    <div className="rental-calendar-legend-item">
                        <div className="rental-calendar-legend-bubble rental-calendar-expired"></div>
                        <span>Vencido</span>
                    </div>
                </div>
            </div>

            {rentals.length === 0 ? (
                <div className="rental-calendar-empty-state">
                    <p>No hay alquileres para mostrar en el calendario</p>
                    <small>Los alquileres activos aparecerán como burbujas coloridas en las fechas correspondientes.</small>
                </div>
            ) : (
                <div className="rental-calendar-grid">
                    <div className="rental-calendar-days-header">
                        {dayNames.map(day => (
                            <div key={day} className="rental-calendar-day-header">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="rental-calendar-days">
                        {days.map((day, index) => (
                            <div
                                key={index}
                                className={`rental-calendar-day ${!day.isCurrentMonth ? 'rental-calendar-other-month' : ''
                                    } ${day.date.toDateString() === today.toDateString() ? 'rental-calendar-today' : ''
                                    }`}
                            >
                                <div className="rental-calendar-day-number">
                                    {day.date.getDate()}
                                </div>

                                {day.rentals.length > 0 && (
                                    <div className="rental-calendar-bubbles">
                                        {day.rentals.slice(0, 4).map((rental, rentalIndex) => {
                                            const colorClass = getRentalColor(rental.endDate);
                                            return (
                                                <div
                                                    key={`${rental._id || rental.id}-${rentalIndex}`}
                                                    className={`rental-calendar-bubble ${colorClass}`}
                                                    onMouseEnter={(e) => handleRentalHover(rental, e)}
                                                    onMouseLeave={handleRentalLeave}
                                                    onClick={() => handleViewRental(rental)}
                                                >
                                                    <div className="rental-calendar-bubble-icon">
                                                        {getRentalIcon(rental.type)}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {day.rentals.length > 4 && (
                                            <div className="rental-calendar-bubble-more">
                                                +{day.rentals.length - 4}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tooltip */}
            {hoveredRental && (
                <div
                    className="rental-calendar-tooltip"
                    style={{
                        left: tooltipPosition.x + 10,
                        top: tooltipPosition.y - 10
                    }}
                >
                    <div className="rental-calendar-tooltip-content">
                        {getItemImage(hoveredRental) && (
                            <div className="rental-calendar-tooltip-image">
                                <img
                                    src={getItemImage(hoveredRental)}
                                    alt={getItemName(hoveredRental)}
                                />
                            </div>
                        )}
                        <div className="rental-calendar-tooltip-info">
                            <h4>{getItemName(hoveredRental)}</h4>
                            <p className="rental-calendar-tooltip-date">
                                Vence: {formatDate(hoveredRental.endDate)}
                            </p>
                            <p className="rental-calendar-tooltip-days">
                                {getDaysUntilExpiry(hoveredRental.endDate) > 0
                                    ? `${getDaysUntilExpiry(hoveredRental.endDate)} días restantes`
                                    : 'Vencido'
                                }
                            </p>
                            <button
                                className="rental-calendar-tooltip-button"
                                onClick={() => handleViewRental(hoveredRental)}
                            >
                                <VisibilityIcon />
                                Ver alquiler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar; 
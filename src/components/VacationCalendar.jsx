import React, { useState, useEffect } from "react";
import "./VacationCalendar.css";
import { calculateWorkingDays } from "../utils/dateUtils";

// Iconos para los diferentes tipos de vacaciones
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import WorkIcon from "@mui/icons-material/Work";
import EventIcon from "@mui/icons-material/Event";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PersonIcon from "@mui/icons-material/Person";

const VacationCalendar = ({
  vacations = [],
  holidays = [],
  onDateClick,
  onVacationClick,
  isPersonal = false,
  showOnlyOwnVacations = false,
  currentUserId = null,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredVacation, setHoveredVacation] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const today = new Date();

  // Obtener ícono según tipo de vacación
  const getVacationIcon = (type) => {
    switch (type) {
      case "rest_day":
        return <BeachAccessIcon />;
      case "extra_work_day":
        return <WorkIcon />;
      default:
        return <BeachAccessIcon />;
    }
  };

  // Obtener color según tipo de vacación
  const getVacationColor = (type) => {
    switch (type) {
      case "rest_day":
        return "vacation-calendar-rest-day";
      case "extra_work_day":
        return "vacation-calendar-extra-work";
      default:
        return "vacation-calendar-rest-day";
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("es-ES", options);
  };

  // Formatear rango de fechas
  const formatDateRange = (startDate, endDate) => {
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
  };

  // Calcular días laborables en el rango
  const calculateDayCount = (startDate, endDate) => {
    return calculateWorkingDays(startDate, endDate);
  };

  // Verificar si una fecha está dentro de un rango de vacación
  const isDateInVacationRange = (date, vacation) => {
    const checkDate = new Date(date);
    const startDate = new Date(vacation.startDate);
    const endDate = new Date(vacation.endDate);

    // Normalizar horas para comparar solo fechas
    checkDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    return checkDate >= startDate && checkDate <= endDate;
  };

  // Verificar si una fecha es festivo
  const isHoliday = (date) => {
    if (!holidays || holidays.length === 0) return false;

    // Normalizar la fecha a comparar
    const checkDate = new Date(date);
    const checkDateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;

    return holidays.some((holiday) => {
      if (!holiday || !holiday.date) return false;

      // Normalizar la fecha del festivo
      const holidayDate = new Date(holiday.date);
      const holidayDateStr = `${holidayDate.getFullYear()}-${String(holidayDate.getMonth() + 1).padStart(2, "0")}-${String(holidayDate.getDate()).padStart(2, "0")}`;

      return checkDateStr === holidayDateStr;
    });
  };

  // Obtener festivo de una fecha
  const getHolidayForDate = (date) => {
    if (!holidays || holidays.length === 0) return null;

    // Normalizar la fecha a comparar
    const checkDate = new Date(date);
    const checkDateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;

    return holidays.find((holiday) => {
      if (!holiday || !holiday.date) return false;

      // Normalizar la fecha del festivo
      const holidayDate = new Date(holiday.date);
      const holidayDateStr = `${holidayDate.getFullYear()}-${String(holidayDate.getMonth() + 1).padStart(2, "0")}-${String(holidayDate.getDate()).padStart(2, "0")}`;

      return checkDateStr === holidayDateStr;
    });
  };

  // Navegación del calendario
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
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
        vacations: [],
      });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      let dayVacations = vacations.filter((vacation) => {
        return isDateInVacationRange(currentDay, vacation);
      });

      // Filtrar vacaciones si está en modo personal
      if (isPersonal && showOnlyOwnVacations && currentUserId) {
        dayVacations = dayVacations.filter(
          (vacation) =>
            vacation.userId === currentUserId ||
            vacation.user?.id === currentUserId,
        );
      }

      days.push({
        date: currentDay,
        isCurrentMonth: true,
        vacations: dayVacations,
        isHoliday: isHoliday(currentDay),
        holiday: getHolidayForDate(currentDay),
      });
    }

    // Días del próximo mes para completar la grilla
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const nextMonthDay = new Date(year, month + 1, day);
      days.push({
        date: nextMonthDay,
        isCurrentMonth: false,
        vacations: [],
      });
    }

    return days;
  };

  // Manejar hover de la burbuja
  const handleVacationHover = (vacation, event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    // Usar coordenadas del viewport que funcionan con position: fixed
    const viewportX = rect.left + rect.width / 2;
    const viewportY = rect.top + rect.height / 2;

    // Ajustar para que el tooltip no se salga de la pantalla
    const tooltipWidth = 280;
    const tooltipHeight = 150;

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

    setHoveredVacation(vacation);
    setTooltipPosition({ x: x, y: y });
  };

  const handleVacationLeave = () => {
    setHoveredVacation(null);
  };

  // Manejar click en día
  const handleDayClick = (day) => {
    if (day.isCurrentMonth && onDateClick) {
      onDateClick(day.date);
    }
  };

  // Manejar click en burbuja de vacación
  const handleVacationClick = (vacation, event) => {
    event.stopPropagation(); // Evitar que se dispare el click del día
    if (onVacationClick) {
      onVacationClick(vacation);
    }
  };

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const days = getDaysInMonth();

  useEffect(() => {
    const handleScroll = () => {
      if (hoveredVacation) {
        setHoveredVacation(null);
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    document.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [hoveredVacation]);

  return (
    <div className="vacation-calendar-container">
      <div className="vacation-calendar-header">
        <div className="vacation-calendar-navigation">
          <button
            className="vacation-calendar-nav-button"
            onClick={goToPreviousMonth}
            aria-label="Mes anterior"
          >
            <ChevronLeftIcon />
          </button>

          <div className="vacation-calendar-current-month">
            <h2>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              className="vacation-calendar-today-button"
              onClick={goToToday}
            >
              Hoy
            </button>
          </div>

          <button
            className="vacation-calendar-nav-button"
            onClick={goToNextMonth}
            aria-label="Siguiente mes"
          >
            <ChevronRightIcon />
          </button>
        </div>

        <div className="vacation-calendar-legend">
          <div className="vacation-calendar-legend-item">
            <div className="vacation-calendar-legend-bubble vacation-calendar-rest-day"></div>
            <span>Día de descanso</span>
          </div>
          <div className="vacation-calendar-legend-item">
            <div className="vacation-calendar-legend-bubble vacation-calendar-extra-work"></div>
            <span>Día extra trabajado</span>
          </div>
          <div className="vacation-calendar-legend-item">
            <div className="vacation-calendar-legend-bubble vacation-calendar-holiday"></div>
            <span>Día festivo</span>
          </div>
        </div>
      </div>

      <div className="vacation-calendar-grid">
        <div className="vacation-calendar-days-header">
          {dayNames.map((day) => (
            <div key={day} className="vacation-calendar-day-header">
              {day}
            </div>
          ))}
        </div>

        <div className="vacation-calendar-days">
          {days.map((day, index) => (
            <div
              key={index}
              className={`vacation-calendar-day ${
                !day.isCurrentMonth ? "vacation-calendar-other-month" : ""
              } ${
                day.date.toDateString() === today.toDateString()
                  ? "vacation-calendar-today"
                  : ""
              } ${day.isCurrentMonth ? "vacation-calendar-clickable" : ""} ${
                day.isHoliday ? "vacation-calendar-day-holiday" : ""
              }`}
              onClick={() => handleDayClick(day)}
            >
              <div className="vacation-calendar-day-number">
                {day.date.getDate()}
                {day.isHoliday && (
                  <span
                    className="vacation-calendar-holiday-indicator"
                    title={day.holiday?.name}
                  >
                    <EventIcon />
                  </span>
                )}
              </div>

              {day.vacations.length > 0 && (
                <div className="vacation-calendar-bubbles">
                  {day.vacations.slice(0, 4).map((vacation, vacationIndex) => {
                    const colorClass = getVacationColor(vacation.type);
                    return (
                      <div
                        key={`${vacation.id}-${vacationIndex}`}
                        className={`vacation-calendar-bubble ${colorClass}`}
                        onMouseEnter={(e) => handleVacationHover(vacation, e)}
                        onMouseLeave={handleVacationLeave}
                        onClick={(e) => handleVacationClick(vacation, e)}
                        title={
                          isPersonal
                            ? `Mi ${vacation.type === "rest_day" ? "día de descanso" : "día extra trabajado"}`
                            : `Click para eliminar: ${vacation.user?.fullName || "Usuario"}`
                        }
                      >
                        <div className="vacation-calendar-bubble-icon">
                          {getVacationIcon(vacation.type)}
                        </div>
                      </div>
                    );
                  })}
                  {day.vacations.length > 4 && (
                    <div className="vacation-calendar-bubble-more">
                      +{day.vacations.length - 4}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredVacation && (
        <div
          className="vacation-calendar-tooltip"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
          }}
        >
          <div className="vacation-calendar-tooltip-content">
            {!isPersonal && hoveredVacation.user?.photoUrl && (
              <div className="vacation-calendar-tooltip-image">
                <img
                  src={hoveredVacation.user.photoUrl}
                  alt={hoveredVacation.user.fullName}
                />
              </div>
            )}
            <div className="vacation-calendar-tooltip-info">
              {!isPersonal && (
                <h4>
                  <PersonIcon />
                  {hoveredVacation.user?.fullName || "Usuario"}
                </h4>
              )}
              <p className="vacation-calendar-tooltip-date">
                {calculateDayCount(
                  hoveredVacation.startDate,
                  hoveredVacation.endDate,
                ) === 1 ? (
                  <>Fecha: {formatDate(hoveredVacation.startDate)}</>
                ) : (
                  <>
                    Período:{" "}
                    {formatDateRange(
                      hoveredVacation.startDate,
                      hoveredVacation.endDate,
                    )}
                    <br />
                    <small>
                      (
                      {calculateDayCount(
                        hoveredVacation.startDate,
                        hoveredVacation.endDate,
                      )}{" "}
                      días)
                    </small>
                  </>
                )}
              </p>
              <p className="vacation-calendar-tooltip-type">
                {hoveredVacation.type === "rest_day"
                  ? "Día de descanso"
                  : "Día extra trabajado"}
              </p>
              {hoveredVacation.description && (
                <p className="vacation-calendar-tooltip-description">
                  {hoveredVacation.description}
                </p>
              )}
              {!isPersonal && (
                <div className="vacation-calendar-tooltip-action">
                  <small>💡 Haz clic para eliminar esta vacación</small>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VacationCalendar;

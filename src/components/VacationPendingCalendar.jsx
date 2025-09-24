import React, { useState, useEffect } from "react";
import "./VacationPendingCalendar.css";
import { calculateWorkingDays } from "../utils/dateUtils";

// Iconos
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EventIcon from "@mui/icons-material/Event";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import WorkIcon from "@mui/icons-material/Work";
import PersonIcon from "@mui/icons-material/Person";
import WarningIcon from "@mui/icons-material/Warning";

const VacationPendingCalendar = ({
  vacationRequest,
  conflictingVacations = [],
  showConflicts = true,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  const months = [
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

  useEffect(() => {
    if (vacationRequest?.startDate) {
      setCurrentMonth(new Date(vacationRequest.startDate));
    }
  }, [vacationRequest]);

  useEffect(() => {
    generateCalendar();
  }, [currentMonth, vacationRequest, conflictingVacations]);

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
    if (!vacationRequest?.startDate || !vacationRequest?.endDate)
      return "normal";

    const start = new Date(vacationRequest.startDate);
    const end = new Date(vacationRequest.endDate);
    const current = new Date(date);

    // Normalizar fechas para comparación
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    current.setHours(0, 0, 0, 0);

    if (current.getTime() === start.getTime()) return "start";
    if (current.getTime() === end.getTime()) return "end";
    if (current >= start && current <= end) return "vacation";

    return "normal";
  };

  const getDayConflicts = (date) => {
    if (!showConflicts || !conflictingVacations.length) return [];

    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);

    return conflictingVacations.filter((conflict) => {
      const conflictDate = new Date(conflict.date);
      conflictDate.setHours(0, 0, 0, 0);
      return conflictDate.getTime() === currentDate.getTime();
    });
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
    if (!vacationRequest?.startDate || !vacationRequest?.endDate) return "";

    const start = new Date(vacationRequest.startDate);
    const end = new Date(vacationRequest.endDate);

    const options = { day: "numeric", month: "short" };
    return `${start.toLocaleDateString("es-ES", options)} - ${end.toLocaleDateString("es-ES", options)}`;
  };

  const calculateDays = () => {
    if (!vacationRequest?.startDate || !vacationRequest?.endDate) return 0;
    return calculateWorkingDays(
      vacationRequest.startDate,
      vacationRequest.endDate,
    );
  };

  const getVacationIcon = (type) => {
    return type === "rest_day" ? <BeachAccessIcon /> : <WorkIcon />;
  };

  const getVacationTypeText = (type) => {
    return type === "rest_day" ? "Días de descanso" : "Días extra trabajados";
  };

  const getConflictCount = () => {
    if (!showConflicts || !vacationRequest) return 0;

    const start = new Date(vacationRequest.startDate);
    const end = new Date(vacationRequest.endDate);

    const conflictDates = new Set();
    conflictingVacations.forEach((conflict) => {
      const conflictDate = new Date(conflict.date);
      if (
        conflictDate >= start &&
        conflictDate <= end &&
        conflict.type === "rest_day"
      ) {
        conflictDates.add(conflictDate.toDateString());
      }
    });

    return conflictDates.size;
  };

  if (!vacationRequest) {
    return (
      <div className="vacation-pending-calendar">
        <div className="calendar-empty">
          <EventIcon />
          <p>Selecciona una solicitud para ver el calendario</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vacation-pending-calendar">
      <div className="calendar-header">
        <div className="calendar-title">
          <EventIcon className="calendar-icon" />
          <h3>Calendario de Solicitud</h3>
        </div>

        <div className="vacation-summary">
          <div className="vacation-period">
            <div className="period-info">
              <span className="period-text">{formatDateRange()}</span>
              <span className="period-duration">{calculateDays()} días</span>
            </div>
            <div className="vacation-type">
              {getVacationIcon(vacationRequest.type)}
              <span>{getVacationTypeText(vacationRequest.type)}</span>
            </div>
          </div>

          {showConflicts && getConflictCount() > 0 && (
            <div className="conflict-warning">
              <WarningIcon />
              <span>{getConflictCount()} conflicto(s)</span>
            </div>
          )}
        </div>
      </div>

      <div className="calendar-navigation">
        <button className="nav-button" onClick={() => navigateMonth(-1)}>
          <ChevronLeftIcon />
        </button>

        <h4 className="month-year">
          {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h4>

        <button className="nav-button" onClick={() => navigateMonth(1)}>
          <ChevronRightIcon />
        </button>
      </div>

      <div className="calendar-grid">
        <div className="day-names">
          {dayNames.map((day) => (
            <div key={day} className="day-name">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-days">
          {calendarDays.map((date, index) => {
            const status = getDayStatus(date);
            const conflicts = getDayConflicts(date);
            const isCurrentMonthDay = isCurrentMonth(date);
            const isTodayDate = isToday(date);

            return (
              <div
                key={index}
                className={`calendar-day 
                                    ${status} 
                                    ${!isCurrentMonthDay ? "other-month" : ""} 
                                    ${isTodayDate ? "today" : ""}
                                    ${conflicts.length > 0 ? "has-conflicts" : ""}
                                `}
              >
                <span className="day-number">{date.getDate()}</span>

                {status !== "normal" && (
                  <div className="vacation-indicator">
                    {getVacationIcon(vacationRequest.type)}
                  </div>
                )}

                {conflicts.length > 0 && status !== "normal" && (
                  <div className="conflict-indicators">
                    {conflicts.slice(0, 3).map((conflict, idx) => (
                      <div
                        key={idx}
                        className={`conflict-bubble ${conflict.type}`}
                        title={`${conflict.user?.fullName || "Usuario"} - ${conflict.type === "rest_day" ? "Descanso" : "Extra"}`}
                      >
                        <PersonIcon />
                      </div>
                    ))}
                    {conflicts.length > 3 && (
                      <div className="conflict-more">
                        +{conflicts.length - 3}
                      </div>
                    )}
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
          <div className="legend-color vacation-color"></div>
          <span>Período de Vacación</span>
        </div>
        <div className="legend-item">
          <div className="legend-color end-color"></div>
          <span>Fin</span>
        </div>
      </div>
    </div>
  );
};

export default VacationPendingCalendar;

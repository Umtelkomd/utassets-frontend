import React, { useState, useEffect } from "react";
import {
  BeachAccess as VacationIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Send as SendIcon,
  Cancel as CancelIcon,
  DateRange as RangeIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { vacationService } from "../services/vacationService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "./VacationRequestForm.css";
import {
  calculateWorkingDays,
  formatDate,
  formatDateRange,
} from "../utils/dateUtils";

const VacationRequestForm = ({
  onClose,
  selectedDate = null,
  isPersonal = false,
}) => {
  const { currentUser } = useAuth();
  const [availableDays, setAvailableDays] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: selectedDate ? selectedDate : "",
    endDate: "",
    type: "rest_day",
    description: "",
    isRange: false,
  });
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    if (currentUser?.id) {
      fetchAvailableDays();
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (formData.date) {
      checkConflicts();
    }
  }, [formData.date, formData.endDate, formData.isRange]);

  const fetchAvailableDays = async () => {
    try {
      const data = await vacationService.getUserAvailableDays(currentUser.id);
      setAvailableDays(data);
    } catch (error) {
      console.error("Error al obtener días disponibles:", error);
    }
  };

  const checkConflicts = async () => {
    // No verificar conflictos en modo personal
    if (isPersonal || !formData.date || formData.type !== "rest_day") {
      setConflicts([]);
      return;
    }

    try {
      if (formData.isRange && formData.endDate) {
        const conflictData = await vacationService.getVacationsByDateRange(
          formData.date,
          formData.endDate,
        );
        setConflicts(conflictData.filter((v) => v.userId !== currentUser.id));
      } else {
        const conflictData = await vacationService.getDateConflicts(
          formData.date,
        );
        setConflicts(conflictData.filter((v) => v.user.id !== currentUser.id));
      }
    } catch (error) {
      console.error("Error al verificar conflictos:", error);
      setConflicts([]);
    }
  };

  // Función para formatear el rango de fechas de una vacación
  const formatVacationRange = (vacation) => {
    if (vacation.startDate && vacation.endDate) {
      return formatDateRange(vacation.startDate, vacation.endDate);
    } else if (vacation.date) {
      return formatDate(vacation.date);
    }
    return "Fecha no disponible";
  };

  // Función para obtener conflictos detallados por fecha
  const getDetailedConflicts = () => {
    if (!formData.date || formData.type !== "rest_day") return [];

    // Generar todas las fechas del rango solicitado
    const requestDates = [];
    const startDate = new Date(formData.date);
    const endDate =
      formData.isRange && formData.endDate
        ? new Date(formData.endDate)
        : startDate;

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      requestDates.push(new Date(d));
    }

    // Para cada fecha del rango, encontrar conflictos
    const conflictsByDate = [];

    requestDates.forEach((date) => {
      const dateString = date.toISOString().split("T")[0];
      const dayConflicts = conflicts.filter((conflict) => {
        // Si el conflicto tiene startDate y endDate (rango)
        if (conflict.startDate && conflict.endDate) {
          const conflictStart = new Date(conflict.startDate);
          const conflictEnd = new Date(conflict.endDate);
          return date >= conflictStart && date <= conflictEnd;
        }
        // Si el conflicto es de un solo día
        if (conflict.date) {
          const conflictDate = new Date(conflict.date);
          return date.toDateString() === conflictDate.toDateString();
        }
        return false;
      });

      if (dayConflicts.length > 0) {
        conflictsByDate.push({
          date: date,
          dateString: dateString,
          conflicts: dayConflicts,
        });
      }
    });

    return conflictsByDate;
  };

  // Función para agrupar conflictos por usuario (versión mejorada)
  const getGroupedConflicts = () => {
    const detailed = getDetailedConflicts();
    const grouped = {};

    detailed.forEach((dateConflict) => {
      dateConflict.conflicts.forEach((conflict) => {
        const userName =
          conflict.user?.fullName || conflict.fullName || "Usuario desconocido";
        if (!grouped[userName]) {
          grouped[userName] = {
            userName,
            dates: [],
            conflicts: [],
          };
        }

        // Agregar fecha si no está ya en la lista
        const dateString = dateConflict.date.toISOString().split("T")[0];
        if (!grouped[userName].dates.some((d) => d.dateString === dateString)) {
          grouped[userName].dates.push({
            date: dateConflict.date,
            dateString: dateString,
            conflict: conflict,
          });
        }

        // Agregar conflicto si no está ya en la lista
        if (!grouped[userName].conflicts.some((c) => c.id === conflict.id)) {
          grouped[userName].conflicts.push(conflict);
        }
      });
    });

    return Object.values(grouped);
  };

  // Contar días únicos con conflictos
  const getConflictDaysCount = () => {
    const detailed = getDetailedConflicts();
    return detailed.length;
  };

  // Obtener resumen de conflictos para mostrar
  const getConflictSummary = () => {
    const grouped = getGroupedConflicts();
    const totalDays = getConflictDaysCount();
    const totalPeople = grouped.length;

    if (totalDays === 0) return null;

    // Crear resumen de personas
    const peopleNames = grouped.map((g) => g.userName).join(", ");

    return {
      totalDays,
      totalPeople,
      peopleNames,
      grouped,
    };
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.type) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    if (formData.isRange && !formData.endDate) {
      toast.error("Por favor selecciona la fecha de fin");
      return;
    }

    if (
      formData.isRange &&
      new Date(formData.endDate) < new Date(formData.date)
    ) {
      toast.error("La fecha de fin no puede ser anterior a la fecha de inicio");
      return;
    }

    // Validar días disponibles para días de descanso
    if (formData.type === "rest_day" && availableDays) {
      const requestedDays =
        formData.isRange && formData.endDate
          ? getDaysBetween(formData.date, formData.endDate)
          : 1;

      if (requestedDays > availableDays.availableDays) {
        toast.error(
          `sNo tienes suficientes días disponibles. Solicitas ${requestedDays} días, pero ssolo tienes ${(availableDays.availableDays, availableDays, availableDays.extraWorkDays)} días disponibles.`,
        );
        return;
      }
    }

    try {
      setLoading(true);

      const requestData = {
        userId: currentUser.id,
        ...formData,
      };

      const response = await vacationService.createVacation(requestData);

      if (response.status === "pending") {
        toast.success(
          "Solicitud de vacación enviada. Esperando aprobación del administrador.",
        );
      } else {
        toast.success(response.message);
      }

      onClose();
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      toast.error(
        error.response?.data?.message || "Error al enviar la solicitud",
      );
    } finally {
      setLoading(false);
    }
  };

  // formatDate ya importada de utils/dateUtils

  const getDaysBetween = (startDate, endDate) => {
    return calculateWorkingDays(startDate, endDate);
  };

  // Calcular días solicitados actuales
  const getCurrentlyRequestedDays = () => {
    if (formData.type !== "rest_day") return 0;

    return formData.isRange && formData.endDate
      ? getDaysBetween(formData.date, formData.endDate)
      : formData.date
        ? 1
        : 0;
  };

  // Calcular días restantes después de esta solicitud
  const getDaysAfterRequest = () => {
    if (!availableDays) return null;
    return availableDays.availableDays - getCurrentlyRequestedDays();
  };

  // Verificar si la solicitud excede los días disponibles
  const isRequestExceedingLimit = () => {
    if (formData.type !== "rest_day" || !availableDays) return false;
    return getCurrentlyRequestedDays() > availableDays.availableDays;
  };

  return (
    <div className="vacation-request-modal-overlay">
      <div className="vacation-request-modal">
        <div className="vacation-request-header">
          <div className="header-icon">
            <VacationIcon />
          </div>
          <div className="header-content">
            <h2>Solicitar Vacaciones</h2>
            <p>Completa el formulario para enviar tu solicitud</p>
          </div>
        </div>

        {availableDays && (
          <div className="available-days-info">
            <div className="days-summary">
              <div className="days-item">
                <span className="days-label">Días disponibles:</span>
                <span
                  className={`days-value ${
                    availableDays.availableDays < 0
                      ? "negative"
                      : availableDays.availableDays <= 5
                        ? "low"
                        : "normal"
                  }`}
                >
                  {availableDays.availableDays}
                </span>
              </div>
              <div className="days-item">
                <span className="days-label">Días usados:</span>
                <span className="days-value">{availableDays.usedRestDays}</span>
              </div>
              <div className="days-item">
                <span className="days-label">Días extra:</span>
                <span className="days-value">
                  {availableDays.extraWorkDays}
                </span>
              </div>
            </div>

            {/* Indicador de solicitud actual */}
            {formData.type === "rest_day" &&
              getCurrentlyRequestedDays() > 0 && (
                <div
                  className={`current-request-info ${isRequestExceedingLimit() ? "exceeding" : ""}`}
                >
                  <div className="request-calculation">
                    <div className="calculation-item">
                      <span className="calculation-label">Solicitando:</span>
                      <span className="calculation-value">
                        {getCurrentlyRequestedDays()} día(s)
                      </span>
                    </div>
                    <div className="calculation-item">
                      <span className="calculation-label">Quedarían:</span>
                      <span
                        className={`calculation-value ${getDaysAfterRequest() < 0 ? "negative" : getDaysAfterRequest() <= 5 ? "low" : "normal"}`}
                      >
                        {getDaysAfterRequest()} día(s)
                      </span>
                    </div>
                  </div>

                  {isRequestExceedingLimit() && (
                    <div className="limit-exceeded-warning">
                      <WarningIcon />
                      <span>⚠️ Esta solicitud excede tus días disponibles</span>
                    </div>
                  )}
                </div>
              )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="vacation-request-form">
          {/* Selector de fecha */}
          <div className="form-group">
            <label>
              <CalendarIcon />
              Fecha de inicio *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Toggle para rango de fechas */}
          <div className="range-toggle-container">
            <input
              type="checkbox"
              id="isRange"
              name="isRange"
              checked={formData.isRange}
              onChange={handleInputChange}
              className="range-toggle-input"
            />
            <label htmlFor="isRange" className="range-toggle-card">
              <div className="toggle-indicator">
                <RangeIcon />
              </div>
              <div className="toggle-content">
                <h4>Solicitar múltiples días</h4>
                <p>Selecciona un rango de fechas para tus vacaciones</p>
              </div>
              <div className="toggle-switch">
                <div className="switch-slider"></div>
              </div>
            </label>
          </div>

          {/* Fecha de fin si es rango */}
          {formData.isRange && (
            <div className="form-group">
              <label>
                <CalendarIcon />
                Fecha de fin *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required={formData.isRange}
                min={formData.date || new Date().toISOString().split("T")[0]}
              />
              {formData.date && formData.endDate && (
                <div className="date-range-info">
                  <CalendarIcon />
                  Solicitando {getDaysBetween(
                    formData.date,
                    formData.endDate,
                  )}{" "}
                  día(s) del {formatDate(formData.date)} al{" "}
                  {formatDate(formData.endDate)}
                </div>
              )}
            </div>
          )}

          {/* Tipo de vacación */}
          <div className="type-selector-container">
            <h3 className="type-selector-title">Tipo de vacación *</h3>
            <div className="type-options">
              <input
                type="radio"
                id="rest_day"
                name="type"
                value="rest_day"
                checked={formData.type === "rest_day"}
                onChange={handleInputChange}
                className="type-radio-input"
              />
              <label htmlFor="rest_day" className="type-option-card">
                <div className="type-indicator type-rest">
                  <VacationIcon />
                </div>
                <div className="type-content">
                  <h4>Día de descanso</h4>
                  <p>
                    Días de vacaciones regulares que se descuentan de tus días
                    disponibles
                  </p>
                </div>
                <div className="type-check">
                  <CheckIcon />
                </div>
              </label>

              <input
                type="radio"
                id="extra_work_day"
                name="type"
                value="extra_work_day"
                checked={formData.type === "extra_work_day"}
                onChange={handleInputChange}
                className="type-radio-input"
              />
              <label htmlFor="extra_work_day" className="type-option-card">
                <div className="type-indicator type-work">
                  <WorkIcon />
                </div>
                <div className="type-content">
                  <h4>Día de trabajo extra</h4>
                  <p>
                    Días trabajados fuera del horario regular que se suman a tus
                    días disponibles
                  </p>
                </div>
                <div className="type-check">
                  <CheckIcon />
                </div>
              </label>
            </div>
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label>
              <DescriptionIcon />
              Descripción (opcional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              placeholder="Describe el motivo de tu solicitud (opcional)"
            />
          </div>

          {/* Conflictos - Mostrar información detallada */}
          {(() => {
            const conflictSummary = getConflictSummary();
            if (!conflictSummary) return null;

            return (
              <div className="conflicts-warning">
                <div className="conflicts-header">
                  <WarningIcon />
                  <div className="conflicts-title">
                    <h4>⚠️ Conflictos de Vacaciones Detectados</h4>
                    <p>
                      Hay <strong>{conflictSummary.totalDays} día(s)</strong>{" "}
                      con conflictos que involucran a{" "}
                      <strong>{conflictSummary.totalPeople} persona(s)</strong>:
                    </p>
                    <div className="conflicts-summary">
                      <span className="conflicts-people">
                        👥 {conflictSummary.peopleNames}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="conflicts-details">
                  {conflictSummary.grouped.map((group, groupIndex) => (
                    <div key={groupIndex} className="conflict-user-group">
                      <div className="conflict-user-header">
                        <span className="conflict-user-name">
                          👤 {group.userName}
                        </span>
                        <span className="conflict-count">
                          {group.dates.length} día
                          {group.dates.length > 1 ? "s" : ""} en conflicto
                        </span>
                      </div>

                      <div className="conflict-dates">
                        {group.dates.map((dateItem, dateIndex) => (
                          <div key={dateIndex} className="conflict-date-item">
                            <span className="conflict-date">
                              📅 {formatDate(dateItem.dateString)}
                            </span>
                            {dateItem.conflict.description && (
                              <span className="conflict-description">
                                💬 {dateItem.conflict.description}
                              </span>
                            )}
                            <span className="conflict-type">
                              {dateItem.conflict.type === "rest_day"
                                ? "🏖️ Día de descanso"
                                : "💼 Día extra trabajado"}
                            </span>
                            {dateItem.conflict.startDate &&
                              dateItem.conflict.endDate && (
                                <span className="conflict-period">
                                  📆 Período:{" "}
                                  {formatVacationRange(dateItem.conflict)}
                                </span>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="conflicts-footer">
                  <p>
                    💡 <strong>Recomendación:</strong> Coordina con las personas
                    mencionadas antes de enviar la solicitud para evitar
                    problemas de cobertura.
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Botones */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              <CancelIcon />
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || isRequestExceedingLimit()}
            >
              <SendIcon />
              {loading ? "Enviando..." : "Enviar Solicitud"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VacationRequestForm;

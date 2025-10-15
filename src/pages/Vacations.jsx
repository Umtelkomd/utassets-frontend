import React, { useState, useEffect } from "react";
import {
  BeachAccess as VacationIcon,
  Add as AddIcon,
  Work as WorkIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  PendingActions as PendingIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import axiosInstance from "../axiosConfig";
import "./Vacations.css";
import { toast } from "react-toastify";
import VacationCalendar from "../components/VacationCalendar";
import LoadingSpinner from "../components/LoadingSpinner";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import CancelVacationsModal from "../components/CancelVacationsModal";
import PendingVacationsManager from "../components/PendingVacationsManager";
import VacationRequestForm from "../components/VacationRequestForm";
import HolidayManager from "../components/HolidayManager";
import { useAuth } from "../context/AuthContext";
import holidayService from "../services/holidayService";
import {
  calculateWorkingDays,
  formatDate,
  formatDateRange,
} from "../utils/dateUtils";

const Vacations = () => {
  const { currentUser } = useAuth();
  const [vacations, setVacations] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersWithDays, setUsersWithDays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [conflictingUsers, setConflictingUsers] = useState([]);
  const [formData, setFormData] = useState({
    userId: "",
    date: "",
    endDate: "",
    type: "rest_day",
    description: "",
    isRange: false,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    vacationId: null,
    userName: "",
    dateRange: "",
    type: "",
    dayCount: 0,
  });
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    user: null,
  });

  // Estados para solicitudes pendientes y formulario de técnicos
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar"); // 'calendar', 'pending', 'request'

  // Estados para edición de días de vacaciones
  const [editingVacationDays, setEditingVacationDays] = useState(null);
  const [editingDaysValue, setEditingDaysValue] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchVacations(),
        fetchUsers(),
        fetchUsersWithDays(),
        fetchAllHolidays(),
      ]);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar los datos de vacaciones");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllHolidays = async () => {
    try {
      // Obtener todos los festivos de todos los usuarios
      const allHolidays = [];
      const usersResponse = await axiosInstance.get("/users");
      for (const user of usersResponse.data) {
        const userHolidays = await holidayService.getHolidaysByUser(user.id);
        allHolidays.push(...userHolidays);
      }
      setHolidays(allHolidays);
    } catch (error) {
      console.error("Error al cargar festivos:", error);
    }
  };

  const fetchVacations = async () => {
    try {
      // Para el calendario, solo obtener vacaciones completamente aprobadas
      const response = await axiosInstance.get("/vacations", {
        params: { onlyApproved: "true" },
      });
      setVacations(response.data);
    } catch (error) {
      console.error("Error al cargar vacaciones:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/users");
      setUsers(response.data.filter((user) => user.isActive));
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  const fetchUsersWithDays = async () => {
    try {
      const response = await axiosInstance.get("/vacations/users");
      setUsersWithDays(response.data);
    } catch (error) {
      console.error("Error al cargar días disponibles:", error);
    }
  };

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // formatDateRange ya importada de utils/dateUtils

  const calculateDayCount = (startDate, endDate) => {
    return calculateWorkingDays(startDate, endDate);
  };

  const handleDateClick = async (date) => {
    setSelectedDate(date);
    const formattedDate = formatDateForInput(date);

    setFormData((prev) => ({
      ...prev,
      date: formattedDate,
      endDate: "",
      isRange: false,
    }));

    // Verificar conflictos para esa fecha
    try {
      const response = await axiosInstance.get(
        `/vacations/conflicts/${formattedDate}`,
      );
      setConflictingUsers(response.data);
    } catch (error) {
      console.error("Error al verificar conflictos:", error);
      setConflictingUsers([]);
    }

    setShowAddModal(true);
  };

  const handleAddVacation = async (e) => {
    e.preventDefault();

    if (!formData.userId || !formData.date || !formData.type) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    // Validar rango de fechas si está habilitado
    if (
      formData.isRange &&
      formData.endDate &&
      new Date(formData.endDate) < new Date(formData.date)
    ) {
      toast.error("La fecha de fin no puede ser anterior a la fecha de inicio");
      return;
    }

    try {
      const response = await axiosInstance.post("/vacations", formData);
      setShowAddModal(false);
      setFormData({
        userId: "",
        date: "",
        endDate: "",
        type: "rest_day",
        description: "",
        isRange: false,
      });
      setSelectedDate(null);
      setConflictingUsers([]);

      // Mostrar mensaje personalizado según la respuesta
      if (response.data.dayCount > 1) {
        toast.success(
          `Se creó la vacación de ${response.data.dayCount} días correctamente`,
        );
      } else {
        toast.success("Vacación agregada correctamente");
      }

      fetchData();
    } catch (error) {
      console.error("Error al agregar vacación:", error);
      toast.error(error.response?.data?.message || "Error al agregar vacación");
    }
  };

  const handleDeleteVacation = async () => {
    try {
      await axiosInstance.delete(`/vacations/${deleteModal.vacationId}`);
      toast.success("Vacación eliminada correctamente");
      fetchData();
    } catch (error) {
      console.error("Error al eliminar vacación:", error);
      toast.error("Error al eliminar vacación");
    } finally {
      closeDeleteModal();
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      vacationId: null,
      userName: "",
      dateRange: "",
      type: "",
      dayCount: 0,
    });
  };

  const handleOpenCancelModal = (user) => {
    setCancelModal({
      isOpen: true,
      user: user,
    });
  };

  const handleCloseCancelModal = () => {
    setCancelModal({
      isOpen: false,
      user: null,
    });
  };

  const handleVacationsCancelled = () => {
    fetchData(); // Recargar datos después de cancelar vacaciones
  };

  const handleAdjustVacationDays = async (userId, adjustment) => {
    try {
      const user = usersWithDays.find((u) => u.id === userId);
      if (!user) return;

      const newDays = user.totalDays + adjustment;
      if (newDays < 0) {
        toast.error("Los días de vacaciones no pueden ser negativos");
        return;
      }

      await axiosInstance.put(`/vacations/users/${userId}/vacation-days`, {
        vacationDays: newDays,
      });

      toast.success(
        `Días de vacaciones ${adjustment > 0 ? "aumentados" : "disminuidos"} correctamente`,
      );
      fetchData(); // Recargar datos
    } catch (error) {
      console.error("Error al ajustar días de vacaciones:", error);
      toast.error("Error al ajustar días de vacaciones");
    }
  };

  const handleStartEditingDays = (userId, currentDays) => {
    setEditingVacationDays(userId);
    setEditingDaysValue(currentDays.toString());
  };

  const handleCancelEditingDays = () => {
    setEditingVacationDays(null);
    setEditingDaysValue("");
  };

  const handleSaveEditingDays = async (userId) => {
    try {
      const newDays = parseInt(editingDaysValue);
      if (isNaN(newDays) || newDays < 0) {
        toast.error("Por favor ingresa un número válido de días");
        return;
      }

      await axiosInstance.put(`/vacations/users/${userId}/vacation-days`, {
        vacationDays: newDays,
      });

      toast.success("Días de vacaciones actualizados correctamente");
      setEditingVacationDays(null);
      setEditingDaysValue("");
      fetchData(); // Recargar datos
    } catch (error) {
      console.error("Error al actualizar días de vacaciones:", error);
      toast.error("Error al actualizar días de vacaciones");
    }
  };

  const handleVacationClick = (vacation) => {
    const dayCount = calculateDayCount(vacation.startDate, vacation.endDate);
    const dateRange =
      dayCount === 1
        ? formatDate(vacation.startDate)
        : formatDateRange(vacation.startDate, vacation.endDate);

    setDeleteModal({
      isOpen: true,
      vacationId: vacation.id,
      userName: vacation.user?.fullName || "Usuario",
      dateRange: dateRange,
      type:
        vacation.type === "rest_day"
          ? "día de descanso"
          : "día extra trabajado",
      dayCount: dayCount,
    });
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setFormData({
      userId: "",
      date: "",
      endDate: "",
      type: "rest_day",
      description: "",
      isRange: false,
    });
    setSelectedDate(null);
    setConflictingUsers([]);
  };

  // formatDate ya importada de utils/dateUtils

  const getDaysColor = (availableDays) => {
    if (availableDays < 0) return "vacation-days-negative";
    if (availableDays <= 5) return "vacation-days-low";
    if (availableDays <= 15) return "vacation-days-medium";
    return "vacation-days-high";
  };

  const getDaysBetween = (startDate, endDate) => {
    return calculateWorkingDays(startDate, endDate);
  };

  const checkRangeConflicts = async (startDate, endDate) => {
    if (!startDate) return;

    try {
      const response = await axiosInstance.get("/vacations/date-range", {
        params: {
          startDate,
          endDate: endDate || startDate,
        },
      });
      setConflictingUsers(response.data);
    } catch (error) {
      console.error("Error al verificar conflictos:", error);
      setConflictingUsers([]);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando vacaciones..." />;
  }

  return (
    <div className="vacations-page">
      <header className="page-header">
        <div className="header-title">
          <VacationIcon />
          <h1>
            {currentUser?.role === "administrador"
              ? "Gestión de Vacaciones"
              : "Mis Vacaciones"}
          </h1>
        </div>
        <div className="header-info">
          <span>Año {new Date().getFullYear()}</span>
          {currentUser?.role === "tecnico" && (
            <button
              className="btn-primary"
              onClick={() => setShowRequestForm(true)}
            >
              <AddIcon />
              Nueva Solicitud
            </button>
          )}
        </div>
      </header>

      {/* Navegación por pestañas para administradores */}
      {currentUser?.role === "administrador" && (
        <div className="tabs-navigation">
          <button
            className={`tab-button ${activeTab === "calendar" ? "active" : ""}`}
            onClick={() => setActiveTab("calendar")}
          >
            <CalendarIcon />
            Calendario
          </button>
          <button
            className={`tab-button ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            <PendingIcon />
            Solicitudes Pendientes
          </button>
          <button
            className={`tab-button ${activeTab === "holidays" ? "active" : ""}`}
            onClick={() => setActiveTab("holidays")}
          >
            <CalendarIcon />
            Festivos
          </button>
        </div>
      )}

      {/* Contenido principal según rol y pestaña activa */}
      {currentUser?.role === "administrador" && activeTab === "calendar" && (
        <>
          {/* Calendario de Vacaciones */}
          <div className="calendar-section">
            <h2>
              <CalendarIcon />
              Calendario de Vacaciones
            </h2>
            <p className="calendar-description">
              Haz clic en cualquier día para agregar una vacación o día extra
              trabajado. Haz clic en las burbujas de colores para eliminar
              vacaciones existentes.
            </p>
            <VacationCalendar
              vacations={vacations}
              holidays={holidays}
              onDateClick={handleDateClick}
              onVacationClick={handleVacationClick}
            />
          </div>

          {/* Cards de Días Disponibles */}
          <div className="users-days-section">
            <h2>
              <PersonIcon />
              Días Disponibles por Persona
            </h2>
            <div className="users-days-grid">
              {usersWithDays.map((user) => (
                <div key={user.id} className="user-days-card">
                  <div className="user-days-header">
                    <div className="user-avatar">
                      {user.photoUrl ? (
                        <img
                          src={user.photoUrl}
                          alt={user.fullName}
                          className="user-image"
                        />
                      ) : (
                        <div className="default-avatar">
                          {user.fullName
                            ? user.fullName.charAt(0).toUpperCase()
                            : "U"}
                        </div>
                      )}
                    </div>
                    <div className="user-info">
                      <h3>{user.fullName}</h3>
                      <p>{user.email}</p>
                    </div>
                  </div>

                  <div className="user-days-stats">
                    <div className="days-stat">
                      <span className="stat-label">Total del año</span>
                      <div className="stat-value-container">
                        {editingVacationDays === user.id ? (
                          <div className="edit-days-container">
                            <input
                              type="number"
                              value={editingDaysValue}
                              onChange={(e) =>
                                setEditingDaysValue(e.target.value)
                              }
                              className="edit-days-input"
                              min="0"
                              max="365"
                            />
                            <div className="edit-days-buttons">
                              <button
                                className="btn-save-days"
                                onClick={() => handleSaveEditingDays(user.id)}
                                title="Guardar"
                              >
                                <SaveIcon />
                              </button>
                              <button
                                className="btn-cancel-days"
                                onClick={handleCancelEditingDays}
                                title="Cancelar"
                              >
                                <CloseIcon />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="stat-value-with-controls">
                            <span className="stat-value">
                              {user.totalDays} días
                            </span>
                            <div className="days-controls">
                              <button
                                className="btn-adjust-days decrease"
                                onClick={() =>
                                  handleAdjustVacationDays(user.id, -1)
                                }
                                title="Disminuir 1 día"
                              >
                                <RemoveIcon />
                              </button>
                              <button
                                className="btn-adjust-days increase"
                                onClick={() =>
                                  handleAdjustVacationDays(user.id, 1)
                                }
                                title="Aumentar 1 día"
                              >
                                <AddIcon />
                              </button>
                              <button
                                className="btn-adjust-days edit"
                                onClick={() =>
                                  handleStartEditingDays(
                                    user.id,
                                    user.totalDays,
                                  )
                                }
                                title="Editar directamente"
                              >
                                <EditIcon />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="days-stat">
                      <span className="stat-label">Días usados</span>
                      <span className="stat-value">
                        {user.usedRestDays} días
                      </span>
                    </div>
                    <div className="days-stat">
                      <span className="stat-label">Días extra</span>
                      <span className="stat-value">
                        +{user.extraWorkDays} días
                      </span>
                    </div>
                    <div
                      className={`days-stat available-days ${getDaysColor(user.availableDays)}`}
                    >
                      <span className="stat-label">Disponibles</span>
                      <span className="stat-value">
                        {user.availableDays} días
                      </span>
                    </div>
                  </div>

                  <div className="user-days-actions">
                    <button
                      className="btn-rest-day"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          userId: user.id,
                          type: "rest_day",
                          date: "",
                          endDate: "",
                          isRange: false,
                        }));
                        setConflictingUsers([]);
                        setShowAddModal(true);
                      }}
                    >
                      <VacationIcon />
                      Día de descanso
                    </button>
                    <button
                      className="btn-work-day"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          userId: user.id,
                          type: "extra_work_day",
                          date: "",
                          endDate: "",
                          isRange: false,
                        }));
                        setConflictingUsers([]);
                        setShowAddModal(true);
                      }}
                    >
                      <WorkIcon />
                      Día extra
                    </button>
                    {user.usedRestDays > 0 && (
                      <button
                        className="btn-cancel-vacations"
                        onClick={() => handleOpenCancelModal(user)}
                      >
                        <CancelIcon />
                        Cancelar vacaciones
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal para agregar vacación */}
          {showAddModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>
                  {formData.type === "rest_day"
                    ? "Agregar Día de Descanso"
                    : "Agregar Día Extra Trabajado"}
                </h2>

                {selectedDate && (
                  <div className="selected-date-info">
                    <CalendarIcon />
                    <span>Fecha seleccionada: {formatDate(selectedDate)}</span>
                  </div>
                )}

                {conflictingUsers.length > 0 && (
                  <div className="conflicts-warning">
                    <WarningIcon />
                    <div>
                      <h4>
                        {formData.isRange
                          ? "Personas que también estarán ausentes en el rango seleccionado:"
                          : "Personas que también estarán ausentes este día:"}
                      </h4>
                      <ul>
                        {conflictingUsers.map((conflict) => (
                          <li key={conflict.id}>
                            {conflict.user.fullName}
                            {conflict.startDate &&
                              conflict.endDate &&
                              ` - ${formatDateRange(conflict.startDate, conflict.endDate)}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <form onSubmit={handleAddVacation}>
                  <div className="form-group">
                    <label>
                      <PersonIcon /> Persona:
                    </label>
                    <select
                      value={formData.userId}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          userId: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">Seleccionar persona</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.fullName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      <CalendarIcon /> Fecha de inicio:
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setFormData((prev) => ({ ...prev, date: newDate }));
                        if (newDate) {
                          checkRangeConflicts(newDate, formData.endDate);
                        }
                      }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <div className="range-toggle-container">
                      <input
                        type="checkbox"
                        id="rangeToggle"
                        className="range-toggle-input"
                        checked={formData.isRange}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isRange: e.target.checked,
                            endDate: e.target.checked ? prev.endDate : "",
                          }))
                        }
                      />
                      <label
                        htmlFor="rangeToggle"
                        className="range-toggle-card"
                      >
                        <div className="toggle-indicator">
                          <CalendarIcon />
                        </div>
                        <div className="toggle-content">
                          <h4>Múltiples días consecutivos</h4>
                          <p>Crea una sola vacación en un rango de fechas</p>
                        </div>
                        <div className="toggle-switch">
                          <div className="switch-slider"></div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {formData.isRange && (
                    <div className="form-group">
                      <label>
                        <CalendarIcon /> Fecha de fin:
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => {
                          const newEndDate = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            endDate: newEndDate,
                          }));
                          if (formData.date && newEndDate) {
                            checkRangeConflicts(formData.date, newEndDate);
                          }
                        }}
                        min={formData.date}
                        required={formData.isRange}
                      />
                      {formData.date && formData.endDate && (
                        <small className="date-range-info">
                          Se creará una vacación de{" "}
                          {getDaysBetween(formData.date, formData.endDate)}{" "}
                          día(s)
                        </small>
                      )}
                    </div>
                  )}

                  <div className="form-group">
                    <div className="type-selector-container">
                      <h3 className="type-selector-title">
                        Selecciona el tipo de vacación:
                      </h3>

                      <div className="type-options">
                        <input
                          type="radio"
                          id="restDay"
                          name="vacationType"
                          value="rest_day"
                          className="type-radio-input"
                          checked={formData.type === "rest_day"}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              type: e.target.value,
                            }))
                          }
                        />
                        <label htmlFor="restDay" className="type-option-card">
                          <div className="type-indicator type-rest">
                            <VacationIcon />
                          </div>
                          <div className="type-content">
                            <h4>Día de descanso</h4>
                            <p>Solicita un día libre o vacaciones</p>
                          </div>
                          <div className="type-check">
                            <CheckIcon />
                          </div>
                        </label>

                        <input
                          type="radio"
                          id="workDay"
                          name="vacationType"
                          value="extra_work_day"
                          className="type-radio-input"
                          checked={formData.type === "extra_work_day"}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              type: e.target.value,
                            }))
                          }
                        />
                        <label htmlFor="workDay" className="type-option-card">
                          <div className="type-indicator type-work">
                            <WorkIcon />
                          </div>
                          <div className="type-content">
                            <h4>Día extra trabajado</h4>
                            <p>Registra un día extra de trabajo</p>
                          </div>
                          <div className="type-check">
                            <CheckIcon />
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Descripción (opcional):</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Motivo o descripción adicional..."
                      rows="3"
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="submit" className="btn-primary">
                      <AddIcon />
                      {formData.type === "rest_day"
                        ? "Agregar Descanso"
                        : "Agregar Día Extra"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleCloseModal}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal de confirmación de eliminación */}
          {deleteModal.isOpen && (
            <DeleteConfirmationModal
              isOpen={deleteModal.isOpen}
              onClose={closeDeleteModal}
              onConfirm={handleDeleteVacation}
              itemName={`${deleteModal.userName} - ${deleteModal.dateRange}`}
              title="Confirmar Eliminación de Vacación"
              message={`¿Estás seguro de que deseas eliminar este ${deleteModal.type} de ${deleteModal.userName}?`}
              details={
                deleteModal.dayCount > 1 ? (
                  <div>
                    <p>
                      <strong>Período:</strong> {deleteModal.dateRange}
                    </p>
                    <p>
                      <strong>Duración:</strong> {deleteModal.dayCount} días
                    </p>
                  </div>
                ) : (
                  <p>
                    <strong>Fecha:</strong> {deleteModal.dateRange}
                  </p>
                )
              }
            />
          )}

          {/* Modal de cancelación de vacaciones */}
          {cancelModal.isOpen && (
            <CancelVacationsModal
              isOpen={cancelModal.isOpen}
              onClose={handleCloseCancelModal}
              user={cancelModal.user}
              onVacationsDeleted={handleVacationsCancelled}
            />
          )}
        </>
      )}

      {/* Pestaña de solicitudes pendientes para administradores */}
      {currentUser?.role === "administrador" && activeTab === "pending" && (
        <PendingVacationsManager onUpdate={fetchData} />
      )}

      {/* Gestión de Festivos */}
      {currentUser?.role === "administrador" && activeTab === "holidays" && (
        <HolidayManager users={users} />
      )}

      {/* Vista para técnicos - Solo calendario personal */}
      {currentUser?.role === "tecnico" && (
        <div className="calendar-section">
          <h2>
            <CalendarIcon />
            Mi Calendario de Vacaciones
          </h2>
          <p className="calendar-description">
            Consulta el estado de tus solicitudes de vacaciones. Las solicitudes
            aprobadas aparecen en el calendario.
          </p>
          <VacationCalendar
            vacations={vacations.filter((v) => v.userId === currentUser.id)}
            holidays={holidays.filter((h) => h.userId === currentUser.id)}
            isPersonal={true}
            showOnlyOwnVacations={true}
            currentUserId={currentUser.id}
          />
        </div>
      )}

      {/* Modal de solicitud para técnicos */}
      {showRequestForm && currentUser?.role === "tecnico" && (
        <VacationRequestForm
          onClose={() => {
            setShowRequestForm(false);
            fetchData(); // Refrescar datos después de crear solicitud
          }}
        />
      )}
    </div>
  );
};

export default Vacations;

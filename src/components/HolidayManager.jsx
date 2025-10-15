import React, { useState, useEffect } from "react";
import {
  Event as HolidayIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import holidayService from "../services/holidayService";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import "./HolidayManager.css";

const HolidayManager = ({ users, onUpdate }) => {
  const [holidays, setHolidays] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    name: "",
    description: "",
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    holidayId: null,
    holidayName: "",
  });

  useEffect(() => {
    if (selectedUserId && selectedUserId !== "ALL") {
      fetchHolidays();
    } else {
      setHolidays([]);
    }
  }, [selectedUserId]);

  const fetchHolidays = async () => {
    if (!selectedUserId) return;

    try {
      setIsLoading(true);
      const data = await holidayService.getHolidaysByUser(selectedUserId);
      setHolidays(data);
    } catch (error) {
      toast.error("Error al cargar festivos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();

    if (!selectedUserId) {
      toast.error("Por favor selecciona un técnico o TODOS");
      return;
    }

    try {
      // Si se seleccionó "TODOS", crear festivo para todos los técnicos
      if (selectedUserId === "ALL") {
        const holidaysToCreate = users.map((user) => ({
          ...formData,
          userId: user.id,
        }));

        const result =
          await holidayService.createMultipleHolidays(holidaysToCreate);

        if (result.created && result.created.length > 0) {
          toast.success(
            `Festivo agregado para ${result.created.length} técnico(s)`,
          );
        }

        if (result.errors && result.errors.length > 0) {
          toast.warning(
            `${result.errors.length} técnico(s) ya tenían este festivo asignado`,
          );
        }

        setShowAddModal(false);
        setFormData({ date: "", name: "", description: "" });
        setSelectedUserId("");
        if (onUpdate) onUpdate();
      } else {
        // Crear festivo para un solo técnico
        await holidayService.createHoliday({
          ...formData,
          userId: parseInt(selectedUserId),
        });
        toast.success("Festivo agregado correctamente");
        setShowAddModal(false);
        setFormData({ date: "", name: "", description: "" });
        fetchHolidays();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error("Ya existe un festivo en esta fecha para este técnico");
      } else {
        toast.error("Error al agregar festivo");
      }
    }
  };

  const confirmDelete = async () => {
    try {
      await holidayService.deleteHoliday(deleteModal.holidayId);
      toast.success("Festivo eliminado correctamente");
      fetchHolidays();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error("Error al eliminar festivo");
    } finally {
      closeDeleteModal();
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      holidayId: null,
      holidayName: "",
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const selectedUser = users.find((u) => u.id === parseInt(selectedUserId));

  return (
    <div className="holiday-manager">
      <div className="holiday-header">
        <div className="header-title">
          <HolidayIcon />
          <h2>Gestión de Días Festivos</h2>
        </div>
      </div>

      <div className="user-selector-section">
        <div className="form-group">
          <label>
            <PersonIcon /> Seleccionar Técnico:
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            required
          >
            <option value="">-- Selecciona un técnico --</option>
            <option
              value="ALL"
              style={{ fontWeight: "bold", color: "#2196f3" }}
            >
              🌍 TODOS LOS TÉCNICOS
            </option>
            <option disabled>──────────</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName}
              </option>
            ))}
          </select>
        </div>

        {selectedUserId && (
          <button
            className="add-holiday-btn"
            onClick={() => setShowAddModal(true)}
          >
            <AddIcon />
            Agregar Festivo
          </button>
        )}
      </div>

      {selectedUserId && selectedUserId !== "ALL" && (
        <div className="holidays-section">
          <div className="section-header">
            <h3>Festivos de {selectedUser?.fullName}</h3>
            <span className="holiday-count">{holidays.length} festivos</span>
          </div>

          {isLoading ? (
            <div className="loading-message">Cargando festivos...</div>
          ) : holidays.length === 0 ? (
            <div className="no-holidays">
              <HolidayIcon />
              <p>No hay festivos registrados para este técnico.</p>
              <p className="hint">
                Agrega festivos para que no se descuenten de las vacaciones.
              </p>
            </div>
          ) : (
            <div className="holidays-list">
              {holidays.map((holiday) => (
                <div key={holiday.id} className="holiday-card">
                  <div className="holiday-info">
                    <div className="holiday-date">
                      <CalendarIcon />
                      <span>{formatDate(holiday.date)}</span>
                    </div>
                    <h4>{holiday.name}</h4>
                    {holiday.description && (
                      <p className="holiday-description">
                        <DescriptionIcon />
                        {holiday.description}
                      </p>
                    )}
                  </div>
                  <button
                    className="delete-holiday-btn"
                    onClick={() =>
                      setDeleteModal({
                        isOpen: true,
                        holidayId: holiday.id,
                        holidayName: `${holiday.name} - ${formatDate(holiday.date)}`,
                      })
                    }
                  >
                    <DeleteIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedUserId === "ALL" && (
        <div className="holidays-section">
          <div className="all-users-info">
            <HolidayIcon style={{ fontSize: "48px", color: "#2196f3" }} />
            <h3>Asignar festivo a todos los técnicos</h3>
            <p>
              Al agregar un festivo con la opción "TODOS LOS TÉCNICOS"
              seleccionada, el festivo se asignará automáticamente a todos los
              técnicos del sistema.
            </p>
            <p className="info-note">
              💡 <strong>Nota:</strong> Si algún técnico ya tiene este festivo
              asignado, se omitirá automáticamente.
            </p>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content holiday-modal">
            <div className="modal-header">
              <h2>
                <AddIcon />
                Agregar Festivo
              </h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ date: "", name: "", description: "" });
                }}
              >
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={handleAddHoliday}>
              <div className="form-group">
                <label>
                  <PersonIcon /> Técnico:
                </label>
                <input
                  type="text"
                  value={
                    selectedUserId === "ALL"
                      ? "🌍 TODOS LOS TÉCNICOS"
                      : selectedUser?.fullName || ""
                  }
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label>
                  <CalendarIcon /> Fecha:
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <HolidayIcon /> Nombre del Festivo:
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ej: Día de la Independencia"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <DescriptionIcon /> Descripción (opcional):
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Información adicional sobre el festivo..."
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  <AddIcon />
                  Agregar Festivo
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ date: "", name: "", description: "" });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          itemName={deleteModal.holidayName}
          title="Confirmar Eliminación de Festivo"
          message={`¿Estás seguro de que deseas eliminar el festivo "${deleteModal.holidayName}"?`}
        />
      )}
    </div>
  );
};

export default HolidayManager;

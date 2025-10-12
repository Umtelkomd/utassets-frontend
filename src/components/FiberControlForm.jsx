import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import * as fiberService from "../services/fiberControlService";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Build as BuildIcon,
  Inventory as InventoryIcon,
  Business as BusinessIcon,
  Calculate as CalculateIcon,
} from "@mui/icons-material";

const FiberControlForm = ({
  isOpen,
  onClose,
  workOrder,
  onSave,
  activities,
  technicians,
  equipment,
  materials,
  subcontractors,
  settings,
}) => {
  const [formData, setFormData] = useState({
    client: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    status: "Pendiente",
    activities: [],
    executorType: "internal",
    dailyLogs: [],
    subcontractorId: "",
    subcontractorCost: 0,
  });

  useEffect(() => {
    if (workOrder) {
      setFormData(JSON.parse(JSON.stringify(workOrder)));
    } else {
      setFormData({
        client: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        status: "Pendiente",
        activities: [],
        executorType: "internal",
        dailyLogs: [],
        subcontractorId: "",
        subcontractorCost: 0,
      });
    }
  }, [workOrder, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExecutorChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      executorType: type,
      dailyLogs: type === "internal" ? prev.dailyLogs || [] : [],
      subcontractorId: type === "subcontractor" ? prev.subcontractorId : "",
      subcontractorCost: type === "subcontractor" ? prev.subcontractorCost : 0,
    }));
  };

  // Activities
  const addActivity = () => {
    setFormData((prev) => ({
      ...prev,
      activities: [...prev.activities, { activityId: "", quantity: 0 }],
    }));
  };

  const updateActivity = (index, field, value) => {
    const newActivities = [...formData.activities];
    newActivities[index] = { ...newActivities[index], [field]: value };
    setFormData((prev) => ({ ...prev, activities: newActivities }));
  };

  const removeActivity = (index) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }));
  };

  // Daily Logs
  const addDailyLog = () => {
    // Check if there's an unsaved daily log (empty log without any entries)
    const hasUnsavedLog = (formData.dailyLogs || []).some(
      (log) =>
        log.time.length === 0 &&
        log.equipment.length === 0 &&
        log.materials.length === 0,
    );

    if (hasUnsavedLog) {
      toast.warning("Completa el reporte actual antes de agregar uno nuevo");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      dailyLogs: [
        ...(prev.dailyLogs || []),
        {
          date: new Date().toISOString().split("T")[0],
          time: [],
          equipment: [],
          materials: [],
        },
      ],
    }));
  };

  const removeDailyLog = (index) => {
    setFormData((prev) => ({
      ...prev,
      dailyLogs: prev.dailyLogs.filter((_, i) => i !== index),
    }));
  };

  const updateDailyLogDate = (index, date) => {
    const newLogs = [...formData.dailyLogs];
    newLogs[index].date = date;
    setFormData((prev) => ({ ...prev, dailyLogs: newLogs }));
  };

  const addDailyLogEntry = (logIndex, type) => {
    const newLogs = [...formData.dailyLogs];
    if (type === "time") {
      newLogs[logIndex].time = [
        ...newLogs[logIndex].time,
        { technicianId: "", hours: 0 },
      ];
    } else if (type === "equipment") {
      newLogs[logIndex].equipment = [
        ...newLogs[logIndex].equipment,
        { equipmentId: "", hours: 0 },
      ];
    } else if (type === "materials") {
      newLogs[logIndex].materials = [
        ...newLogs[logIndex].materials,
        { materialId: "", quantity: 0 },
      ];
    }
    setFormData((prev) => ({ ...prev, dailyLogs: newLogs }));
  };

  const removeDailyLogEntry = (logIndex, type, entryIndex) => {
    const newLogs = [...formData.dailyLogs];
    newLogs[logIndex][type] = newLogs[logIndex][type].filter(
      (_, i) => i !== entryIndex,
    );
    setFormData((prev) => ({ ...prev, dailyLogs: newLogs }));
  };

  const updateDailyLogEntry = (logIndex, type, entryIndex, field, value) => {
    const newLogs = [...formData.dailyLogs];
    newLogs[logIndex][type][entryIndex][field] = value;
    setFormData((prev) => ({ ...prev, dailyLogs: newLogs }));
  };

  const financialSummary = useMemo(() => {
    const income = fiberService.calculateWorkOrderIncome(formData, activities);
    const costs = fiberService.calculateWorkOrderCosts(
      formData,
      settings,
      technicians,
      equipment,
      materials,
    );
    const profitability = fiberService.calculateProfitability(
      income,
      costs.totalCost,
    );
    return { income, costs, profitability };
  }, [formData, activities, settings, technicians, equipment, materials]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.client.trim()) {
      toast.error("El nombre del cliente es requerido");
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content fiber-form-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>
            {workOrder
              ? `Editar OT: ${workOrder.id}`
              : "Nueva Orden de Trabajo"}
          </h2>
          <button className="close-button" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="fiber-form-grid">
            {/* Main Column */}
            <div className="fiber-form-main">
              {/* General Data */}
              <div className="form-section">
                <h3>
                  <InfoIcon /> Datos Generales
                </h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Cliente *</label>
                    <input
                      type="text"
                      name="client"
                      value={formData.client}
                      onChange={handleChange}
                      placeholder="Nombre del cliente"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Estado</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En Progreso">En Progreso</option>
                      <option value="Completada">Completada</option>
                      <option value="Facturada">Facturada</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha Inicio</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha Fin</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Activities */}
              <div className="form-section">
                <div className="section-header">
                  <h3>
                    <AssignmentIcon /> Actividades
                  </h3>
                  <button
                    type="button"
                    onClick={addActivity}
                    className="btn-small"
                  >
                    <AddIcon /> Añadir
                  </button>
                </div>
                {formData.activities.map((act, index) => (
                  <div key={index} className="activity-row">
                    <select
                      value={act.activityId}
                      onChange={(e) =>
                        updateActivity(index, "activityId", e.target.value)
                      }
                    >
                      <option value="">Seleccionar actividad...</option>
                      {activities.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.id} - {a.description}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={act.quantity}
                      onChange={(e) =>
                        updateActivity(
                          index,
                          "quantity",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="Cantidad"
                      min="0"
                      step="0.01"
                    />
                    <button
                      type="button"
                      onClick={() => removeActivity(index)}
                      className="btn-icon-danger"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                ))}
              </div>

              {/* Executor Type */}
              <div className="form-section">
                <h3>
                  <PeopleIcon /> Tipo de Ejecución
                </h3>
                <div className="executor-buttons">
                  <button
                    type="button"
                    className={`executor-btn ${formData.executorType === "internal" ? "active" : ""}`}
                    onClick={() => handleExecutorChange("internal")}
                  >
                    <PeopleIcon /> Personal Interno
                  </button>
                  <button
                    type="button"
                    className={`executor-btn ${formData.executorType === "subcontractor" ? "active" : ""}`}
                    onClick={() => handleExecutorChange("subcontractor")}
                  >
                    <BusinessIcon /> Subcontrata
                  </button>
                </div>
              </div>

              {/* Internal Execution */}
              {formData.executorType === "internal" && (
                <div className="form-section">
                  <div className="section-header">
                    <h3>Reportes Diarios</h3>
                    <button
                      type="button"
                      onClick={addDailyLog}
                      className="btn-small"
                    >
                      <AddIcon /> Nuevo Reporte
                    </button>
                  </div>
                  {(formData.dailyLogs || []).map((log, logIndex) => (
                    <div key={logIndex} className="daily-log-card">
                      <div className="daily-log-header">
                        <input
                          type="date"
                          value={log.date}
                          onChange={(e) =>
                            updateDailyLogDate(logIndex, e.target.value)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeDailyLog(logIndex)}
                          className="btn-icon-danger"
                        >
                          <DeleteIcon />
                        </button>
                      </div>

                      {/* Technicians */}
                      <div className="log-section">
                        <div className="log-section-header">
                          <strong>
                            <PeopleIcon
                              fontSize="small"
                              style={{
                                verticalAlign: "middle",
                                marginRight: "6px",
                              }}
                            />
                            Técnicos
                          </strong>
                          <button
                            type="button"
                            onClick={() => addDailyLogEntry(logIndex, "time")}
                            className="btn-mini"
                            title="Agregar técnico existente"
                          >
                            + Técnico
                          </button>
                        </div>
                        {log.time.length === 0 && (
                          <div className="empty-state">
                            <PeopleIcon
                              style={{ opacity: 0.3, fontSize: "2rem" }}
                            />
                            <p>
                              No hay técnicos asignados. Haz clic en "+ Técnico"
                              para agregar uno.
                            </p>
                          </div>
                        )}
                        {technicians.length === 0 && log.time.length > 0 && (
                          <div className="warning-message">
                            ⚠️ No hay técnicos disponibles. Ve a Configuración →
                            Técnicos para agregar uno.
                          </div>
                        )}
                        {log.time.map((entry, entryIndex) => {
                          const selectedTech = technicians.find(
                            (t) => t.id === entry.technicianId,
                          );
                          return (
                            <div key={entryIndex} className="log-entry">
                              <div className="log-entry-select">
                                <select
                                  value={entry.technicianId}
                                  onChange={(e) =>
                                    updateDailyLogEntry(
                                      logIndex,
                                      "time",
                                      entryIndex,
                                      "technicianId",
                                      e.target.value,
                                    )
                                  }
                                  disabled={technicians.length === 0}
                                >
                                  <option value="">
                                    {technicians.length === 0
                                      ? "⚠️ No hay técnicos disponibles"
                                      : "🔍 Seleccionar técnico existente..."}
                                  </option>
                                  {technicians.map((t) => (
                                    <option key={t.id} value={t.id}>
                                      👷 {t.name} - €{t.costPerHour}/h
                                    </option>
                                  ))}
                                </select>
                                {selectedTech && (
                                  <small className="selected-info">
                                    Coste: €{selectedTech.costPerHour}/h
                                  </small>
                                )}
                              </div>
                              <input
                                type="number"
                                value={entry.hours}
                                onChange={(e) =>
                                  updateDailyLogEntry(
                                    logIndex,
                                    "time",
                                    entryIndex,
                                    "hours",
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                placeholder="⏱️ Horas trabajadas"
                                min="0"
                                step="0.5"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  removeDailyLogEntry(
                                    logIndex,
                                    "time",
                                    entryIndex,
                                  )
                                }
                                className="btn-mini-danger"
                                title="Eliminar técnico"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Equipment */}
                      <div className="log-section">
                        <div className="log-section-header">
                          <strong>
                            <BuildIcon
                              fontSize="small"
                              style={{
                                verticalAlign: "middle",
                                marginRight: "6px",
                              }}
                            />
                            Equipos
                          </strong>
                          <button
                            type="button"
                            onClick={() =>
                              addDailyLogEntry(logIndex, "equipment")
                            }
                            className="btn-mini"
                            title="Agregar equipo existente"
                          >
                            + Equipo
                          </button>
                        </div>
                        {log.equipment.length === 0 && (
                          <div className="empty-state">
                            <BuildIcon
                              style={{ opacity: 0.3, fontSize: "2rem" }}
                            />
                            <p>
                              No hay equipos asignados. Haz clic en "+ Equipo"
                              para agregar uno.
                            </p>
                          </div>
                        )}
                        {equipment.length === 0 && log.equipment.length > 0 && (
                          <div className="warning-message">
                            ⚠️ No hay equipos disponibles. Ve a Configuración →
                            Equipos para agregar uno.
                          </div>
                        )}
                        {log.equipment.map((entry, entryIndex) => {
                          const selectedEquip = equipment.find(
                            (e) => e.id === entry.equipmentId,
                          );
                          return (
                            <div key={entryIndex} className="log-entry">
                              <div className="log-entry-select">
                                <select
                                  value={entry.equipmentId}
                                  onChange={(e) =>
                                    updateDailyLogEntry(
                                      logIndex,
                                      "equipment",
                                      entryIndex,
                                      "equipmentId",
                                      e.target.value,
                                    )
                                  }
                                  disabled={equipment.length === 0}
                                >
                                  <option value="">
                                    {equipment.length === 0
                                      ? "⚠️ No hay equipos disponibles"
                                      : "🔍 Seleccionar equipo existente..."}
                                  </option>
                                  {equipment.map((e) => (
                                    <option key={e.id} value={e.id}>
                                      🔧 {e.name} - €{e.costPerHour}/h
                                    </option>
                                  ))}
                                </select>
                                {selectedEquip && (
                                  <small className="selected-info">
                                    Coste: €{selectedEquip.costPerHour}/h
                                  </small>
                                )}
                              </div>
                              <input
                                type="number"
                                value={entry.hours}
                                onChange={(e) =>
                                  updateDailyLogEntry(
                                    logIndex,
                                    "equipment",
                                    entryIndex,
                                    "hours",
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                placeholder="⏱️ Horas de uso"
                                min="0"
                                step="0.5"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  removeDailyLogEntry(
                                    logIndex,
                                    "equipment",
                                    entryIndex,
                                  )
                                }
                                className="btn-mini-danger"
                                title="Eliminar equipo"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Materials */}
                      <div className="log-section">
                        <div className="log-section-header">
                          <strong>
                            <InventoryIcon
                              fontSize="small"
                              style={{
                                verticalAlign: "middle",
                                marginRight: "6px",
                              }}
                            />
                            Materiales
                          </strong>
                          <button
                            type="button"
                            onClick={() =>
                              addDailyLogEntry(logIndex, "materials")
                            }
                            className="btn-mini"
                            title="Agregar material existente"
                          >
                            + Material
                          </button>
                        </div>
                        {log.materials.length === 0 && (
                          <div className="empty-state">
                            <InventoryIcon
                              style={{ opacity: 0.3, fontSize: "2rem" }}
                            />
                            <p>
                              No hay materiales asignados. Haz clic en "+
                              Material" para agregar uno.
                            </p>
                          </div>
                        )}
                        {materials.length === 0 && log.materials.length > 0 && (
                          <div className="warning-message">
                            ⚠️ No hay materiales disponibles. Ve a Configuración
                            → Materiales para agregar uno.
                          </div>
                        )}
                        {log.materials.map((entry, entryIndex) => {
                          const selectedMat = materials.find(
                            (m) => m.id === entry.materialId,
                          );
                          return (
                            <div key={entryIndex} className="log-entry">
                              <div className="log-entry-select">
                                <select
                                  value={entry.materialId}
                                  onChange={(e) =>
                                    updateDailyLogEntry(
                                      logIndex,
                                      "materials",
                                      entryIndex,
                                      "materialId",
                                      e.target.value,
                                    )
                                  }
                                  disabled={materials.length === 0}
                                >
                                  <option value="">
                                    {materials.length === 0
                                      ? "⚠️ No hay materiales disponibles"
                                      : "🔍 Seleccionar material existente..."}
                                  </option>
                                  {materials.map((m) => (
                                    <option key={m.id} value={m.id}>
                                      📦 {m.name} - €{m.cost}/{m.unit}
                                    </option>
                                  ))}
                                </select>
                                {selectedMat && (
                                  <small className="selected-info">
                                    Coste: €{selectedMat.cost}/
                                    {selectedMat.unit}
                                  </small>
                                )}
                              </div>
                              <input
                                type="number"
                                value={entry.quantity}
                                onChange={(e) =>
                                  updateDailyLogEntry(
                                    logIndex,
                                    "materials",
                                    entryIndex,
                                    "quantity",
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                placeholder="📊 Cantidad usada"
                                min="0"
                                step="0.01"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  removeDailyLogEntry(
                                    logIndex,
                                    "materials",
                                    entryIndex,
                                  )
                                }
                                className="btn-mini-danger"
                                title="Eliminar material"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Subcontractor Execution */}
              {formData.executorType === "subcontractor" && (
                <div className="form-section">
                  <h3>
                    <BusinessIcon /> Datos de Subcontrata
                  </h3>
                  <div className="form-group">
                    <label>Subcontrata</label>
                    <select
                      name="subcontractorId"
                      value={formData.subcontractorId}
                      onChange={handleChange}
                    >
                      <option value="">Seleccionar subcontrata...</option>
                      {subcontractors.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Coste (€)</label>
                    <input
                      type="number"
                      name="subcontractorCost"
                      value={formData.subcontractorCost}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Financial Summary Sidebar */}
            <div className="fiber-form-sidebar">
              <div className="financial-summary">
                <h3>
                  <CalculateIcon /> Resumen Financiero
                </h3>
                <div className="summary-item">
                  <span>Ingreso Total:</span>
                  <strong className="text-blue">
                    €{financialSummary.income.toFixed(2)}
                  </strong>
                </div>
                <div className="summary-item">
                  <span>Coste Total:</span>
                  <strong className="text-red">
                    €{financialSummary.costs.totalCost.toFixed(2)}
                  </strong>
                </div>
                <hr />
                <div className="summary-item large">
                  <span>Margen:</span>
                  <strong
                    className={
                      financialSummary.profitability.margin >= 0
                        ? "text-green"
                        : "text-red"
                    }
                  >
                    €{financialSummary.profitability.margin.toFixed(2)}
                  </strong>
                </div>
                <div className="summary-item large">
                  <span>Rentabilidad:</span>
                  <strong
                    className={
                      financialSummary.profitability.margin >= 0
                        ? "text-green"
                        : "text-red"
                    }
                  >
                    {isFinite(financialSummary.profitability.percentage)
                      ? financialSummary.profitability.percentage.toFixed(2)
                      : "N/A"}
                    %
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FiberControlForm;

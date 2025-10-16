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
import "./FiberControlForm.css";

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
    orderNumber: "",
    projectName: "",
    clientName: "",
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
        orderNumber: "",
        projectName: "",
        clientName: "",
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
    // Check if there's an incomplete daily log (log without at least one entry in time, equipment or materials)
    const hasIncompleteLog = (formData.dailyLogs || []).some(
      (log) =>
        log.time.length === 0 &&
        log.equipment.length === 0 &&
        log.materials.length === 0,
    );

    if (hasIncompleteLog) {
      toast.warning(
        "⚠️ Completa el reporte actual antes de agregar uno nuevo. Debes agregar al menos un técnico, equipo o material.",
        {
          autoClose: 4000,
        },
      );
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
    if (!formData.orderNumber.trim()) {
      toast.error("El número de orden es requerido");
      return;
    }
    if (!formData.projectName.trim()) {
      toast.error("El nombre del proyecto es requerido");
      return;
    }
    if (!formData.clientName.trim()) {
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
                    <label>Número de Orden *</label>
                    <input
                      type="text"
                      name="orderNumber"
                      value={formData.orderNumber}
                      onChange={handleChange}
                      placeholder="Ej: OT-2024-001"
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
                    <label>Nombre del Proyecto *</label>
                    <input
                      type="text"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleChange}
                      placeholder="Nombre del proyecto"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Cliente *</label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      placeholder="Nombre del cliente"
                      required
                    />
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
                    className="fiber-btn-add"
                  >
                    <AddIcon /> Añadir
                  </button>
                </div>
                <div className="fiber-activity-list">
                  {formData.activities.map((act, index) => (
                    <div key={index} className="fiber-activity-row">
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
                            parseInt(e.target.value) || 0,
                          )
                        }
                        placeholder="Cantidad"
                        min="0"
                        step="1"
                      />
                      <button
                        type="button"
                        onClick={() => removeActivity(index)}
                        className="fiber-btn-remove"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Executor Type */}
              <div className="form-section">
                <h3>
                  <PeopleIcon /> Tipo de Ejecución
                </h3>
                <div className="fiber-executor-buttons">
                  <button
                    type="button"
                    className={`fiber-executor-btn ${formData.executorType === "internal" ? "active" : ""}`}
                    onClick={() => handleExecutorChange("internal")}
                  >
                    <PeopleIcon /> Personal Interno
                  </button>
                  <button
                    type="button"
                    className={`fiber-executor-btn ${formData.executorType === "subcontractor" ? "active" : ""}`}
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
                      className="fiber-btn-add"
                    >
                      <AddIcon /> Nuevo Reporte
                    </button>
                  </div>
                  <div className="fiber-daily-logs-container">
                    {(formData.dailyLogs || []).map((log, logIndex) => (
                      <div key={logIndex} className="fiber-daily-log-card">
                        <div className="fiber-daily-log-header">
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
                            className="fiber-btn-remove"
                          >
                            <DeleteIcon />
                          </button>
                        </div>

                        {/* Technicians */}
                        <div className="fiber-log-section">
                          <div className="fiber-log-section-header">
                            <div className="fiber-log-section-title">
                              <PeopleIcon />
                              Técnicos
                            </div>
                            <button
                              type="button"
                              onClick={() => addDailyLogEntry(logIndex, "time")}
                              className="fiber-btn-add-entry"
                              title="Agregar técnico existente"
                            >
                              + Técnico
                            </button>
                          </div>
                          {log.time.length === 0 && (
                            <div className="fiber-empty-state">
                              <PeopleIcon />
                              <p>
                                No hay técnicos asignados. Haz clic en "+
                                Técnico" para agregar uno.
                              </p>
                            </div>
                          )}
                          {technicians.length === 0 && log.time.length > 0 && (
                            <div className="fiber-warning-message">
                              ⚠️ No hay técnicos disponibles. Ve a Configuración
                              → Técnicos para agregar uno.
                            </div>
                          )}
                          {log.time.map((entry, entryIndex) => {
                            const selectedTech = technicians.find(
                              (t) => t.id === entry.technicianId,
                            );
                            return (
                              <div key={entryIndex} className="fiber-log-entry">
                                <div className="fiber-log-entry-select-wrapper">
                                  <label>Técnico</label>
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
                                    <div className="fiber-log-entry-info">
                                      💰 Coste: €{selectedTech.costPerHour}/h
                                    </div>
                                  )}
                                </div>
                                <div className="fiber-log-entry-fields">
                                  <div className="fiber-log-entry-input-wrapper">
                                    <label>⏰ Horas</label>
                                    <input
                                      type="number"
                                      value={entry.hours || 0}
                                      onChange={(e) =>
                                        updateDailyLogEntry(
                                          logIndex,
                                          "time",
                                          entryIndex,
                                          "hours",
                                          parseFloat(e.target.value) || 0,
                                        )
                                      }
                                      min="0"
                                      step="0.5"
                                      placeholder="0"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeDailyLogEntry(
                                        logIndex,
                                        "time",
                                        entryIndex,
                                      )
                                    }
                                    className="fiber-btn-remove-entry"
                                    title="Eliminar técnico"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Equipment */}
                        <div className="fiber-log-section">
                          <div className="fiber-log-section-header">
                            <div className="fiber-log-section-title">
                              <BuildIcon />
                              Equipos
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                addDailyLogEntry(logIndex, "equipment")
                              }
                              className="fiber-btn-add-entry"
                              title="Agregar equipo existente"
                            >
                              + Equipo
                            </button>
                          </div>
                          {log.equipment.length === 0 && (
                            <div className="fiber-empty-state">
                              <BuildIcon />
                              <p>
                                No hay equipos asignados. Haz clic en "+ Equipo"
                                para agregar uno.
                              </p>
                            </div>
                          )}
                          {equipment.length === 0 &&
                            log.equipment.length > 0 && (
                              <div className="fiber-warning-message">
                                ⚠️ No hay equipos disponibles. Ve a
                                Configuración → Equipos para agregar uno.
                              </div>
                            )}
                          {log.equipment.map((entry, entryIndex) => {
                            const selectedEquip = equipment.find(
                              (e) => e.id === entry.equipmentId,
                            );
                            return (
                              <div key={entryIndex} className="fiber-log-entry">
                                <div className="fiber-log-entry-select-wrapper">
                                  <label>Equipo</label>
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
                                    <div className="fiber-log-entry-info">
                                      💰 Coste: €{selectedEquip.costPerHour}/h
                                    </div>
                                  )}
                                </div>
                                <div className="fiber-log-entry-fields">
                                  <div className="fiber-log-entry-input-wrapper">
                                    <label>⏰ Horas de uso</label>
                                    <input
                                      type="number"
                                      value={entry.hours || 0}
                                      onChange={(e) =>
                                        updateDailyLogEntry(
                                          logIndex,
                                          "equipment",
                                          entryIndex,
                                          "hours",
                                          parseFloat(e.target.value) || 0,
                                        )
                                      }
                                      min="0"
                                      step="0.5"
                                      placeholder="0"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeDailyLogEntry(
                                        logIndex,
                                        "equipment",
                                        entryIndex,
                                      )
                                    }
                                    className="fiber-btn-remove-entry"
                                    title="Eliminar equipo"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Materials */}
                        <div className="fiber-log-section">
                          <div className="fiber-log-section-header">
                            <div className="fiber-log-section-title">
                              <InventoryIcon />
                              Materiales
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                addDailyLogEntry(logIndex, "materials")
                              }
                              className="fiber-btn-add-entry"
                              title="Agregar material existente"
                            >
                              + Material
                            </button>
                          </div>
                          {log.materials.length === 0 && (
                            <div className="fiber-empty-state">
                              <InventoryIcon />
                              <p>
                                No hay materiales asignados. Haz clic en "+
                                Material" para agregar uno.
                              </p>
                            </div>
                          )}
                          {materials.length === 0 &&
                            log.materials.length > 0 && (
                              <div className="fiber-warning-message">
                                ⚠️ No hay materiales disponibles. Ve a
                                Configuración → Materiales para agregar uno.
                              </div>
                            )}
                          {log.materials.map((entry, entryIndex) => {
                            const selectedMat = materials.find(
                              (m) => m.id === entry.materialId,
                            );
                            return (
                              <div key={entryIndex} className="fiber-log-entry">
                                <div className="fiber-log-entry-select-wrapper">
                                  <label>Material</label>
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
                                    <div className="fiber-log-entry-info">
                                      💰 Coste: €{selectedMat.cost}/
                                      {selectedMat.unit}
                                    </div>
                                  )}
                                </div>
                                <div className="fiber-log-entry-fields">
                                  <div className="fiber-log-entry-input-wrapper">
                                    <label>📊 Cantidad</label>
                                    <input
                                      type="number"
                                      value={entry.quantity || 0}
                                      onChange={(e) =>
                                        updateDailyLogEntry(
                                          logIndex,
                                          "materials",
                                          entryIndex,
                                          "quantity",
                                          parseFloat(e.target.value) || 0,
                                        )
                                      }
                                      min="0"
                                      step="0.01"
                                      placeholder="0"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeDailyLogEntry(
                                        logIndex,
                                        "materials",
                                        entryIndex,
                                      )
                                    }
                                    className="fiber-btn-remove-entry"
                                    title="Eliminar material"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
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
              <div className="fiber-financial-summary">
                <h3>
                  <CalculateIcon /> Resumen Financiero
                </h3>

                {/* Income Section */}
                <div className="fiber-summary-section">
                  <h4>💰 Ingresos</h4>
                  <div className="fiber-summary-item">
                    <span>Actividades:</span>
                    <strong className="text-blue">
                      €{financialSummary.income.toFixed(2)}
                    </strong>
                  </div>
                </div>

                <hr />

                {/* Costs Section */}
                <div className="fiber-summary-section">
                  <h4>💸 Costes</h4>
                  {formData.executorType === "internal" ? (
                    <>
                      <div className="fiber-summary-item">
                        <span>Mano de Obra (MO):</span>
                        <strong>
                          €{financialSummary.costs.laborCost.toFixed(2)}
                        </strong>
                      </div>
                      <div className="fiber-summary-item">
                        <span>Equipos (CE):</span>
                        <strong>
                          €{financialSummary.costs.equipmentCost.toFixed(2)}
                        </strong>
                      </div>
                      <div className="fiber-summary-item">
                        <span>Materiales:</span>
                        <strong>
                          €{financialSummary.costs.materialCost.toFixed(2)}
                        </strong>
                      </div>
                      <div className="fiber-summary-item">
                        <span>Coste Indirecto (CI):</span>
                        <strong>
                          €{financialSummary.costs.indirectCost.toFixed(2)}
                        </strong>
                        <small
                          style={{
                            display: "block",
                            fontSize: "0.75rem",
                            opacity: 0.7,
                          }}
                        >
                          {settings.indirectCostRate}% sobre MO
                        </small>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="fiber-summary-item">
                        <span>Subcontrata:</span>
                        <strong>
                          €{financialSummary.costs.subcontractorCost.toFixed(2)}
                        </strong>
                      </div>
                      <div className="fiber-summary-item">
                        <span>Coste Indirecto (CI):</span>
                        <strong>
                          €{financialSummary.costs.indirectCost.toFixed(2)}
                        </strong>
                        <small
                          style={{
                            display: "block",
                            fontSize: "0.75rem",
                            opacity: 0.7,
                          }}
                        >
                          {settings.subcontractorIndirectCostRate}% sobre
                          subcontrata
                        </small>
                      </div>
                    </>
                  )}
                  <div className="fiber-summary-item fiber-summary-total">
                    <span>
                      <strong>Coste Total:</strong>
                    </span>
                    <strong className="text-red">
                      €{financialSummary.costs.totalCost.toFixed(2)}
                    </strong>
                  </div>
                </div>

                <hr />

                {/* Profitability Section */}
                <div className="fiber-summary-section">
                  <h4>📊 Rentabilidad</h4>
                  <div className="fiber-summary-item large">
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
                  <div className="fiber-summary-item large">
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

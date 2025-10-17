import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import LoadingSpinner from "../components/LoadingSpinner";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import FiberControlForm from "../components/FiberControlForm";
import FiberControlSettings from "../components/FiberControlSettings";
import * as fiberService from "../services/fiberControlService";
import "./FiberControl.css";

const FiberControl = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [workOrders, setWorkOrders] = useState([]);
  const [settings, setSettings] = useState({
    indirectCostRate: 25,
    subcontractorIndirectCostRate: 10,
  });
  const [activities, setActivities] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [subcontractors, setSubcontractors] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load all data from API on mount
  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        workOrdersData,
        settingsData,
        activitiesData,
        techniciansData,
        equipmentData,
        materialsData,
        subcontractorsData,
      ] = await Promise.all([
        fiberService.getAllWorkOrders(),
        fiberService.getSettings(),
        fiberService.getAllActivities(),
        fiberService.getAllTechnicians(),
        fiberService.getAllEquipment(),
        fiberService.getAllMaterials(),
        fiberService.getAllSubcontractors(),
      ]);

      setWorkOrders(workOrdersData);
      setSettings(settingsData);
      setActivities(activitiesData);
      setTechnicians(techniciansData);
      setEquipment(equipmentData);
      setMaterials(materialsData);
      setSubcontractors(subcontractorsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar los datos. Intentando inicializar...");

      // Try to initialize default data if loading fails
      try {
        await fiberService.initializeDefaultData();
        // Retry loading after initialization
        await loadAllData();
      } catch (initError) {
        console.error("Error initializing data:", initError);
        toast.error("Error al inicializar los datos");
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate KPIs
  const activeOrders = workOrders.filter(
    (order) => order.status === "En Progreso" || order.status === "Pendiente",
  ).length;
  const completedOrders = workOrders.filter(
    (order) => order.status === "Completada",
  ).length;
  const avgMargin =
    workOrders.length > 0
      ? workOrders.reduce((sum, order) => {
          const costs = fiberService.calculateWorkOrderCosts(
            order,
            settings,
            technicians,
            equipment,
            materials,
          );
          const income = fiberService.calculateWorkOrderIncome(
            order,
            activities,
          );
          const profitability = fiberService.calculateProfitability(
            income,
            costs.totalCost,
          );
          return (
            sum +
            (isFinite(profitability.percentage) ? profitability.percentage : 0)
          );
        }, 0) / workOrders.length
      : 0;
  const totalBilled = workOrders.reduce(
    (sum, order) => sum + (order.billedAmount || 0),
    0,
  );

  const handleAddOrder = () => {
    setEditingOrder(null);
    setShowForm(true);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleDeleteOrder = (order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (orderToDelete) {
      try {
        await fiberService.deleteWorkOrder(orderToDelete.id);
        setWorkOrders(
          workOrders.filter((order) => order.id !== orderToDelete.id),
        );
        toast.success("Orden de trabajo eliminada exitosamente");
      } catch (error) {
        console.error("Error deleting work order:", error);
        toast.error("Error al eliminar la orden de trabajo");
      } finally {
        setShowDeleteModal(false);
        setOrderToDelete(null);
      }
    }
  };

  const handleSaveOrder = async (orderData) => {
    try {
      if (editingOrder) {
        const updatedOrder = await fiberService.updateWorkOrder(
          editingOrder.id,
          orderData,
        );
        setWorkOrders(
          workOrders.map((order) =>
            order.id === editingOrder.id ? updatedOrder : order,
          ),
        );
        toast.success("Orden de trabajo actualizada exitosamente");
      } else {
        const newOrder = await fiberService.createWorkOrder(orderData);
        setWorkOrders([...workOrders, newOrder]);
        toast.success("Orden de trabajo creada exitosamente");
      }
      setShowForm(false);
      setEditingOrder(null);
    } catch (error) {
      console.error("Error saving work order:", error);
      toast.error("Error al guardar la orden de trabajo");
    }
  };

  const handleSettingsSave = async (newSettings) => {
    try {
      const updatedSettings = await fiberService.updateSettings(newSettings);
      setSettings(updatedSettings);
      toast.success("Configuración guardada exitosamente");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Error al guardar la configuración");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pendiente":
        return "status-badge status-pending";
      case "En Progreso":
        return "status-badge status-progress";
      case "Completada":
        return "status-badge status-completed";
      case "Cancelada":
        return "status-badge status-cancelled";
      default:
        return "status-badge";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="fiber-control-container">
      <div className="fiber-control-header">
        <div className="header-content">
          <h1>Control de Fibra Óptica</h1>
          <div className="header-actions">
            <button
              className={`nav-button ${activeView === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveView("dashboard")}
            >
              <DashboardIcon />
              Dashboard
            </button>
            <button
              className={`nav-button ${activeView === "settings" ? "active" : ""}`}
              onClick={() => setActiveView("settings")}
            >
              <SettingsIcon />
              Configuración
            </button>
          </div>
        </div>
      </div>

      {activeView === "dashboard" ? (
        <div className="fiber-control-content">
          {/* KPI Cards */}
          <div className="kpi-grid">
            <div className="kpi-card kpi-blue">
              <div className="kpi-icon">
                <AssignmentIcon />
              </div>
              <div className="kpi-content">
                <h3>Órdenes Activas</h3>
                <p className="kpi-value">{activeOrders}</p>
              </div>
            </div>

            <div className="kpi-card kpi-green">
              <div className="kpi-icon">
                <CheckCircleIcon />
              </div>
              <div className="kpi-content">
                <h3>Órdenes Completadas</h3>
                <p className="kpi-value">{completedOrders}</p>
              </div>
            </div>

            <div className="kpi-card kpi-yellow">
              <div className="kpi-icon">
                <TrendingUpIcon />
              </div>
              <div className="kpi-content">
                <h3>Margen Promedio</h3>
                <p className="kpi-value">{avgMargin.toFixed(1)}%</p>
              </div>
            </div>

            <div className="kpi-card kpi-purple">
              <div className="kpi-icon">
                <ScheduleIcon />
              </div>
              <div className="kpi-content">
                <h3>Total Facturado</h3>
                <p className="kpi-value">{formatCurrency(totalBilled)}</p>
              </div>
            </div>
          </div>

          {/* Work Orders Table */}
          <div className="card">
            <div className="card-header">
              <h2>Órdenes de Trabajo</h2>
              <button className="btn btn-primary" onClick={handleAddOrder}>
                <AddIcon />
                Nueva Orden
              </button>
            </div>

            <div className="table-container">
              {workOrders.length === 0 ? (
                <div className="empty-state">
                  <p>No hay órdenes de trabajo registradas</p>
                  <button className="btn btn-primary" onClick={handleAddOrder}>
                    <AddIcon />
                    Crear Primera Orden
                  </button>
                </div>
              ) : (
                <table className="fiber-table">
                  <thead>
                    <tr>
                      <th>Orden #</th>
                      <th>Proyecto</th>
                      <th>Cliente</th>
                      <th>Estado</th>
                      <th>Fecha Inicio</th>
                      <th>Fecha Fin</th>
                      <th>Coste Real</th>
                      <th>Costos Totales</th>
                      <th>Ingreso</th>
                      <th>Monto Facturado</th>
                      <th>Rentabilidad</th>
                      <th>Margen %</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workOrders.map((order) => {
                      const costs = fiberService.calculateWorkOrderCosts(
                        order,
                        settings,
                        technicians,
                        equipment,
                        materials,
                      );
                      const income = fiberService.calculateWorkOrderIncome(
                        order,
                        activities,
                      );
                      const profitability = fiberService.calculateProfitability(
                        income,
                        costs.totalCost,
                      );
                      const realCost =
                        costs.laborCost +
                        costs.equipmentCost +
                        costs.materialCost +
                        costs.subcontractorCost;
                      return (
                        <tr key={order.id}>
                          <td>{order.orderNumber}</td>
                          <td>{order.projectName}</td>
                          <td>{order.clientName}</td>
                          <td>
                            <span className={getStatusBadgeClass(order.status)}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            {new Date(order.startDate).toLocaleDateString(
                              "es-CO",
                            )}
                          </td>
                          <td>
                            {order.endDate
                              ? new Date(order.endDate).toLocaleDateString(
                                  "es-CO",
                                )
                              : "-"}
                          </td>
                          <td>{formatCurrency(realCost)}</td>
                          <td>{formatCurrency(costs.totalCost)}</td>
                          <td>{formatCurrency(income)}</td>
                          <td>{formatCurrency(order.billedAmount || 0)}</td>
                          <td>
                            <span
                              className={
                                profitability.margin >= 0
                                  ? "positive-margin"
                                  : "negative-margin"
                              }
                            >
                              {formatCurrency(profitability.margin)}
                            </span>
                          </td>
                          <td>
                            <span
                              className={
                                profitability.percentage >= 20
                                  ? "positive-margin"
                                  : "negative-margin"
                              }
                            >
                              {isFinite(profitability.percentage)
                                ? profitability.percentage.toFixed(1)
                                : "N/A"}
                              %
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-icon btn-edit"
                                onClick={() => handleEditOrder(order)}
                                title="Editar"
                              >
                                <EditIcon />
                              </button>
                              <button
                                className="btn-icon btn-delete"
                                onClick={() => handleDeleteOrder(order)}
                                title="Eliminar"
                              >
                                <DeleteIcon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="fiber-control-content">
          <FiberControlSettings
            settings={settings}
            activities={activities}
            technicians={technicians}
            equipment={equipment}
            materials={materials}
            subcontractors={subcontractors}
            onSettingsSave={handleSettingsSave}
            onActivitiesChange={setActivities}
            onTechniciansChange={setTechnicians}
            onEquipmentChange={setEquipment}
            onMaterialsChange={setMaterials}
            onSubcontractorsChange={setSubcontractors}
          />
        </div>
      )}

      {/* Modals */}
      <FiberControlForm
        isOpen={showForm}
        workOrder={editingOrder}
        activities={activities}
        technicians={technicians}
        equipment={equipment}
        materials={materials}
        subcontractors={subcontractors}
        settings={settings}
        onSave={handleSaveOrder}
        onClose={() => {
          setShowForm(false);
          setEditingOrder(null);
        }}
      />

      {showDeleteModal && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setOrderToDelete(null);
          }}
          onConfirm={confirmDelete}
          itemName={orderToDelete?.orderNumber}
        />
      )}
    </div>
  );
};

export default FiberControl;

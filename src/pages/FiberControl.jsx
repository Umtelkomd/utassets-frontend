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

const INITIAL_ACTIVITIES = [
  {
    id: "1",
    description: "Excavación y canalización",
    unit: "metros",
    price: 15000,
  },
  {
    id: "2",
    description: "Instalación de cable de fibra óptica",
    unit: "metros",
    price: 12000,
  },
  {
    id: "3",
    description: "Fusión de fibra óptica",
    unit: "fusiones",
    price: 8000,
  },
  {
    id: "4",
    description: "Instalación de caja de empalme",
    unit: "unidades",
    price: 50000,
  },
  {
    id: "5",
    description: "Pruebas y certificación OTDR",
    unit: "pruebas",
    price: 5000,
  },
];

const INITIAL_TECHNICIANS = [
  { id: "1", name: "Juan Pérez", costPerHour: 25 },
  { id: "2", name: "María García", costPerHour: 28 },
  { id: "3", name: "Carlos López", costPerHour: 22 },
];

const INITIAL_EQUIPMENT = [
  { id: "1", name: "Excavadora", costPerHour: 50 },
  { id: "2", name: "Fusionadora", costPerHour: 30 },
  { id: "3", name: "OTDR", costPerHour: 40 },
];

const INITIAL_MATERIALS = [
  { id: "1", name: "Cable de fibra óptica", unit: "metros", cost: 10 },
  { id: "2", name: "Caja de empalme", unit: "unidades", cost: 200 },
  { id: "3", name: "Conectores", unit: "unidades", cost: 5 },
];

const INITIAL_SUBCONTRACTORS = [
  { id: "1", name: "SubFibra S.A.", contact: "contacto@subfibra.com" },
  { id: "2", name: "Telecom Solutions", contact: "info@telecomsol.com" },
];

const FiberControl = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [workOrders, setWorkOrders] = useState(() => {
    const saved = localStorage.getItem("fiberControl_workOrders");
    return saved ? JSON.parse(saved) : [];
  });
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("fiberControl_settings");
    return saved
      ? JSON.parse(saved)
      : { indirectCostRate: 25, subcontractorIndirectCostRate: 10 };
  });
  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem("fiberControl_activities");
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });
  const [technicians, setTechnicians] = useState(() => {
    const saved = localStorage.getItem("fiberControl_technicians");
    return saved ? JSON.parse(saved) : INITIAL_TECHNICIANS;
  });
  const [equipment, setEquipment] = useState(() => {
    const saved = localStorage.getItem("fiberControl_equipment");
    return saved ? JSON.parse(saved) : INITIAL_EQUIPMENT;
  });
  const [materials, setMaterials] = useState(() => {
    const saved = localStorage.getItem("fiberControl_materials");
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });
  const [subcontractors, setSubcontractors] = useState(() => {
    const saved = localStorage.getItem("fiberControl_subcontractors");
    return saved ? JSON.parse(saved) : INITIAL_SUBCONTRACTORS;
  });

  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("fiberControl_workOrders", JSON.stringify(workOrders));
  }, [workOrders]);

  useEffect(() => {
    localStorage.setItem("fiberControl_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("fiberControl_activities", JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(
      "fiberControl_technicians",
      JSON.stringify(technicians),
    );
  }, [technicians]);

  useEffect(() => {
    localStorage.setItem("fiberControl_equipment", JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem("fiberControl_materials", JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem(
      "fiberControl_subcontractors",
      JSON.stringify(subcontractors),
    );
  }, [subcontractors]);

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

  const confirmDelete = () => {
    if (orderToDelete) {
      setWorkOrders(
        workOrders.filter((order) => order.id !== orderToDelete.id),
      );
      toast.success("Orden de trabajo eliminada exitosamente");
      setShowDeleteModal(false);
      setOrderToDelete(null);
    }
  };

  const handleSaveOrder = (orderData) => {
    if (editingOrder) {
      setWorkOrders(
        workOrders.map((order) =>
          order.id === editingOrder.id
            ? { ...orderData, id: editingOrder.id }
            : order,
        ),
      );
      toast.success("Orden de trabajo actualizada exitosamente");
    } else {
      const newOrder = {
        ...orderData,
        id: Date.now(),
      };
      setWorkOrders([...workOrders, newOrder]);
      toast.success("Orden de trabajo creada exitosamente");
    }
    setShowForm(false);
    setEditingOrder(null);
  };

  const handleSettingsSave = (newSettings) => {
    setSettings(newSettings);
    toast.success("Configuración guardada exitosamente");
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
                      <th>Costos Totales</th>
                      <th>Monto Facturado</th>
                      <th>Margen</th>
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
                          <td>{formatCurrency(costs.totalCost)}</td>
                          <td>{formatCurrency(order.billedAmount || 0)}</td>
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

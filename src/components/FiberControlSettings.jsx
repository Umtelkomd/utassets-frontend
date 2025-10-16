import React, { useState } from "react";
import { toast } from "react-toastify";
import * as fiberService from "../services/fiberControlService";
import {
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Percent as PercentIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Build as BuildIcon,
  Inventory as InventoryIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import "./FiberControlSettings.css";

const FiberControlSettings = ({
  settings,
  onSettingsSave,
  activities,
  onActivitiesChange,
  technicians,
  onTechniciansChange,
  equipment,
  onEquipmentChange,
  materials,
  onMaterialsChange,
  subcontractors,
  onSubcontractorsChange,
}) => {
  const [activeTab, setActiveTab] = useState("costes");
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [localSettings, setLocalSettings] = useState(settings);

  // Sync local settings when prop changes
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const tabs = [
    { id: "costes", label: "Costes Indirectos", icon: <PercentIcon /> },
    { id: "actividades", label: "Actividades", icon: <AssignmentIcon /> },
    { id: "tecnicos", label: "Tecnicos", icon: <PersonIcon /> },
    { id: "equipos", label: "Equipos", icon: <BuildIcon /> },
    { id: "materiales", label: "Materiales", icon: <InventoryIcon /> },
    { id: "subcontratas", label: "Subcontratas", icon: <BusinessIcon /> },
  ];

  const handleSettingsChange = (field, value) => {
    setLocalSettings((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleSaveSettings = async () => {
    try {
      await fiberService.updateSettings(localSettings);
      onSettingsSave(localSettings);
      toast.success("Configuración actualizada");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Error al actualizar la configuración");
    }
  };

  const openAddModal = (type) => {
    setEditingItem(null);
    setShowModal(true);

    switch (type) {
      case "actividades":
        setFormData({ id: "", description: "", unit: "", price: 0 });
        break;
      case "tecnicos":
        setFormData({ name: "", costPerHour: 0 });
        break;
      case "equipos":
        setFormData({ name: "", costPerHour: 0 });
        break;
      case "materiales":
        setFormData({ name: "", unit: "", cost: 0 });
        break;
      case "subcontratas":
        setFormData({ name: "", contact: "" });
        break;
      default:
        setFormData({});
    }
  };

  const openEditModal = (item, type) => {
    setEditingItem({ ...item, type });
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleSaveItem = async () => {
    try {
      if (!editingItem) {
        // Add new item
        switch (activeTab) {
          case "actividades":
            if (
              !formData.id ||
              !formData.description ||
              !formData.unit ||
              formData.price <= 0
            ) {
              toast.error("Complete todos los campos correctamente");
              return;
            }
            const newActivity = await fiberService.createActivity(formData);
            onActivitiesChange((prev) => [...prev, newActivity]);
            toast.success("Actividad agregada exitosamente");
            break;
          case "tecnicos":
            if (!formData.name || formData.costPerHour <= 0) {
              toast.error("Complete todos los campos correctamente");
              return;
            }
            const newTech = await fiberService.createTechnician(formData);
            onTechniciansChange((prev) => [...prev, newTech]);
            toast.success("Tecnico agregado exitosamente");
            break;
          case "equipos":
            if (!formData.name || formData.costPerHour <= 0) {
              toast.error("Complete todos los campos correctamente");
              return;
            }
            const newEquip = await fiberService.createEquipment(formData);
            onEquipmentChange((prev) => [...prev, newEquip]);
            toast.success("Equipo agregado exitosamente");
            break;
          case "materiales":
            if (!formData.name || !formData.unit || formData.cost <= 0) {
              toast.error("Complete todos los campos correctamente");
              return;
            }
            const newMat = await fiberService.createMaterial(formData);
            onMaterialsChange((prev) => [...prev, newMat]);
            toast.success("Material agregado exitosamente");
            break;
          case "subcontratas":
            if (!formData.name) {
              toast.error("El nombre es requerido");
              return;
            }
            const newSub = await fiberService.createSubcontractor(formData);
            onSubcontractorsChange((prev) => [...prev, newSub]);
            toast.success("Subcontratista agregado exitosamente");
            break;
          default:
            break;
        }
      } else {
        // Edit existing item
        switch (editingItem.type || activeTab) {
          case "actividades":
            if (
              !formData.description ||
              !formData.unit ||
              formData.price <= 0
            ) {
              toast.error("Complete todos los campos correctamente");
              return;
            }
            const updatedActivity = await fiberService.updateActivity(
              editingItem.id,
              formData,
            );
            onActivitiesChange((prev) =>
              prev.map((item) =>
                item.id === editingItem.id ? updatedActivity : item,
              ),
            );
            toast.success("Actividad actualizada exitosamente");
            break;
          case "tecnicos":
            if (!formData.name || formData.costPerHour <= 0) {
              toast.error("Complete todos los campos correctamente");
              return;
            }
            const updatedTech = await fiberService.updateTechnician(
              editingItem.id,
              formData,
            );
            onTechniciansChange((prev) =>
              prev.map((item) =>
                item.id === editingItem.id ? updatedTech : item,
              ),
            );
            toast.success("Tecnico actualizado exitosamente");
            break;
          case "equipos":
            if (!formData.name || formData.costPerHour <= 0) {
              toast.error("Complete todos los campos correctamente");
              return;
            }
            const updatedEquip = await fiberService.updateEquipment(
              editingItem.id,
              formData,
            );
            onEquipmentChange((prev) =>
              prev.map((item) =>
                item.id === editingItem.id ? updatedEquip : item,
              ),
            );
            toast.success("Equipo actualizado exitosamente");
            break;
          case "materiales":
            if (!formData.name || !formData.unit || formData.cost <= 0) {
              toast.error("Complete todos los campos correctamente");
              return;
            }
            const updatedMat = await fiberService.updateMaterial(
              editingItem.id,
              formData,
            );
            onMaterialsChange((prev) =>
              prev.map((item) =>
                item.id === editingItem.id ? updatedMat : item,
              ),
            );
            toast.success("Material actualizado exitosamente");
            break;
          case "subcontratas":
            if (!formData.name) {
              toast.error("El nombre es requerido");
              return;
            }
            const updatedSub = await fiberService.updateSubcontractor(
              editingItem.id,
              formData,
            );
            onSubcontractorsChange((prev) =>
              prev.map((item) =>
                item.id === editingItem.id ? updatedSub : item,
              ),
            );
            toast.success("Subcontratista actualizado exitosamente");
            break;
          default:
            break;
        }
      }

      setShowModal(false);
      setFormData({});
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error("Error al guardar el elemento");
    }
  };

  const handleDeleteItem = async (id, type) => {
    if (!window.confirm("¿Está seguro de eliminar este elemento?")) {
      return;
    }

    try {
      switch (type) {
        case "actividades":
          await fiberService.deleteActivity(id);
          onActivitiesChange((prev) => prev.filter((item) => item.id !== id));
          toast.success("Actividad eliminada exitosamente");
          break;
        case "tecnicos":
          await fiberService.deleteTechnician(id);
          onTechniciansChange((prev) => prev.filter((item) => item.id !== id));
          toast.success("Tecnico eliminado exitosamente");
          break;
        case "equipos":
          await fiberService.deleteEquipment(id);
          onEquipmentChange((prev) => prev.filter((item) => item.id !== id));
          toast.success("Equipo eliminado exitosamente");
          break;
        case "materiales":
          await fiberService.deleteMaterial(id);
          onMaterialsChange((prev) => prev.filter((item) => item.id !== id));
          toast.success("Material eliminado exitosamente");
          break;
        case "subcontratas":
          await fiberService.deleteSubcontractor(id);
          onSubcontractorsChange((prev) =>
            prev.filter((item) => item.id !== id),
          );
          toast.success("Subcontratista eliminado exitosamente");
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Error al eliminar el elemento");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "costes":
        return (
          <div className="settings-section">
            <h3>
              <PercentIcon /> Configuracion de Costes Indirectos
            </h3>
            <div className="settings-form">
              <div className="form-group">
                <label htmlFor="indirectCostRate">
                  Tasa de Costes Indirectos (Interno) %
                </label>
                <input
                  type="number"
                  id="indirectCostRate"
                  min="0"
                  step="0.1"
                  value={localSettings.indirectCostRate || 0}
                  onChange={(e) =>
                    handleSettingsChange("indirectCostRate", e.target.value)
                  }
                />
                <small>
                  Porcentaje aplicado sobre el coste de mano de obra interna
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="subcontractorIndirectCostRate">
                  Tasa de Costes Indirectos (Subcontrata) %
                </label>
                <input
                  type="number"
                  id="subcontractorIndirectCostRate"
                  min="0"
                  step="0.1"
                  value={localSettings.subcontractorIndirectCostRate || 0}
                  onChange={(e) =>
                    handleSettingsChange(
                      "subcontractorIndirectCostRate",
                      e.target.value,
                    )
                  }
                />
                <small>Porcentaje aplicado sobre el coste de subcontrata</small>
              </div>

              <div className="form-actions">
                <button onClick={handleSaveSettings} className="btn-save">
                  <SaveIcon /> Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        );

      case "actividades":
        return (
          <div className="settings-section">
            <div className="section-header">
              <h3>
                <AssignmentIcon /> Actividades
              </h3>
              <button
                onClick={() => openAddModal("actividades")}
                className="btn-add"
              >
                <AddIcon /> Agregar Actividad
              </button>
            </div>
            <table className="settings-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Descripción</th>
                  <th>Unidad</th>
                  <th>Precio (EUR)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-data">
                      No hay actividades disponibles
                    </td>
                  </tr>
                ) : (
                  activities.map((activity) => (
                    <tr key={activity.id}>
                      <td>{activity.id}</td>
                      <td>{activity.description}</td>
                      <td>{activity.unit}</td>
                      <td>{(Number(activity.price) || 0).toFixed(2)}</td>
                      <td className="action-buttons">
                        <button
                          onClick={() => openEditModal(activity, "actividades")}
                          className="btn-edit"
                          title="Editar"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteItem(activity.id, "actividades")
                          }
                          className="btn-delete"
                          title="Eliminar"
                        >
                          <DeleteIcon />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );

      case "tecnicos":
        return (
          <div className="settings-section">
            <div className="section-header">
              <h3>
                <PersonIcon /> Tecnicos
              </h3>
              <button
                onClick={() => openAddModal("tecnicos")}
                className="btn-add"
              >
                <AddIcon /> Agregar Tecnico
              </button>
            </div>
            <table className="settings-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Coste por Hora (EUR)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {technicians.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="no-data">
                      No hay tecnicos registrados
                    </td>
                  </tr>
                ) : (
                  technicians.map((tech) => (
                    <tr key={tech.id}>
                      <td>{tech.name}</td>
                      <td>{(Number(tech.costPerHour) || 0).toFixed(2)}</td>
                      <td className="action-buttons">
                        <button
                          onClick={() => openEditModal(tech, "tecnicos")}
                          className="btn-edit"
                          title="Editar"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(tech.id, "tecnicos")}
                          className="btn-delete"
                          title="Eliminar"
                        >
                          <DeleteIcon />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );

      case "equipos":
        return (
          <div className="settings-section">
            <div className="section-header">
              <h3>
                <BuildIcon /> Equipos
              </h3>
              <button
                onClick={() => openAddModal("equipos")}
                className="btn-add"
              >
                <AddIcon /> Agregar Equipo
              </button>
            </div>
            <table className="settings-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Coste por Hora (EUR)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {equipment.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="no-data">
                      No hay equipos registrados
                    </td>
                  </tr>
                ) : (
                  equipment.map((equip) => (
                    <tr key={equip.id}>
                      <td>{equip.name}</td>
                      <td>{(Number(equip.costPerHour) || 0).toFixed(2)}</td>
                      <td className="action-buttons">
                        <button
                          onClick={() => openEditModal(equip, "equipos")}
                          className="btn-edit"
                          title="Editar"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(equip.id, "equipos")}
                          className="btn-delete"
                          title="Eliminar"
                        >
                          <DeleteIcon />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );

      case "materiales":
        return (
          <div className="settings-section">
            <div className="section-header">
              <h3>
                <InventoryIcon /> Materiales
              </h3>
              <button
                onClick={() => openAddModal("materiales")}
                className="btn-add"
              >
                <AddIcon /> Agregar Material
              </button>
            </div>
            <table className="settings-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Unidad</th>
                  <th>Coste (EUR)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {materials.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="no-data">
                      No hay materiales registrados
                    </td>
                  </tr>
                ) : (
                  materials.map((mat) => (
                    <tr key={mat.id}>
                      <td>{mat.name}</td>
                      <td>{mat.unit}</td>
                      <td>{(Number(mat.cost) || 0).toFixed(2)}</td>
                      <td className="action-buttons">
                        <button
                          onClick={() => openEditModal(mat, "materiales")}
                          className="btn-edit"
                          title="Editar"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(mat.id, "materiales")}
                          className="btn-delete"
                          title="Eliminar"
                        >
                          <DeleteIcon />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );

      case "subcontratas":
        return (
          <div className="settings-section">
            <div className="section-header">
              <h3>
                <BusinessIcon /> Subcontratas
              </h3>
              <button
                onClick={() => openAddModal("subcontratas")}
                className="btn-add"
              >
                <AddIcon /> Agregar Subcontratista
              </button>
            </div>
            <table className="settings-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Contacto</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {subcontractors.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="no-data">
                      No hay subcontratistas registrados
                    </td>
                  </tr>
                ) : (
                  subcontractors.map((sub) => (
                    <tr key={sub.id}>
                      <td>{sub.name}</td>
                      <td>{sub.contact || "N/A"}</td>
                      <td className="action-buttons">
                        <button
                          onClick={() => openEditModal(sub, "subcontratas")}
                          className="btn-edit"
                          title="Editar"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteItem(sub.id, "subcontratas")
                          }
                          className="btn-delete"
                          title="Eliminar"
                        >
                          <DeleteIcon />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  const renderModalContent = () => {
    switch (activeTab) {
      case "actividades":
        return (
          <>
            <div className="form-group">
              <label htmlFor="id">ID de Actividad *</label>
              <input
                type="text"
                id="id"
                value={formData.id || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, id: e.target.value }))
                }
                placeholder="Ej: DGF_ACT_001"
                required
                disabled={!!editingItem}
                style={
                  editingItem
                    ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" }
                    : {}
                }
              />
              {editingItem && (
                <small style={{ color: "#64748b", fontSize: "0.875rem" }}>
                  El ID no se puede modificar
                </small>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="description">Descripción *</label>
              <input
                type="text"
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Descripción de la actividad"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="unit">Unidad *</label>
              <input
                type="text"
                id="unit"
                value={formData.unit || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, unit: e.target.value }))
                }
                placeholder="Ej: UDS, ML, M3"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">Precio (EUR) *</label>
              <input
                type="number"
                id="price"
                min="0"
                step="0.01"
                value={formData.price || 0}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value) || 0,
                  }))
                }
                required
              />
            </div>
          </>
        );

      case "tecnicos":
        return (
          <>
            <div className="form-group">
              <label htmlFor="name">Nombre *</label>
              <input
                type="text"
                id="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="costPerHour">Coste por Hora (EUR) *</label>
              <input
                type="number"
                id="costPerHour"
                min="0"
                step="0.01"
                value={formData.costPerHour || 0}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    costPerHour: parseFloat(e.target.value) || 0,
                  }))
                }
                required
              />
            </div>
          </>
        );

      case "equipos":
        return (
          <>
            <div className="form-group">
              <label htmlFor="name">Nombre *</label>
              <input
                type="text"
                id="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="costPerHour">Coste por Hora (EUR) *</label>
              <input
                type="number"
                id="costPerHour"
                min="0"
                step="0.01"
                value={formData.costPerHour || 0}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    costPerHour: parseFloat(e.target.value) || 0,
                  }))
                }
                required
              />
            </div>
          </>
        );

      case "materiales":
        return (
          <>
            <div className="form-group">
              <label htmlFor="name">Nombre *</label>
              <input
                type="text"
                id="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="unit">Unidad *</label>
              <input
                type="text"
                id="unit"
                value={formData.unit || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, unit: e.target.value }))
                }
                placeholder="ej: m, kg, unidad"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="cost">Coste (EUR) *</label>
              <input
                type="number"
                id="cost"
                min="0"
                step="0.01"
                value={formData.cost || 0}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cost: parseFloat(e.target.value) || 0,
                  }))
                }
                required
              />
            </div>
          </>
        );

      case "subcontratas":
        return (
          <>
            <div className="form-group">
              <label htmlFor="name">Nombre *</label>
              <input
                type="text"
                id="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact">Contacto</label>
              <input
                type="text"
                id="contact"
                value={formData.contact || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, contact: e.target.value }))
                }
                placeholder="Email o telefono"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fiber-control-settings">
      <div className="settings-header">
        <h2>
          <SettingsIcon /> Configuracion
        </h2>
      </div>

      <div className="settings-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="settings-content">{renderContent()}</div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div
            className="modal-content settings-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{editingItem ? "Editar" : "Agregar"}</h3>
              <button
                className="close-button"
                onClick={() => setShowModal(false)}
              >
                <CancelIcon />
              </button>
            </div>
            <div className="modal-body">{renderModalContent()}</div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="cancel-button"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                className="submit-button"
              >
                <SaveIcon /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiberControlSettings;

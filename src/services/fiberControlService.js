const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5051/api";

// ==================== API FUNCTIONS ====================

// Work Orders
export const createWorkOrder = async (workOrderData) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/fiber-control/work-orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(workOrderData),
  });
  if (!response.ok) throw new Error("Failed to create work order");
  return response.json();
};

export const getAllWorkOrders = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/fiber-control/work-orders`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch work orders");
  return response.json();
};

export const getWorkOrdersByStatus = async (status) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/fiber-control/work-orders/status/${status}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!response.ok) throw new Error("Failed to fetch work orders by status");
  return response.json();
};

export const getWorkOrder = async (id) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/fiber-control/work-orders/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!response.ok) throw new Error("Failed to fetch work order");
  return response.json();
};

export const updateWorkOrder = async (id, workOrderData) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/fiber-control/work-orders/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(workOrderData),
    },
  );
  if (!response.ok) throw new Error("Failed to update work order");
  return response.json();
};

export const deleteWorkOrder = async (id) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/fiber-control/work-orders/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!response.ok) throw new Error("Failed to delete work order");
  return response.json();
};

// Activities
export const createActivity = async (activityData) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/fiber-control/activities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(activityData),
  });
  if (!response.ok) throw new Error("Failed to create activity");
  return response.json();
};

export const getAllActivities = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/fiber-control/activities`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch activities");
  return response.json();
};

export const updateActivity = async (id, activityData) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/fiber-control/activities/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(activityData),
    },
  );
  if (!response.ok) throw new Error("Failed to update activity");
  return response.json();
};

export const deleteActivity = async (id) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/fiber-control/activities/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!response.ok) throw new Error("Failed to delete activity");
  return response.json();
};

// Technicians
export const createTechnician = async (technicianData) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/fiber-control/technicians`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(technicianData),
  });
  if (!response.ok) throw new Error("Failed to create technician");
  return response.json();
};

export const getAllTechnicians = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/fiber-control/technicians`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch technicians");
  return response.json();
};

export const updateTechnician = async (id, technicianData) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/fiber-control/technicians/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(technicianData),
    },
  );
  if (!response.ok) throw new Error("Failed to update technician");
  return response.json();
};

export const deleteTechnician = async (id) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/fiber-control/technicians/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!response.ok) throw new Error("Failed to delete technician");
  return response.json();
};

// Equipment
export const createEquipment = async (equipmentData) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/fiber-control/equipment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(equipmentData),
  });
  if (!response.ok) throw new Error("Failed to create equipment");
  return response.json();
};

export const getAllEquipment = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/fiber-control/equipment`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch equipment");
  return response.json();
};

export const updateEquipment = async (id, equipmentData) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/fiber-control/equipment/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(equipmentData),
    },
  );
  if (!response.ok) throw new Error("Failed to update equipment");
  return response.json();
};

export const deleteEquipment = async (id) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/fiber-control/equipment/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!response.ok) throw new Error("Failed to delete equipment");
  return response.json();
};

// Materials
export const createMaterial = async (materialData) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/fiber-control/materials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(materialData),
  });
  if (!response.ok) throw new Error("Failed to create material");
  return response.json();
};

export const getAllMaterials = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/fiber-control/materials`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch materials");
  return response.json();
};

export const updateMaterial = async (id, materialData) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/fiber-control/materials/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(materialData),
    },
  );
  if (!response.ok) throw new Error("Failed to update material");
  return response.json();
};

export const deleteMaterial = async (id) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/fiber-control/materials/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!response.ok) throw new Error("Failed to delete material");
  return response.json();
};

// Subcontractors
export const createSubcontractor = async (subcontractorData) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/fiber-control/subcontractors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(subcontractorData),
  });
  if (!response.ok) throw new Error("Failed to create subcontractor");
  return response.json();
};

export const getAllSubcontractors = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/fiber-control/subcontractors`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch subcontractors");
  return response.json();
};

export const updateSubcontractor = async (id, subcontractorData) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/fiber-control/subcontractors/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subcontractorData),
    },
  );
  if (!response.ok) throw new Error("Failed to update subcontractor");
  return response.json();
};

export const deleteSubcontractor = async (id) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/fiber-control/subcontractors/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!response.ok) throw new Error("Failed to delete subcontractor");
  return response.json();
};

// Settings
export const getSettings = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/fiber-control/settings`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch settings");
  return response.json();
};

export const updateSettings = async (settingsData) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/fiber-control/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settingsData),
  });
  if (!response.ok) throw new Error("Failed to update settings");
  return response.json();
};

// Initialize default data
export const initializeDefaultData = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/fiber-control/initialize`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to initialize default data");
  return response.json();
};

// ==================== CALCULATIONS ====================

export const calculateWorkOrderIncome = (workOrder, activities) => {
  if (!workOrder || !workOrder.activities) return 0;

  const activityMap = new Map(activities.map((a) => [a.id, a.price]));

  return workOrder.activities.reduce((total, item) => {
    const price = activityMap.get(item.activityId) || 0;
    return total + price * item.quantity;
  }, 0);
};

export const calculateWorkOrderCosts = (
  workOrder,
  settings,
  technicians,
  equipment,
  materials,
) => {
  let laborCost = 0;
  let equipmentCost = 0;
  let materialCost = 0;
  let subcontractorCost = 0;
  let indirectCost = 0;

  if (workOrder.executorType === "internal") {
    const techMap = new Map(technicians.map((t) => [t.id, t.costPerHour]));
    const equipMap = new Map(equipment.map((e) => [e.id, e.costPerHour]));
    const materialMap = new Map(materials.map((m) => [m.id, m.cost]));

    (workOrder.dailyLogs || []).forEach((log) => {
      log.time.forEach(
        (t) => (laborCost += (techMap.get(t.technicianId) || 0) * t.hours),
      );
      log.equipment.forEach(
        (e) => (equipmentCost += (equipMap.get(e.equipmentId) || 0) * e.hours),
      );
      log.materials.forEach(
        (m) =>
          (materialCost += (materialMap.get(m.materialId) || 0) * m.quantity),
      );
    });
    indirectCost = laborCost * (settings.indirectCostRate / 100);
  } else if (workOrder.executorType === "subcontractor") {
    subcontractorCost = workOrder.subcontractorCost || 0;
    indirectCost =
      subcontractorCost * (settings.subcontractorIndirectCostRate / 100);
  }

  const totalCost =
    laborCost + equipmentCost + materialCost + subcontractorCost + indirectCost;

  return {
    laborCost,
    equipmentCost,
    materialCost,
    subcontractorCost,
    indirectCost,
    totalCost,
  };
};

export const calculateProfitability = (income, totalCost) => {
  if (income === 0) return { margin: -totalCost, percentage: -Infinity };
  const margin = income - totalCost;
  const percentage = (margin / income) * 100;
  return { margin, percentage };
};

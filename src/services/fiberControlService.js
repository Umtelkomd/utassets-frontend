// ==================== CALCULATIONS ====================
// FiberControl uses localStorage for data persistence
// API functions will be added when backend is ready

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

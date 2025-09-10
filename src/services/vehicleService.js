import { BaseService } from './baseService';

// Crear instancia del servicio base para vehículos
const vehicleService = new BaseService('/vehicles');

// Exportar métodos usando el servicio base
export const getVehicles = vehicleService.getAll.bind(vehicleService);
export const getVehicleById = vehicleService.getById.bind(vehicleService);
export const createVehicle = vehicleService.create.bind(vehicleService);
export const updateVehicle = vehicleService.update.bind(vehicleService);
export const deleteVehicle = vehicleService.delete.bind(vehicleService);

// Exportar la instancia por si se necesitan métodos adicionales
export default vehicleService; 
import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';

// Crear el contexto de permisos
const PermissionsContext = createContext();

// Definir los permisos según el rol
const rolePermissions = {
  administrador: {
    canCreateVehicle: true,
    canEditVehicle: true,
    canDeleteVehicle: true,
    canAssignVehicle: true,
    canUnassignVehicle: true,
    canViewAllUsers: true,
    canEditAllUsers: true,
    canDeleteUsers: true,
    canManageRoles: true,
    canAccessSettings: true,
    canViewReports: true,
    canCreateInventory: true,
    canEditInventory: true,
    canDeleteInventory: true,
    canViewAllInventory: true,
    viewVehicleAssignments: true,
    createVehicleAssignment: true,
    updateVehicleAssignment: true,
    deleteVehicleAssignment: true,
    view_rentals: true,
    create_rental: true,
    edit_rental: true,
    canCreateHousing: true,
    canEditHousing: true,
    canDeleteHousing: true,
    canViewAllHousing: true,
    canCreateRental: true,
    canEditRental: true,
    canDeleteRental: true,
    canViewAllRentals: true,
    canManageVacations: true,
    // Permisos de financiamientos
    canCreateFinancings: true,
    canEditFinancings: true,
    canDeleteFinancings: true,
    canViewFinancings: true,
    canRecordPayments: true,
  },
  tecnico: {
    canCreateVehicle: false,
    canEditVehicle: false, 
    canDeleteVehicle: false,
    canAssignVehicle: false,
    canUnassignVehicle: false,
    canViewAllUsers: false,
    canEditUsers: false,
    canManageRoles: false,
    canAccessSettings: false,
    canViewReports: true,
    canCreateInventory: true,
    canEditInventory: true,
    canDeleteInventory: false,
    canViewAllInventory: false,
    viewVehicleAssignments: true,
    createVehicleAssignment: false,
    updateVehicleAssignment: false,
    deleteVehicleAssignment: false,
    canCreateHousing: false,
    canEditHousing: false,
    canDeleteHousing: false,
    canViewAllHousing: false,
    canManageVacations: false,
    // Permisos de financiamientos para técnicos
    canCreateFinancings: false,
    canEditFinancings: false,
    canDeleteFinancings: false,
    canViewFinancings: true,
    canRecordPayments: true,
  }
};

// Proveedor del contexto de permisos
export const PermissionsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  
  // Determinar el rol del usuario actual
  const userRole = useMemo(() => {
    return currentUser?.role || 'tecnico';
  }, [currentUser?.role]);
  
  // Calcular los permisos basados en el rol
  const permissions = useMemo(() => {
    return rolePermissions[userRole] || rolePermissions.tecnico;
  }, [userRole]);
  
  // Función para verificar si el usuario tiene un permiso específico
  const hasPermission = useMemo(() => {
    return (permission) => {
      return permissions[permission] === true;
    };
  }, [permissions]);
  
  // Valor del contexto
  const value = useMemo(() => ({
    permissions,
    hasPermission,
    userRole
  }), [permissions, hasPermission, userRole]);
  
  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

// Hook personalizado para usar el contexto de permisos
export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions debe ser usado dentro de un PermissionsProvider');
  }
  return context;
}; 
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
    canEditUsers: true,
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
    canCreateInventory: false,
    canEditInventory: false,
    canDeleteInventory: false,
    canViewAllInventory: true, // Los técnicos pueden ver todo el inventario pero no modificarlo
    viewVehicleAssignments: true,
    createVehicleAssignment: false,
    updateVehicleAssignment: false,
    deleteVehicleAssignment: false,
  }
};

// Proveedor del contexto de permisos
export const PermissionsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  
  // Determinar el rol del usuario actual
  const userRole = currentUser?.role || 'tecnico';
  
  // Log para depuración
  console.log('PermissionsContext - Rol del usuario:', {
    userRole,
    currentUser: currentUser ? {
      email: currentUser.email,
      role: currentUser.role,
      hasBackendUser: !!currentUser.backendUser
    } : null
  });
  
  // Calcular los permisos basados en el rol
  const permissions = useMemo(() => {
    return rolePermissions[userRole] || rolePermissions.tecnico;
  }, [userRole]);
  
  // Función para verificar si el usuario tiene un permiso específico
  const hasPermission = (permission) => {
    return permissions[permission] === true;
  };
  
  // Valor del contexto
  const value = {
    permissions,
    hasPermission,
    userRole
  };
  
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
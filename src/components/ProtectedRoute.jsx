import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';
import './Loading.css';

// Componente para proteger rutas basado en permisos
const ProtectedRoute = ({ element, requiredPermission }) => {
    const { currentUser, isAuthInitialized } = useAuth();
    const { hasPermission } = usePermissions();
    const location = useLocation();

    // Mientras se está verificando la autenticación, mostrar un loader o nada
    if (!isAuthInitialized) {
        return <div className="page-loading-spinner">Verificando permisos...</div>;
    }

    // Si no hay usuario, redirigir al login
    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si se requiere un permiso específico y el usuario no lo tiene, mostrar acceso denegado
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return <Navigate to="/access-denied" replace />;
    }

    // Si todo está bien, mostrar el componente protegido
    return element;
};

export default ProtectedRoute; 
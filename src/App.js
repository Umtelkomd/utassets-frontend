// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componentes
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import InventoryList from './pages/InventoryList';
import InventoryForm from './pages/InventoryForm';
import MaintenanceHistory from './pages/MaintenanceHistory';
import MaintenanceSchedule from './pages/MaintenanceSchedule';
import ProjectAssignment from './pages/ProjectAssignment';
import Projects from './pages/Projects';
import VehicleList from './pages/VehicleList';
import VehicleForm from './pages/VehicleForm';
import VehicleAssignment from './pages/VehicleAssignment';
import NotFound from './pages/NotFound';
import AccessDenied from './pages/AccessDenied';
import Profile from './pages/Profile';

// Contextos
import { AuthProvider } from './context/AuthContext';
import { PermissionsProvider } from './context/PermissionsContext';

// Estilos
import './App.css';

// Componente contenedor para páginas con layout común
const PageContainer = ({ children }) => (
  <div className="app-container">
    <Navbar />
    <main className="main-content">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <PermissionsProvider>
          <ToastContainer position="bottom-right" />
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/access-denied" element={<AccessDenied />} />

            {/* Ruta principal (Dashboard) */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute 
                  element={<PageContainer><Dashboard /></PageContainer>} 
                />
              } 
            />

            {/* Ruta de Perfil */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute 
                  element={<PageContainer><Profile /></PageContainer>}
                />
              } 
            />

            {/* Rutas de Inventario */}
            <Route 
              path="/inventory" 
              element={
                <ProtectedRoute 
                  element={<PageContainer><InventoryList /></PageContainer>}
                  requiredPermission="canViewAllInventory"
                />
              } 
            />
            <Route 
              path="/inventory/new" 
              element={
                <ProtectedRoute 
                  element={<PageContainer><InventoryForm /></PageContainer>}
                  requiredPermission="canCreateInventory"
                />
              } 
            />
            <Route 
              path="/inventory/edit/:id" 
              element={
                <ProtectedRoute 
                  element={<PageContainer><InventoryForm /></PageContainer>}
                  requiredPermission="canEditInventory"
                />
              } 
            />

            {/* Rutas de Mantenimiento */}
            <Route 
              path="/maintenance/history/:id" 
              element={
                <ProtectedRoute 
                  element={<PageContainer><MaintenanceHistory /></PageContainer>}
                  requiredPermission="canViewAllInventory"
                />
              } 
            />
            <Route 
              path="/maintenance/schedule" 
              element={
                <ProtectedRoute 
                  element={<PageContainer><MaintenanceSchedule /></PageContainer>}
                  requiredPermission="canViewAllInventory"
                />
              } 
            />

            {/* Rutas de Proyectos */}
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute 
                  element={<PageContainer><Projects /></PageContainer>}
                  requiredPermission="canViewAllInventory"
                />
              } 
            />
            <Route 
              path="/project-assignment" 
              element={
                <ProtectedRoute 
                  element={<PageContainer><ProjectAssignment /></PageContainer>}
                  requiredPermission="canAssignVehicle"
                />
              } 
            />

            {/* Rutas de Vehículos */}
            <Route 
              path="/vehicles" 
              element={
                <ProtectedRoute 
                  element={<PageContainer><VehicleList /></PageContainer>}
                  requiredPermission="canViewAllInventory"
                />
              } 
            />
            <Route 
              path="/vehicles/new" 
              element={
                <ProtectedRoute 
                  element={<PageContainer><VehicleForm /></PageContainer>}
                  requiredPermission="canCreateVehicle"
                />
              } 
            />
            <Route 
              path="/vehicles/:id" 
              element={
                <ProtectedRoute 
                  element={<PageContainer><VehicleForm /></PageContainer>}
                  requiredPermission="canViewAllInventory"
                />
              } 
            />
            <Route 
              path="/vehicles/edit/:id" 
              element={
                <ProtectedRoute 
                  element={<PageContainer><VehicleForm /></PageContainer>}
                  requiredPermission="canEditVehicle"
                />
              } 
            />
            <Route 
              path="/vehicles/assignment/:vehicleId" 
              element={
                <ProtectedRoute 
                  element={<PageContainer><VehicleAssignment /></PageContainer>}
                  requiredPermission="canViewAllInventory"
                />
              } 
            />

            {/* Ruta para página no encontrada */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PermissionsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
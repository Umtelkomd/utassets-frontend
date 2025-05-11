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
import Projects from './pages/Projects';
// import Reports from './pages/Reports'; // COMENTADO TEMPORALMENTE
import VehicleList from './pages/VehicleList';
import VehicleForm from './pages/VehicleForm';
import NotFound from './pages/NotFound';
import AccessDenied from './pages/AccessDenied';
import Profile from './pages/Profile';
import Categories from './pages/Categories';
import Users from './pages/Users';
import Statistics from './pages/Statistics';

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
    <Router basename='/utassets'>
      <AuthProvider>
        <PermissionsProvider>
          <ToastContainer position="bottom-right" />
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="/categories" element={<Categories />} />


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

            {/* Rutas de Proyectos */}
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute 
                  element={<PageContainer><Projects /></PageContainer>}
                  requiredPermission="canViewReports"
                />
              } 
            />

            {/* Ruta de Estadísticas */}
            <Route 
              path="/statistics" 
              element={
                <ProtectedRoute 
                  element={<PageContainer><Statistics /></PageContainer>}
                  requiredPermission="canViewReports"
                />
              } 
            />

            {/* Rutas de Vehículos */}
            <Route 
              path="/vehicles" 
              element={
                <ProtectedRoute 
                  element={<PageContainer><VehicleList /></PageContainer>}
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

            {/* Ruta para página no encontrada */}
            <Route path="*" element={<NotFound />} />

            {/* Ruta para usuarios */}
            <Route path="/users" element={<ProtectedRoute 
                  element={<PageContainer><Users /></PageContainer>}
                  requiredPermission="canEditAllUsers"
                />} />
          </Routes>
        </PermissionsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
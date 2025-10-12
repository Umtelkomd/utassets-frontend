// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Componentes
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm";
import ConfirmEmail from "./pages/ConfirmEmail";
import Dashboard from "./pages/Dashboard";
import InventoryList from "./pages/InventoryList";
import InventoryForm from "./pages/InventoryForm";
import Projects from "./pages/Projects";
import Reports from "./pages/Reports"; // COMENTADO TEMPORALMENTE
import VehicleList from "./pages/VehicleList";
import VehicleForm from "./pages/VehicleForm";
import HousingList from "./pages/HousingList";
import HousingForm from "./pages/HousingForm";
import NotFound from "./pages/NotFound";
import AccessDenied from "./pages/AccessDenied";
import Profile from "./pages/Profile";
import Categories from "./pages/Categories";
import Users from "./pages/Users";
import Statistics from "./pages/Statistics";
import Vacations from "./pages/Vacations";
import RentalList from "./pages/RentalList";
import RentalForm from "./pages/RentalForm";
import RentalView from "./pages/RentalView";
import RentalTypeSelection from "./pages/RentalTypeSelection";
import VehicleRentalForm from "./pages/VehicleRentalForm";
import HousingRentalForm from "./pages/HousingRentalForm";
import InventoryRentalForm from "./pages/InventoryRentalForm";
import AuthCallback from "./pages/AuthCallback";
import Financings from "./pages/Financings";
import FinancingDetail from "./pages/FinancingDetail";
import AddFinancing from "./pages/AddFinancing";
import EditFinancing from "./pages/EditFinancing";
import SSORedirectHandler from "./pages/SSORedirectHandler";
import FiberControl from "./pages/FiberControl";

// Contextos
import { AuthProvider } from "./context/AuthContext";
import { PermissionsProvider } from "./context/PermissionsContext";

// Estilos
import "./App.css";

// Componente contenedor para páginas con layout común
const PageContainer = ({ children }) => (
  <div className="app-container">
    <Navbar />

    <main className="main-content">{children}</main>
    <Footer />
  </div>
);

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <AuthProvider>
        <PermissionsProvider>
          <ToastContainer position="bottom-right" />
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/reset-password-confirm"
              element={<ResetPasswordConfirm />}
            />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* 🔥 NUEVA RUTA ESPECIAL PARA SSO - SIN ProtectedRoute */}
            <Route path="/sso-redirect" element={<SSORedirectHandler />} />

            {/* Ruta principal (Dashboard) */}
            <Route
              path="/"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <Dashboard />
                    </PageContainer>
                  }
                />
              }
            />

            {/* Ruta alternativa para /dashboard - Redirige a / */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />

            {/* Ruta de Perfil */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <Profile />
                    </PageContainer>
                  }
                />
              }
            />

            {/* Rutas de Inventario */}
            <Route
              path="/inventory"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <InventoryList />
                    </PageContainer>
                  }
                />
              }
            />
            <Route
              path="/inventory/new"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <InventoryForm />
                    </PageContainer>
                  }
                  requiredPermission="canCreateInventory"
                />
              }
            />
            <Route
              path="/inventory/edit/:id"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <InventoryForm />
                    </PageContainer>
                  }
                  requiredPermission="canEditInventory"
                />
              }
            />

            {/* Rutas de Alquileres */}
            <Route
              path="/rentals"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <RentalList />
                    </PageContainer>
                  }
                  requiredPermission="view_rentals"
                />
              }
            />
            <Route
              path="/rentals/new"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <RentalTypeSelection />
                    </PageContainer>
                  }
                  requiredPermission="create_rental"
                />
              }
            />
            <Route
              path="/rentals/new/item"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <InventoryRentalForm />
                    </PageContainer>
                  }
                  requiredPermission="canCreateRental"
                />
              }
            />
            <Route
              path="/rentals/new/vehicle"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <VehicleRentalForm />
                    </PageContainer>
                  }
                  requiredPermission="canCreateRental"
                />
              }
            />
            <Route
              path="/rentals/new/housing"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <HousingRentalForm />
                    </PageContainer>
                  }
                  requiredPermission="canCreateRental"
                />
              }
            />
            <Route
              path="/rentals/edit/housing/:id"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <HousingRentalForm />
                    </PageContainer>
                  }
                  requiredPermission="canEditRental"
                />
              }
            />
            <Route
              path="/rentals/edit/vehicle/:id"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <VehicleRentalForm />
                    </PageContainer>
                  }
                  requiredPermission="canEditRental"
                />
              }
            />
            <Route
              path="/rentals/edit/item/:id"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <InventoryRentalForm />
                    </PageContainer>
                  }
                  requiredPermission="canEditRental"
                />
              }
            />
            <Route
              path="/rentals/view/housing/:id"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <RentalView />
                    </PageContainer>
                  }
                  requiredPermission="view_rentals"
                />
              }
            />
            <Route
              path="/rentals/view/vehicle/:id"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <RentalView />
                    </PageContainer>
                  }
                  requiredPermission="view_rentals"
                />
              }
            />
            <Route
              path="/rentals/view/item/:id"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <RentalView />
                    </PageContainer>
                  }
                  requiredPermission="view_rentals"
                />
              }
            />

            {/* Rutas de Proyectos */}
            <Route
              path="/projects"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <Projects />
                    </PageContainer>
                  }
                  requiredPermission="canViewReports"
                />
              }
            />

            {/* Ruta de FiberControl */}
            <Route
              path="/fibercontrol"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <FiberControl />
                    </PageContainer>
                  }
                  requiredPermission="canViewReports"
                />
              }
            />

            {/* Ruta de Estadísticas */}
            <Route
              path="/statistics"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <Statistics />
                    </PageContainer>
                  }
                  requiredPermission="canViewReports"
                />
              }
            />

            {/* Rutas de Vehículos */}
            <Route
              path="/vehicles"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <VehicleList />
                    </PageContainer>
                  }
                />
              }
            />
            <Route
              path="/vehicles/new"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <VehicleForm />
                    </PageContainer>
                  }
                  requiredPermission="canCreateVehicle"
                />
              }
            />
            <Route
              path="/vehicles/:id"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <VehicleForm />
                    </PageContainer>
                  }
                />
              }
            />
            <Route
              path="/vehicles/edit/:id"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <VehicleForm />
                    </PageContainer>
                  }
                  requiredPermission="canEditVehicle"
                />
              }
            />

            {/* Rutas de Viviendas */}
            <Route
              path="/housing"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <HousingList />
                    </PageContainer>
                  }
                />
              }
            />
            <Route
              path="/housing/new"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <HousingForm />
                    </PageContainer>
                  }
                  requiredPermission="canCreateHousing"
                />
              }
            />
            <Route
              path="/housing/view/:id"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <HousingForm />
                    </PageContainer>
                  }
                />
              }
            />
            <Route
              path="/housing/edit/:id"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <HousingForm />
                    </PageContainer>
                  }
                  requiredPermission="canEditHousing"
                />
              }
            />

            {/* Rutas de Financiamientos */}
            <Route
              path="/financings"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <Financings />
                    </PageContainer>
                  }
                  requiredPermission="canAccessSettings"
                />
              }
            />
            <Route
              path="/financings/new"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <AddFinancing />
                    </PageContainer>
                  }
                  requiredPermission="canAccessSettings"
                />
              }
            />
            <Route
              path="/financings/:id"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <FinancingDetail />
                    </PageContainer>
                  }
                  requiredPermission="canAccessSettings"
                />
              }
            />
            <Route
              path="/financings/:id/edit"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <EditFinancing />
                    </PageContainer>
                  }
                  requiredPermission="canAccessSettings"
                />
              }
            />

            {/* Ruta para página no encontrada */}
            <Route path="*" element={<NotFound />} />

            {/* Ruta para usuarios */}
            <Route
              path="/users"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <Users />
                    </PageContainer>
                  }
                  requiredPermission="canEditAllUsers"
                />
              }
            />

            {/* Ruta para vacaciones */}
            <Route
              path="/vacations"
              element={
                <ProtectedRoute
                  element={
                    <PageContainer>
                      <Vacations />
                    </PageContainer>
                  }
                  requiredPermission="canManageVacations"
                />
              }
            />
          </Routes>
        </PermissionsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

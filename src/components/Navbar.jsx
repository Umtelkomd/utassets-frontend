// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';
import './Navbar.css';

// Iconos
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import InventoryIcon from '@mui/icons-material/Inventory';
import BuildIcon from '@mui/icons-material/Build';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import ScheduleIcon from '@mui/icons-material/Schedule';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [assetsMenuOpen, setAssetsMenuOpen] = useState(false);
  const [maintenanceMenuOpen, setMaintenanceMenuOpen] = useState(false);
  const [projectsMenuOpen, setProjectsMenuOpen] = useState(false);

  const { currentUser, logout } = useAuth();
  const { hasPermission, userRole } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleProfile = () => setProfileOpen(!profileOpen);
  const toggleAssetsMenu = () => setAssetsMenuOpen(!assetsMenuOpen);
  const toggleMaintenanceMenu = () => setMaintenanceMenuOpen(!maintenanceMenuOpen);
  const toggleProjectsMenu = () => setProjectsMenuOpen(!projectsMenuOpen);

  const closeMenu = () => setIsOpen(false);
  const closeAllSubmenus = () => {
    setAssetsMenuOpen(false);
    setMaintenanceMenuOpen(false);
    setProjectsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Verificar si la ruta actual coincide con la ruta proporcionada
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="menu-toggle" onClick={toggleMenu}>
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </div>
        <Link to="/" className="logo">
          <DashboardIcon className="dashboard-icon" />
          <span>UTK Assets</span>
        </Link>
      </div>

      <div className={`navbar-menu ${isOpen ? 'is-open' : ''}`}>
        <Link
          to="/"
          className={`navbar-item ${isActive('/') ? 'active' : ''}`}
          onClick={() => {
            closeMenu();
            closeAllSubmenus();
          }}
        >
          <HomeIcon className="nav-icon" />
          <span>Inicio</span>
        </Link>

        {/* Menú desplegable de Activos */}
        {hasPermission('canViewAllInventory') && (
          <div className={`navbar-dropdown ${isActive('/vehicles') || isActive('/inventory') ? 'active' : ''}`}>
            <div
              className="navbar-dropdown-trigger"
              onClick={() => {
                toggleAssetsMenu();
                setMaintenanceMenuOpen(false);
                setProjectsMenuOpen(false);
              }}
            >
              <CategoryIcon className="nav-icon" />
              <span>Activos</span>
              {assetsMenuOpen ? <KeyboardArrowUpIcon className="dropdown-arrow" /> : <KeyboardArrowDownIcon className="dropdown-arrow" />}
            </div>

            {assetsMenuOpen && (
              <div className="navbar-dropdown-menu">
                <Link
                  to="/vehicles"
                  className={`dropdown-item ${isActive('/vehicles') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <DirectionsCarIcon className="dropdown-icon" />
                  <span>Vehículos</span>
                </Link>
                <Link
                  to="/inventory"
                  className={`dropdown-item ${isActive('/inventory') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <InventoryIcon className="dropdown-icon" />
                  <span>Inventario</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Menú desplegable de Mantenimiento */}
        {hasPermission('canViewReports') && (
          <div className={`navbar-dropdown ${isActive('/maintenance') ? 'active' : ''}`}>
            <div
              className="navbar-dropdown-trigger"
              onClick={() => {
                toggleMaintenanceMenu();
                setAssetsMenuOpen(false);
                setProjectsMenuOpen(false);
              }}
            >
              <BuildIcon className="nav-icon" />
              <span>Mantenimiento</span>
              {maintenanceMenuOpen ? <KeyboardArrowUpIcon className="dropdown-arrow" /> : <KeyboardArrowDownIcon className="dropdown-arrow" />}
            </div>

            {maintenanceMenuOpen && (
              <div className="navbar-dropdown-menu">
                <Link
                  to="/maintenance/history"
                  className={`dropdown-item ${isActive('/maintenance/history') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <BuildIcon className="dropdown-icon" />
                  <span>Historial</span>
                </Link>
                <Link
                  to="/maintenance/schedule"
                  className={`dropdown-item ${isActive('/maintenance/schedule') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <ScheduleIcon className="dropdown-icon" />
                  <span>Programación</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Menú desplegable de Proyectos */}
        {hasPermission('canAssignVehicle') && (
          <div className={`navbar-dropdown ${isActive('/projects') || isActive('/project-assignment') ? 'active' : ''}`}>
            <div
              className="navbar-dropdown-trigger"
              onClick={() => {
                toggleProjectsMenu();
                setAssetsMenuOpen(false);
                setMaintenanceMenuOpen(false);
              }}
            >
              <BusinessIcon className="nav-icon" />
              <span>Proyectos</span>
              {projectsMenuOpen ? <KeyboardArrowUpIcon className="dropdown-arrow" /> : <KeyboardArrowDownIcon className="dropdown-arrow" />}
            </div>

            {projectsMenuOpen && (
              <div className="navbar-dropdown-menu">
                <Link
                  to="/projects"
                  className={`dropdown-item ${isActive('/projects') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <BusinessIcon className="dropdown-icon" />
                  <span>Lista de Proyectos</span>
                </Link>
                <Link
                  to="/project-assignment"
                  className={`dropdown-item ${isActive('/project-assignment') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <AssignmentIcon className="dropdown-icon" />
                  <span>Asignaciones</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Elemento Administración - Solo para administradores */}
        {hasPermission('canAccessSettings') && (
          <Link
            to="/settings"
            className={`navbar-item ${isActive('/settings') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <SettingsIcon className="nav-icon" />
            <span>Administración</span>
          </Link>
        )}
      </div>

      <div className="navbar-end">
        <div className="profile-dropdown">
          <div className="profile-trigger" onClick={toggleProfile}>
            <div className="avatar">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Perfil" />
              ) : (
                <AccountCircleIcon />
              )}
            </div>
            <div className="user-info">
              <span className="username">{currentUser?.displayName || currentUser?.email || 'Usuario'}</span>
              <span className="user-role">
                {userRole === 'administrador' ? 'Administrador' : 'Técnico'}
              </span>
            </div>
            {profileOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </div>
          {profileOpen && (
            <div className="profile-menu">
              <Link to="/profile" className="profile-item" onClick={() => setProfileOpen(false)}>
                <AccountCircleIcon className="menu-icon" />
                <span>Mi Perfil</span>
              </Link>
              <div className="profile-item logout" onClick={handleLogout}>
                <ExitToAppIcon className="menu-icon" />
                <span>Cerrar Sesión</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
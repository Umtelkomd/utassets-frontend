// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';
import './Navbar.css';
import { getImageUrl, IMAGE_TYPES } from '../utils/imageUtils';

// Iconos
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import InventoryIcon from '@mui/icons-material/Inventory';
import BuildIcon from '@mui/icons-material/Build';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PeopleIcon from '@mui/icons-material/People';
import InsightsIcon from '@mui/icons-material/Insights';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

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
                                onClick={() => {
                                    closeMenu();
                                    setAssetsMenuOpen(false);
                                }}
                            >
                                <DirectionsCarIcon className="dropdown-icon" />
                                <span>Vehículos</span>
                            </Link>
                            <Link
                                to="/inventory"
                                className={`dropdown-item ${isActive('/inventory') ? 'active' : ''}`}
                                onClick={() => {
                                    closeMenu();
                                    setAssetsMenuOpen(false);
                                }}
                            >
                                <InventoryIcon className="dropdown-icon" />
                                <span>Inventario</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Enlace directo a Proyectos */}
                {hasPermission('canViewReports') && (
                    <Link
                        to="/projects"
                        className={`navbar-item ${isActive('/projects') ? 'active' : ''}`}
                        onClick={closeMenu}
                    >
                        <AssignmentIcon className="nav-icon" />
                        <span>Proyectos</span>
                    </Link>
                )}

                {/* Enlace a Reportes - COMENTADO TEMPORALMENTE HASTA QUE SE COMPLETE EL DESARROLLO
                <Link
                    to="/reports"
                    className={`navbar-item ${isActive('/reports') ? 'active' : ''}`}
                    onClick={closeMenu}
                >
                    <ReportProblemIcon className="nav-icon" />
                    <span>Reportes</span>
                </Link>
                */}

                {/* Enlace a Estadísticas */}
                {/*
                {hasPermission('canViewReports') && (
                    <Link
                        to="/statistics"
                        className={`navbar-item ${isActive('/statistics') ? 'active' : ''}`}
                        onClick={closeMenu}
                    >
                        <InsightsIcon className="nav-icon" />
                        <span>Estadísticas</span>
                    </Link>
                )}
                */}

                {/* Opción de Usuarios - Solo para administradores */}
                {hasPermission('canAccessSettings') && (
                    <Link
                        to="/users"
                        className={`navbar-item ${isActive('/users') ? 'active' : ''}`}
                        onClick={closeMenu}
                    >
                        <PeopleIcon className="nav-icon" />
                        <span>Personal</span>
                    </Link>
                )}
            </div>

            <div className="navbar-end">
                <div className="profile-dropdown">
                    <div className="profile-trigger" onClick={toggleProfile}>
                        <div className="avatar">
                            {currentUser?.imagePath ? (
                                <img
                                    src={getImageUrl(currentUser.imagePath, IMAGE_TYPES.USERS)}
                                    alt={currentUser.fullName}
                                    className="user-avatar"
                                />
                            ) : (
                                <AccountCircleIcon />
                            )}
                        </div>
                        <div className="user-info">
                            <span className="username">{currentUser?.fullName || 'Usuario'}</span>
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
// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';
import './Navbar.css';

// Iconos
import {
    Menu as MenuIcon,
    Close as CloseIcon,
    Home as HomeIcon,
    DirectionsCar as DirectionsCarIcon,
    Inventory as InventoryIcon,
    Build as BuildIcon,
    Assignment as AssignmentIcon,
    AccountCircle as AccountCircleIcon,
    ExitToApp as ExitToAppIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    Dashboard as DashboardIcon,
    Business as BusinessIcon,
    Category as CategoryIcon,
    Schedule as ScheduleIcon,
    AssignmentTurnedIn as AssignmentTurnedInIcon,
    People as PeopleIcon,
    Insights as InsightsIcon,
    ReportProblem as ReportProblemIcon,
    CalendarMonth as CalendarMonthIcon,
    BeachAccess as BeachAccessIcon,
    Home,
    AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [assetsMenuOpen, setAssetsMenuOpen] = useState(false);
    const [maintenanceMenuOpen, setMaintenanceMenuOpen] = useState(false);
    const [projectsMenuOpen, setProjectsMenuOpen] = useState(false);
    const [hrMenuOpen, setHrMenuOpen] = useState(false);

    const { currentUser, logout } = useAuth();
    const { hasPermission, userRole } = usePermissions();
    const navigate = useNavigate();
    const location = useLocation();

    const toggleMenu = () => setIsOpen(!isOpen);
    const toggleProfile = () => setProfileOpen(!profileOpen);
    const toggleAssetsMenu = () => setAssetsMenuOpen(!assetsMenuOpen);
    const toggleMaintenanceMenu = () => setMaintenanceMenuOpen(!maintenanceMenuOpen);
    const toggleProjectsMenu = () => setProjectsMenuOpen(!projectsMenuOpen);
    const toggleHrMenu = () => setHrMenuOpen(!hrMenuOpen);

    const closeMenu = () => setIsOpen(false);
    const closeAllSubmenus = () => {
        setAssetsMenuOpen(false);
        setMaintenanceMenuOpen(false);
        setProjectsMenuOpen(false);
        setHrMenuOpen(false);
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
                    <HomeIcon className="nav-icon home-icon" />
                </Link>

                {/* Menú desplegable de Activos */}
                <div className={`navbar-dropdown ${isActive('/vehicles') || isActive('/inventory') ? 'active' : ''}`}>
                    <div
                        className="navbar-dropdown-trigger"
                        onClick={() => {
                            toggleAssetsMenu();
                            setMaintenanceMenuOpen(false);
                            setProjectsMenuOpen(false);
                            setHrMenuOpen(false);
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
                            <Link
                                to="/housing"
                                className={`dropdown-item ${isActive('/housing') ? 'active' : ''}`}
                                onClick={() => {
                                    closeMenu();
                                    setAssetsMenuOpen(false);
                                }}
                            >
                                <HomeIcon className="dropdown-icon" />
                                <span>Viviendas</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Menú desplegable de Recursos Humanos */}
                {(hasPermission('canAccessSettings') || hasPermission('canManageVacations')) && (
                    <div className={`navbar-dropdown ${isActive('/users') || isActive('/vacations') ? 'active' : ''}`}>
                        <div
                            className="navbar-dropdown-trigger"
                            onClick={() => {
                                toggleHrMenu();
                                setAssetsMenuOpen(false);
                                setMaintenanceMenuOpen(false);
                                setProjectsMenuOpen(false);
                            }}
                        >
                            <PeopleIcon className="nav-icon" />
                            <span>Recursos Humanos</span>
                            {hrMenuOpen ? <KeyboardArrowUpIcon className="dropdown-arrow" /> : <KeyboardArrowDownIcon className="dropdown-arrow" />}
                        </div>

                        {hrMenuOpen && (
                            <div className="navbar-dropdown-menu">
                                {/* Opción de Personal - Solo para administradores */}
                                {hasPermission('canAccessSettings') && (
                                    <Link
                                        to="/users"
                                        className={`dropdown-item ${isActive('/users') ? 'active' : ''}`}
                                        onClick={() => {
                                            closeMenu();
                                            setHrMenuOpen(false);
                                        }}
                                    >
                                        <PeopleIcon className="dropdown-icon" />
                                        <span>Personal</span>
                                    </Link>
                                )}

                                {/* Opción de Vacaciones - Solo para administradores */}
                                {hasPermission('canManageVacations') && (
                                    <Link
                                        to="/vacations"
                                        className={`dropdown-item ${isActive('/vacations') ? 'active' : ''}`}
                                        onClick={() => {
                                            closeMenu();
                                            setHrMenuOpen(false);
                                        }}
                                    >
                                        <BeachAccessIcon className="dropdown-icon" />
                                        <span>Vacaciones</span>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Financiamientos - Solo para administradores */}
                {/* Temporalmente ocultado - financiamientos comentados */}
                {/* {hasPermission('canAccessSettings') && (
                    <Link
                        to="/financings"
                        className={`navbar-item ${isActive('/financings') ? 'active' : ''}`}
                        onClick={closeMenu}
                    >
                        <AccountBalanceIcon className="nav-icon" />
                        <span>Financiamientos</span>
                    </Link>
                )} */}

                {/* Alquileres - Solo para administradores */}
                {hasPermission('canViewAllRentals') && (
                    <Link
                        to="/rentals"
                        className={`navbar-item ${isActive('/rentals') ? 'active' : ''}`}
                        onClick={closeMenu}
                    >
                        <CalendarMonthIcon className="nav-icon" />
                        <span>Alquileres</span>
                    </Link>
                )}

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
            </div>

            <div className="navbar-end">
                <div className="profile-dropdown">
                    <div className="profile-trigger" onClick={toggleProfile}>
                        <div className="avatar">
                            {currentUser?.photoUrl ? (
                                <img
                                    src={currentUser.photoUrl}
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
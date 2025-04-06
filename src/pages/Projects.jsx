import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';
import './Projects.css';

// Iconos
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [currentProject, setCurrentProject] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        manager: '',
        status: 'activo',
        team: [],
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/projects');
            setProjects(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar proyectos:', error);
            toast.error('No se pudieron cargar los proyectos');
            setLoading(false);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleStatusFilter = (e) => {
        setStatusFilter(e.target.value);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleAddProject = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/projects', formData);
            toast.success('Proyecto creado exitosamente');
            setShowAddModal(false);
            setFormData({
                name: '',
                description: '',
                location: '',
                startDate: '',
                endDate: '',
                manager: '',
                status: 'activo',
                team: [],
            });
            fetchProjects();
        } catch (error) {
            console.error('Error al crear proyecto:', error);
            toast.error('No se pudo crear el proyecto');
        }
    };

    const handleEditProject = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/projects/${currentProject._id}`, formData);
            toast.success('Proyecto actualizado exitosamente');
            setShowAddModal(false);
            fetchProjects();
        } catch (error) {
            console.error('Error al actualizar proyecto:', error);
            toast.error('No se pudo actualizar el proyecto');
        }
    };

    const handleDeleteProject = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este proyecto?')) {
            try {
                await axios.delete(`/api/projects/${id}`);
                toast.success('Proyecto eliminado exitosamente');
                fetchProjects();
            } catch (error) {
                console.error('Error al eliminar proyecto:', error);
                toast.error('No se pudo eliminar el proyecto');
            }
        }
    };

    const openViewModal = (project) => {
        setCurrentProject(project);
        setShowViewModal(true);
    };

    const openEditModal = (project) => {
        setCurrentProject(project);
        setFormData({
            name: project.name,
            description: project.description,
            location: project.location,
            startDate: project.startDate ? project.startDate.split('T')[0] : '',
            endDate: project.endDate ? project.endDate.split('T')[0] : '',
            manager: project.manager,
            status: project.status,
            team: project.team || [],
        });
        setShowAddModal(true);
    };

    // Filtrar proyectos
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.location.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Ordenar proyectos
    const sortedProjects = [...filteredProjects].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    // Formateo de fecha
    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Obtener clase de estado
    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'activo':
                return 'status-active';
            case 'completado':
                return 'status-completed';
            case 'cancelado':
                return 'status-cancelled';
            case 'pendiente':
                return 'status-pending';
            default:
                return '';
        }
    };

    return (
        <div className="projects-container">
            <div className="projects-header">
                <h1>Gestión de Proyectos</h1>
                <button
                    className="add-project-button"
                    onClick={() => {
                        setCurrentProject(null);
                        setFormData({
                            name: '',
                            description: '',
                            location: '',
                            startDate: '',
                            endDate: '',
                            manager: '',
                            status: 'activo',
                            team: [],
                        });
                        setShowAddModal(true);
                    }}
                >
                    <AddIcon /> Nuevo Proyecto
                </button>
            </div>

            <div className="search-filters-section">
                <div className="search-box">
                    <SearchIcon className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar proyectos..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                <div className="filters">
                    <div className="filter">
                        <FilterListIcon className="filter-icon" />
                        <select value={statusFilter} onChange={handleStatusFilter}>
                            <option value="all">Todos los estados</option>
                            <option value="activo">Activos</option>
                            <option value="completado">Completados</option>
                            <option value="pendiente">Pendientes</option>
                            <option value="cancelado">Cancelados</option>
                        </select>
                    </div>

                    <div className="sort">
                        <SortIcon className="sort-icon" />
                        <select
                            value={`${sortConfig.key}-${sortConfig.direction}`}
                            onChange={(e) => {
                                const [key, direction] = e.target.value.split('-');
                                setSortConfig({ key, direction });
                            }}
                        >
                            <option value="name-asc">Nombre (A-Z)</option>
                            <option value="name-desc">Nombre (Z-A)</option>
                            <option value="startDate-asc">Fecha inicio (antigua)</option>
                            <option value="startDate-desc">Fecha inicio (reciente)</option>
                            <option value="endDate-asc">Fecha fin (antigua)</option>
                            <option value="endDate-desc">Fecha fin (reciente)</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-container">Cargando proyectos...</div>
            ) : (
                <div className="projects-grid">
                    {sortedProjects.length === 0 ? (
                        <div className="no-results">No se encontraron proyectos con los filtros actuales.</div>
                    ) : (
                        sortedProjects.map(project => (
                            <div className="project-card" key={project._id}>
                                <div className={`project-status ${getStatusClass(project.status)}`}>
                                    {project.status}
                                </div>
                                <h3 className="project-name">{project.name}</h3>
                                <div className="project-description">
                                    {project.description.length > 120
                                        ? `${project.description.substring(0, 120)}...`
                                        : project.description}
                                </div>
                                <div className="project-details">
                                    <div className="project-detail">
                                        <LocationOnIcon className="detail-icon" />
                                        <span>{project.location || 'Sin ubicación'}</span>
                                    </div>
                                    <div className="project-detail">
                                        <CalendarTodayIcon className="detail-icon" />
                                        <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                                    </div>
                                    <div className="project-detail">
                                        <PeopleIcon className="detail-icon" />
                                        <span>{project.team?.length || 0} miembros</span>
                                    </div>
                                </div>
                                <div className="project-actions">
                                    <button onClick={() => openViewModal(project)} className="view-button">
                                        <VisibilityIcon /> Ver
                                    </button>
                                    <button onClick={() => openEditModal(project)} className="edit-button">
                                        <EditIcon /> Editar
                                    </button>
                                    <button onClick={() => handleDeleteProject(project._id)} className="delete-button">
                                        <DeleteIcon /> Eliminar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal para añadir/editar proyectos */}
            {showAddModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{currentProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
                            <button className="close-button" onClick={() => setShowAddModal(false)}>
                                <CancelIcon />
                            </button>
                        </div>
                        <form onSubmit={currentProject ? handleEditProject : handleAddProject}>
                            <div className="form-group">
                                <label htmlFor="name">Nombre del Proyecto *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Descripción *</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="location">Ubicación</label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="manager">Gerente de Proyecto</label>
                                    <input
                                        type="text"
                                        id="manager"
                                        name="manager"
                                        value={formData.manager}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="startDate">Fecha de Inicio</label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="endDate">Fecha de Finalización</label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="status">Estado</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="activo">Activo</option>
                                    <option value="pendiente">Pendiente</option>
                                    <option value="completado">Completado</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-button">
                                    Cancelar
                                </button>
                                <button type="submit" className="submit-button">
                                    {currentProject ? 'Actualizar Proyecto' : 'Crear Proyecto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para ver detalles del proyecto */}
            {showViewModal && currentProject && (
                <div className="modal-backdrop">
                    <div className="modal-content view-modal">
                        <div className="modal-header">
                            <h2>Detalles del Proyecto</h2>
                            <button className="close-button" onClick={() => setShowViewModal(false)}>
                                <CancelIcon />
                            </button>
                        </div>
                        <div className="project-view-content">
                            <div className="project-view-header">
                                <h3>{currentProject.name}</h3>
                                <div className={`project-view-status ${getStatusClass(currentProject.status)}`}>
                                    {currentProject.status}
                                </div>
                            </div>

                            <div className="project-view-section">
                                <h4>Descripción</h4>
                                <p>{currentProject.description}</p>
                            </div>

                            <div className="project-view-columns">
                                <div className="project-view-column">
                                    <div className="project-view-item">
                                        <LocationOnIcon className="view-icon" />
                                        <div>
                                            <h5>Ubicación</h5>
                                            <p>{currentProject.location || 'No especificada'}</p>
                                        </div>
                                    </div>

                                    <div className="project-view-item">
                                        <CalendarTodayIcon className="view-icon" />
                                        <div>
                                            <h5>Fecha de Inicio</h5>
                                            <p>{formatDate(currentProject.startDate)}</p>
                                        </div>
                                    </div>

                                    <div className="project-view-item">
                                        <CalendarTodayIcon className="view-icon" />
                                        <div>
                                            <h5>Fecha de Finalización</h5>
                                            <p>{formatDate(currentProject.endDate)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="project-view-column">
                                    <div className="project-view-item">
                                        <PeopleIcon className="view-icon" />
                                        <div>
                                            <h5>Gerente de Proyecto</h5>
                                            <p>{currentProject.manager || 'No asignado'}</p>
                                        </div>
                                    </div>

                                    <div className="project-view-item">
                                        <PeopleIcon className="view-icon" />
                                        <div>
                                            <h5>Equipo</h5>
                                            <p>{currentProject.team?.length
                                                ? `${currentProject.team.length} miembros`
                                                : 'No hay miembros asignados'}</p>
                                        </div>
                                    </div>

                                    <div className="project-view-item">
                                        <AssignmentIcon className="view-icon" />
                                        <div>
                                            <h5>Recursos Asignados</h5>
                                            <p>{currentProject.resources?.length || 0} recursos</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="project-view-actions">
                                <Link to={`/project-assignment/${currentProject._id}`} className="assignment-button">
                                    <AssignmentIcon /> Gestionar Asignaciones
                                </Link>
                                <button onClick={() => {
                                    setShowViewModal(false);
                                    openEditModal(currentProject);
                                }} className="edit-button">
                                    <EditIcon /> Editar Proyecto
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects; 
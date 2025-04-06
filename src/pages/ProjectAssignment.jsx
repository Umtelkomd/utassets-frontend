// src/pages/ProjectAssignment.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import './ProjectAssignment.css';

// Iconos de Material UI
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

const ProjectAssignment = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);

  const [newAssignment, setNewAssignment] = useState({
    inventoryId: '',
    quantity: 1,
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Obtener proyectos
        const projectsResponse = await axios.get(`${API_URL}/projects`);
        setProjects(projectsResponse.data);

        // Obtener inventario
        const inventoryResponse = await axios.get(`${API_URL}/inventory`);
        setInventory(inventoryResponse.data);
        setFilteredInventory(inventoryResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filtrar inventario basado en el término de búsqueda
    if (searchTerm) {
      const filtered = inventory.filter(item =>
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInventory(filtered);
    } else {
      setFilteredInventory(inventory);
    }
  }, [searchTerm, inventory]);

  const fetchProjectAssignments = async (projectId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/projects/${projectId}/inventory`);
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching project assignments:', error);
      toast.error('Error al cargar las asignaciones del proyecto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    fetchProjectAssignments(project.id);
    setShowAddForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment({
      ...newAssignment,
      [name]: value
    });
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();

    if (!selectedProject) {
      toast.error('Debes seleccionar un proyecto');
      return;
    }

    if (!newAssignment.inventoryId) {
      toast.error('Debes seleccionar un item del inventario');
      return;
    }

    if (newAssignment.quantity < 1) {
      toast.error('La cantidad debe ser al menos 1');
      return;
    }

    setIsLoading(true);

    try {
      // Enviar los datos al backend
      await axios.post(`${API_URL}/projects/${selectedProject.id}/inventory`, {
        inventoryId: newAssignment.inventoryId,
        quantity: newAssignment.quantity,
        notes: newAssignment.notes
      });

      // Recargar las asignaciones
      fetchProjectAssignments(selectedProject.id);

      // Resetear el formulario
      setNewAssignment({
        inventoryId: '',
        quantity: 1,
        notes: ''
      });

      setShowAddForm(false);
      toast.success('Item asignado correctamente al proyecto');
    } catch (error) {
      console.error('Error adding assignment:', error);

      // Mostrar mensaje de error específico si el backend lo proporciona
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Error al asignar el item al proyecto');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnItem = async (assignmentId) => {
    if (window.confirm('¿Estás seguro de que deseas marcar este item como devuelto?')) {
      setIsLoading(true);
      try {
        await axios.put(`${API_URL}/projects/${selectedProject.id}/inventory/${assignmentId}/return`);

        // Recargar las asignaciones
        fetchProjectAssignments(selectedProject.id);

        toast.success('Item marcado como devuelto correctamente');
      } catch (error) {
        console.error('Error returning item:', error);
        toast.error('Error al marcar el item como devuelto');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta asignación?')) {
      setIsLoading(true);
      try {
        await axios.delete(`${API_URL}/projects/${selectedProject.id}/inventory/${assignmentId}`);

        // Recargar las asignaciones
        fetchProjectAssignments(selectedProject.id);

        toast.success('Asignación eliminada correctamente');
      } catch (error) {
        console.error('Error deleting assignment:', error);
        toast.error('Error al eliminar la asignación');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading && projects.length === 0) {
    return (
      <div className="page-loading-spinner">
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="project-assignment-page">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <AssignmentIcon /> Asignación a Proyectos
          </h2>
        </div>

        <div className="project-assignment-container">
          {/* Lista de proyectos */}
          <div className="projects-list-container">
            <h3 className="section-title">Proyectos</h3>

            {projects.length === 0 ? (
              <div className="no-projects">
                <p>No hay proyectos disponibles.</p>
              </div>
            ) : (
              <ul className="projects-list">
                {projects.map(project => (
                  <li
                    key={project.id}
                    className={`project-item ${selectedProject && selectedProject.id === project.id ? 'active' : ''}`}
                    onClick={() => handleProjectSelect(project)}
                  >
                    <div className="project-details">
                      <h4 className="project-name">{project.name}</h4>
                      <span className="project-code">{project.project_code}</span>
                    </div>
                    <div className="project-status">
                      <span className={`status-badge ${project.status.toLowerCase()}`}>
                        {project.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Detalle del proyecto seleccionado */}
          <div className="project-detail-container">
            {selectedProject ? (
              <>
                <div className="project-header">
                  <div className="project-info">
                    <h3>{selectedProject.name}</h3>
                    <span className="project-code">{selectedProject.project_code}</span>
                  </div>

                  <div className="project-dates">
                    <div className="date-group">
                      <span className="date-label">Inicio:</span>
                      <span className="date-value">{formatDate(selectedProject.start_date)}</span>
                    </div>
                    <div className="date-group">
                      <span className="date-label">Fin:</span>
                      <span className="date-value">{formatDate(selectedProject.end_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="project-description">
                  <p>{selectedProject.description || 'Sin descripción.'}</p>
                </div>

                <div className="assignments-section">
                  <div className="section-header">
                    <h3>Equipos y Herramientas Asignados</h3>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowAddForm(!showAddForm)}
                    >
                      {showAddForm ? (
                        <><CloseIcon /> Cancelar</>
                      ) : (
                        <><AddIcon /> Asignar Item</>
                      )}
                    </button>
                  </div>

                  {showAddForm && (
                    <div className="assignment-form-container">
                      <form onSubmit={handleAddAssignment} className="assignment-form">
                        <div className="search-container">
                          <div className="search-box">
                            <SearchIcon />
                            <input
                              type="text"
                              placeholder="Buscar en inventario por nombre, código o categoría..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="inventory-selector">
                          <table className="inventory-table">
                            <thead>
                              <tr>
                                <th></th>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th>Disponible</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredInventory.map(item => (
                                <tr
                                  key={item.id}
                                  className={newAssignment.inventoryId === item.id.toString() ? 'selected' : ''}
                                  onClick={() => setNewAssignment({ ...newAssignment, inventoryId: item.id.toString() })}
                                >
                                  <td>
                                    <input
                                      type="radio"
                                      name="inventoryId"
                                      value={item.id}
                                      checked={newAssignment.inventoryId === item.id.toString()}
                                      onChange={handleInputChange}
                                    />
                                  </td>
                                  <td>{item.item_code}</td>
                                  <td>{item.item_name}</td>
                                  <td>{item.category}</td>
                                  <td>{item.quantity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="quantity">Cantidad*</label>
                            <input
                              type="number"
                              id="quantity"
                              name="quantity"
                              className="form-control"
                              value={newAssignment.quantity}
                              onChange={handleInputChange}
                              min="1"
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="notes">Notas</label>
                            <input
                              type="text"
                              id="notes"
                              name="notes"
                              className="form-control"
                              value={newAssignment.notes}
                              onChange={handleInputChange}
                              placeholder="Información adicional sobre esta asignación"
                            />
                          </div>
                        </div>

                        <div className="form-actions">
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading || !newAssignment.inventoryId}
                          >
                            <AddIcon /> Asignar
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {isLoading ? (
                    <div className="loading">Cargando asignaciones...</div>
                  ) : assignments.length === 0 ? (
                    <div className="no-assignments">
                      <p>No hay equipos o herramientas asignados a este proyecto.</p>
                    </div>
                  ) : (
                    <div className="assignments-table-container">
                      <table className="assignments-table">
                        <thead>
                          <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Cantidad</th>
                            <th>Fecha Asignación</th>
                            <th>Fecha Devolución</th>
                            <th>Notas</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignments.map(assignment => (
                            <tr key={assignment.id}>
                              <td>{assignment.item_code}</td>
                              <td>{assignment.item_name}</td>
                              <td>{assignment.quantity}</td>
                              <td>{formatDate(assignment.assigned_date)}</td>
                              <td>
                                {assignment.returned_date ? (
                                  formatDate(assignment.returned_date)
                                ) : (
                                  <span className="pending-return">Pendiente</span>
                                )}
                              </td>
                              <td>{assignment.notes || '-'}</td>
                              <td>
                                <div className="action-buttons">
                                  {!assignment.returned_date && (
                                    <button
                                      className="btn-action return"
                                      onClick={() => handleReturnItem(assignment.id)}
                                      title="Marcar como devuelto"
                                    >
                                      <CheckIcon />
                                    </button>
                                  )}

                                  <button
                                    className="btn-action delete"
                                    onClick={() => handleDeleteAssignment(assignment.id)}
                                    title="Eliminar asignación"
                                  >
                                    <DeleteIcon />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="no-project-selected">
                <AssignmentIcon className="big-icon" />
                <p>Selecciona un proyecto para ver y gestionar las asignaciones de equipos y herramientas.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectAssignment;
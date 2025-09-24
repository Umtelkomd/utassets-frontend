import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import './Reports.css';
import LoadingSpinner from '../components/LoadingSpinner';
import * as reportService from '../services/reportService.js';
import * as vehicleService from '../services/vehicleService';
import * as inventoryService from '../services/inventoryService';
import { useAuth } from '../context/AuthContext';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

// Iconos
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonIcon from '@mui/icons-material/Person';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import InventoryIcon from '@mui/icons-material/Inventory';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReplyIcon from '@mui/icons-material/Reply';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import BuildIcon from '@mui/icons-material/Build';

const Reports = () => {
    const { currentUser } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [currentReport, setCurrentReport] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reportToDelete, setReportToDelete] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [vehicles, setVehicles] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'MEDIA',
        relatedItemId: '',
        relatedItemType: ''
    });
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [useFallbackMode, setUseFallbackMode] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchReports();
        fetchItems();
    }, []);

    useEffect(() => {
        if (showDetailModal && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [showDetailModal, currentReport?.comments]);

    // Generar datos de ejemplo para el modo de fallback
    const generateSampleData = () => {
        const sampleReports = [
            {
                id: 1,
                title: 'Ejemplo: Problema con el vehículo XYZ-123',
                description: 'Este es un reporte de ejemplo para demostrar la funcionalidad. El vehículo tiene problemas con el motor.',
                status: 'PENDIENTE',
                type: 'ALTA',
                createdBy: { id: 1, name: 'Usuario Demo', role: 'Técnico' },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                comments: [
                    {
                        id: 1,
                        reportId: 1,
                        userId: 2,
                        userName: 'Administrador Demo',
                        userRole: 'Administrador',
                        content: 'Este es un comentario de ejemplo. Cuando el backend esté listo, estos datos serán reemplazados por datos reales.',
                        createdAt: new Date().toISOString()
                    }
                ],
                relatedItemType: 'VEHICULO',
                relatedItemName: 'Toyota Hilux XYZ-123'
            },
            {
                id: 2,
                title: 'Ejemplo: Solicitud de mantenimiento para equipo',
                description: 'Este es otro reporte de ejemplo. Se requiere mantenimiento preventivo para el equipo de inventario.',
                status: 'EN_PROCESO',
                type: 'MEDIA',
                createdBy: { id: 1, name: 'Usuario Demo', role: 'Técnico' },
                createdAt: new Date(Date.now() - 86400000).toISOString(), // Ayer
                updatedAt: new Date(Date.now() - 43200000).toISOString(), // Hace 12 horas
                comments: [],
                relatedItemType: 'INVENTARIO',
                relatedItemName: 'Impresora HP LaserJet Pro'
            },
            {
                id: 3,
                title: 'Ejemplo: Reporte completado',
                description: 'Este es un ejemplo de reporte completado. Se solucionó el problema con el sistema de refrigeración.',
                status: 'COMPLETADO',
                type: 'CRITICA',
                createdBy: { id: 2, name: 'Supervisor Demo', role: 'Administrador' },
                createdAt: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
                updatedAt: new Date(Date.now() - 86400000).toISOString(), // Ayer
                comments: [
                    {
                        id: 2,
                        reportId: 3,
                        userId: 1,
                        userName: 'Técnico Demo',
                        userRole: 'Técnico',
                        content: 'Se realizó la revisión inicial del sistema.',
                        createdAt: new Date(Date.now() - 158400000).toISOString() // Hace 1 día y 20 horas
                    },
                    {
                        id: 3,
                        reportId: 3,
                        userId: 2,
                        userName: 'Supervisor Demo',
                        userRole: 'Administrador',
                        content: 'Problema solucionado, se cambió la pieza defectuosa.',
                        createdAt: new Date(Date.now() - 86400000).toISOString() // Ayer
                    }
                ],
                relatedItemType: 'VEHICULO',
                relatedItemName: 'Nissan Frontier ABC-456'
            }
        ];

        return sampleReports;
    };

    const fetchReports = async () => {
        try {
            setLoading(true);

            if (useFallbackMode) {
                // Usar datos de ejemplo en modo fallback
                const sampleReports = generateSampleData();
                setReports(sampleReports);
                toast.info('Usando datos de demostración (modo fallback)');
                setLoading(false);
                return;
            }

            // Intentar obtener datos reales de la API
            try {
                const data = await reportService.getReports();
                setReports(data);
                setLoading(false);
            } catch (error) {
                
                toast.error('No se pudieron cargar los reportes del backend');

                // Preguntar al usuario si desea usar el modo de fallback
                if (window.confirm('No se pudieron cargar los datos del servidor. ¿Desea usar datos de demostración en su lugar?')) {
                    setUseFallbackMode(true);
                    const sampleReports = generateSampleData();
                    setReports(sampleReports);
                    toast.info('Usando datos de demostración (modo fallback)');
                }

                setLoading(false);
            }
        } catch (error) {
            
            toast.error('No se pudieron cargar los reportes');
            setLoading(false);
        }
    };

    const fetchItems = async () => {
        try {
            if (useFallbackMode) {
                // Datos de ejemplo para vehículos
                const vehiclesData = [
                    { id: 1, item_name: 'Toyota Hilux', license_plate: 'XYZ-123' },
                    { id: 2, item_name: 'Nissan Frontier', license_plate: 'ABC-456' },
                    { id: 3, item_name: 'Ford Ranger', license_plate: 'DEF-789' }
                ];

                // Datos de ejemplo para inventario
                const inventoryData = [
                    { id: 1, itemName: 'Impresora HP LaserJet Pro', itemCode: 'INV-001' },
                    { id: 2, itemName: 'Monitor Dell 27"', itemCode: 'INV-002' },
                    { id: 3, itemName: 'Laptop Lenovo ThinkPad', itemCode: 'INV-003' }
                ];

                setVehicles(vehiclesData);
                setInventory(inventoryData);
                return;
            }

            // Modo real: obtener de la API
            let vehiclesData = [];
            let inventoryData = [];

            try {
                vehiclesData = await vehicleService.getVehicles();
            } catch (error) {
                
                toast.error('No se pudieron cargar los vehículos');
            }

            try {
                inventoryData = await inventoryService.getInventory();
            } catch (error) {
                
                toast.error('No se pudo cargar el inventario');
            }

            setVehicles(vehiclesData);
            setInventory(inventoryData);
        } catch (error) {
            
            toast.error('No se pudieron cargar los elementos disponibles');
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            if (useFallbackMode) {
                // Modo fallback: simular la creación de un comentario
                const newCommentObj = {
                    id: Date.now(),
                    reportId: currentReport.id,
                    userId: 1,
                    userName: 'Usuario Actual',
                    userRole: 'Técnico',
                    content: newComment,
                    createdAt: new Date().toISOString()
                };

                const updatedReport = {
                    ...currentReport,
                    comments: [...(currentReport.comments || []), newCommentObj]
                };

                setCurrentReport(updatedReport);

                // Actualizar la lista de reportes también
                setReports(prevReports =>
                    prevReports.map(report =>
                        report.id === currentReport.id ? updatedReport : report
                    )
                );

                setNewComment('');
                toast.success('Comentario añadido con éxito (modo demo)');
                return;
            }

            // Modo real: enviar a la API
            await reportService.addComment(currentReport.id, { content: newComment });
            const updatedReport = await reportService.getReportById(currentReport.id);
            setCurrentReport(updatedReport);

            // Actualizar la lista de reportes también
            setReports(prevReports =>
                prevReports.map(report =>
                    report.id === currentReport.id ? updatedReport : report
                )
            );

            setNewComment('');
            toast.success('Comentario añadido con éxito');
        } catch (error) {
            
            toast.error('Error al añadir el comentario');
        }
    };

    const handleChangeStatus = async (status) => {
        try {
            if (useFallbackMode) {
                // Modo fallback: simular el cambio de estado
                const updatedReport = {
                    ...currentReport,
                    status,
                    updatedAt: new Date().toISOString()
                };

                setCurrentReport(updatedReport);

                // Actualizar la lista de reportes también
                setReports(prevReports =>
                    prevReports.map(report =>
                        report.id === currentReport.id ? updatedReport : report
                    )
                );

                setShowActionMenu(false);
                toast.success(`Estado actualizado a ${getStatusText(status)} (modo demo)`);
                return;
            }

            // Modo real: enviar a la API
            await reportService.updateReport(currentReport.id, { status });
            const updatedReport = await reportService.getReportById(currentReport.id);
            setCurrentReport(updatedReport);

            // Actualizar la lista de reportes también
            setReports(prevReports =>
                prevReports.map(report =>
                    report.id === currentReport.id ? updatedReport : report
                )
            );

            setShowActionMenu(false);
            toast.success(`Estado actualizado a ${getStatusText(status)}`);
        } catch (error) {
            
            toast.error('Error al actualizar el estado');
        }
    };

    const handleDeleteClick = (report) => {
        setReportToDelete(report);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            if (useFallbackMode) {
                // Modo fallback: simular la eliminación
                setReports(prevReports =>
                    prevReports.filter(report => report.id !== reportToDelete.id)
                );

                toast.success('Reporte eliminado exitosamente (modo demo)');
                setShowDeleteModal(false);
                setReportToDelete(null);

                if (showDetailModal && currentReport?.id === reportToDelete.id) {
                    setShowDetailModal(false);
                    setCurrentReport(null);
                }
                return;
            }

            // Modo real: enviar a la API
            await reportService.deleteReport(reportToDelete.id);

            // Eliminar de la lista local de reportes
            setReports(prevReports =>
                prevReports.filter(report => report.id !== reportToDelete.id)
            );

            toast.success('Reporte eliminado exitosamente');
            setShowDeleteModal(false);
            setReportToDelete(null);

            if (showDetailModal && currentReport?.id === reportToDelete.id) {
                setShowDetailModal(false);
                setCurrentReport(null);
            }
        } catch (error) {
            
            toast.error('No se pudo eliminar el reporte');
        }
    };

    const openDetailModal = async (report) => {
        try {
            if (useFallbackMode) {
                // Modo fallback: usar directamente el reporte de la lista
                setCurrentReport(report);
                setShowDetailModal(true);
                return;
            }

            // Modo real: obtener detalles de la API
            const detailedReport = await reportService.getReportById(report.id);
            setCurrentReport(detailedReport);
            setShowDetailModal(true);
        } catch (error) {
            
            toast.error('Error al cargar el detalle del reporte');

            // Si falla, intentar con el reporte que ya tenemos
            setCurrentReport(report);
            setShowDetailModal(true);
        }
    };

    const handleAddNew = () => {
        setFormData({
            title: '',
            description: '',
            type: 'MEDIA',
            relatedItemId: '',
            relatedItemType: ''
        });
        setShowAddModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitReport = async (e) => {
        e.preventDefault();

        try {
            // Extraer solo los campos necesarios para el backend
            const reportData = {
                title: formData.title,
                description: formData.description,
                type: formData.type
            };

            // Añadir campos opcionales solo si están definidos
            if (formData.relatedItemId) {
                reportData.relatedItemId = parseInt(formData.relatedItemId);
                reportData.relatedItemType = formData.relatedItemType;
            }

            

            let newReport;

            if (useFallbackMode) {
                // Modo fallback: crear un reporte simulado
                const relatedItem = reportData.relatedItemId ?
                    (reportData.relatedItemType === 'VEHICULO' ?
                        vehicles.find(v => v.id === reportData.relatedItemId) :
                        inventory.find(i => i.id === reportData.relatedItemId)) :
                    null;

                newReport = {
                    id: Date.now(),
                    ...reportData,
                    status: 'PENDIENTE',
                    createdBy: { id: 1, name: 'Usuario Actual', role: 'Técnico' },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    comments: [],
                    relatedItemName: relatedItem ?
                        (reportData.relatedItemType === 'VEHICULO' ?
                            `${relatedItem.item_name || relatedItem.brand} - ${relatedItem.license_plate || relatedItem.item_code}` :
                            `${relatedItem.itemName || relatedItem.item_name} - ${relatedItem.itemCode || relatedItem.item_code}`) :
                        null
                };

                toast.success('Reporte creado exitosamente (modo demo)');
            } else {
                // Modo real: enviar a la API
                try {
                    newReport = await reportService.createReport(reportData);
                    toast.success('Reporte creado exitosamente');
                } catch (error) {
                    

                    // Si falla la creación, preguntar si desea cambiar a modo fallback
                    if (window.confirm('No se pudo crear el reporte en el servidor. ¿Desea utilizar el modo de demostración?')) {
                        setUseFallbackMode(true);
                        // Ejecutar la lógica de modo fallback
                        const relatedItem = reportData.relatedItemId ?
                            (reportData.relatedItemType === 'VEHICULO' ?
                                vehicles.find(v => v.id === reportData.relatedItemId) :
                                inventory.find(i => i.id === reportData.relatedItemId)) :
                            null;

                        newReport = {
                            id: Date.now(),
                            ...reportData,
                            status: 'PENDIENTE',
                            createdBy: { id: 1, name: 'Usuario Actual', role: 'Técnico' },
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            comments: [],
                            relatedItemName: relatedItem ?
                                (reportData.relatedItemType === 'VEHICULO' ?
                                    `${relatedItem.item_name || relatedItem.brand} - ${relatedItem.license_plate || relatedItem.item_code}` :
                                    `${relatedItem.itemName || relatedItem.item_name} - ${relatedItem.itemCode || relatedItem.item_code}`) :
                                null
                        };

                        toast.info('Cambiado a modo de demostración');
                        toast.success('Reporte creado exitosamente (modo demo)');
                    } else {
                        toast.error(`Error al crear reporte: ${error.message || 'Error desconocido'}`);
                        return; // Salir sin cerrar el modal si no se cambió al modo fallback
                    }
                }
            }

            if (newReport) {
                setShowAddModal(false);
                // Actualizar la lista de reportes
                setReports(prevReports => [newReport, ...prevReports]);
            }
        } catch (error) {
            
            toast.error(`Error al crear el reporte: ${error.message || 'Error desconocido'}`);
        }
    };

    // Filtrar reportes
    const filteredReports = reports.filter(report => {
        const matchesSearch =
            report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (report.createdBy?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || report.type === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    // Ordenar reportes por fecha de creación (más recientes primero)
    const sortedReports = [...filteredReports].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Obtener clase de prioridad
    const getPriorityClass = (type) => {
        switch (type) {
            case 'BAJA': return 'priority-low';
            case 'MEDIA': return 'priority-medium';
            case 'ALTA': return 'priority-high';
            case 'CRITICA': return 'priority-critical';
            default: return '';
        }
    };

    // Obtener texto de prioridad
    const getPriorityText = (type) => {
        switch (type) {
            case 'BAJA': return 'Baja';
            case 'MEDIA': return 'Media';
            case 'ALTA': return 'Alta';
            case 'CRITICA': return 'Crítica';
            default: return type;
        }
    };

    // Obtener clase de estado
    const getStatusClass = (status) => {
        switch (status) {
            case 'PENDIENTE': return 'status-pending';
            case 'EN_PROCESO': return 'status-in-progress';
            case 'COMPLETADO': return 'status-completed';
            case 'CANCELADO': return 'status-cancelled';
            default: return '';
        }
    };

    // Obtener texto de estado
    const getStatusText = (status) => {
        switch (status) {
            case 'PENDIENTE': return 'Pendiente';
            case 'EN_PROCESO': return 'En proceso';
            case 'COMPLETADO': return 'Completado';
            case 'CANCELADO': return 'Cancelado';
            default: return status;
        }
    };

    // Obtener icono de estado
    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDIENTE': return <HourglassEmptyIcon />;
            case 'EN_PROCESO': return <BuildIcon />;
            case 'COMPLETADO': return <CheckCircleOutlineIcon />;
            case 'CANCELADO': return <CancelIcon />;
            default: return null;
        }
    };

    const toggleFallbackMode = () => {
        const newMode = !useFallbackMode;
        setUseFallbackMode(newMode);
        if (newMode) {
            toast.info('Modo de demostración activado');
        } else {
            toast.info('Modo de datos reales activado');
        }
        fetchReports();
    };

    if (loading) {
        return <LoadingSpinner message="Cargando reportes..." />;
    }

    return (
        <div className="reports-container">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Reportes y Soporte</h2>
                    <div className="header-buttons">
                        <button
                            className="add-report-button"
                            onClick={handleAddNew}
                        >
                            <AddIcon /> Nuevo Reporte
                        </button>
                        <button
                            className={`fallback-mode-toggle ${useFallbackMode ? 'active' : ''}`}
                            onClick={toggleFallbackMode}
                            title={useFallbackMode ? "Cambiar a datos reales" : "Cambiar a datos de demostración"}
                            style={{ marginLeft: '10px', padding: '8px 12px', fontSize: '0.8em' }}
                        >
                            {useFallbackMode ? "🔄 Modo Real" : "🔄 Modo Demo"}
                        </button>
                    </div>
                </div>

                <div className="search-filters-section">
                    <div className="search-box">
                        <SearchIcon className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar reportes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filters">
                        <div className="filter-group">
                            <FilterListIcon />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Todos los estados</option>
                                <option value="PENDIENTE">Pendiente</option>
                                <option value="EN_PROCESO">En proceso</option>
                                <option value="COMPLETADO">Completado</option>
                                <option value="CANCELADO">Cancelado</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <PriorityHighIcon />
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                            >
                                <option value="all">Todas las prioridades</option>
                                <option value="BAJA">Baja</option>
                                <option value="MEDIA">Media</option>
                                <option value="ALTA">Alta</option>
                                <option value="CRITICA">Crítica</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="reports-list">
                    {sortedReports.length === 0 ? (
                        <div className="no-reports">
                            <AssignmentIcon className="no-reports-icon" />
                            <p>No hay reportes disponibles</p>
                            <button className="create-report-button" onClick={handleAddNew}>
                                <AddIcon /> Crear Reporte
                            </button>
                        </div>
                    ) : (
                        sortedReports.map(report => (
                            <div
                                key={report.id}
                                className="report-card"
                                onClick={() => openDetailModal(report)}
                            >
                                <div className="report-header">
                                    <h3 className="report-title">{report.title}</h3>
                                    <div className={`report-status ${getStatusClass(report.status)}`}>
                                        {getStatusIcon(report.status)}
                                        <span>{getStatusText(report.status)}</span>
                                    </div>
                                </div>

                                <div className="report-body">
                                    <p className="report-description">{report.description}</p>

                                    {report.relatedItemType && (
                                        <div className="related-item">
                                            {report.relatedItemType === 'VEHICULO' ? (
                                                <DirectionsCarIcon className="related-item-icon" />
                                            ) : (
                                                <InventoryIcon className="related-item-icon" />
                                            )}
                                            <span>{report.relatedItemName || 'Elemento relacionado'}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="report-footer">
                                    <div className="report-meta">
                                        <PersonIcon className="meta-icon" />
                                        <span>{report.createdBy?.name || 'Usuario'}</span>
                                    </div>
                                    <div className="report-meta">
                                        <ChatIcon className="meta-icon" />
                                        <span>{report.comments?.length || 0} comentarios</span>
                                    </div>
                                    <div className={`report-priority ${getPriorityClass(report.type)}`}>
                                        <PriorityHighIcon className="priority-icon" />
                                        <span>{getPriorityText(report.type)}</span>
                                    </div>
                                </div>

                                <div className="report-date">
                                    {formatDate(report.createdAt)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal para crear un nuevo reporte */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Crear Nuevo Reporte</h3>
                            <button className="close-button" onClick={() => setShowAddModal(false)}>
                                <CloseIcon />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitReport}>
                            <div className="form-group">
                                <label htmlFor="title">Título*</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Título descriptivo del reporte"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Descripción*</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Describe detalladamente el problema o situación"
                                    rows={5}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="type">Prioridad*</label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="BAJA">Baja</option>
                                    <option value="MEDIA">Media</option>
                                    <option value="ALTA">Alta</option>
                                    <option value="CRITICA">Crítica</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="relatedItemType">Elemento Relacionado (Opcional)</label>
                                <select
                                    id="relatedItemType"
                                    name="relatedItemType"
                                    value={formData.relatedItemType}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Ninguno</option>
                                    <option value="VEHICULO">Vehículo</option>
                                    <option value="INVENTARIO">Inventario</option>
                                </select>
                            </div>
                            {formData.relatedItemType && (
                                <div className="form-group">
                                    <label htmlFor="relatedItemId">Seleccionar {formData.relatedItemType === 'VEHICULO' ? 'Vehículo' : 'Item'}</label>
                                    <select
                                        id="relatedItemId"
                                        name="relatedItemId"
                                        value={formData.relatedItemId}
                                        onChange={handleInputChange}
                                        required={!!formData.relatedItemType}
                                    >
                                        <option value="">Selecciona un elemento</option>
                                        {formData.relatedItemType === 'VEHICULO' ?
                                            vehicles.map(vehicle => (
                                                <option key={vehicle.id} value={vehicle.id}>
                                                    {vehicle.item_name || vehicle.brand} - {vehicle.license_plate || vehicle.item_code}
                                                </option>
                                            )) :
                                            inventory.map(item => (
                                                <option key={item.id} value={item.id}>
                                                    {item.itemName || item.item_name} - {item.itemCode || item.item_code}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            )}
                            <div className="form-buttons">
                                <button type="button" className="cancel-button" onClick={() => setShowAddModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="submit-button">
                                    Crear Reporte
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de detalle del reporte */}
            {showDetailModal && currentReport && (
                <div className="modal-overlay detail-modal-overlay">
                    <div className="modal-content detail-modal">
                        <div className="modal-header detail-header">
                            <button className="back-button" onClick={() => setShowDetailModal(false)}>
                                <ArrowBackIcon />
                            </button>
                            <h3>{currentReport.title}</h3>
                            <div className="report-actions">
                                <button
                                    className="action-menu-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowActionMenu(!showActionMenu);
                                    }}
                                >
                                    <MoreVertIcon />
                                </button>
                                {showActionMenu && (
                                    <div className="action-menu">
                                        {currentReport.status !== 'COMPLETADO' && (
                                            <button
                                                className="action-item complete-action"
                                                onClick={() => handleChangeStatus('COMPLETADO')}
                                            >
                                                <CheckCircleOutlineIcon /> Marcar como completado
                                            </button>
                                        )}
                                        {currentReport.status !== 'EN_PROCESO' && currentReport.status !== 'COMPLETADO' && (
                                            <button
                                                className="action-item progress-action"
                                                onClick={() => handleChangeStatus('EN_PROCESO')}
                                            >
                                                <BuildIcon /> Marcar en proceso
                                            </button>
                                        )}
                                        {currentReport.status !== 'CANCELADO' && (
                                            <button
                                                className="action-item cancel-action"
                                                onClick={() => handleChangeStatus('CANCELADO')}
                                            >
                                                <CancelIcon /> Cancelar reporte
                                            </button>
                                        )}
                                        <button
                                            className="action-item delete-action"
                                            onClick={() => {
                                                setShowActionMenu(false);
                                                handleDeleteClick(currentReport);
                                            }}
                                        >
                                            <DeleteIcon /> Eliminar reporte
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="report-detail-content">
                            <div className="report-info-section">
                                <div className="report-info-header">
                                    <div className="report-info-meta">
                                        <span className="report-info-creator">
                                            <PersonIcon /> {currentReport.createdBy?.name || 'Usuario'}
                                        </span>
                                        <span className="report-info-date">
                                            {formatDate(currentReport.createdAt)}
                                        </span>
                                    </div>
                                    <div className={`report-detail-status ${getStatusClass(currentReport.status)}`}>
                                        {getStatusIcon(currentReport.status)}
                                        <span>{getStatusText(currentReport.status)}</span>
                                    </div>
                                </div>

                                <div className="report-detail-description">
                                    <p>{currentReport.description}</p>
                                </div>

                                {currentReport.relatedItemType && (
                                    <div className="report-related-item">
                                        <h4>Elemento Relacionado:</h4>
                                        <div className="related-item-detail">
                                            {currentReport.relatedItemType === 'VEHICULO' ? (
                                                <DirectionsCarIcon className="related-item-icon" />
                                            ) : (
                                                <InventoryIcon className="related-item-icon" />
                                            )}
                                            <span>{currentReport.relatedItemName || 'Elemento relacionado'}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="report-detail-priority-section">
                                    <h4>Prioridad:</h4>
                                    <div className={`report-detail-priority ${getPriorityClass(currentReport.type)}`}>
                                        <PriorityHighIcon />
                                        <span>{getPriorityText(currentReport.type)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="report-comments-section">
                                <h4 className="comments-heading">
                                    <ChatIcon /> Comentarios ({currentReport.comments?.length || 0})
                                </h4>

                                <div className="comments-list">
                                    {currentReport.comments && currentReport.comments.length > 0 ? (
                                        currentReport.comments.map(comment => (
                                            <div key={comment.id} className="comment-item">
                                                <div className="comment-header">
                                                    <div className="comment-user-info">
                                                        <PersonIcon className="comment-user-icon" />
                                                        <span className="comment-username">{comment.userName}</span>
                                                        <span className="comment-role">{comment.userRole}</span>
                                                    </div>
                                                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                                                </div>
                                                <div className="comment-content">
                                                    <p>{comment.content}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-comments">
                                            <p>No hay comentarios todavía.</p>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {currentReport.status !== 'COMPLETADO' && currentReport.status !== 'CANCELADO' && (
                                    <form className="comment-form" onSubmit={handleSubmitComment}>
                                        <div className="comment-input-container">
                                            <textarea
                                                className="comment-input"
                                                placeholder="Escribe un comentario..."
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="send-comment-button">
                                            <SendIcon />
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación de eliminación */}
            {showDeleteModal && (
                <DeleteConfirmationModal
                    title="Eliminar Reporte"
                    message={`¿Estás seguro de que deseas eliminar el reporte "${reportToDelete?.title}"?`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}
        </div>
    );
};

export default Reports; 
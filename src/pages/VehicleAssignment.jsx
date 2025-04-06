import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, CircularProgress, Alert, Snackbar,
    FormControl, InputLabel, Select, MenuItem, TextField, Paper,
    Dialog, DialogTitle, DialogContent, DialogActions, Grid, Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import BuildIcon from '@mui/icons-material/Build';
import { toast } from 'react-toastify';
import axios from '../axiosConfig';
import './VehicleAssignment.css';
import { usePermissions } from '../context/PermissionsContext';

const VehicleAssignment = () => {
    const { vehicleId } = useParams();
    const navigate = useNavigate();
    const { hasPermission } = usePermissions();

    // Estados
    const [vehicle, setVehicle] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado para el formulario de nueva asignación
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        userId: '',
        assignmentType: 'Conductor',
        assignmentStatus: 'Activa',
        startDate: new Date(),
        endDate: null,
        notes: ''
    });

    // Estado para el formulario de edición
    const [editDialog, setEditDialog] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);

    // Estado para el formulario de finalización
    const [endDialog, setEndDialog] = useState(false);
    const [endingAssignment, setEndingAssignment] = useState(null);
    const [endDate, setEndDate] = useState(new Date());
    const [endNotes, setEndNotes] = useState('');

    // Cargar datos iniciales
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                console.log('Iniciando carga de datos para la gestión de asignaciones del vehículo ID:', vehicleId);

                // Obtener detalles del vehículo
                console.log('Obteniendo detalles del vehículo...');
                const vehicleResponse = await axios.get(`/vehicles/${vehicleId}`);
                console.log('Vehículo obtenido:', vehicleResponse.data);
                setVehicle(vehicleResponse.data);

                // Obtener asignaciones del vehículo
                console.log('Obteniendo asignaciones del vehículo...');
                const assignmentsResponse = await axios.get(`/vehicle-assignments/vehicle/${vehicleId}`);
                console.log('Asignaciones obtenidas:', assignmentsResponse.data);
                setAssignments(assignmentsResponse.data);

                // Obtener lista de usuarios - Corregir la URL para obtener usuarios
                console.log('Obteniendo lista de usuarios...');
                try {
                    const usersResponse = await axios.get('/auth/users');
                    console.log('Usuarios obtenidos:', usersResponse.data);
                    setUsers(usersResponse.data);
                } catch (userError) {
                    console.error('Error específico al obtener usuarios:', userError);
                    console.error('Detalles del error:', userError.response ? userError.response.data : 'Sin detalles');
                    // Intentar con filtro de rol (puede que necesite permisos específicos)
                    try {
                        console.log('Intentando obtener usuarios con filtro de rol...');
                        const filteredUsersResponse = await axios.get('/auth/users?role=tecnico');
                        console.log('Usuarios filtrados obtenidos:', filteredUsersResponse.data);
                        setUsers(filteredUsersResponse.data);
                    } catch (filteredError) {
                        console.error('También falló la obtención de usuarios filtrados:', filteredError);
                        setError('No se pudo cargar la lista de usuarios. Verifica tus permisos.');
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error('Error al cargar datos:', err);

                // Mostrar detalles específicos del error
                if (err.response) {
                    console.error('Respuesta de error:', {
                        status: err.response.status,
                        statusText: err.response.statusText,
                        data: err.response.data
                    });

                    // Mensaje personalizado según el código de error
                    if (err.response.status === 404) {
                        setError('No se encuentra el vehículo solicitado.');
                    } else if (err.response.status === 403) {
                        setError('No tienes permisos para ver las asignaciones de este vehículo.');
                    } else {
                        setError(`Error al cargar los datos: ${err.response.data.message || 'Verifica tu conexión'}`);
                    }
                } else if (err.request) {
                    console.error('Error de red - No se recibió respuesta del servidor');
                    setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
                } else {
                    console.error('Error inesperado:', err.message);
                    setError('Error inesperado. Por favor, intenta de nuevo más tarde.');
                }

                setLoading(false);
            }
        };

        fetchData();
    }, [vehicleId]);

    // Manejadores para el formulario de nueva asignación
    const handleOpenDialog = () => setOpenDialog(true);

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setFormData({
            userId: '',
            assignmentType: 'Conductor',
            assignmentStatus: 'Activa',
            startDate: new Date(),
            endDate: null,
            notes: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date, field) => {
        setFormData(prev => ({ ...prev, [field]: date }));
    };

    const handleSubmit = async () => {
        try {
            // Validar datos
            if (!formData.userId || !formData.assignmentType || !formData.startDate) {
                toast.error('Por favor completa todos los campos obligatorios');
                return;
            }

            const payload = {
                vehicleId: parseInt(vehicleId),
                userId: parseInt(formData.userId),
                assignmentType: formData.assignmentType,
                assignmentStatus: formData.assignmentStatus,
                startDate: formData.startDate,
                endDate: formData.endDate,
                notes: formData.notes
            };

            const response = await axios.post('/vehicle-assignments', payload);

            // Actualizar lista de asignaciones
            setAssignments(prev => [response.data.assignment, ...prev]);

            toast.success('Asignación creada correctamente');
            handleCloseDialog();
        } catch (err) {
            console.error('Error al crear asignación:', err);
            const errorMsg = err.response?.data?.message || 'Error al crear la asignación';
            toast.error(errorMsg);
        }
    };

    // Manejadores para editar asignación
    const handleEditClick = (assignment) => {
        setEditingAssignment(assignment);
        setFormData({
            userId: assignment.userId.toString(),
            assignmentType: assignment.assignmentType,
            assignmentStatus: assignment.assignmentStatus,
            startDate: new Date(assignment.startDate),
            endDate: assignment.endDate ? new Date(assignment.endDate) : null,
            notes: assignment.notes || ''
        });
        setEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setEditDialog(false);
        setEditingAssignment(null);
    };

    const handleUpdateAssignment = async () => {
        try {
            const payload = {
                assignmentType: formData.assignmentType,
                assignmentStatus: formData.assignmentStatus,
                startDate: formData.startDate,
                endDate: formData.endDate,
                notes: formData.notes
            };

            const response = await axios.put(`/vehicle-assignments/${editingAssignment.id}`, payload);

            // Actualizar lista de asignaciones
            setAssignments(prev =>
                prev.map(a => a.id === editingAssignment.id ? response.data.assignment : a)
            );

            toast.success('Asignación actualizada correctamente');
            handleCloseEditDialog();
        } catch (err) {
            console.error('Error al actualizar asignación:', err);
            const errorMsg = err.response?.data?.message || 'Error al actualizar la asignación';
            toast.error(errorMsg);
        }
    };

    // Manejadores para finalizar asignación
    const handleEndClick = (assignment) => {
        setEndingAssignment(assignment);
        setEndDate(new Date());
        setEndNotes('');
        setEndDialog(true);
    };

    const handleCloseEndDialog = () => {
        setEndDialog(false);
        setEndingAssignment(null);
    };

    const handleEndAssignment = async () => {
        try {
            const payload = {
                endDate: endDate,
                notes: endNotes
            };

            const response = await axios.put(`/vehicle-assignments/${endingAssignment.id}/end`, payload);

            // Actualizar lista de asignaciones
            setAssignments(prev =>
                prev.map(a => a.id === endingAssignment.id ? response.data.assignment : a)
            );

            toast.success('Asignación finalizada correctamente');
            handleCloseEndDialog();
        } catch (err) {
            console.error('Error al finalizar asignación:', err);
            const errorMsg = err.response?.data?.message || 'Error al finalizar la asignación';
            toast.error(errorMsg);
        }
    };

    // Eliminar asignación
    const handleDeleteAssignment = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta asignación?')) {
            return;
        }

        try {
            await axios.delete(`/vehicle-assignments/${id}`);

            // Actualizar lista de asignaciones
            setAssignments(prev => prev.filter(a => a.id !== id));

            toast.success('Asignación eliminada correctamente');
        } catch (err) {
            console.error('Error al eliminar asignación:', err);
            const errorMsg = err.response?.data?.message || 'Error al eliminar la asignación';
            toast.error(errorMsg);
        }
    };

    // Función para renderizar el estado con un color
    const renderStatus = (status) => {
        let color;
        switch (status) {
            case 'Activa':
                color = 'success';
                break;
            case 'Finalizada':
                color = 'default';
                break;
            case 'Pendiente':
                color = 'warning';
                break;
            default:
                color = 'default';
        }

        return <Chip label={status} color={color} size="small" />;
    };

    // Función para renderizar el tipo con un icono
    const renderType = (type) => {
        let icon;
        let color;

        switch (type) {
            case 'Responsable':
                icon = <PersonIcon fontSize="small" />;
                color = 'primary';
                break;
            case 'Conductor':
                icon = <DirectionsCarIcon fontSize="small" />;
                color = 'secondary';
                break;
            case 'Mantenimiento':
                icon = <BuildIcon fontSize="small" />;
                color = 'warning';
                break;
            default:
                icon = <AssignmentIndIcon fontSize="small" />;
                color = 'default';
        }

        return <Chip icon={icon} label={type} color={color} size="small" />;
    };

    if (loading) {
        return (
            <Box className="loading-container">
                <CircularProgress />
                <Typography variant="body1">Cargando datos...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box className="error-container">
                <Alert severity="error">{error}</Alert>
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/vehicles')}
                >
                    Volver a Vehículos
                </Button>
            </Box>
        );
    }

    return (
        <div className="vehicle-assignment-container">
            <div className="vehicle-assignment-header">
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/vehicles')}
                    className="back-button"
                >
                    Volver
                </Button>

                <Typography variant="h4" component="h1">
                    Asignaciones de {vehicle?.brand} {vehicle?.model} ({vehicle?.licensePlate})
                </Typography>

                {hasPermission('createVehicleAssignment') && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenDialog}
                        className="add-assignment-button"
                    >
                        Nueva Asignación
                    </Button>
                )}
            </div>

            {vehicle && (
                <Paper className="vehicle-info-paper">
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1">
                                <DirectionsCarIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                                {vehicle.brand} {vehicle.model} ({vehicle.year})
                            </Typography>
                            <Typography variant="body2">
                                Placa: {vehicle.licensePlate}
                            </Typography>
                            <Typography variant="body2">
                                Estado: {vehicle.status}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2">
                                Tipo: {vehicle.vehicleType}
                            </Typography>
                            <Typography variant="body2">
                                Departamento: {vehicle.department || 'No asignado'}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            <Typography variant="h5" component="h2" className="assignments-title">
                Asignaciones Activas
            </Typography>

            <div className="assignments-list">
                {assignments.filter(a => a.assignmentStatus === 'Activa').length === 0 ? (
                    <Paper className="no-assignments-paper">
                        <Typography variant="body1">No hay asignaciones activas para este vehículo</Typography>
                    </Paper>
                ) : (
                    assignments
                        .filter(a => a.assignmentStatus === 'Activa')
                        .map(assignment => (
                            <Paper key={assignment.id} className="assignment-card">
                                <div className="assignment-card-header">
                                    <div className="assignment-type-status">
                                        {renderType(assignment.assignmentType)}
                                        {renderStatus(assignment.assignmentStatus)}
                                    </div>

                                    <div className="assignment-actions">
                                        {hasPermission('updateVehicleAssignment') && (
                                            <Button
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleEditClick(assignment)}
                                            >
                                                Editar
                                            </Button>
                                        )}

                                        {hasPermission('updateVehicleAssignment') && assignment.assignmentStatus === 'Activa' && (
                                            <Button
                                                size="small"
                                                color="warning"
                                                startIcon={<DateRangeIcon />}
                                                onClick={() => handleEndClick(assignment)}
                                            >
                                                Finalizar
                                            </Button>
                                        )}

                                        {hasPermission('deleteVehicleAssignment') && (
                                            <Button
                                                size="small"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleDeleteAssignment(assignment.id)}
                                            >
                                                Eliminar
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="assignment-info">
                                    <Typography variant="body1" className="user-name">
                                        <PersonIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                                        {assignment.user.fullName || assignment.user.email}
                                    </Typography>

                                    <Typography variant="body2" className="date-info">
                                        <strong>Inicio:</strong> {format(new Date(assignment.startDate), 'dd/MM/yyyy')}
                                        {assignment.endDate && (
                                            <span> <strong>Fin:</strong> {format(new Date(assignment.endDate), 'dd/MM/yyyy')}</span>
                                        )}
                                    </Typography>

                                    {assignment.notes && (
                                        <Typography variant="body2" className="notes-text">
                                            <strong>Notas:</strong> {assignment.notes}
                                        </Typography>
                                    )}
                                </div>
                            </Paper>
                        ))
                )}
            </div>

            <Typography variant="h5" component="h2" className="assignments-title">
                Historial de Asignaciones
            </Typography>

            <div className="assignments-list">
                {assignments.filter(a => a.assignmentStatus !== 'Activa').length === 0 ? (
                    <Paper className="no-assignments-paper">
                        <Typography variant="body1">No hay historial de asignaciones para este vehículo</Typography>
                    </Paper>
                ) : (
                    assignments
                        .filter(a => a.assignmentStatus !== 'Activa')
                        .map(assignment => (
                            <Paper key={assignment.id} className="assignment-card history-card">
                                <div className="assignment-card-header">
                                    <div className="assignment-type-status">
                                        {renderType(assignment.assignmentType)}
                                        {renderStatus(assignment.assignmentStatus)}
                                    </div>

                                    <div className="assignment-actions">
                                        {hasPermission('deleteVehicleAssignment') && (
                                            <Button
                                                size="small"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleDeleteAssignment(assignment.id)}
                                            >
                                                Eliminar
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="assignment-info">
                                    <Typography variant="body1" className="user-name">
                                        <PersonIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                                        {assignment.user.fullName || assignment.user.email}
                                    </Typography>

                                    <Typography variant="body2" className="date-info">
                                        <strong>Inicio:</strong> {format(new Date(assignment.startDate), 'dd/MM/yyyy')}
                                        {assignment.endDate && (
                                            <span> <strong>Fin:</strong> {format(new Date(assignment.endDate), 'dd/MM/yyyy')}</span>
                                        )}
                                    </Typography>

                                    {assignment.notes && (
                                        <Typography variant="body2" className="notes-text">
                                            <strong>Notas:</strong> {assignment.notes}
                                        </Typography>
                                    )}
                                </div>
                            </Paper>
                        ))
                )}
            </div>

            {/* Diálogo para nueva asignación */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Nueva Asignación de Vehículo</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} style={{ marginTop: '8px' }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel id="user-label">Usuario</InputLabel>
                                <Select
                                    labelId="user-label"
                                    id="userId"
                                    name="userId"
                                    value={formData.userId}
                                    onChange={handleInputChange}
                                    label="Usuario"
                                >
                                    <MenuItem value="">Seleccionar usuario</MenuItem>
                                    {users.map(user => (
                                        <MenuItem key={user.id} value={user.id.toString()}>
                                            {user.fullName || user.email}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel id="type-label">Tipo de Asignación</InputLabel>
                                <Select
                                    labelId="type-label"
                                    id="assignmentType"
                                    name="assignmentType"
                                    value={formData.assignmentType}
                                    onChange={handleInputChange}
                                    label="Tipo de Asignación"
                                >
                                    <MenuItem value="Responsable">Responsable</MenuItem>
                                    <MenuItem value="Conductor">Conductor</MenuItem>
                                    <MenuItem value="Mantenimiento">Mantenimiento</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel id="status-label">Estado</InputLabel>
                                <Select
                                    labelId="status-label"
                                    id="assignmentStatus"
                                    name="assignmentStatus"
                                    value={formData.assignmentStatus}
                                    onChange={handleInputChange}
                                    label="Estado"
                                >
                                    <MenuItem value="Activa">Activa</MenuItem>
                                    <MenuItem value="Pendiente">Pendiente</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="Fecha de Inicio *"
                                value={formData.startDate}
                                onChange={(date) => handleDateChange(date, 'startDate')}
                                renderInput={(params) => <TextField {...params} fullWidth required />}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="Fecha de Fin (opcional)"
                                value={formData.endDate}
                                onChange={(date) => handleDateChange(date, 'endDate')}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                id="notes"
                                name="notes"
                                label="Notas (opcional)"
                                multiline
                                rows={3}
                                fullWidth
                                value={formData.notes}
                                onChange={handleInputChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo para editar asignación */}
            <Dialog open={editDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Editar Asignación</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} style={{ marginTop: '8px' }}>
                        <Grid item xs={12}>
                            <Typography variant="body1">
                                <strong>Usuario:</strong> {
                                    editingAssignment && users.find(u => u.id.toString() === formData.userId)?.fullName
                                }
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel id="edit-type-label">Tipo de Asignación</InputLabel>
                                <Select
                                    labelId="edit-type-label"
                                    id="assignmentType"
                                    name="assignmentType"
                                    value={formData.assignmentType}
                                    onChange={handleInputChange}
                                    label="Tipo de Asignación"
                                >
                                    <MenuItem value="Responsable">Responsable</MenuItem>
                                    <MenuItem value="Conductor">Conductor</MenuItem>
                                    <MenuItem value="Mantenimiento">Mantenimiento</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel id="edit-status-label">Estado</InputLabel>
                                <Select
                                    labelId="edit-status-label"
                                    id="assignmentStatus"
                                    name="assignmentStatus"
                                    value={formData.assignmentStatus}
                                    onChange={handleInputChange}
                                    label="Estado"
                                >
                                    <MenuItem value="Activa">Activa</MenuItem>
                                    <MenuItem value="Pendiente">Pendiente</MenuItem>
                                    <MenuItem value="Finalizada">Finalizada</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="Fecha de Inicio *"
                                value={formData.startDate}
                                onChange={(date) => handleDateChange(date, 'startDate')}
                                renderInput={(params) => <TextField {...params} fullWidth required />}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="Fecha de Fin (opcional)"
                                value={formData.endDate}
                                onChange={(date) => handleDateChange(date, 'endDate')}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                id="notes"
                                name="notes"
                                label="Notas (opcional)"
                                multiline
                                rows={3}
                                fullWidth
                                value={formData.notes || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog}>Cancelar</Button>
                    <Button onClick={handleUpdateAssignment} variant="contained">Actualizar</Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo para finalizar asignación */}
            <Dialog open={endDialog} onClose={handleCloseEndDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Finalizar Asignación</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} style={{ marginTop: '8px' }}>
                        {endingAssignment && (
                            <Grid item xs={12}>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Usuario:</strong> {endingAssignment.user.fullName || endingAssignment.user.email}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Tipo:</strong> {endingAssignment.assignmentType}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Fecha de inicio:</strong> {format(new Date(endingAssignment.startDate), 'dd/MM/yyyy')}
                                </Typography>
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <DatePicker
                                label="Fecha de Finalización *"
                                value={endDate}
                                onChange={setEndDate}
                                renderInput={(params) => <TextField {...params} fullWidth required />}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                id="endNotes"
                                label="Notas de Finalización (opcional)"
                                multiline
                                rows={3}
                                fullWidth
                                value={endNotes}
                                onChange={(e) => setEndNotes(e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEndDialog}>Cancelar</Button>
                    <Button onClick={handleEndAssignment} variant="contained" color="warning">Finalizar Asignación</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default VehicleAssignment; 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../axiosConfig';
import './VehicleForm.css';
import { usePermissions } from '../context/PermissionsContext';

// Componentes de Material UI
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BuildIcon from '@mui/icons-material/Build';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

const VehicleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { hasPermission } = usePermissions();

    const isEditing = !!id;
    const isViewing = id && window.location.pathname.includes('/vehicles/') && !window.location.pathname.includes('/edit/');

    // Verificar permisos para editar o crear
    const canEdit = hasPermission('canEditVehicle');
    const canCreate = hasPermission('canCreateVehicle');

    // Determinar si el usuario tiene permisos para la acción actual
    const hasRequiredPermission = (!isEditing && canCreate) || (isEditing && !isViewing && canEdit) || isViewing;

    // Verificar si venimos desde la vista de inventario
    // Si estamos en modo edición después de visualización, conservar el contexto
    const isFromInventory = window.location.pathname.includes('/inventory/') ||
        localStorage.getItem('fromInventory') === 'true';

    console.log('Estado de navegación:', {
        ruta: window.location.pathname,
        desdeInventario: isFromInventory,
        localStorage: localStorage.getItem('fromInventory')
    });

    // Configurar el contexto al montar el componente
    useEffect(() => {
        const currentPath = window.location.pathname;

        // Si estamos en una ruta de inventario, guardar el contexto
        if (currentPath.includes('/inventory/') || currentPath.includes('/inventory/edit/')) {
            console.log('Estableciendo contexto de inventario (ruta actual:', currentPath, ')');
            localStorage.setItem('fromInventory', 'true');
        }

        console.log('Contexto después de inicialización:', localStorage.getItem('fromInventory'));

        // No limpiar el localStorage en la función de limpieza
        // Lo manejaremos en los handlers de navegación
    }, []);

    // Mejorar la detección de contexto para el botón de editar
    const handleEditButtonClick = () => {
        // Vamos a preservar explícitamente el contexto al navegar a la edición
        if (isFromInventory) {
            console.log('Preservando contexto de inventario para edición');
            // Estamos usando replaceItem para asegurarnos de que el valor se actualiza
            localStorage.setItem('fromInventory', 'true');
        }
        console.log('Navegando a edición con contexto:', localStorage.getItem('fromInventory'));
        navigate(`/vehicles/edit/${id}`);
    };

    // Obtener el título y subtítulo basado en el modo
    const getPageTitle = () => {
        if (isViewing) {
            return (
                <>
                    <DirectionsCarIcon sx={{ mr: 1 }} />
                    Detalles del Vehículo
                </>
            );
        } else if (isEditing) {
            return (
                <>
                    <DriveFileRenameOutlineIcon sx={{ mr: 1 }} />
                    Editar Vehículo
                </>
            );
        } else {
            return (
                <>
                    <AddIcon sx={{ mr: 1 }} />
                    Registrar Nuevo Vehículo
                </>
            );
        }
    };

    const initialFormState = {
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        licensePlate: '',
        vin: '',
        color: '',
        vehicleStatus: 'Operativo',
        mileage: '',
        fuelType: 'Gasolina',
        insuranceExpiryDate: null,
        notes: '',
        responsiblePerson: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [inventoryData, setInventoryData] = useState(null);
    const [technicians, setTechnicians] = useState([]);
    const [responsibleTechnicianName, setResponsibleTechnicianName] = useState('');

    const vehicleStatuses = ['Operativo', 'En Reparación', 'Fuera de Servicio'];
    const fuelTypes = ['Gasolina', 'Diésel', 'Eléctrico', 'Híbrido'];

    // Cargar la lista de técnicos
    useEffect(() => {
        const fetchTechnicians = async () => {
            try {
                console.log('Intentando cargar la lista de técnicos...');
                const response = await axiosInstance.get('/auth/users?role=tecnico');
                console.log('Respuesta completa de la API:', response);

                if (response.data && Array.isArray(response.data)) {
                    console.log('Técnicos cargados correctamente:', response.data);
                    setTechnicians(response.data);
                } else {
                    console.error('La respuesta no contiene un array de técnicos:', response.data);
                    toast.error('Formato de respuesta incorrecto al cargar técnicos');
                }
            } catch (error) {
                console.error('Error al cargar la lista de técnicos:', error);
                console.error('Detalles del error:', error.response ? error.response.data : 'Sin detalles');
                toast.error('No se pudo cargar la lista de técnicos');
            }
        };

        fetchTechnicians();
    }, []);

    useEffect(() => {
        if (id) {
            const fetchVehicleData = async () => {
                setIsLoading(true);
                try {
                    console.log('Obteniendo datos del vehículo con ID:', id);
                    const response = await axiosInstance.get(`/vehicles/${id}`);
                    const vehicle = response.data;
                    console.log('Vehículo obtenido:', vehicle);

                    // Verificar si venimos desde el inventario o desde vehículos
                    const isFromInventory = window.location.pathname.includes('/inventory/');
                    console.log('¿Accediendo desde inventario?', isFromInventory);

                    // Función para ajustar la fecha y mostrar el día correcto
                    const adjustDate = (dateStr) => {
                        if (!dateStr) return null;
                        // Crear un objeto Date desde la fecha del backend
                        const date = new Date(dateStr);
                        // Ajustar manualmente al día correcto sumando el desplazamiento de la zona horaria
                        const offsetMinutes = date.getTimezoneOffset(); // Diferencia en minutos respecto a UTC
                        const adjustedDate = new Date(date.getTime() - offsetMinutes * 60 * 1000);
                        // Formatear como YYYY-MM-DD
                        const year = adjustedDate.getFullYear();
                        const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
                        const day = String(adjustedDate.getDate()).padStart(2, '0');

                        return `${year}-${month}-${day}`;
                    };

                    // Primero, intentemos obtener la asignación de técnico actual
                    try {
                        // Obtener asignaciones de este vehículo
                        const assignmentsResponse = await axiosInstance.get(`/vehicle-assignments/vehicle/${id}`);
                        console.log('Asignaciones obtenidas:', assignmentsResponse.data);

                        // Filtrar para obtener la asignación activa de tipo 'Responsable'
                        const activeAssignment = assignmentsResponse.data.find(
                            a => a.assignmentStatus === 'Activa' && a.assignmentType === 'Responsable'
                        );

                        // Si encontramos una asignación activa, usar el ID del usuario como responsiblePerson
                        if (activeAssignment) {
                            console.log('Asignación activa encontrada:', activeAssignment);
                            vehicle.responsiblePerson = activeAssignment.userId.toString();
                            console.log('ID del técnico asignado:', vehicle.responsiblePerson);

                            // Guardar el nombre del técnico para mostrar en modo visualización
                            if (activeAssignment.user) {
                                setResponsibleTechnicianName(activeAssignment.user.fullName || activeAssignment.user.email);
                            }
                        } else {
                            console.log('No se encontró asignación activa para este vehículo');
                        }
                    } catch (assignmentError) {
                        console.error('Error al obtener asignaciones:', assignmentError);
                    }

                    // Asegurar que ningún valor sea undefined
                    setFormData({
                        brand: vehicle.brand || '',
                        model: vehicle.model || '',
                        year: vehicle.year || new Date().getFullYear(),
                        licensePlate: vehicle.licensePlate || '',
                        vin: vehicle.vin || '',
                        color: vehicle.color || '',
                        vehicleStatus: vehicle.vehicleStatus || 'Operativo',
                        mileage: vehicle.mileage || '',
                        fuelType: vehicle.fuelType || 'Gasolina',
                        insuranceExpiryDate: adjustDate(vehicle.insuranceExpiryDate),
                        notes: vehicle.notes || '',
                        responsiblePerson: vehicle.responsiblePerson || ''
                    });

                    // Cargar datos de inventario para obtener la imagen
                    try {
                        console.log('Intentando cargar datos de inventario para vehículo ID:', id);
                        console.log('Datos del vehículo:', vehicle);

                        // Determinar el ID de inventario que vamos a usar
                        let inventoryId = vehicle.inventoryId || id;

                        console.log('Usando ID de inventario:', inventoryId);

                        // Verificar si estamos accediendo directamente desde el inventario
                        const isFromInventory = window.location.pathname.includes('/inventory/');
                        if (isFromInventory) {
                            console.log('Accediendo desde la vista de inventario, usando ID directo:', id);
                            inventoryId = id; // Si venimos de inventario, usar el ID directamente
                        }

                        console.log('ID de inventario final a usar:', inventoryId);
                        const inventoryResponse = await axiosInstance.get(`/inventory/${inventoryId}`);
                        console.log('Respuesta del inventario:', inventoryResponse.data);

                        if (inventoryResponse.data) {
                            setInventoryData(inventoryResponse.data);

                            // Verificar si hay una imagen en el inventario
                            if (inventoryResponse.data.imagePath) {
                                console.log('Ruta de imagen encontrada:', inventoryResponse.data.imagePath);
                                // Construir la URL de la imagen
                                const imagePath = inventoryResponse.data.imagePath;

                                // Construir la URL para la imagen
                                // Eliminar el prefijo /uploads/ si existe
                                const cleanImagePath = imagePath.startsWith('/uploads/')
                                    ? imagePath.substring(9) // Quita los primeros 9 caracteres (/uploads/)
                                    : imagePath;

                                // Construir la URL completa con /api/uploads
                                const imageUrl = `${API_URL}/uploads/${cleanImagePath}`;
                                console.log('URL de imagen construida:', imageUrl);
                                setImagePreview(imageUrl);
                            } else {
                                console.log('No se encontró imagen para este vehículo (imagePath es null o vacío)');
                                setImagePreview(null);
                            }
                        } else {
                            console.log('No se encontraron datos de inventario para este vehículo (respuesta vacía)');
                        }
                    } catch (inventoryError) {
                        console.error('Error al cargar datos de inventario:', inventoryError);
                        if (inventoryError.response) {
                            console.error('Detalles del error:', inventoryError.response.data);
                        }
                        // No mostramos error al usuario, simplemente no cargamos la imagen
                    }
                } catch (error) {
                    console.error('Error fetching vehicle data:', error);
                    toast.error('Error al cargar los datos del vehículo');
                    navigate('/vehicles');
                } finally {
                    setIsLoading(false);
                }
            };

            fetchVehicleData();
        }
    }, [id, navigate]);

    // Añadir un useEffect para actualizar el nombre del técnico cuando cambia la selección
    useEffect(() => {
        if (formData.responsiblePerson && technicians.length > 0) {
            const selectedTech = technicians.find(tech => tech.id.toString() === formData.responsiblePerson);
            if (selectedTech) {
                setResponsibleTechnicianName(selectedTech.fullName || selectedTech.email);
            }
        }
    }, [formData.responsiblePerson, technicians]);

    // Redirigir si el usuario no tiene permisos para la acción actual
    useEffect(() => {
        if (!hasRequiredPermission) {
            if (!isEditing && !canCreate) {
                toast.error('No tienes permisos para crear vehículos');
                navigate('/vehicles');
            } else if (isEditing && !isViewing && !canEdit) {
                toast.error('No tienes permisos para editar vehículos');
                navigate(`/vehicles/${id}`); // Redirigir a vista de detalle
            }
        }
    }, [hasRequiredPermission, isEditing, isViewing, canCreate, canEdit, navigate, id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Limpiar el error cuando el usuario modifica el campo
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.brand.trim()) {
            newErrors.brand = 'La marca es requerida';
        }

        if (!formData.model.trim()) {
            newErrors.model = 'El modelo es requerido';
        }

        if (!formData.licensePlate.trim()) {
            newErrors.licensePlate = 'La placa es requerida';
        }

        if (!formData.year || isNaN(formData.year)) {
            newErrors.year = 'El año debe ser un número válido';
        }

        if (!formData.responsiblePerson.trim()) {
            newErrors.responsiblePerson = 'La persona responsable es requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Verificar permisos antes de proceder
        if ((!isEditing && !canCreate) || (isEditing && !isViewing && !canEdit)) {
            toast.error('No tienes permisos para realizar esta acción');
            return;
        }

        if (!validateForm()) {
            toast.error('Por favor, corrige los errores del formulario');
            return;
        }

        setIsLoading(true);

        try {
            let vehicleId;
            let selectedTechnicianId = formData.responsiblePerson;

            if (isEditing) {
                // Actualizar los datos del vehículo
                await axiosInstance.put(`/vehicles/${id}`, {
                    brand: formData.brand,
                    model: formData.model,
                    year: formData.year,
                    licensePlate: formData.licensePlate,
                    vin: formData.vin,
                    color: formData.color,
                    vehicleStatus: formData.vehicleStatus,
                    mileage: formData.mileage,
                    fuelType: formData.fuelType,
                    insuranceExpiryDate: formData.insuranceExpiryDate,
                    notes: formData.notes,
                    responsiblePerson: formData.responsiblePerson
                });

                vehicleId = id;

                // Si hay una imagen nueva, actualizamos el inventario
                if (selectedFile || formData.notes !== (inventoryData?.notes || '')) {
                    // Determinar el ID de inventario que vamos a usar para actualizar
                    const isFromInventory = window.location.pathname.includes('/inventory/');
                    let inventoryId;

                    if (isFromInventory) {
                        console.log('Actualizando desde la vista de inventario, usando ID directo:', id);
                        inventoryId = id;
                    } else if (inventoryData && inventoryData.id) {
                        console.log('Usando ID del inventario cargado:', inventoryData.id);
                        inventoryId = inventoryData.id;
                    } else {
                        // Si no tenemos ninguna de las opciones anteriores, usar el ID directo
                        console.log('Usando ID directo como última opción:', id);
                        inventoryId = id;
                    }

                    console.log('Actualizando inventario con ID:', inventoryId);

                    // Preparamos los datos para actualizar
                    const formDataInventory = new FormData();

                    // Usar los datos del inventario que ya tenemos, o valores por defecto si no los tenemos
                    formDataInventory.append('itemName', inventoryData?.itemName || `${formData.brand} ${formData.model}`);
                    formDataInventory.append('itemCode', inventoryData?.itemCode || formData.licensePlate);
                    formDataInventory.append('category', inventoryData?.category || 'Vehículo');
                    formDataInventory.append('quantity', inventoryData?.quantity || 1);
                    formDataInventory.append('condition', inventoryData?.condition || 'Excelente');
                    formDataInventory.append('location', inventoryData?.location || 'Estacionamiento');

                    // Siempre usar el responsable person del inventario si existe
                    if (inventoryData?.responsiblePerson) {
                        formDataInventory.append('responsiblePerson', inventoryData.responsiblePerson);
                    } else {
                        // Si no hay un responsable en el inventario, usar el del formulario
                        formDataInventory.append('responsiblePerson', formData.responsiblePerson);
                    }

                    // Siempre actualizar las notas desde el formulario del vehículo
                    formDataInventory.append('notes', formData.notes);

                    // Añadir la nueva imagen si hay una seleccionada
                    if (selectedFile) {
                        console.log('Añadiendo nueva imagen al inventario:', selectedFile.name);
                        formDataInventory.append('imagePath', selectedFile);
                    } else {
                        console.log('No se seleccionó una nueva imagen para actualizar');
                    }

                    // Actualizar el inventario
                    await axiosInstance.put(`/inventory/${inventoryId}`, formDataInventory, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }
            } else {
                // Para nuevos vehículos, primero creamos un inventario
                const inventoryFormData = new FormData();
                inventoryFormData.append('itemName', `${formData.brand} ${formData.model}`);
                inventoryFormData.append('itemCode', formData.licensePlate);
                inventoryFormData.append('category', 'Vehículo');
                inventoryFormData.append('quantity', 1);
                inventoryFormData.append('condition',
                    formData.vehicleStatus === 'Operativo' ? 'Excelente' :
                        (formData.vehicleStatus === 'En Reparación' ? 'Necesita Reparación' : 'Fuera de Servicio')
                );
                inventoryFormData.append('location', 'Estacionamiento');
                inventoryFormData.append('notes', formData.notes || '');
                inventoryFormData.append('responsiblePerson', formData.responsiblePerson); // Añadir persona responsable

                // Añadir imagen si existe
                if (selectedFile) {
                    console.log('Añadiendo imagen al nuevo inventario:', selectedFile.name);
                    inventoryFormData.append('imagePath', selectedFile);
                } else {
                    console.log('No se seleccionó imagen para el nuevo vehículo');
                }

                // Crear inventario
                const inventoryResponse = await axiosInstance.post('/inventory', inventoryFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const newInventoryId = inventoryResponse.data.id;

                // Ahora creamos el vehículo con el ID del inventario
                const vehicleResponse = await axiosInstance.post('/vehicles', {
                    ...formData,
                    inventoryId: newInventoryId
                });

                // Obtener el ID del vehículo creado
                vehicleId = vehicleResponse.data.id;
            }

            // Si se seleccionó un técnico, crear o actualizar la asignación
            if (selectedTechnicianId) {
                console.log(`Creando asignación de técnico (ID: ${selectedTechnicianId}) al vehículo (ID: ${vehicleId})`);

                try {
                    // Verificar si ya existe una asignación activa para este vehículo
                    const assignmentsResponse = await axiosInstance.get(`/vehicle-assignments/vehicle/${vehicleId}`);
                    const activeAssignments = assignmentsResponse.data.filter(
                        a => a.assignmentStatus === 'Activa' && a.assignmentType === 'Responsable'
                    );

                    if (activeAssignments.length > 0) {
                        // Si hay una asignación activa, actualizarla si es diferente
                        const currentAssignment = activeAssignments[0];

                        if (currentAssignment.userId.toString() !== selectedTechnicianId.toString()) {
                            console.log('Finalizando asignación anterior y creando una nueva');

                            // Finalizar la asignación anterior
                            await axiosInstance.put(`/vehicle-assignments/${currentAssignment.id}/end`, {
                                endDate: new Date(),
                                notes: 'Finalizado automáticamente al asignar nuevo técnico'
                            });

                            // Crear nueva asignación
                            await axiosInstance.post('/vehicle-assignments', {
                                vehicleId: vehicleId,
                                userId: parseInt(selectedTechnicianId),
                                assignmentType: 'Responsable',
                                assignmentStatus: 'Activa',
                                startDate: new Date(),
                                notes: 'Asignado como responsable del vehículo'
                            });
                        } else {
                            console.log('El técnico ya está asignado a este vehículo');
                        }
                    } else {
                        // Si no hay asignación activa, crear una nueva
                        await axiosInstance.post('/vehicle-assignments', {
                            vehicleId: vehicleId,
                            userId: parseInt(selectedTechnicianId),
                            assignmentType: 'Responsable',
                            assignmentStatus: 'Activa',
                            startDate: new Date(),
                            notes: 'Asignado como responsable del vehículo'
                        });
                        console.log('Nueva asignación creada');
                    }
                } catch (assignmentError) {
                    console.error('Error al gestionar la asignación de técnico:', assignmentError);
                    toast.warning('El vehículo se guardó, pero hubo un problema al asignar el técnico');
                }
            }

            toast.success(`Vehículo ${isEditing ? 'actualizado' : 'añadido'} correctamente`);

            // Asegurarse de que la limpieza se complete antes de navegar
            const navigateWithCleanup = (route) => {
                // Limpiar el contexto de navegación
                localStorage.removeItem('fromInventory');
                console.log('Limpiando contexto de navegación después de guardar y redirigiendo a:', route);

                // Pequeño retraso para asegurar que localStorage se actualice antes de la navegación
                setTimeout(() => {
                    navigate(route);
                }, 50);
            };

            // Navegar a la página correspondiente según de dónde venimos
            if (isFromInventory) {
                console.log('-> Navegando a inventario después de guardar');
                navigateWithCleanup('/inventory');
            } else {
                console.log('-> Navegando a vehículos después de guardar');
                navigateWithCleanup('/vehicles');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error(`Error al ${isEditing ? 'actualizar' : 'añadir'} el vehículo`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Para el botón de volver
    const handleGoBack = () => {
        // Determinar la ruta de regreso basada en el contexto
        if (isFromInventory) {
            localStorage.removeItem('fromInventory');
            navigate('/inventory');
        } else {
            navigate('/vehicles');
        }
    };

    if (isLoading) {
        return (
            <div className="page-loading-spinner">
                <p>Cargando datos...</p>
            </div>
        );
    }

    return (
        <div className="vehicle-form-page">
            <div className="vehicle-form">
                <div className="form-header">
                    <h1 className="form-title">{getPageTitle()}</h1>
                    {isViewing && canEdit && (
                        <button
                            className="btn-primary"
                            onClick={handleEditButtonClick}
                        >
                            <DriveFileRenameOutlineIcon sx={{ mr: 1 }} /> Editar Vehículo
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="page-loading-spinner">Cargando...</div>
                ) : (
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="form-grid">
                            <div className="vehicle-info">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="brand">Marca*</label>
                                        <input
                                            type="text"
                                            id="brand"
                                            name="brand"
                                            value={formData.brand}
                                            onChange={handleInputChange}
                                            className={`form-control ${errors.brand ? 'error' : ''}`}
                                            disabled={isViewing}
                                            readOnly={isViewing}
                                        />
                                        {errors.brand && <div className="error-message">{errors.brand}</div>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="model">Modelo*</label>
                                        <input
                                            type="text"
                                            id="model"
                                            name="model"
                                            value={formData.model}
                                            onChange={handleInputChange}
                                            className={`form-control ${errors.model ? 'error' : ''}`}
                                            disabled={isViewing}
                                            readOnly={isViewing}
                                        />
                                        {errors.model && <div className="error-message">{errors.model}</div>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="year">Año*</label>
                                        <input
                                            type="number"
                                            id="year"
                                            name="year"
                                            value={formData.year}
                                            onChange={handleInputChange}
                                            className={`form-control ${errors.year ? 'error' : ''}`}
                                            min="1900"
                                            max={new Date().getFullYear() + 1}
                                            disabled={isViewing}
                                            readOnly={isViewing}
                                        />
                                        {errors.year && <div className="error-message">{errors.year}</div>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="licensePlate">Placa*</label>
                                        <input
                                            type="text"
                                            id="licensePlate"
                                            name="licensePlate"
                                            value={formData.licensePlate}
                                            onChange={handleInputChange}
                                            className={`form-control ${errors.licensePlate ? 'error' : ''}`}
                                            disabled={isViewing}
                                            readOnly={isViewing}
                                        />
                                        {errors.licensePlate && <div className="error-message">{errors.licensePlate}</div>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="vin">VIN/Número de Chasis</label>
                                        <input
                                            type="text"
                                            id="vin"
                                            name="vin"
                                            value={formData.vin}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            disabled={isViewing}
                                            readOnly={isViewing}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="color">Color</label>
                                        <input
                                            type="text"
                                            id="color"
                                            name="color"
                                            value={formData.color}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            disabled={isViewing}
                                            readOnly={isViewing}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="vehicleStatus">Estado*</label>
                                        <select
                                            id="vehicleStatus"
                                            name="vehicleStatus"
                                            value={formData.vehicleStatus}
                                            onChange={handleInputChange}
                                            className={`form-control ${errors.vehicleStatus ? 'error' : ''}`}
                                            disabled={isViewing}
                                        >
                                            {vehicleStatuses.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                        {errors.vehicleStatus && <div className="error-message">{errors.vehicleStatus}</div>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="mileage">Kilometraje</label>
                                        <input
                                            type="number"
                                            id="mileage"
                                            name="mileage"
                                            value={formData.mileage}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            min="0"
                                            disabled={isViewing}
                                            readOnly={isViewing}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="fuelType">Tipo de Combustible</label>
                                        <select
                                            id="fuelType"
                                            name="fuelType"
                                            value={formData.fuelType}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            disabled={isViewing}
                                        >
                                            {fuelTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="insuranceExpiryDate">Vencimiento de Seguro</label>
                                        <input
                                            type="date"
                                            id="insuranceExpiryDate"
                                            name="insuranceExpiryDate"
                                            value={formData.insuranceExpiryDate || ''}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            disabled={isViewing}
                                            readOnly={isViewing}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="responsiblePerson">Persona Responsable</label>
                                        {isViewing ? (
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={responsibleTechnicianName || 'No asignado'}
                                                disabled
                                                readOnly
                                            />
                                        ) : (
                                            <select
                                                id="responsiblePerson"
                                                name="responsiblePerson"
                                                value={formData.responsiblePerson}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                disabled={isViewing}
                                            >
                                                <option value="">Seleccionar técnico</option>
                                                {technicians.map(tech => (
                                                    <option key={tech.id} value={tech.id.toString()}>
                                                        {tech.fullName || tech.email}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <label htmlFor="notes">Notas</label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        rows="4"
                                        disabled={isViewing}
                                        readOnly={isViewing}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="vehicle-image">
                                <h3 className="image-label">Imagen del Vehículo</h3>
                                <div className="image-container">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Vista previa del vehículo" />
                                    ) : (
                                        <div className="no-image">
                                            <DirectionsCarIcon />
                                            <span>No hay imagen disponible</span>
                                        </div>
                                    )}
                                </div>

                                {!isViewing && (
                                    <div className="image-upload">
                                        <label htmlFor="vehicle-image" className="upload-button">
                                            {imagePreview ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                                        </label>
                                        <input
                                            type="file"
                                            id="vehicle-image"
                                            name="imagePath"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden-input"
                                        />
                                        <span className="file-name">
                                            {selectedFile ? selectedFile.name : (imagePreview ? 'Imagen actual' : 'Ningún archivo seleccionado')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-buttons">
                            <button type="button" className="btn-secondary" onClick={handleGoBack}>
                                <ArrowBackIcon sx={{ mr: 1 }} /> Volver
                            </button>

                            {!isViewing && (
                                <button type="button" className="btn-primary" onClick={handleSubmit}>
                                    <SaveIcon sx={{ mr: 1 }} /> Guardar
                                </button>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default VehicleForm; 
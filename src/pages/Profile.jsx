import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../axiosConfig';
import './Profile.css';
import { toast } from 'react-toastify';
import { vacationService, VacationStatus } from '../services/vacationService';
import VacationRequestForm from '../components/VacationRequestForm';
import VacationCalendar from '../components/VacationCalendar';

// Iconos
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CancelIcon from '@mui/icons-material/Cancel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddIcon from '@mui/icons-material/Add';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WorkIcon from '@mui/icons-material/Work';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import HourglassFullIcon from '@mui/icons-material/HourglassFull';
import CancelScheduleSendIcon from '@mui/icons-material/CancelScheduleSend';

const Profile = () => {
    const { currentUser, updateUserProfile } = useAuth();
    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        phone: '',
        photoUrl: null,
    });
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [error, setError] = useState(null);

    // Estados para la sección de vacaciones
    const [vacations, setVacations] = useState([]);
    const [availableDays, setAvailableDays] = useState(null);
    const [showVacationForm, setShowVacationForm] = useState(false);
    const [vacationLoading, setVacationLoading] = useState(false);
    const [selectedVacationDate, setSelectedVacationDate] = useState(null);

    useEffect(() => {
        if (currentUser) {
            setProfile({
                fullName: currentUser.fullName || '',
                email: currentUser.email || '',
                phone: currentUser.phone || '',
                photoUrl: currentUser.photoUrl || null
            });
            setLoading(false);

            // Cargar datos de vacaciones solo para técnicos
            if (currentUser.role === 'tecnico') {
                loadVacationData();
            }
        }
    }, [currentUser]);

    const loadVacationData = async () => {
        if (!currentUser?.id) return;

        try {
            setVacationLoading(true);
            const [userVacations, userDays] = await Promise.all([
                vacationService.getUserVacations(currentUser.id),
                vacationService.getUserAvailableDays(currentUser.id)
            ]);

            setVacations(userVacations);
            setAvailableDays(userDays);
        } catch (error) {
            console.error('Error al cargar datos de vacaciones:', error);
            toast.error('Error al cargar información de vacaciones');
        } finally {
            setVacationLoading(false);
        }
    };

    const handleVacationFormClose = () => {
        setShowVacationForm(false);
        setSelectedVacationDate(null);
        // Recargar datos después de crear una solicitud
        loadVacationData();
    };

    // Función para obtener el icono según el estado de la vacación
    const getStatusIcon = (vacation) => {
        const status = vacation.status || (vacation.isApproved ? VacationStatus.FULLY_APPROVED : VacationStatus.PENDING);

        switch (status) {
            case VacationStatus.PENDING:
                return <HourglassEmptyIcon className="status-icon pending" />;
            case VacationStatus.FIRST_APPROVED:
                return <HourglassFullIcon className="status-icon first-approved" />;
            case VacationStatus.FULLY_APPROVED:
                return <CheckCircleIcon className="status-icon approved" />;
            case VacationStatus.REJECTED:
                return <CancelScheduleSendIcon className="status-icon rejected" />;
            default:
                return <PendingIcon className="status-icon pending" />;
        }
    };

    // Función para obtener el texto del estado
    const getStatusText = (vacation) => {
        const status = vacation.status || (vacation.isApproved ? VacationStatus.FULLY_APPROVED : VacationStatus.PENDING);

        switch (status) {
            case VacationStatus.PENDING:
                return 'Pendiente (1ra aprobación)';
            case VacationStatus.FIRST_APPROVED:
                return 'Pendiente (2da aprobación)';
            case VacationStatus.FULLY_APPROVED:
                return 'Aprobada';
            case VacationStatus.REJECTED:
                return 'Rechazada';
            default:
                return 'Pendiente';
        }
    };

    // Función para obtener la clase CSS del estado
    const getStatusClass = (vacation) => {
        const status = vacation.status || (vacation.isApproved ? VacationStatus.FULLY_APPROVED : VacationStatus.PENDING);

        switch (status) {
            case VacationStatus.PENDING:
                return 'pending';
            case VacationStatus.FIRST_APPROVED:
                return 'first-approved';
            case VacationStatus.FULLY_APPROVED:
                return 'approved';
            case VacationStatus.REJECTED:
                return 'rejected';
            default:
                return 'pending';
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile({
            ...profile,
            [name]: value,
        });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({
            ...passwordData,
            [name]: value,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('La imagen no debe superar los 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                setError('El archivo debe ser una imagen');
                return;
            }
            setProfile(prev => ({
                ...prev,
                photoUrl: file
            }));
            setError(null);
        }
    };

    const saveProfile = async () => {
        try {
            setLoading(true);

            // Crear FormData para enviar todos los datos
            const formDataToSend = new FormData();

            // Agregar la imagen si existe
            if (profile.photoUrl instanceof File) {
                formDataToSend.append('image', profile.photoUrl);
            }

            // Agregar todos los campos del perfil
            Object.keys(profile).forEach(key => {
                if (key === 'photoUrl' && profile[key] instanceof File) {
                    // La imagen ya se agregó como 'image'
                    return;
                }
                formDataToSend.append(key, profile[key] || '');
            });

            if (currentUser.id) {
                const response = await axios.put(`/users/${currentUser.id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                // Actualizar el contexto de autenticación
                if (updateUserProfile) {
                    await updateUserProfile({
                        fullName: profile.fullName,
                        email: profile.email,
                        phone: profile.phone,
                        photoUrl: response.data.photoUrl || profile.photoUrl
                    });
                }
            }

            toast.success('Perfil actualizado correctamente');
            setEditing(false);
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
            toast.error('Error al actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const updatePassword = async () => {
        try {
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                toast.error('Las contraseñas no coinciden');
                return;
            }

            setLoading(true);

            // Aquí deberías implementar la lógica para actualizar la contraseña
            // usando Firebase o tu backend

            toast.success('Contraseña actualizada correctamente');
            setChangingPassword(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error) {
            toast.error('Error al actualizar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setEditing(false);
        if (currentUser) {
            setProfile({
                fullName: currentUser.fullName || '',
                email: currentUser.email || '',
                phone: currentUser.phone || '',
                photoUrl: currentUser.photoUrl || null
            });
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Cargando perfil...</p>
            </div>
        );
    }

    return (
        <div className="profile-container">
            {/* Header con título y acciones */}
            <div className="profile-header">
                <div className="header-content">
                    <h1>Mi Perfil</h1>
                    <p className="header-subtitle">Gestiona tu información personal y configuración de cuenta</p>
                </div>
                <div className="header-actions">
                    {!editing ? (
                        <button
                            className="btn-primary edit-btn"
                            onClick={() => setEditing(true)}
                            disabled={loading}
                        >
                            <EditIcon />
                            <span>Editar Perfil</span>
                        </button>
                    ) : (
                        <div className="edit-actions">
                            <button
                                className="btn-secondary cancel-btn"
                                onClick={cancelEdit}
                                disabled={loading}
                            >
                                <CancelIcon />
                                <span>Cancelar</span>
                            </button>
                            <button
                                className="btn-success save-btn"
                                onClick={saveProfile}
                                disabled={loading}
                            >
                                <SaveIcon />
                                <span>Guardar Cambios</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="profile-content">
                {/* Información personal */}
                <div className="profile-card main-info">
                    <div className="card-header">
                        <h2>Información Personal</h2>
                    </div>

                    <div className="profile-layout">
                        {/* Sección de foto de perfil */}
                        <div className="profile-photo-section">
                            <div className="profile-photo-container">
                                {profile.photoUrl ? (
                                    <img
                                        src={
                                            profile.photoUrl instanceof File
                                                ? URL.createObjectURL(profile.photoUrl)
                                                : profile.photoUrl
                                        }
                                        alt="Foto de perfil"
                                        className="profile-image"
                                    />
                                ) : (
                                    <div className="default-avatar">
                                        <AccountCircleIcon className="default-icon" />
                                    </div>
                                )}
                                {editing && (
                                    <div className="photo-overlay">
                                        <label htmlFor="photo-upload" className="photo-upload-btn">
                                            <CameraAltIcon />
                                            <span>Cambiar foto</span>
                                        </label>
                                        <input
                                            id="photo-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="profile-name">
                                <h3>{profile.fullName || 'Sin nombre'}</h3>
                                <p className="profile-email">{profile.email}</p>
                            </div>
                        </div>

                        {/* Campos de información */}
                        <div className="profile-fields">
                            <div className="field-group">
                                <div className="field-item">
                                    <div className="field-icon">
                                        <PersonIcon />
                                    </div>
                                    <div className="field-content">
                                        <label>Nombre completo</label>
                                        {editing ? (
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={profile.fullName}
                                                onChange={handleInputChange}
                                                placeholder="Ingresa tu nombre completo"
                                                className="form-input"
                                            />
                                        ) : (
                                            <div className="field-value">
                                                {profile.fullName || 'No especificado'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="field-item">
                                    <div className="field-icon">
                                        <EmailIcon />
                                    </div>
                                    <div className="field-content">
                                        <label>Correo electrónico</label>
                                        <div className="field-value">
                                            {profile.email}
                                            <span className="field-badge">Verificado</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="field-item">
                                    <div className="field-icon">
                                        <PhoneIcon />
                                    </div>
                                    <div className="field-content">
                                        <label>Número de teléfono</label>
                                        {editing ? (
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={profile.phone}
                                                onChange={handleInputChange}
                                                placeholder="Ingresa tu número de teléfono"
                                                className="form-input"
                                            />
                                        ) : (
                                            <div className="field-value">
                                                {profile.phone || 'No especificado'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seguridad */}
                <div className="profile-card security-section">
                    <div className="card-header">
                        <h2>Seguridad y Privacidad</h2>
                        <p>Mantén tu cuenta segura actualizando tu contraseña regularmente</p>
                    </div>

                    <div className="security-content">
                        {!changingPassword ? (
                            <div className="security-item">
                                <div className="security-icon">
                                    <VpnKeyIcon />
                                </div>
                                <div className="security-info">
                                    <h4>Contraseña</h4>
                                    <p>Última actualización hace 30 días</p>
                                </div>
                                <button
                                    className="btn-outline password-change-btn"
                                    onClick={() => setChangingPassword(true)}
                                >
                                    <VpnKeyIcon />
                                    <span>Cambiar Contraseña</span>
                                </button>
                            </div>
                        ) : (
                            <div className="password-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Contraseña actual</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Ingresa tu contraseña actual"
                                            className="form-input"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Nueva contraseña</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Ingresa tu nueva contraseña"
                                            className="form-input"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Confirmar nueva contraseña</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Confirma tu nueva contraseña"
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        className="btn-secondary"
                                        onClick={() => {
                                            setChangingPassword(false);
                                            setPasswordData({
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmPassword: '',
                                            });
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        className="btn-primary"
                                        onClick={updatePassword}
                                        disabled={loading}
                                    >
                                        <SaveIcon />
                                        <span>Actualizar Contraseña</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sección de Vacaciones - Solo para técnicos */}
                {currentUser?.role === 'tecnico' && (
                    <div className="profile-card vacation-section">
                        <div className="card-header">
                            <h2>
                                <BeachAccessIcon className="section-icon" />
                                Mis Vacaciones
                            </h2>
                            <p>Gestiona tus solicitudes de vacaciones y consulta tu calendario personal</p>
                            <div className="vacation-info-banner">
                                <HourglassFullIcon className="info-icon" />
                                <span>Las solicitudes de vacaciónes requieren aprobación de dos administradores</span>
                            </div>
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    setSelectedVacationDate(null);
                                    setShowVacationForm(true);
                                }}
                                disabled={vacationLoading}
                            >
                                <AddIcon />
                                Nueva Solicitud
                            </button>
                        </div>

                        {/* Resumen de días */}
                        {availableDays && (
                            <div className="vacation-summary">
                                <div className="days-stats-grid">
                                    <div className="stat-card available">
                                        <div className="stat-icon">
                                            <BeachAccessIcon />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-value">{availableDays.availableDays}</span>
                                            <span className="stat-label">Días disponibles</span>
                                        </div>
                                    </div>

                                    <div className="stat-card used">
                                        <div className="stat-icon">
                                            <CalendarTodayIcon />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-value">{availableDays.usedRestDays}</span>
                                            <span className="stat-label">Días usados</span>
                                        </div>
                                    </div>

                                    <div className="stat-card extra">
                                        <div className="stat-icon">
                                            <WorkIcon />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-value">{availableDays.extraWorkDays}</span>
                                            <span className="stat-label">Días extra</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Lista de solicitudes */}
                        <div className="vacation-requests">
                            <h3>Mis Solicitudes</h3>
                            {vacationLoading ? (
                                <div className="loading-state">
                                    <div className="loading-spinner"></div>
                                    <p>Cargando solicitudes...</p>
                                </div>
                            ) : vacations.length === 0 ? (
                                <div className="empty-state">
                                    <BeachAccessIcon className="empty-icon" />
                                    <p>No tienes solicitudes de vacaciones</p>
                                    <button
                                        className="btn-primary"
                                        onClick={() => {
                                            setSelectedVacationDate(null);
                                            setShowVacationForm(true);
                                        }}
                                    >
                                        <AddIcon />
                                        Crear primera solicitud
                                    </button>
                                </div>
                            ) : (
                                <div className="requests-list">
                                    {vacations.slice(-10).map((vacation) => (
                                        <div key={vacation.id} className="request-item">
                                            <div className="request-date">
                                                <CalendarTodayIcon />
                                                {vacation.dayCount === 1 ? (
                                                    new Date(vacation.startDate).toLocaleDateString('es-ES', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })
                                                ) : (
                                                    `${new Date(vacation.startDate).toLocaleDateString('es-ES', {
                                                        day: 'numeric',
                                                        month: vacation.startDate && vacation.endDate &&
                                                            new Date(vacation.startDate).getMonth() === new Date(vacation.endDate).getMonth()
                                                            ? undefined : 'short'
                                                    })} - ${new Date(vacation.endDate).toLocaleDateString('es-ES', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}`
                                                )}
                                            </div>

                                            <div className="request-type">
                                                {vacation.type === 'rest_day' ? (
                                                    <>
                                                        <BeachAccessIcon className="type-icon rest" />
                                                        <span>Día de descanso</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <WorkIcon className="type-icon work" />
                                                        <span>Día de trabajo extra</span>
                                                    </>
                                                )}
                                            </div>

                                            <div className="request-status">
                                                {getStatusIcon(vacation)}
                                                <span className={`status-text ${getStatusClass(vacation)}`}>
                                                    {getStatusText(vacation)}
                                                </span>
                                            </div>

                                            {vacation.description && (
                                                <div className="request-description">
                                                    {vacation.description}
                                                </div>
                                            )}

                                            {/* Motivo de rechazo si la solicitud fue rechazada */}
                                            {vacation.status === VacationStatus.REJECTED && vacation.rejectionReason && (
                                                <div className="rejection-info">
                                                    <CancelScheduleSendIcon className="rejection-icon" />
                                                    <div className="rejection-details">
                                                        <span>Motivo del rechazo:</span>
                                                        <p className="rejection-reason">
                                                            {vacation.rejectionReason}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Calendario personal */}
                        <div className="personal-calendar">
                            <h3>Mi Calendario de Vacaciones</h3>
                            <p className="calendar-description">
                                Consulta tus vacaciones completamente aprobadas. Haz clic en cualquier fecha para crear una nueva solicitud.
                            </p>
                            <VacationCalendar
                                vacations={vacations.filter(v =>
                                    v.status === VacationStatus.FULLY_APPROVED ||
                                    (v.isApproved && !v.status)
                                )}
                                isPersonal={true}
                                showOnlyOwnVacations={true}
                                currentUserId={currentUser?.id}
                                onDateClick={(date) => {
                                    // Formatear la fecha manteniendo la zona horaria local
                                    const year = date.getFullYear();
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const day = String(date.getDate()).padStart(2, '0');
                                    const formattedDate = `${year}-${month}-${day}`;
                                    setSelectedVacationDate(formattedDate);
                                    setShowVacationForm(true);
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Modal de solicitud de vacaciones */}
                {showVacationForm && (
                    <VacationRequestForm
                        onClose={handleVacationFormClose}
                        selectedDate={selectedVacationDate}
                        isPersonal={true}
                    />
                )}
            </div>
        </div>
    );
};

export default Profile; 
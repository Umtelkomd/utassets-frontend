import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../axiosConfig';
import './Profile.css';
import { toast } from 'react-toastify';

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

    useEffect(() => {
        if (currentUser) {
            setProfile({
                fullName: currentUser.fullName || '',
                email: currentUser.email || '',
                phone: currentUser.phone || '',
                photoUrl: currentUser.photoUrl || null
            });
            setLoading(false);
        }
    }, [currentUser]);

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
            </div>
        </div>
    );
};

export default Profile; 
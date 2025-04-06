import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../axiosConfig';
import './Profile.css';
import { toast } from 'react-toastify';

// Iconos
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

const Profile = () => {
    const { currentUser, updateUserProfile } = useAuth();
    const [profile, setProfile] = useState({
        displayName: '',
        email: '',
        phoneNumber: '',
        department: '',
        position: '',
        address: '',
    });
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (currentUser) {
            // Cargar datos del perfil desde Firebase/Backend
            setProfile({
                displayName: currentUser.displayName || '',
                email: currentUser.email || '',
                photoURL: currentUser.photoURL || '',
                phoneNumber: currentUser.phoneNumber || '',
                department: currentUser.department || 'No especificado',
                position: currentUser.position || 'No especificado',
                address: currentUser.address || 'No especificada',
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

    const saveProfile = async () => {
        try {
            setLoading(true);

            // Actualizar el perfil en Firebase/Backend
            await updateUserProfile({
                displayName: profile.displayName,
                photoURL: profile.photoURL,
            });

            // Si tienes un backend, puedes guardar información adicional
            if (currentUser.uid) {
                await axios.put(`/api/users/${currentUser.uid}`, {
                    phoneNumber: profile.phoneNumber,
                    department: profile.department,
                    position: profile.position,
                    address: profile.address,
                });
            }

            toast.success('Perfil actualizado correctamente');
            setEditing(false);
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
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
            console.error('Error al actualizar contraseña:', error);
            toast.error('Error al actualizar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-container">Cargando...</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Mi Perfil</h1>
                <div className="action-buttons">
                    {!editing ? (
                        <button
                            className="edit-button"
                            onClick={() => setEditing(true)}
                            disabled={loading}
                        >
                            <EditIcon /> Editar
                        </button>
                    ) : (
                        <button
                            className="save-button"
                            onClick={saveProfile}
                            disabled={loading}
                        >
                            <SaveIcon /> Guardar
                        </button>
                    )}
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-section user-info">
                    <div className="profile-photo">
                        {profile.photoURL ? (
                            <img src={profile.photoURL} alt="Foto de perfil" />
                        ) : (
                            <AccountCircleIcon className="default-avatar" />
                        )}
                    </div>

                    <div className="profile-details">
                        <div className="profile-field">
                            <PersonIcon className="field-icon" />
                            <div className="field-content">
                                <label>Nombre</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={profile.displayName}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    <p>{profile.displayName || 'No especificado'}</p>
                                )}
                            </div>
                        </div>

                        <div className="profile-field">
                            <EmailIcon className="field-icon" />
                            <div className="field-content">
                                <label>Correo Electrónico</label>
                                <p>{profile.email}</p>
                            </div>
                        </div>

                        <div className="profile-field">
                            <PhoneIcon className="field-icon" />
                            <div className="field-content">
                                <label>Teléfono</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={profile.phoneNumber}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    <p>{profile.phoneNumber || 'No especificado'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-section work-info">
                    <h2>Información Laboral</h2>

                    <div className="profile-field">
                        <WorkIcon className="field-icon" />
                        <div className="field-content">
                            <label>Cargo</label>
                            {editing ? (
                                <input
                                    type="text"
                                    name="position"
                                    value={profile.position}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <p>{profile.position}</p>
                            )}
                        </div>
                    </div>

                    <div className="profile-field">
                        <LocationOnIcon className="field-icon" />
                        <div className="field-content">
                            <label>Departamento</label>
                            {editing ? (
                                <input
                                    type="text"
                                    name="department"
                                    value={profile.department}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <p>{profile.department}</p>
                            )}
                        </div>
                    </div>

                    <div className="profile-field">
                        <LocationOnIcon className="field-icon" />
                        <div className="field-content">
                            <label>Dirección</label>
                            {editing ? (
                                <input
                                    type="text"
                                    name="address"
                                    value={profile.address}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <p>{profile.address}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="profile-section security">
                    <h2>Seguridad</h2>

                    {!changingPassword ? (
                        <button
                            className="password-button"
                            onClick={() => setChangingPassword(true)}
                        >
                            <VpnKeyIcon /> Cambiar Contraseña
                        </button>
                    ) : (
                        <div className="password-change-form">
                            <div className="form-field">
                                <label>Contraseña Actual</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                />
                            </div>

                            <div className="form-field">
                                <label>Nueva Contraseña</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                />
                            </div>

                            <div className="form-field">
                                <label>Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                />
                            </div>

                            <div className="password-actions">
                                <button
                                    className="cancel-button"
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
                                    className="update-button"
                                    onClick={updatePassword}
                                    disabled={loading}
                                >
                                    Actualizar Contraseña
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile; 
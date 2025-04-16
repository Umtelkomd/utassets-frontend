import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../axiosConfig';
import './ProfileImageUpload.css';

// Iconos
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';

const ProfileImageUpload = ({ onImageUpdate }) => {
    const { currentUser, updateUserProfile } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validar tipo de archivo
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            toast.error('Solo se permiten archivos JPG, PNG o GIF');
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('image', file);

            const response = await axios.put(`/users/${currentUser.id}/image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (updateUserProfile) {
                // Actualizar el perfil del usuario con la nueva imagen
                const updatedUser = {
                    ...currentUser,
                    imagePath: response.data.imagePath || null
                };
                console.log('Actualizando usuario con imagen:', updatedUser);
                await updateUserProfile(updatedUser);
            }

            toast.success('Imagen de perfil actualizada correctamente');
            if (onImageUpdate) {
                onImageUpdate(response.data.imagePath);
            }
        } catch (error) {
            console.error('Error al subir la imagen:', error);
            toast.error('Error al subir la imagen');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteImage = async () => {
        try {
            setIsUploading(true);
            await axios.delete(`/users/${currentUser.id}/image`);

            if (updateUserProfile) {
                // Actualizar el perfil del usuario eliminando la imagen
                const updatedUser = {
                    ...currentUser,
                    imagePath: null
                };
                await updateUserProfile(updatedUser);
            }

            toast.success('Imagen de perfil eliminada correctamente');
            if (onImageUpdate) {
                onImageUpdate(null);
            }
        } catch (error) {
            console.error('Error al eliminar la imagen:', error);
            toast.error('Error al eliminar la imagen');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="profile-image-container">
            <div className="profile-image-wrapper">
                {currentUser?.imagePath ? (
                    <>
                        <img
                            src={`${process.env.REACT_APP_API_URL}/uploads/users/${currentUser.imagePath}`}
                            alt="Foto de perfil"
                            className="profile-image"
                            onError={(e) => {
                                console.error('Error al cargar la imagen:', e);
                                e.target.src = ''; // Esto hará que se muestre el ícono por defecto
                            }}
                        />
                    </>
                ) : (
                    <AccountCircleIcon className="default-avatar" />
                )}
            </div>

            <div className="profile-image-actions">
                <button
                    className="upload-button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    <CloudUploadIcon />
                    <span>Cambiar foto</span>
                </button>

                {currentUser?.imagePath && (
                    <button
                        className="delete-button"
                        onClick={handleDeleteImage}
                        disabled={isUploading}
                    >
                        <DeleteIcon />
                        <span>Eliminar foto</span>
                    </button>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/jpeg,image/png,image/gif"
                    style={{ display: 'none' }}
                />
            </div>
        </div>
    );
};

export default ProfileImageUpload; 
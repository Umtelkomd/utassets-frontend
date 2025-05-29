import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../axiosConfig';
import './ProfileImageUpload.css';
import { toast } from 'react-toastify';

// Iconos
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

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

            // Subir la imagen al servidor
            const formDataImage = new FormData();
            formDataImage.append('image', file);
            formDataImage.append('entityType', 'users');

            const uploadResponse = await axios.post('/upload', formDataImage);
            const imageUrl = uploadResponse.data.url;

            // Actualizar el perfil del usuario en el backend
            if (currentUser?.id) {
                const updatedUser = await updateUserProfile({
                    ...currentUser,
                    photoUrl: imageUrl
                });

                if (onImageUpdate) {
                    onImageUpdate(imageUrl);
                }
            }

            toast.success('Imagen de perfil actualizada correctamente');
        } catch (error) {
            console.error('Error al subir imagen:', error);
            toast.error('Error al subir la imagen');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteImage = async () => {
        try {
            setIsUploading(true);

            // Eliminar la imagen del servidor de Hostinger
            if (currentUser?.photoUrl) {
                // await uploadService.deleteImage(currentUser.photoUrl);
            }

            // Actualizar el perfil del usuario en el backend
            await axios.delete(`/users/${currentUser.id}/image`);

            if (updateUserProfile) {
                // Actualizar el perfil del usuario eliminando la imagen
                const updatedUser = {
                    ...currentUser,
                    photoUrl: null
                };
                await updateUserProfile(updatedUser);
            }

            toast.success('Imagen de perfil eliminada correctamente');
            if (onImageUpdate) {
                onImageUpdate(null);
            }
        } catch (error) {
            console.error('Error al eliminar imagen:', error);
            toast.error('Error al eliminar la imagen');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="profile-image-container">
            <div className="profile-image-wrapper">
                {currentUser?.photoUrl ? (
                    <>
                        <img
                            src={currentUser.photoUrl}
                            alt={currentUser.fullName}
                            className="profile-image"
                            onError={(e) => {
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

                {currentUser?.photoUrl && (
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
import React from 'react';
import axios from '../axiosConfig';
import './ProfileImageUpload.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { getImageUrl, IMAGE_TYPES } from '../utils/imageUtils';

const UserImageDelete = ({ currentUser, onImageUpdate }) => {
    const handleDeleteImage = async () => {
        try {
            await axios.delete(`/users/${currentUser.id}/image`);
            toast.success('Imagen de perfil eliminada correctamente');
            if (onImageUpdate) {
                onImageUpdate(null);
            }
        } catch (error) {
            toast.error('Error al eliminar la imagen');
        }
    };

    return (
        <div className="profile-image-container">
            <div className="profile-image-wrapper">
                {currentUser?.imagePath ? (
                    <img
                        src={getImageUrl(currentUser.imagePath, IMAGE_TYPES.USERS)}
                        alt={currentUser.fullName}
                        className="user-image"
                    />
                ) : (
                    <AccountCircleIcon className="default-avatar" />
                )}
            </div>

            {currentUser?.imagePath && (
                <div className="profile-image-actions">
                    <button
                        className="delete-button"
                        onClick={handleDeleteImage}
                    >
                        <DeleteIcon />
                        <span>Eliminar foto</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserImageDelete; 
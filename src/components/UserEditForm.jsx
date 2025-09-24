import React, { useState, useEffect } from 'react';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    AdminPanelSettings as AdminIcon,
    Save as SaveIcon,
} from '@mui/icons-material';
import UserImageDelete from './UserImageDelete';

const UserEditForm = ({
    initialData,
    onSubmit,
    onCancel,
    selectedUser,
    onImageUpdate
}) => {
    const [formData, setFormData] = useState(initialData);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="user-edit-form">
            {selectedUser && (
                <div className="profile-image-section">
                    <UserImageDelete
                        currentUser={selectedUser}
                        onImageUpdate={onImageUpdate}
                    />
                </div>
            )}

            <div className="form-group">
                <label>
                    <PersonIcon /> Nombre Completo:
                </label>
                <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>
                    <EmailIcon /> Correo Electrónico:
                </label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>
                    <PhoneIcon /> Teléfono:
                </label>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label>
                    <AdminIcon /> Rol:
                </label>
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                >
                    <option value="tecnico">Técnico</option>
                    <option value="administrador">Administrador</option>
                </select>
            </div>

            <div className="modal-actions">
                <button type="submit" className="btn-primary">
                    <SaveIcon /> Guardar Cambios
                </button>
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={onCancel}
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
};

export default UserEditForm; 
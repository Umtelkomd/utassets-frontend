import React, { useState, useEffect, useMemo } from 'react';
import {
    Person as PersonIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    AdminPanelSettings as AdminIcon,
    SupervisorAccount as UserIcon,
    Search as SearchIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    VpnKey as VpnKeyIcon,
} from '@mui/icons-material';
import axiosInstance from '../axiosConfig';
import './Users.css';
import { toast } from 'react-toastify';
import UserEditForm from '../components/UserEditForm';
import LoadingSpinner from '../components/LoadingSpinner';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const initialFormState = {
    username: '',
    email: '',
    password: '',
    role: 'tecnico',
    fullName: '',
    phone: '',
};

const Users = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [formData, setFormData] = useState(initialFormState);
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        userId: null,
        userName: ''
    });

    const selectedUser = useMemo(() =>
        users.find(user => user.id === selectedUserId),
        [users, selectedUserId]
    );

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('/users');
            setUsers(response.data);
        } catch (error) {

            toast.error('Error al cargar el personal');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/users/register', formData);
            setShowAddModal(false);
            setFormData(initialFormState);
            toast.success('Persona creada correctamente');
            fetchUsers();
        } catch (error) {

            toast.error('Error al crear la persona');
        }
    };

    const handleEditUser = async (formData) => {
        if (!selectedUser) return;

        try {
            await axiosInstance.put(`/users/${selectedUser.id}`, formData);
            setShowEditModal(false);
            setSelectedUserId(null);
            toast.success('Persona actualizada correctamente');
            fetchUsers();
        } catch (error) {
            toast.error('Error al actualizar la persona');
        }
    };

    const confirmDelete = async () => {
        try {
            await axiosInstance.delete(`/users/${deleteModal.userId}`);
            toast.success('Persona eliminada correctamente');
            fetchUsers();
        } catch (error) {
            toast.error('Error al eliminar la persona');
        } finally {
            closeDeleteModal();
        }
    };

    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            userId: null,
            userName: ''
        });
    };

    const handleOpenEditModal = (user) => {
        setSelectedUserId(user.id);
        setShowEditModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedUserId(null);
        setFormData(initialFormState);
    };

    const handleImageUpdate = async (photoUrl) => {
        try {
            setUsers(prevUsers => prevUsers.map(user => {
                if (user.id === selectedUserId) {
                    return { ...user, photoUrl };
                }
                return user;
            }));
        } catch (error) {
            toast.error('Error al actualizar la imagen');
        }
    };

    const filteredUsers = users.filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="users-page">
            <header className="page-header">
                <div className="header-title">
                    <PersonIcon />
                    <h1>Gestión de Personal</h1>
                </div>
                <button
                    className="add-user-btn"
                    onClick={() => setShowAddModal(true)}
                >
                    <AddIcon />
                    Agregar Persona
                </button>
            </header>

            <div className="search-bar">
                <SearchIcon />
                <input
                    type="text"
                    placeholder="Buscar personal..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {isLoading ? (
                <LoadingSpinner message="Cargando personal..." />
            ) : (
                <div className="users-grid">
                    {filteredUsers.length === 0 ? (
                        <div className="no-results">
                            <p>No se encontraron resultados para tu búsqueda.</p>
                        </div>
                    ) : (
                        filteredUsers.map(user => (
                            <div
                                key={user.id}
                                className={`user-card ${user.role === 'administrador' ? 'admin-user' : ''}`}
                            >
                                <div className="user-card-header">
                                    <div className="user-role-badge">
                                        {user.role === 'administrador' ? (
                                            <>
                                                <AdminIcon /> Administrador
                                            </>
                                        ) : (
                                            <>
                                                <UserIcon /> Técnico
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="user-card-avatar">
                                    {user.photoUrl ? (
                                        <img
                                            src={user.photoUrl}
                                            alt={user.fullName}
                                            className="user-image"
                                        />
                                    ) : (
                                        <div className="default-avatar">
                                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    )}
                                </div>

                                <div className="user-card-content">
                                    <h3>{user.fullName}</h3>
                                    <div className="user-info">
                                        <p><EmailIcon /> {user.email}</p>
                                        {user.phone && <p><PhoneIcon /> {user.phone}</p>}
                                    </div>
                                    <div className="last-login">
                                        Último acceso: {user.lastLoginDate ? new Date(user.lastLoginDate).toLocaleString() : 'Nunca'}
                                    </div>
                                </div>

                                <div className="user-card-actions">
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleOpenEditModal(user)}
                                    >
                                        <EditIcon />
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => setDeleteModal({ isOpen: true, userId: user.id, userName: user.fullName })}
                                    >
                                        <DeleteIcon />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Agregar Nueva Persona</h2>
                        <form onSubmit={handleAddUser}>
                            <div className="form-group">
                                <label>
                                    <PersonIcon /> Nombre Completo:
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                    required
                                    placeholder="Nombre y apellido"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <PersonIcon /> Nombre de Usuario:
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                    required
                                    placeholder="nombre.apellido"
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
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    required
                                    placeholder="correo@ejemplo.com"
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
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="+123456789"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <VpnKeyIcon /> Contraseña:
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <AdminIcon /> Rol:
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                    required
                                >
                                    <option value="tecnico">Técnico</option>
                                    <option value="administrador">Administrador</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">
                                    <AddIcon /> Crear Persona
                                </button>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={handleCloseModal}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Editar Persona</h2>
                        <UserEditForm
                            initialData={{
                                email: selectedUser.email,
                                role: selectedUser.role,
                                fullName: selectedUser.fullName || '',
                                phone: selectedUser.phone || '',
                            }}
                            onSubmit={handleEditUser}
                            onCancel={handleCloseModal}
                            selectedUser={selectedUser}
                            onImageUpdate={handleImageUpdate}
                        />
                    </div>
                </div>
            )}

            {deleteModal.isOpen && (
                <DeleteConfirmationModal
                    isOpen={deleteModal.isOpen}
                    onClose={closeDeleteModal}
                    onConfirm={confirmDelete}
                    itemName={deleteModal.userName}
                    title="Confirmar Eliminación de Persona"
                    message={`¿Estás seguro de que deseas eliminar a "${deleteModal.userName}"?`}
                />
            )}
        </div>
    );
};

export default Users; 
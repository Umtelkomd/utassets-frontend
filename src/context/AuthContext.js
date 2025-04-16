import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from '../axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser && typeof parsedUser === 'object') {
                    setCurrentUser(parsedUser);
                }
            } catch (error) {
                console.error('Error al parsear usuario almacenado:', error);
                localStorage.removeItem('user');
            }
        }
        setIsAuthInitialized(true);
    }, []);

    const login = async (userData) => {
        try {
            const response = await axios.post('/auth/login', userData);
            const { user, token } = response.data;

            if (!user || !user.role) {
                throw new Error('Datos de usuario inválidos o rol no asignado');
            }

            const userWithRole = {
                ...user,
                role: user.role
            };

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userWithRole));
            setCurrentUser(userWithRole);

            return userWithRole;
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setCurrentUser(null);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            throw error;
        }
    };

    const updateUserProfile = async (userData) => {
        try {
            if (!currentUser) {
                throw new Error('No hay usuario autenticado');
            }

            const response = await axios.put(`/users/${currentUser.id}`, {
                ...userData,
                imagePath: userData.imagePath || null
            });
            const updatedUser = response.data;

            if (!updatedUser || !updatedUser.role) {
                throw new Error('Datos de usuario inválidos o rol no asignado');
            }

            const userWithRole = {
                ...updatedUser,
                role: updatedUser.role
            };

            setCurrentUser(userWithRole);
            localStorage.setItem('user', JSON.stringify(userWithRole));

            return userWithRole;
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
            throw error;
        }
    };

    const value = {
        currentUser,
        isAuthInitialized,
        login,
        logout,
        updateUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
}; 
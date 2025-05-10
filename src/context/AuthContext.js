import React, { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';

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
      const response = await axiosInstance.post('/auth/login', userData);
      const { user, token } = response.data;

      if (!user || !user.role) {
        return { 
          success: false, 
          error: 'Datos de usuario inválidos o rol no asignado' 
        };
      }

      const userWithRole = {
        ...user,
        role: user.role
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userWithRole));
      setCurrentUser(userWithRole);

      return { success: true, user: userWithRole };
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al iniciar sesión'
      };
    }
  };

  const register = async (formData) => {
    try {

      const response = await axiosInstance.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Respuesta del servidor:', response.data);

      const { user, token } = response.data;

      if (!user || !user.role) {
        return { 
          success: false, 
          error: 'Datos de usuario inválidos o rol no asignado' 
        };
      }

      const userWithRole = {
        ...user,
        role: user.role
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userWithRole));
      setCurrentUser(userWithRole);

      return { success: true, user: userWithRole };
    } catch (error) {
      console.error('Error detallado en registro:', error.response?.data || error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al registrar usuario'
      };
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const updateUserProfile = async (userData) => {
    try {
      if (!currentUser) {
        throw new Error('No hay usuario autenticado');
      }

      const response = await axiosInstance.put(`/users/${currentUser.id}`, {
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
      throw error;
    }
  };

  const value = {
    currentUser,
    isAuthInitialized,
    login,
    register,
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
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}; 
import React, { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance, { validateTokenWithServer } from '../axiosConfig';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(false);

  // Función para hacer logout limpio
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Función para validar token existente con el servidor
  const validateExistingToken = async () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!storedToken || !storedUser) {
      setIsAuthInitialized(true);
      return;
    }

    try {
      setIsValidatingToken(true);
      const parsedUser = JSON.parse(storedUser);
      
      // Validar con el servidor
      const validation = await validateTokenWithServer();
      
      if (validation.isValid) {
        // Token válido, restaurar usuario
        if (parsedUser && typeof parsedUser === 'object') {
          setCurrentUser(parsedUser);
        }
      } else {
        // Token inválido, limpiar storage
        console.warn('Token almacenado es inválido, limpiando sesión');
        logout();
      }
    } catch (error) {
      console.error('Error al validar token almacenado:', error);
      // En caso de error de conexión, mantener la sesión pero marcar como no validada
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === 'object') {
          setCurrentUser(parsedUser);
        }
      } catch (parseError) {
        logout();
      }
    } finally {
      setIsValidatingToken(false);
      setIsAuthInitialized(true);
    }
  };

  // Efecto principal de inicialización
  useEffect(() => {
    validateExistingToken();
  }, []);

  // Manejar eventos de logout automático del interceptor
  useEffect(() => {
    const handleAutoLogout = (event) => {
      const { reason, message } = event.detail;
      console.log(`Logout automático detectado: ${reason}`);
      
      logout();
      
      // Mostrar notificación al usuario
      toast.error(message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    };

    const handleAccessForbidden = (event) => {
      const { message } = event.detail;
      toast.error(message, {
        position: 'top-right',
        autoClose: 4000,
      });
    };

    const handleServerError = (event) => {
      const { message } = event.detail;
      toast.error(message, {
        position: 'top-right',
        autoClose: 4000,
      });
    };

    const handleConnectionError = (event) => {
      const { message } = event.detail;
      toast.error(message, {
        position: 'top-right',
        autoClose: 4000,
      });
    };

    // Escuchar eventos del interceptor
    window.addEventListener('auto-logout', handleAutoLogout);
    window.addEventListener('access-forbidden', handleAccessForbidden);
    window.addEventListener('server-error', handleServerError);
    window.addEventListener('api-connection-error', handleConnectionError);

    return () => {
      window.removeEventListener('auto-logout', handleAutoLogout);
      window.removeEventListener('access-forbidden', handleAccessForbidden);
      window.removeEventListener('server-error', handleServerError);
      window.removeEventListener('api-connection-error', handleConnectionError);
    };
  }, []);

  // Verificación periódica del token (cada 1 hora)
  useEffect(() => {
    if (!currentUser) return;

    const tokenCheckInterval = setInterval(async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        logout();
        return;
      }

      try {
        const validation = await validateTokenWithServer();
        if (!validation.isValid) {
          console.warn('Token expirado en verificación periódica');
          logout();
          toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', {
            position: 'top-right',
            autoClose: 5000,
          });
        }
      } catch (error) {
        // En caso de error de red, no hacer logout automático
        console.warn('Error en verificación periódica del token:', error);
      }
    }, 60 * 60 * 1000); // 1 hora (cambiado de 5 minutos)

    return () => clearInterval(tokenCheckInterval);
  }, [currentUser]);

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
      console.log(error)
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
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al registrar usuario'
      };
    }
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

  // Función para verificar manualmente el token
  const checkTokenValidity = async () => {
    try {
      setIsValidatingToken(true);
      const validation = await validateTokenWithServer();
      
      if (!validation.isValid) {
        logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error al verificar token:', error);
      return false;
    } finally {
      setIsValidatingToken(false);
    }
  };

  const value = {
    currentUser,
    isAuthInitialized,
    isValidatingToken,
    login,
    register,
    logout,
    updateUserProfile,
    checkTokenValidity
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
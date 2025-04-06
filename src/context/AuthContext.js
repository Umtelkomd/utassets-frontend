import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

// API URL del backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

// Contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  // Función para iniciar sesión con email y contraseña
  const login = async (email, password) => {
    try {
      setError('');
      
      // Iniciar sesión con el backend
      const response = await axios.post(`${API_URL}/auth/login`, {
        username: email,
        password: password
      });
      
      if (response.data && response.data.token) {
        // Guardar token en localStorage
        localStorage.setItem('authToken', response.data.token);
        setUserToken(response.data.token);
        
        // Establecer datos de usuario desde la respuesta del backend
        if (response.data.user) {
          const userData = {
            id: response.data.user.id,
            email: response.data.user.email,
            username: response.data.user.username,
            displayName: response.data.user.fullName,
            role: response.data.user.role
          };
          
          console.log('Usuario establecido desde login:', userData);
          setCurrentUser(userData);
        }
        
        return response.data;
      }
      
      throw new Error('Respuesta del servidor no contiene token');
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      throw err;
    }
  };

  // Función para registrar un nuevo usuario
  const register = async (email, password, fullName) => {
    try {
      setError('');
      
      // Registrar usuario en el backend
      const response = await axios.post(`${API_URL}/auth/register`, {
        username: email.split('@')[0],
        email,
        password,
        fullName
      });
      
      if (response.data && response.data.user) {
        // Si la respuesta incluye un token, guardarlo
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
          setUserToken(response.data.token);
        }
        
        return response.data;
      }
      
      return response.data;
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      setError(err.response?.data?.message || 'Error al registrar usuario. Inténtalo nuevamente.');
      throw err;
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      // Limpiar el token y el usuario actual
      localStorage.removeItem('authToken');
      setUserToken(null);
      setCurrentUser(null);
    } catch (err) {
      setError('Error al cerrar sesión: ' + err.message);
      throw err;
    }
  };

  // Función para restablecer contraseña (envía email al backend)
  const resetPassword = async (email) => {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, { email });
      return response.data;
    } catch (err) {
      setError('Error al solicitar restablecimiento de contraseña: ' + err.message);
      throw err;
    }
  };

  // Efecto para verificar el estado de autenticación al cargar la aplicación
  useEffect(() => {
    console.log('Verificando autenticación...');
    
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // Verificar si hay un token de autenticación en localStorage
        const token = localStorage.getItem('authToken');
        
        console.log('Token encontrado en localStorage:', !!token);
        
        if (token) {
          try {
            // Verificar el token con el backend y obtener información del usuario
            console.log('Verificando token con el backend...');
            const response = await axios.get(
              `${API_URL}/auth/me`, 
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
            
            console.log('Respuesta del backend (token válido):', response.data);
            
            if (response.data) {
              // Establecer el token y la información del usuario
              setUserToken(token);
              
              const userData = {
                id: response.data.id,
                email: response.data.email,
                username: response.data.username,
                displayName: response.data.fullName,
                role: response.data.role
              };
              
              console.log('Estableciendo usuario desde token:', userData);
              setCurrentUser(userData);
            }
          } catch (err) {
            console.error('Error al verificar token con backend:', err);
            // Si hay error, eliminar el token
            localStorage.removeItem('authToken');
            setUserToken(null);
          }
        }
        
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
      } finally {
        setIsAuthInitialized(true);
        setLoading(false);
      }
    };
    
    // Iniciar verificación de autenticación
    initializeAuth();
  }, []);

  // Valores a proporcionar a través del contexto
  const value = {
    currentUser,
    userToken,
    login,
    register,
    logout,
    resetPassword,
    loading,
    error,
    setError,
    isAuthInitialized
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 
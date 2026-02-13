import { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { handleAuthError } from '../utils/errorHandler';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const role = localStorage.getItem('role');

    if (token) {
      try {
        const parsedUser = userData ? JSON.parse(userData) : { token, role };
        setUser(parsedUser);
      } catch (error) {
        setUser({ token, role });
      }
    } else {
      setUser(null);
    }
    
    setLoading(false);
  }, []);

  // Listen for global auth errors
  useEffect(() => {
    const handleGlobalAuthError = (event) => {
      const { message, status } = event.detail;
      
      if (status === 401) {
        setAuthError(message);
        logout();
        
        // Dispatch event for AuthErrorBoundary
        window.dispatchEvent(new CustomEvent('auth-error', {
          detail: { message, status }
        }));
      }
    };

    window.addEventListener('app-error', handleGlobalAuthError);
    
    return () => {
      window.removeEventListener('app-error', handleGlobalAuthError);
    };
  }, []);

  const login = async (credentials, type = 'user') => {
    try {
      setAuthError(null);
      const response = await authService.login(credentials, type);
      const userData = authService.getUser();
      setUser(userData);
      return response;
    } catch (error) {
      setAuthError(error.userMessage || error.message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      setAuthError(null);
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      setAuthError(error.userMessage || error.message);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setAuthError(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading,
    authError
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
 
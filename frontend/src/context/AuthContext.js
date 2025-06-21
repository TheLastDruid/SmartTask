import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getCurrentUser, logout as authLogout } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('AuthContext initializeAuth starting...');
      try {
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token ? 'present' : 'missing');
        if (token) {
          console.log('Calling getCurrentUser...');
          const currentUser = await getCurrentUser();
          console.log('getCurrentUser successful, user:', currentUser);
          setUser(currentUser);
          setIsAuthenticated(true);
          console.log('AuthContext initialized, isAuthenticated set to true');
        } else {
          console.log('No token found, user not authenticated');
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        console.log('AuthContext initialization failed, isAuthenticated set to false');
      } finally {
        setLoading(false);
        console.log('AuthContext initialization completed, loading set to false');
      }
    };

    initializeAuth();
  }, []);

  const login = (userData, token) => {
    console.log('AuthContext login called with:', { userData, token: token ? 'present' : 'missing' });
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
    console.log('AuthContext login completed, isAuthenticated set to true');
  };
  const logout = () => {
    authLogout();
    setUser(null);
    setIsAuthenticated(false);
    console.log('User logged out');
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    console.log('Auth data cleared');
  };

  const updateUser = (userData) => {
    setUser(userData);
  };
  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    clearAuth,
    updateUser
  }), [user, loading, isAuthenticated]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

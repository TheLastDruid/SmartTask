import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { authService } from '../services/authService';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'AUTH_LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Debug log for state changes
  useEffect(() => {
    console.log('Auth state changed:', {
      isAuthenticated: state.isAuthenticated,
      loading: state.loading,
      hasToken: !!state.token,
      hasUser: !!state.user
    });
  }, [state]);
    useEffect(() => {
    console.log('AuthProvider useEffect running');
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
    
    if (token) {
      // Set token for verification
      authService.setAuthToken(token);
      
      // Try to verify token by making a simple API call
      const verifyToken = async () => {
        try {
          console.log('Attempting to verify token...');
          // Make a simple request to verify token validity
          const response = await authService.verifyToken();
          console.log('Token verification successful:', response.data);
          
          // Check if we have user data in localStorage
          const userData = localStorage.getItem('user');
          let user = {};
          if (userData) {
            try {
              user = JSON.parse(userData);
            } catch (e) {
              console.warn('Failed to parse user data from localStorage');
            }
          }
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              token,
              user,
            },
          });
        } catch (error) {
          console.log('Token verification failed:', error.response?.status, error.message);
          // Only clear token if it's actually invalid (401), not for network errors
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            authService.removeAuthToken();
            dispatch({ type: 'AUTH_LOGOUT' });
          } else {
            // Network error - keep token but mark as not authenticated for now
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        }
      };
      
      verifyToken();
    } else {
      console.log('No token found, setting loading to false');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.login(email, password);
      const { token, ...user } = response.data;
      
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { token, user },
      });
      
      return response;
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };
  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      console.log('Registration data:', userData); // Debug log
      const response = await authService.register(userData);
      console.log('Registration response:', response); // Debug log
      
      // Handle the response structure from backend
      const { token, email, firstName, lastName } = response.data;
      const user = { email, firstName, lastName };
      
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { token, user },
      });
      
      return response;
    } catch (error) {
      console.error('Registration error in context:', error); // Debug log
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    authService.removeAuthToken();
    dispatch({ type: 'AUTH_LOGOUT' });
  };
  const value = useMemo(() => ({
    ...state,
    login,
    register,
    logout,
  }), [state, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };

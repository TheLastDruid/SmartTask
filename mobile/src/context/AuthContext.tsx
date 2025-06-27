/**
 * Authentication Context for SmartTask Mobile
 * Implements proper state management with React Context
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginRequest, RegisterRequest, AuthContextType } from '../types';
import { STORAGE_KEYS } from '../utils/config';
import { apiService } from '../services/apiService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * Manages user authentication state and provides auth methods
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize authentication state on app start
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Check if user is already authenticated on app startup
   */
  const initializeAuth = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Test backend connectivity first
      console.log('AuthContext: Testing backend connectivity...');
      const isConnected = await apiService.testConnection();
      if (!isConnected) {
        console.warn('AuthContext: Backend connectivity test failed');
        setError('Cannot connect to server. Please check your network connection.');
      }
      
      const [token, userData] = await AsyncStorage.multiGet([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);

      if (token[1] && userData[1]) {
        // Token and user data exist, verify token validity
        try {
          const currentUser = await apiService.getUserProfile();
          setUser(currentUser);
        } catch (error) {
          // Token might be expired, try to refresh
          console.warn('Error verifying user profile during initialization:', error);
          try {
            await refreshToken();
          } catch (refreshError) {
            // Refresh failed, clear stored data
            console.warn('Token refresh failed during initialization:', refreshError);
            await clearAuthData();
          }
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear error state
   */
  const clearError = (): void => {
    setError(null);
  };

  /**
   * Login user with credentials
   */
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const authResponse = await apiService.login(credentials);
      
      // Convert AuthResponse to User
      const userData: User = {
        id: authResponse.id,
        email: authResponse.email,
        firstName: authResponse.firstName,
        lastName: authResponse.lastName,
        emailVerified: authResponse.emailVerified,
      };
      
      setUser(userData);
    } catch (error: any) {
      let errorMessage = 'Login failed';
      
      // Handle email verification error specifically
      if (error.message?.includes('verify your email') || error.requiresVerification) {
        errorMessage = 'Please verify your email address before logging in. Check your inbox for the verification link.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const authResponse = await apiService.register(userData);
      
      // Only set user if registration doesn't require verification
      if (!authResponse.requiresVerification) {
        const user: User = {
          id: authResponse.id,
          email: authResponse.email,
          firstName: authResponse.firstName,
          lastName: authResponse.lastName,
          emailVerified: authResponse.emailVerified,
        };
        setUser(user);
      } else {
        setError(authResponse.message ?? 'Please check your email for verification');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      console.error('AuthContext: Registration error:', error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user and clear authentication data
   */
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await apiService.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      await clearAuthData();
      setUser(null);
      setIsLoading(false);
    }
  };

  /**
   * Refresh authentication token
   */
  const refreshToken = async (): Promise<void> => {
    try {
      // The API service handles token refresh automatically
      // We just need to verify the user profile is still valid
      const currentUser = await apiService.getUserProfile();
      setUser(currentUser);
      
      // Update stored user data
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(currentUser));
    } catch (error) {
      console.error('Token refresh error:', error);
      await clearAuthData();
      setUser(null);
      throw error;
    }
  };

  /**
   * Clear all authentication data from storage
   */
  const clearAuthData = async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  /**
   * Context value object
   */
  const contextValue: AuthContextType = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshToken,
    clearError,
  }), [user, isLoading, error]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 * Throws error if used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * HOC to require authentication
 * Redirects to login if user is not authenticated
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      // Return loading component or null
      return null;
    }

    if (!isAuthenticated) {
      // In a real app, this would redirect to login
      // For now, we'll return null and let the navigation handle it
      return null;
    }

    return <Component {...props} />;
  };

  return AuthenticatedComponent;
};

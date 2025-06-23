import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('Response interceptor error:', error);
    console.log('Error config URL:', error.config?.url);
    console.log('Error status:', error.response?.status);
    
    // Check for JWT signature errors
    const errorMessage = error.response?.data?.message || error.message || '';
    const isJwtSignatureError = errorMessage.includes('JWT signature does not match') || 
                               errorMessage.includes('signature') ||
                               error.response?.status === 403;
    
    if (error.response?.status === 401 || isJwtSignatureError) {
      // Don't redirect if this is a login or register request
      const isAuthRequest = error.config?.url?.includes('/api/auth/login') || 
                           error.config?.url?.includes('/api/auth/register');
      
      // Don't redirect if this is a token verification request (like getCurrentUser)
      const isVerifyRequest = error.config?.url?.includes('/api/auth/verify') ||
                              error.config?.url?.includes('/api/auth/me');
      
      if (!isAuthRequest && !isVerifyRequest) {
        console.log('JWT authentication error, clearing invalid token and redirecting');
        clearInvalidToken();
      } else {
        console.log('401 error from auth endpoint, not redirecting');
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => {
    console.log('AuthService: Attempting login for:', email); // Debug log
    return api.post('/api/auth/login', { email, password });
  },

  register: (userData) => {
    console.log('AuthService: Attempting registration for:', userData.email); // Debug log
    console.log('AuthService: Registration data:', userData); // Debug log
    return api.post('/api/auth/register', userData);
  },

  verifyToken: () => {
    return api.get('/api/auth/verify');
  },

  verifyEmail: (token) => {
    return api.get(`/api/auth/verify-email?token=${token}`);
  },

  resendVerificationEmail: (email) => {
    return api.post('/api/auth/resend-verification', { email });
  },

  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  removeAuthToken: () => {
    delete api.defaults.headers.common['Authorization'];
  },
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Clear the auth token from axios defaults
  delete api.defaults.headers.common['Authorization'];
};

// Function to clear invalid tokens
const clearInvalidToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Reload the page to reset the application state
  window.location.reload();
};

// Export function for manual token clearing (useful for debugging)
window.clearInvalidToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('Token cleared! Reloading page...');
  window.location.reload();
};

export default api;

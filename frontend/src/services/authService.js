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
    
    if (error.response?.status === 401) {
      // Don't redirect if this is a login or register request
      const isAuthRequest = error.config?.url?.includes('/api/auth/login') || 
                           error.config?.url?.includes('/api/auth/register');
      
      // Don't redirect if this is a token verification request
      const isVerifyRequest = error.config?.url?.includes('/api/auth/verify');
      
      if (!isAuthRequest && !isVerifyRequest) {
        console.log('401 error from protected route, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
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

export default api;

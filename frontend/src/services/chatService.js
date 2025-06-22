import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_URL}/api/chat`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const chatService = {
  // Send a message to the chatbot
  sendMessage: async (message, conversationId = null) => {
    try {
      const response = await api.post('/message', {
        message,
        conversationId
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
  // Upload a file for processing
  uploadFile: async (file, conversationId = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (conversationId) {
        formData.append('conversationId', conversationId);
      }

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.response || response.data;  // Handle wrapped response
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },  // Get main conversation for current user
  getMainConversation: async () => {
    try {
      const response = await api.get('/conversation/main');
      return response.data;
    } catch (error) {
      console.error('Error getting main conversation:', error);
      throw error;
    }
  },

  // Get specific conversation
  getConversation: async (conversationId) => {
    try {
      const response = await api.get(`/conversation/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  },

  // Get all conversations for current user
  getUserConversations: async () => {
    try {
      const response = await api.get('/conversations');
      return response.data;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  },

  // Delete a conversation
  deleteConversation: async (conversationId) => {
    try {
      const response = await api.delete(`/conversation/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  },

  // Confirm task creation from extracted tasks
  confirmTasks: async (tasks) => {
    try {
      const response = await api.post('/confirm-tasks', tasks);
      return response.data;
    } catch (error) {
      console.error('Error confirming tasks:', error);
      throw error;
    }
  },

  // Check chatbot health
  checkHealth: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error checking chatbot health:', error);
      throw error;
    }
  }
};

export default chatService;

import api from './authService';

export const taskService = {
  getAllTasks: () => {
    return api.get('/api/tasks');
  },

  createTask: (taskData) => {
    return api.post('/api/tasks', taskData);
  },

  updateTask: (taskId, taskData) => {
    return api.put(`/api/tasks/${taskId}`, taskData);
  },

  deleteTask: (taskId) => {
    return api.delete(`/api/tasks/${taskId}`);
  },

  getTask: (taskId) => {
    return api.get(`/api/tasks/${taskId}`);
  },
};

// Mock for taskService
export const taskService = {
  getTasks: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  getTaskById: jest.fn(),
};

export default taskService;

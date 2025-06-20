// Mock for authService
export const authService = {
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  verifyToken: jest.fn(),
  getCurrentUser: jest.fn(),
};

export default authService;

// Mock for chatService
export const chatService = {
  sendMessage: jest.fn(),
  getChatHistory: jest.fn(),
  clearHistory: jest.fn(),
};

export default chatService;

/**
 * Configuration constants for SmartTask Mobile
 */

// *** FORCE REFRESH - TIMESTAMP: 2025-06-27T15:47:30 ***
console.warn('CONFIG MODULE LOADED - TIMESTAMP:', new Date().toISOString());
console.warn('CONFIG: BUNDLE TIMESTAMP: 2025-06-27T15:47:30');
console.warn('CONFIG: FORCED CACHE REFRESH - VERSION 3');

// API Configuration - Choose the appropriate URL for your setup:

// Option 1: WiFi Network (WORKING - found via connectivity test)
export const API_BASE_URL = 'http://192.168.1.29:8080';

console.warn('CONFIG: API_BASE_URL EXPORTED AS:', API_BASE_URL);
console.warn('CONFIG: This should NOT be localhost:3000!');
console.warn('CONFIG: If you see localhost:3000, there is a cache issue!');

// Option 4: Other network configurations (Hyper-V, WSL, etc.)
// export const API_BASE_URL = 'http://172.24.224.1:8080';  // Hyper-V Default Switch
// export const API_BASE_URL = 'http://172.21.224.1:8080';  // WSL Hyper-V

/**
 * Available backend URLs for testing
 * The app will automatically test these to find a working connection
 */
export const BACKEND_URLS = {
  ANDROID_EMULATOR: 'http://10.0.2.2:8080',
  IOS_SIMULATOR: 'http://localhost:8080',
  WIFI_NETWORK: 'http://192.168.1.29:8080',
  HYPER_V_DEFAULT: 'http://172.24.224.1:8080',
  WSL_HYPER_V: 'http://172.21.224.1:8080',
};

/**
 * Get the appropriate API base URL based on platform and device type
 */
export const getApiBaseUrl = (platform?: string, isPhysicalDevice?: boolean): string => {
  // If running on physical device, use WiFi network IP
  if (isPhysicalDevice) {
    return BACKEND_URLS.WIFI_NETWORK;
  }
  
  // Platform-specific defaults
  if (platform === 'ios') {
    return BACKEND_URLS.IOS_SIMULATOR;
  }
  
  // Default to Android emulator
  return BACKEND_URLS.ANDROID_EMULATOR;
};

export const API_ENDPOINTS = {
  // Authentication - Backend uses /api/auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  VERIFY_TOKEN: '/api/auth/verify',
  USER_PROFILE: '/api/auth/me',
  VERIFY_EMAIL: '/api/auth/verify-email',
  RESEND_VERIFICATION: '/api/auth/resend-verification',
  
  // Tasks - Backend uses /api/tasks
  TASKS: '/api/tasks',
  TASK_BY_ID: (id: string) => `/api/tasks/${id}`,
  TASK_BY_TICKET: (ticketNumber: number) => `/api/tasks/ticket/${ticketNumber}`,
  
  // Chat - Backend uses /api/chat
  CHAT_MESSAGE: '/api/chat/message',
  CHAT_UPLOAD: '/api/chat/upload',
  CHAT_CONFIRM_TASKS: '/api/chat/confirm-tasks',
  CHAT_CONVERSATION_BY_ID: (id: string) => `/api/chat/conversation/${id}`,
  CHAT_CONVERSATIONS: '/api/chat/conversations',
  CHAT_MAIN_CONVERSATION: '/api/chat/conversation/main',
  CHAT_HEALTH: '/api/chat/health',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@smarttask_access_token',
  REFRESH_TOKEN: '@smarttask_refresh_token',
  USER_DATA: '@smarttask_user_data',
  CHAT_CONVERSATIONS: '@smarttask_conversations',
} as const;

export const APP_CONFIG = {
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: ['.txt', '.pdf', '.docx'],
  CHAT_MESSAGE_LIMIT: 100,
  TASK_PAGINATION_LIMIT: 20,
} as const;

/**
 * API Service for SmartTask Mobile
 * Handles all API communication with the Spring Boot backend
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../utils/config';
import {
  User,
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  ChatResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Conversation,
  ApiError,
} from '../types';

class ApiService {
  private readonly api: AxiosInstance;

  constructor() {
    console.log('API: Initializing ApiService...');
    console.log('API: API_BASE_URL from config:', API_BASE_URL);
    
    // *** TEMPORARY: Hardcode the working URL to bypass config issues ***
    const WORKING_URL = 'http://192.168.1.29:8080';
    console.warn('API: FORCING base URL to:', WORKING_URL);
    
    this.api = axios.create({
      baseURL: WORKING_URL, // Use hardcoded URL temporarily
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('API: Axios instance created with baseURL:', this.api.defaults.baseURL);

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        } catch (error) {
          console.error('Error getting auth token:', error);
          return config;
        }
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - clear tokens
          this.handleUnauthorized();
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Handle unauthorized responses by clearing stored tokens
   */
  private async handleUnauthorized(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  /**
   * Standardized error handling
   */
  private handleError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message ?? 'Server error occurred';
      return {
        message,
        statusCode: error.response.status,
        error: error.response.data?.error ?? 'Unknown error',
      };
    } else if (error.request) {
      // Network error
      return {
        message: 'Network error. Please check your connection.',
        statusCode: 0,
        error: 'NetworkError',
      };
    } else {
      // Other error
      return {
        message: error.message ?? 'An unexpected error occurred',
        statusCode: 500,
        error: 'UnknownError',
      };
    }
  }

  // ===== AUTHENTICATION METHODS =====

  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('API: Attempting login for:', credentials.email);
      console.log('API: Using base URL:', this.api.defaults.baseURL);
      
      // *** TEMPORARY: Hardcode correct endpoint to bypass cache ***
      const LOGIN_ENDPOINT = '/api/auth/login';
      console.log('API: Login endpoint (hardcoded):', LOGIN_ENDPOINT);
      console.log('API: Full URL will be:', `${this.api.defaults.baseURL}${LOGIN_ENDPOINT}`);
      
      // Additional debugging - inspect the actual request config
      const requestConfig = {
        method: 'POST',
        url: LOGIN_ENDPOINT,
        data: credentials,
        baseURL: this.api.defaults.baseURL,
      };
      console.log('API: Request config:', requestConfig);
      
      const response: AxiosResponse<AuthResponse> = await this.api.post(
        LOGIN_ENDPOINT,
        credentials
      );

      const authData = response.data;
      console.log('API: Login response received:', authData);
      
      // Store the token
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.token);
      
      // Create and store user data
      const userData: User = {
        id: authData.id,
        email: authData.email,
        firstName: authData.firstName,
        lastName: authData.lastName,
        emailVerified: authData.emailVerified,
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      
      console.log('API: Login successful for:', credentials.email);
      return authData;
    } catch (error: any) {
      console.error('API: Login error details:', error);
      console.error('API: Error response:', error.response?.data);
      console.error('API: Error status:', error.response?.status);
      console.error('API: Error message:', error.message);
      
      // Handle specific API error responses
      if (error.response?.data) {
        const apiError = error.response.data;
        // Create a proper error with the server message
        const loginError = new Error(apiError.message ?? apiError.error ?? 'Login failed');
        (loginError as any).statusCode = apiError.statusCode ?? error.response.status;
        (loginError as any).requiresVerification = apiError.message?.includes('verify your email');
        throw loginError;
      }
      
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('API: Attempting registration for:', userData.email);
      console.log('API: Registration data:', userData);
      console.log('API: Using base URL:', this.api.defaults.baseURL);
      
      // *** TEMPORARY: Hardcode correct endpoint to bypass cache ***
      const REGISTER_ENDPOINT = '/api/auth/register';
      console.log('API: Full URL:', `${this.api.defaults.baseURL}${REGISTER_ENDPOINT}`);
      
      const response: AxiosResponse<AuthResponse> = await this.api.post(
        REGISTER_ENDPOINT,
        userData
      );

      const authData = response.data;
      console.log('API: Registration response received:', authData);
      
      // Only store token if email is verified or doesn't require verification
      if (!authData.requiresVerification) {
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.token);
        
        // Create and store user data
        const user: User = {
          id: authData.id,
          email: authData.email,
          firstName: authData.firstName,
          lastName: authData.lastName,
          emailVerified: authData.emailVerified,
        };
        
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      }
      
      console.log('API: Registration successful for:', userData.email);
      return authData;
    } catch (error: any) {
      console.error('API: Registration error details:', error);
      console.error('API: Error response:', error.response?.data);
      console.error('API: Error status:', error.response?.status);
      console.error('API: Error message:', error.message);
      throw error;
    }
  }

  /**
   * Verify authentication token and get user data
   */
  async verifyToken(): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.get(API_ENDPOINTS.VERIFY_TOKEN);
      return response.data;
    } catch (error) {
      console.error('API: Token verification error:', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getUserProfile(): Promise<User> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.get(API_ENDPOINTS.USER_PROFILE);
      const authData = response.data;
      
      // Convert AuthResponse to User format
      const userData: User = {
        id: authData.id,
        email: authData.email,
        firstName: authData.firstName,
        lastName: authData.lastName,
        emailVerified: authData.emailVerified,
      };
      
      // Update stored user data
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('API: Get user profile error:', error);
      throw error;
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string; status: string }> {
    try {
      const response = await this.api.get(API_ENDPOINTS.VERIFY_EMAIL, {
        params: { token }
      });
      return response.data;
    } catch (error) {
      console.error('API: Email verification error:', error);
      throw error;
    }
  }

  /**
   * Resend email verification
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    try {
      console.log('API: Resending verification email for:', email);
      const response: AxiosResponse<{ message: string }> = await this.api.post(
        '/api/auth/resend-verification',
        { email }
      );
      console.log('API: Verification email sent response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: Resend verification error:', error);
      console.error('API: Error response:', error.response?.data);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Clear stored tokens
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error('API: Logout error:', error);
      throw error;
    }
  }

  // ===== TASK MANAGEMENT METHODS =====

  /**
   * Get all tasks for the current user
   */
  async getTasks(): Promise<Task[]> {
    try {
      const response: AxiosResponse<Task[]> = await this.api.get(API_ENDPOINTS.TASKS);
      return response.data;
    } catch (error) {
      console.error('API: Get tasks error:', error);
      throw error;
    }
  }

  /**
   * Get a specific task by ID
   */
  async getTask(id: string): Promise<Task> {
    try {
      const response: AxiosResponse<Task> = await this.api.get(API_ENDPOINTS.TASK_BY_ID(id));
      return response.data;
    } catch (error) {
      console.error('API: Get task error:', error);
      throw error;
    }
  }

  /**
   * Get a task by ticket number
   */
  async getTaskByTicket(ticketNumber: number): Promise<Task> {
    try {
      const response: AxiosResponse<Task> = await this.api.get(API_ENDPOINTS.TASK_BY_TICKET(ticketNumber));
      return response.data;
    } catch (error) {
      console.error('API: Get task by ticket error:', error);
      throw error;
    }
  }

  /**
   * Create a new task
   */
  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    try {
      const response: AxiosResponse<Task> = await this.api.post(API_ENDPOINTS.TASKS, taskData);
      return response.data;
    } catch (error) {
      console.error('API: Create task error:', error);
      throw error;
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(id: string, taskData: UpdateTaskRequest): Promise<Task> {
    try {
      const response: AxiosResponse<Task> = await this.api.put(API_ENDPOINTS.TASK_BY_ID(id), taskData);
      return response.data;
    } catch (error) {
      console.error('API: Update task error:', error);
      throw error;
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<{ message: string }> {
    try {
      const response = await this.api.delete(API_ENDPOINTS.TASK_BY_ID(id));
      return response.data;
    } catch (error) {
      console.error('API: Delete task error:', error);
      throw error;
    }
  }

  // ===== CHAT/AI METHODS =====

  /**
   * Send a chat message to the AI assistant
   */
  async sendChatMessage(message: string, conversationId?: string | null): Promise<ChatResponse> {
    try {
      console.log('API: Sending chat message:', message);
      console.log('API: Conversation ID:', conversationId);
      
      // *** TEMPORARY: Hardcode correct endpoint to bypass cache ***
      const CHAT_MESSAGE_ENDPOINT = '/api/chat/message';
      console.log('API: Chat message endpoint (hardcoded):', CHAT_MESSAGE_ENDPOINT);
      
      const payload = {
        message,
        conversationId,
      };
      
      const response: AxiosResponse<ChatResponse> = await this.api.post(
        CHAT_MESSAGE_ENDPOINT,
        payload
      );

      console.log('API: Chat response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: Chat message error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Upload a file to chat
   */
  async uploadFileToChat(fileContent: string, fileName: string): Promise<ChatResponse> {
    try {
      console.log('API: Uploading file to chat:', fileName);
      
      // *** TEMPORARY: Hardcode correct endpoint to bypass cache ***
      const CHAT_UPLOAD_ENDPOINT = '/api/chat/upload';
      
      const payload = {
        fileName,
        content: fileContent,
      };
      
      const response: AxiosResponse<ChatResponse> = await this.api.post(
        CHAT_UPLOAD_ENDPOINT,
        payload
      );

      console.log('API: File upload response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: File upload error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get the main conversation for the user
   */
  async getMainConversation(): Promise<Conversation> {
    try {
      console.log('API: Getting main conversation');
      
      // *** TEMPORARY: Hardcode correct endpoint to bypass cache ***
      const MAIN_CONVERSATION_ENDPOINT = '/api/chat/conversation/main';
      
      const response: AxiosResponse<Conversation> = await this.api.get(
        MAIN_CONVERSATION_ENDPOINT
      );

      console.log('API: Main conversation received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: Get main conversation error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Confirm and create tasks from chat
   */
  async confirmChatTasks(tasks: any[], conversationId?: string | null): Promise<ChatResponse> {
    try {
      console.log('API: Confirming chat tasks:', tasks);
      
      // *** TEMPORARY: Hardcode correct endpoint to bypass cache ***
      const CONFIRM_TASKS_ENDPOINT = '/api/chat/confirm-tasks';
      
      const payload = {
        tasks,
        conversationId,
      };
      
      const response: AxiosResponse<ChatResponse> = await this.api.post(
        CONFIRM_TASKS_ENDPOINT,
        payload
      );

      console.log('API: Task confirmation response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: Task confirmation error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get chat conversations
   */
  async getChatConversations(): Promise<Conversation[]> {
    try {
      const response: AxiosResponse<Conversation[]> = await this.api.get(API_ENDPOINTS.CHAT_CONVERSATIONS);
      return response.data;
    } catch (error) {
      console.error('API: Get chat conversations error:', error);
      throw error;
    }
  }

  /**
   * Get a specific conversation
   */
  async getChatConversation(id: string): Promise<Conversation> {
    try {
      const response: AxiosResponse<Conversation> = await this.api.get(API_ENDPOINTS.CHAT_CONVERSATION_BY_ID(id));
      return response.data;
    } catch (error) {
      console.error('API: Get chat conversation error:', error);
      throw error;
    }
  }

  /**
   * Check chat service health
   */
  async getChatHealth(): Promise<{ status: string; groq_status: string }> {
    try {
      const response = await this.api.get(API_ENDPOINTS.CHAT_HEALTH);
      return response.data;
    } catch (error) {
      console.error('API: Get chat health error:', error);
      throw error;
    }
  }

  /**
   * Test backend connectivity with detailed logging
   */
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('API: Testing backend connection...');
      console.log('API: Base URL:', API_BASE_URL);
      
      const startTime = Date.now();
      const response = await this.api.get('/api/health', {
        timeout: 5000, // 5 second timeout for connectivity test
      });
      const duration = Date.now() - startTime;
      
      console.log('API: Connection test successful');
      console.log('API: Response status:', response.status);
      console.log('API: Response time:', `${duration}ms`);
      console.log('API: Response data:', response.data);
      
      return {
        success: true,
        message: `Connected successfully in ${duration}ms`,
        details: {
          status: response.status,
          baseUrl: API_BASE_URL,
          responseTime: duration,
          data: response.data,
        },
      };
    } catch (error: any) {
      console.error('API: Connection test failed');
      console.error('API: Error details:', error);
      
      let message = 'Failed to connect to backend';
      let details: any = { baseUrl: API_BASE_URL };
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        message = 'Backend server is not accessible. Check if it\'s running.';
        details.errorCode = error.code;
      } else if (error.code === 'ECONNABORTED') {
        message = 'Connection timeout. Backend may be slow or unreachable.';
        details.timeout = true;
      } else if (error.response) {
        message = `Backend responded with error: ${error.response.status}`;
        details.statusCode = error.response.status;
        details.responseData = error.response.data;
      } else if (error.request) {
        message = 'Network error. Check your internet connection.';
        details.networkError = true;
      }
      
      details.originalError = error.message;
      
      return {
        success: false,
        message,
        details,
      };
    }
  }

  /**
   * Test different API base URLs to find the working one
   */
  async findWorkingBaseUrl(): Promise<{ success: boolean; workingUrl?: string; results: any[] }> {
    const testUrls = [
      'http://10.0.2.2:8080',        // Android emulator
      'http://localhost:8080',        // iOS simulator / localhost
      'http://192.168.1.29:8080',     // WiFi network
      'http://172.24.224.1:8080',     // Hyper-V Default Switch
      'http://172.21.224.1:8080',     // WSL Hyper-V
    ];

    console.log('API: Testing multiple base URLs...');
    const results: any[] = [];

    for (const testUrl of testUrls) {
      try {
        console.log(`API: Testing ${testUrl}...`);
        const startTime = Date.now();
        
        const testApi = axios.create({
          baseURL: testUrl,
          timeout: 3000,
        });
        
        const response = await testApi.get('/api/health');
        const duration = Date.now() - startTime;
        
        const result = {
          url: testUrl,
          success: true,
          status: response.status,
          responseTime: duration,
          data: response.data,
        };
        
        console.log(`API: ✅ ${testUrl} - Success (${duration}ms)`);
        results.push(result);
        
        // Return the first working URL
        return {
          success: true,
          workingUrl: testUrl,
          results: [...results],
        };
        
      } catch (error: any) {
        const result = {
          url: testUrl,
          success: false,
          error: error.message,
          code: error.code,
        };
        
        console.log(`API: ❌ ${testUrl} - Failed:`, error.message);
        results.push(result);
      }
    }

    return {
      success: false,
      results,
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

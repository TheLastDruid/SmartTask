/**
 * WebSocket Service for Real-time Updates
 * Provides real-time communication with the backend using built-in WebSocket
 */

import { Task, ChatMessage } from '../types';
import { API_BASE_URL } from '../utils/config';

export interface WebSocketMessage {
  type: 'TASK_UPDATE' | 'TASK_DELETE' | 'TASK_CREATE' | 'CHAT_MESSAGE' | 'NOTIFICATION';
  data: any;
  userId?: string;
  timestamp: string;
}

export interface TaskUpdateMessage {
  type: 'TASK_UPDATE';
  data: Task;
  userId: string;
  timestamp: string;
}

export interface ChatMessageUpdate {
  type: 'CHAT_MESSAGE';
  data: ChatMessage;
  userId: string;
  timestamp: string;
}

export interface NotificationMessage {
  type: 'NOTIFICATION';
  data: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  };
  userId: string;
  timestamp: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private isConnecting = false;
  private listeners: Map<string, Set<(message: WebSocketMessage) => void>> = new Map();
  private userId: string | null = null;
  private token: string | null = null;

  /**
   * Initialize WebSocket connection
   */
  async connect(userId: string, token: string): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.userId = userId;
    this.token = token;
    this.isConnecting = true;

    try {
      const wsUrl = API_BASE_URL.replace('http', 'ws') + `/ws?token=${token}&userId=${userId}`;
      console.log('WebSocket: Connecting to', wsUrl);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket: Connected successfully');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        
        // Send authentication message
        this.send({
          type: 'AUTH',
          data: { userId, token },
          timestamp: new Date().toISOString(),
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('WebSocket: Received message', message);
          this.handleMessage(message);
        } catch (error) {
          console.error('WebSocket: Error parsing message', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket: Connection closed', event.code, event.reason);
        this.isConnecting = false;
        this.ws = null;

        // Attempt to reconnect if it wasn't a clean close
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket: Connection error', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('WebSocket: Failed to connect', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      console.log('WebSocket: Disconnecting');
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.userId = null;
    this.token = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Send message through WebSocket
   */
  private send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket: Cannot send message, connection not open');
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    const typeListeners = this.listeners.get(message.type);
    if (typeListeners) {
      typeListeners.forEach(listener => {
        try {
          listener(message);
        } catch (error) {
          console.error('WebSocket: Error in message listener', error);
        }
      });
    }

    // Also notify 'all' listeners
    const allListeners = this.listeners.get('all');
    if (allListeners) {
      allListeners.forEach(listener => {
        try {
          listener(message);
        } catch (error) {
          console.error('WebSocket: Error in all message listener', error);
        }
      });
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket: Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(`WebSocket: Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      if (this.userId && this.token) {
        this.connect(this.userId, this.token);
      }
    }, delay);
  }

  /**
   * Subscribe to specific message types
   */
  subscribe(
    messageType: string | 'all',
    listener: (message: WebSocketMessage) => void
  ): () => void {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, new Set());
    }

    this.listeners.get(messageType)!.add(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(messageType);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.listeners.delete(messageType);
        }
      }
    };
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection status
   */
  getStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (this.isConnecting) return 'connecting';
    if (this.ws) {
      switch (this.ws.readyState) {
        case WebSocket.OPEN:
          return 'connected';
        case WebSocket.CONNECTING:
          return 'connecting';
        case WebSocket.CLOSING:
        case WebSocket.CLOSED:
          return 'disconnected';
        default:
          return 'error';
      }
    }
    return 'disconnected';
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

// Export specific message type helpers
export const subscribeToTaskUpdates = (callback: (task: Task) => void) => {
  return websocketService.subscribe('TASK_UPDATE', (message) => {
    if (message.type === 'TASK_UPDATE') {
      callback(message.data as Task);
    }
  });
};

export const subscribeToTaskCreation = (callback: (task: Task) => void) => {
  return websocketService.subscribe('TASK_CREATE', (message) => {
    if (message.type === 'TASK_CREATE') {
      callback(message.data as Task);
    }
  });
};

export const subscribeToTaskDeletion = (callback: (taskId: string) => void) => {
  return websocketService.subscribe('TASK_DELETE', (message) => {
    if (message.type === 'TASK_DELETE') {
      callback(message.data.id as string);
    }
  });
};

export const subscribeToChatMessages = (callback: (message: ChatMessage) => void) => {
  return websocketService.subscribe('CHAT_MESSAGE', (message) => {
    if (message.type === 'CHAT_MESSAGE') {
      callback(message.data as ChatMessage);
    }
  });
};

export const subscribeToNotifications = (callback: (notification: NotificationMessage['data']) => void) => {
  return websocketService.subscribe('NOTIFICATION', (message) => {
    if (message.type === 'NOTIFICATION') {
      callback(message.data as NotificationMessage['data']);
    }
  });
};

export default websocketService;

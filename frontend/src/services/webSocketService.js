import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.messageHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
  }  connect(userId, onConnected, onError) {
    if (this.connected) {
      return;
    }

    // Get the JWT token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No JWT token found, cannot establish WebSocket connection');
      if (onError) {
        onError(new Error('No JWT token found'));
      }
      return;
    }

    console.log('🔌 Attempting WebSocket connection with token for user:', userId);

    const socket = new SockJS(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/ws`);
    this.stompClient = Stomp.over(socket);
    
    // Disable debug logging in production
    if (process.env.NODE_ENV === 'production') {
      this.stompClient.debug = () => {};
    }

    // Pass the JWT token in the connection headers
    const headers = {
      'Authorization': `Bearer ${token}`,
      'X-User-ID': userId
    };

    console.log('🔐 Connecting with headers:', { 'Authorization': 'Bearer ***', 'X-User-ID': userId });    this.stompClient.connect(
      headers,
      (frame) => {
        console.log('✅ Connected to WebSocket:', frame);
        console.log('🔍 DEBUG: Connection established successfully');
        this.connected = true;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        
        // Subscribe to user-specific channels
        this.subscribeToUserChannels(userId);
        
        if (onConnected) {
          onConnected(frame);
        }
      },
      (error) => {
        console.error('❌ WebSocket connection error:', error);
        this.connected = false;
        
        if (onError) {
          onError(error);
        }
        
        // Attempt to reconnect
        this.attemptReconnect(userId, onConnected, onError);
      }
    );
  }

  attemptReconnect(userId, onConnected, onError) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(userId, onConnected, onError);
      }, this.reconnectDelay);
      
      // Exponential backoff
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }
  subscribeToUserChannels(userId) {
    if (!this.stompClient || !this.connected) {
      console.log('🚫 Cannot subscribe: stompClient or connected is false', { stompClient: !!this.stompClient, connected: this.connected });
      return;
    }

    console.log('📡 Subscribing to user channels for:', userId);

    // Subscribe to user-specific task updates
    this.subscribe(`/user/${userId}/queue/tasks`, (message) => {
      console.log('📨 Received task update message:', message.body);
      this.handleMessage('tasks', JSON.parse(message.body));
    });

    // Subscribe to user-specific profile updates
    this.subscribe(`/user/${userId}/queue/profile`, (message) => {
      this.handleMessage('profile', JSON.parse(message.body));
    });

    // Subscribe to user-specific notifications
    this.subscribe(`/user/${userId}/queue/notifications`, (message) => {
      this.handleMessage('notifications', JSON.parse(message.body));
    });

    // Subscribe to user-specific general updates
    this.subscribe(`/user/${userId}/queue/updates`, (message) => {
      this.handleMessage('updates', JSON.parse(message.body));
    });

    // Subscribe to system-wide notifications
    this.subscribe('/topic/notifications', (message) => {
      this.handleMessage('system-notifications', JSON.parse(message.body));
    });    // Subscribe to general task updates (for dashboard)
    this.subscribe('/topic/tasks', (message) => {
      console.log('📨 Received message from /topic/tasks:', message.body);
      const parsedMessage = JSON.parse(message.body);
      console.log('🔍 Parsed message:', parsedMessage);
      console.log('🔍 Message type from payload:', parsedMessage.type);
      this.handleMessage('tasks', parsedMessage);
    });
  }
  subscribe(destination, callback) {
    if (!this.stompClient || !this.connected) {
      console.warn('Cannot subscribe: WebSocket not connected');
      return;
    }

    console.log('🔔 Subscribing to:', destination);
    const subscription = this.stompClient.subscribe(destination, callback);
    this.subscriptions.set(destination, subscription);
    console.log('✅ Successfully subscribed to:', destination);
    return subscription;
  }

  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }  handleMessage(type, message) {
    console.log(`📧 Handling message of type '${type}':`, message);
    console.log('🔍 DEBUG: Message object structure:', Object.keys(message));
    console.log('🔍 DEBUG: Message.type field:', message.type);
    
    // Check if we're accidentally using message.type instead of the parameter
    const actualType = type;
    console.log('🔍 DEBUG: Using actualType:', actualType);
    
    const handlers = this.messageHandlers.get(actualType);
    if (handlers) {
      console.log(`🎯 Found ${handlers.length} handlers for message type '${actualType}'`);
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error(`Error handling message of type ${actualType}:`, error);
        }
      });
    } else {
      console.warn(`⚠️ No handlers found for message type '${actualType}'`);
    }
  }

  // Register a message handler for a specific message type
  onMessage(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type).push(handler);

    // Return a function to remove the handler
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  // Send a message to the server
  sendMessage(destination, message) {
    if (!this.stompClient || !this.connected) {
      console.warn('Cannot send message: WebSocket not connected');
      return;
    }

    this.stompClient.send(destination, {}, JSON.stringify(message));
  }

  disconnect() {
    if (this.stompClient && this.connected) {
      // Unsubscribe from all channels
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      
      this.stompClient.disconnect();
      this.connected = false;
      console.log('WebSocket disconnected');
    }
  }

  isConnected() {
    return this.connected;
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;

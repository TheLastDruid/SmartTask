/**
 * React Hook for Real-time Updates
 * Manages WebSocket connection and provides real-time data updates
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { Task, ChatMessage } from '../types';
import { 
  websocketService, 
  WebSocketMessage,
  subscribeToTaskUpdates,
  subscribeToTaskCreation,
  subscribeToTaskDeletion,
  subscribeToChatMessages,
  subscribeToNotifications
} from '../services/websocketService';
import { useAuth } from '../context/AuthContext';

export interface RealTimeHookResult {
  isConnected: boolean;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: WebSocketMessage | null;
  taskUpdates: Task[];
  newChatMessages: ChatMessage[];
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
  }>;
  clearTaskUpdates: () => void;
  clearChatMessages: () => void;
  clearNotifications: () => void;
}

/**
 * Hook for managing real-time WebSocket connection
 */
export const useRealTime = (): RealTimeHookResult => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [taskUpdates, setTaskUpdates] = useState<Task[]>([]);
  const [newChatMessages, setNewChatMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
  }>>([]);

  const reconnectTimeoutRef = useRef<number | null>(null);

  // Clear functions
  const clearTaskUpdates = useCallback(() => setTaskUpdates([]), []);
  const clearChatMessages = useCallback(() => setNewChatMessages([]), []);
  const clearNotifications = useCallback(() => setNotifications([]), []);

  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log('RealTime: Connecting WebSocket for user', user.id);
      
      // Get token from storage (this should be available from AuthContext)
      const token = 'dummy-token'; // In real implementation, get from auth context
      
      websocketService.connect(user.id, token).catch(error => {
        console.error('RealTime: Failed to connect WebSocket', error);
      });

      // Update status periodically
      const statusInterval = setInterval(() => {
        const currentStatus = websocketService.getStatus();
        setStatus(currentStatus);
        setIsConnected(websocketService.isConnected());
      }, 1000);

      return () => {
        clearInterval(statusInterval);
        websocketService.disconnect();
      };
    } else {
      websocketService.disconnect();
      setIsConnected(false);
      setStatus('disconnected');
    }
  }, [isAuthenticated, user?.id]);

  // Subscribe to all WebSocket messages
  useEffect(() => {
    const unsubscribe = websocketService.subscribe('all', (message) => {
      setLastMessage(message);
      console.log('RealTime: Received message', message.type);
    });

    return unsubscribe;
  }, []);

  // Subscribe to task updates
  useEffect(() => {
    const unsubscribeUpdates = subscribeToTaskUpdates((task) => {
      setTaskUpdates(prev => {
        // Remove existing task and add updated one
        const filtered = prev.filter(t => t.id !== task.id);
        return [...filtered, task];
      });
    });

    const unsubscribeCreation = subscribeToTaskCreation((task) => {
      setTaskUpdates(prev => [...prev, task]);
    });

    const unsubscribeDeletion = subscribeToTaskDeletion((taskId) => {
      setTaskUpdates(prev => prev.filter(t => t.id !== taskId));
    });

    return () => {
      unsubscribeUpdates();
      unsubscribeCreation();
      unsubscribeDeletion();
    };
  }, []);

  // Subscribe to chat messages
  useEffect(() => {
    const unsubscribe = subscribeToChatMessages((message) => {
      setNewChatMessages(prev => [...prev, message]);
    });

    return unsubscribe;
  }, []);

  // Subscribe to notifications
  useEffect(() => {
    const unsubscribe = subscribeToNotifications((notification) => {
      const newNotification = {
        id: Date.now().toString(),
        ...notification,
        timestamp: new Date().toISOString(),
      };
      setNotifications(prev => [...prev, newNotification]);

      // Auto-remove notification after 5 seconds for info/success
      if (notification.type === 'info' || notification.type === 'success') {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
        }, 5000);
      }
    });

    return unsubscribe;
  }, []);

  return {
    isConnected,
    status,
    lastMessage,
    taskUpdates,
    newChatMessages,
    notifications,
    clearTaskUpdates,
    clearChatMessages,
    clearNotifications,
  };
};

/**
 * Hook specifically for task real-time updates
 */
export const useRealTimeTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeUpdates = subscribeToTaskUpdates((task) => {
      setTasks(prev => {
        const index = prev.findIndex(t => t.id === task.id);
        if (index >= 0) {
          // Update existing task
          const updated = [...prev];
          updated[index] = task;
          return updated;
        } else {
          // Add new task
          return [...prev, task];
        }
      });
      setLastUpdate(new Date().toISOString());
    });

    const unsubscribeCreation = subscribeToTaskCreation((task) => {
      setTasks(prev => [...prev, task]);
      setLastUpdate(new Date().toISOString());
    });

    const unsubscribeDeletion = subscribeToTaskDeletion((taskId) => {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setLastUpdate(new Date().toISOString());
    });

    return () => {
      unsubscribeUpdates();
      unsubscribeCreation();
      unsubscribeDeletion();
    };
  }, []);

  const updateTask = useCallback((updatedTask: Task) => {
    setTasks(prev => {
      const index = prev.findIndex(t => t.id === updatedTask.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = updatedTask;
        return updated;
      }
      return prev;
    });
  }, []);

  const addTask = useCallback((newTask: Task) => {
    setTasks(prev => [...prev, newTask]);
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  return {
    tasks,
    lastUpdate,
    updateTask,
    addTask,
    removeTask,
    setTasks,
  };
};

/**
 * Hook specifically for chat real-time updates
 */
export const useRealTimeChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToChatMessages((message) => {
      setMessages(prev => [...prev, message]);
      setLastUpdate(new Date().toISOString());
    });

    return unsubscribe;
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    lastUpdate,
    addMessage,
    clearMessages,
    setMessages,
  };
};

export default useRealTime;

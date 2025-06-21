import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import webSocketService from '../services/webSocketService';
import { toast } from 'react-toastify';

export const useRealTimeTasks = (initialTasks = []) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const { user } = useAuth();

  // Handle real-time task updates
  const handleTaskUpdate = useCallback((message) => {
    const { action, data, taskId } = message;
    
    setTasks(prevTasks => {
      switch (action) {
        case 'CREATE':
          // Add new task if it doesn't exist
          if (!prevTasks.find(task => task.id === data.id)) {
            toast.success('New task created!', { position: 'bottom-right' });
            return [...prevTasks, data];
          }
          return prevTasks;
          
        case 'UPDATE':
          // Update existing task
          const updatedTasks = prevTasks.map(task => 
            task.id === data.id ? { ...task, ...data } : task
          );
          toast.info('Task updated!', { position: 'bottom-right' });
          return updatedTasks;
          
        case 'DELETE':
          // Remove deleted task
          const filteredTasks = prevTasks.filter(task => task.id !== taskId);
          toast.warning('Task deleted!', { position: 'bottom-right' });
          return filteredTasks;
          
        default:
          return prevTasks;
      }
    });
  }, []);

  // Handle notifications
  const handleNotification = useCallback((message) => {
    const { message: notificationMessage, type } = message;
    
    switch (type) {
      case 'INFO':
        toast.info(notificationMessage);
        break;
      case 'WARNING':
        toast.warning(notificationMessage);
        break;
      case 'ERROR':
        toast.error(notificationMessage);
        break;
      default:
        toast(notificationMessage);
    }
  }, []);

  // Handle system notifications
  const handleSystemNotification = useCallback((message) => {
    if (message.broadcast) {
      toast.info(message.message, { 
        position: 'top-center',
        autoClose: false 
      });
    }
  }, []);

  // Connect to WebSocket when user is available
  useEffect(() => {
    if (user && user.id) {
      const onConnected = () => {
        setIsConnected(true);
        setConnectionError(null);
        console.log('Connected to real-time updates');
      };

      const onError = (error) => {
        setIsConnected(false);
        setConnectionError(error);
        console.error('WebSocket connection error:', error);
      };

      // Connect to WebSocket
      webSocketService.connect(user.id, onConnected, onError);

      // Register message handlers
      const removeTaskHandler = webSocketService.onMessage('tasks', handleTaskUpdate);
      const removeNotificationHandler = webSocketService.onMessage('notifications', handleNotification);
      const removeSystemNotificationHandler = webSocketService.onMessage('system-notifications', handleSystemNotification);

      // Cleanup on unmount or user change
      return () => {
        removeTaskHandler();
        removeNotificationHandler();
        removeSystemNotificationHandler();
        webSocketService.disconnect();
        setIsConnected(false);
      };
    }
  }, [user, handleTaskUpdate, handleNotification, handleSystemNotification]);

  // Update tasks when initialTasks change
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Function to manually refresh tasks (fallback)
  const refreshTasks = useCallback(async () => {
    // This would typically call your task service to fetch fresh data
    // You can implement this based on your existing task fetching logic
    console.log('Refreshing tasks...');
  }, []);

  return {
    tasks,
    setTasks,
    isConnected,
    connectionError,
    refreshTasks
  };
};

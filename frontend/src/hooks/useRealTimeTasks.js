import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import webSocketService from '../services/webSocketService';
import notificationService from '../utils/notificationService';
import Logger from '../utils/logger';

export const useRealTimeTasks = (initialTasks = []) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError] = useState(null);
  const { user } = useAuth();

  // Check WebSocket connection status periodically
  useEffect(() => {
    const checkConnection = () => {
      const connected = webSocketService.isConnected();
      setIsConnected(connected);
    };

    // Check immediately
    checkConnection();

    // Check every 2 seconds
    const interval = setInterval(checkConnection, 2000);

    return () => clearInterval(interval);
  }, []);  // Handle real-time task updates
  const handleTaskUpdate = useCallback((message) => {
    Logger.debug('Frontend received task update:', message);
    const { action, data, taskId, type } = message;
    
    // Handle bulk updates
    if (type === 'BULK_TASK_UPDATE') {
      Logger.debug('Processing bulk task update:', action, data);
      setTasks(prevTasks => {
        switch (action) {        case 'BULK_MARK_COMPLETE': {
          // Mark all specified tasks as complete
          const updatedTaskIds = data.map(task => task.id);
          const updatedTasks = prevTasks.map(task => 
            updatedTaskIds.includes(task.id) 
              ? { ...task, status: 'DONE' }
              : task
          );
          // Show less intrusive notification for bulk completion
          if (data.length > 1) {
            notificationService.taskUpdate(`${data.length} tasks completed`);
          }
          return updatedTasks;
        }
          default:
            return prevTasks;
        }
      });
      return;
    }
    
  // Handle individual task updates
  setTasks(prevTasks => {
    switch (action) {      case 'CREATE': {
        // Add new task if it doesn't exist
        if (!prevTasks.find(task => task.id === data.id)) {
          // Only show notification for tasks created by others (not current user)
          if (data.userId !== user?.id) {
            notificationService.realTimeUpdate('New task added');
          }
          return [...prevTasks, data];
        }
        return prevTasks;
      }
        
      case 'UPDATE': {
        // Update existing task
        const updatedTasks = prevTasks.map(task => 
          task.id === data.id ? { ...task, ...data } : task
        );
        // Don't show notification for real-time updates to reduce noise
        return updatedTasks;
      }
        
      case 'DELETE': {
        // Remove deleted task
        const filteredTasks = prevTasks.filter(task => task.id !== taskId);
        // Show notification for all deletions - deduplication handled by notificationService
        Logger.debug('DELETE case triggered, showing notification');
        notificationService.success('Task deleted');
        return filteredTasks;
      }
        
      default:
        return prevTasks;
    }
  });
  }, [user?.id]);

  // Handle notifications
  const handleNotification = useCallback((message) => {
    const { message: notificationMessage, type } = message;
    
    switch (type) {
      case 'INFO':
        notificationService.info(notificationMessage);
        break;
      case 'WARNING':
        notificationService.warning(notificationMessage);
        break;
      case 'ERROR':
        notificationService.error(notificationMessage);
        break;
      default:
        notificationService.info(notificationMessage);
    }
  }, []);

  // Handle system notifications
  const handleSystemNotification = useCallback((message) => {
    if (message.broadcast) {
      notificationService.info(message.message);
    }
  }, []);
  // Register message handlers when user is available
  useEffect(() => {
    if (user?.id) {
      Logger.debug('Registering real-time message handlers for user:', user.id);

      // Register message handlers (connection is already handled by WebSocketDebugger)
      const removeTaskHandler = webSocketService.onMessage('tasks', handleTaskUpdate);
      const removeNotificationHandler = webSocketService.onMessage('notifications', handleNotification);
      const removeSystemNotificationHandler = webSocketService.onMessage('system-notifications', handleSystemNotification);

      // Cleanup on unmount or user change
      return () => {
        Logger.debug('Cleaning up real-time message handlers');
        removeTaskHandler();
        removeNotificationHandler();
        removeSystemNotificationHandler();
      };
    }
  }, [user?.id]); // Remove the function dependencies to prevent constant re-registration

  // Update tasks when initialTasks change
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Function to manually refresh tasks (fallback)
  const refreshTasks = useCallback(async () => {
    // This would typically call your task service to fetch fresh data
    // You can implement this based on your existing task fetching logic
    Logger.debug('Refreshing tasks...');
  }, []);

  return {
    tasks,
    setTasks,
    isConnected,
    connectionError,
    refreshTasks
  };
};

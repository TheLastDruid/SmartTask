import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import webSocketService from '../services/webSocketService';
import { toast } from 'react-toastify';

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
    console.log('🔔 Frontend received task update:', message);
    const { action, data, taskId, type } = message;
    
    // Handle bulk updates
    if (type === 'BULK_TASK_UPDATE') {
      console.log('Processing bulk task update:', action, data);
      setTasks(prevTasks => {
        switch (action) {
          case 'BULK_MARK_COMPLETE': {
            // Mark all specified tasks as complete
            const updatedTaskIds = data.map(task => task.id);
            const updatedTasks = prevTasks.map(task => 
              updatedTaskIds.includes(task.id) 
                ? { ...task, status: 'DONE' }
                : task
            );
            toast.success(`${data.length} tasks marked as complete!`, { position: 'bottom-right' });
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
      switch (action) {case 'CREATE': {
          // Add new task if it doesn't exist
          if (!prevTasks.find(task => task.id === data.id)) {
            toast.success('New task created!', { position: 'bottom-right' });
            return [...prevTasks, data];
          }
          return prevTasks;
        }
          
        case 'UPDATE': {
          // Update existing task
          const updatedTasks = prevTasks.map(task => 
            task.id === data.id ? { ...task, ...data } : task
          );
          toast.info('Task updated!', { position: 'bottom-right' });
          return updatedTasks;
        }
          
        case 'DELETE': {
          // Remove deleted task
          const filteredTasks = prevTasks.filter(task => task.id !== taskId);
          toast.warning('Task deleted!', { position: 'bottom-right' });
          return filteredTasks;
        }
          
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
  // Register message handlers when user is available
  useEffect(() => {
    if (user?.id) {
      console.log('Registering real-time message handlers for user:', user.id);

      // Register message handlers (connection is already handled by WebSocketDebugger)
      const removeTaskHandler = webSocketService.onMessage('tasks', handleTaskUpdate);
      const removeNotificationHandler = webSocketService.onMessage('notifications', handleNotification);
      const removeSystemNotificationHandler = webSocketService.onMessage('system-notifications', handleSystemNotification);

      // Cleanup on unmount or user change
      return () => {
        console.log('Cleaning up real-time message handlers');
        removeTaskHandler();
        removeNotificationHandler();
        removeSystemNotificationHandler();
      };
    }
  }, [user?.id, handleTaskUpdate, handleNotification, handleSystemNotification]);

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

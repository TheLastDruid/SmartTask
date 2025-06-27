import { toast } from 'react-toastify';
import Logger from './logger';

class NotificationService {
  constructor() {
    this.defaultOptions = {
      position: 'top-center',
      autoClose: 2500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    };
    // Simple deduplication tracking
    this.recentNotifications = new Map();
    this.deduplicationWindow = 3000; // 3 seconds - increased from 2
  }

  // Check if we should show this notification (deduplication)
  shouldShowNotification(message, type = 'default') {
    const key = `${type}:${message}`;
    const now = Date.now();
    
    Logger.debug('Checking notification:', { key, now, hasExisting: this.recentNotifications.has(key) });
    
    if (this.recentNotifications.has(key)) {
      const lastShown = this.recentNotifications.get(key);
      const timeDiff = now - lastShown;
      Logger.debug('Time difference:', timeDiff, 'vs window:', this.deduplicationWindow);
      if (timeDiff < this.deduplicationWindow) {
        Logger.debug('Notification blocked - too recent');
        return false; // Too recent, don't show
      }
    }
    
    this.recentNotifications.set(key, now);
    Logger.debug('Notification allowed, cache updated');
    
    // Clean up old entries
    for (const [k, timestamp] of this.recentNotifications.entries()) {
      if (now - timestamp > this.deduplicationWindow) {
        this.recentNotifications.delete(k);
      }
    }
    
    return true;
  }

  success(message, options = {}) {
    // Temporarily bypass deduplication to test
    // if (!this.shouldShowNotification(message, 'success')) return null;
    const finalOptions = { ...this.defaultOptions, ...options };
    Logger.info('Success notification:', message);
    return toast.success(message, finalOptions);
  }

  error(message, options = {}) {
    // Temporarily bypass deduplication to test
    // if (!this.shouldShowNotification(message, 'error')) return null;
    const finalOptions = { 
      ...this.defaultOptions, 
      autoClose: 4000, // Longer for errors
      ...options 
    };
    Logger.error('Error notification:', message);
    return toast.error(message, finalOptions);
  }

  warning(message, options = {}) {
    if (!this.shouldShowNotification(message, 'warning')) return null;
    const finalOptions = { 
      ...this.defaultOptions, 
      autoClose: 3000,
      ...options 
    };
    Logger.warn('Warning notification:', message);
    return toast.warning(message, finalOptions);
  }

  info(message, options = {}) {
    if (!this.shouldShowNotification(message, 'info')) return null;
    const finalOptions = { ...this.defaultOptions, ...options };
    Logger.info('Info notification:', message);
    return toast.info(message, finalOptions);
  }

  // Simplified task update method - no more random frequency
  taskUpdate(message, options = {}) {
    if (!this.shouldShowNotification(message, 'task')) return null;
    const finalOptions = { 
      ...this.defaultOptions, 
      autoClose: 1500,
      ...options 
    };
    Logger.info('Task update notification:', message);
    return toast.success(message, finalOptions);
  }

  // Method for chat responses - always show but brief
  chatResponse(message, options = {}) {
    if (!this.shouldShowNotification(message, 'chat')) return null;
    const finalOptions = { 
      ...this.defaultOptions, 
      autoClose: 2000,
      ...options 
    };
    Logger.info('Chat response notification:', message);
    return toast.success(message, finalOptions);
  }

  // Method for real-time updates - simplified
  realTimeUpdate(message, options = {}) {
    if (!this.shouldShowNotification(message, 'realtime')) return null;
    const finalOptions = { 
      ...this.defaultOptions, 
      autoClose: 1000,
      ...options 
    };
    Logger.info('Real-time update notification:', message);
    return toast.info(message, finalOptions);
  }

  // Dismiss all notifications
  dismissAll() {
    toast.dismiss();
    this.recentNotifications.clear(); // Also clear deduplication cache
  }

  // Clear deduplication cache manually if needed
  clearCache() {
    this.recentNotifications.clear();
  }
}

const notificationService = new NotificationService();
export default notificationService;

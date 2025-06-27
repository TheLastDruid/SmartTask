/**
 * Production-ready logging utility
 * Logs to console in development, can be extended for production logging services
 */

const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  static log(message, ...args) {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  static debug(message, ...args) {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  static warn(message, ...args) {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
    // In production, you could send warnings to a logging service
  }

  static error(message, ...args) {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, ...args);
    }
    // In production, you could send errors to a logging service like Sentry
  }

  static info(message, ...args) {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }
}

export default Logger;

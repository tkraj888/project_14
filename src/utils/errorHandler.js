/**
 * Enhanced Error Handler
 * Provides user-friendly error messages and handles edge cases
 */

/**
 * Error types and their user-friendly messages
 */
const ERROR_MESSAGES = {
  // Authentication errors
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.',
  SESSION_EXPIRED: 'Your session has expired. Redirecting to login...',
  LOGGED_IN_ELSEWHERE: 'You have been logged in on another device. Please log in again.',
  
  // Network errors
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  
  // Validation errors
  VALIDATION_ERROR: 'Please check your input and try again.',
  INVALID_INPUT: 'Invalid input provided. Please correct and try again.',
  
  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  NOT_FOUND: 'The requested resource was not found.',
};

/**
 * Parse error response and return user-friendly message
 * @param {Error|Response|object} error - Error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Handle network errors
  if (!navigator.onLine) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (error.message.includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT;
    }
    return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
  }
  
  // Handle HTTP status codes
  if (error.status || error.statusCode) {
    const status = error.status || error.statusCode;
    
    switch (status) {
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 408:
        return ERROR_MESSAGES.TIMEOUT;
      case 422:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case 500:
      case 502:
      case 503:
      case 504:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle object with message property
  if (error && error.message) {
    return error.message;
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * Handle authentication errors with automatic logout
 * @param {Error} error - Error object
 * @param {Function} navigate - Navigation function
 * @returns {boolean} True if handled, false otherwise
 */
export const handleAuthError = (error, navigate) => {
  const status = error.status || error.statusCode;
  
  if (status === 401) {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    
    // Show user-friendly message
    const message = error.message?.toLowerCase().includes('another device')
      ? ERROR_MESSAGES.LOGGED_IN_ELSEWHERE
      : ERROR_MESSAGES.SESSION_EXPIRED;
    
    // Redirect to login after a short delay
    setTimeout(() => {
      if (navigate) {
        navigate('/', { 
          state: { 
            message,
            from: window.location.pathname 
          } 
        });
      } else {
        window.location.href = '/';
      }
    }, 1500);
    
    return true;
  }
  
  return false;
};

/**
 * Create a safe error object for logging (removes sensitive data)
 * @param {Error} error - Error object
 * @returns {object} Safe error object
 */
export const createSafeError = (error) => {
  return {
    message: error.message || 'Unknown error',
    status: error.status || error.statusCode,
    timestamp: new Date().toISOString(),
    // Don't include stack traces or sensitive data
  };
};

/**
 * Global error handler for unhandled promise rejections
 */
export const setupGlobalErrorHandler = () => {
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    
    // Log error safely (in production, send to error tracking service)
    if (import.meta.env.DEV) {
      console.error('Unhandled promise rejection:', event.reason);
    }
    
    // Show user-friendly message
    const message = getErrorMessage(event.reason);
    
    // You can dispatch a global error event here
    window.dispatchEvent(new CustomEvent('app-error', { 
      detail: { message } 
    }));
  });
};

/**
 * Retry failed requests with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Initial delay in ms
 * @returns {Promise} Result of function
 */
export const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on authentication errors
      if (error.status === 401 || error.status === 403) {
        throw error;
      }
      
      // Don't retry on validation errors
      if (error.status === 422) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};

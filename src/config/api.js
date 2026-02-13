import { getErrorMessage, handleAuthError } from '../utils/errorHandler';
import { checkRateLimit } from '../utils/rateLimiter';

// Use environment variable or fallback to localhost
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem("token");

  if (isFormData) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Enhanced fetch with error handling, rate limiting, and retry logic
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @param {object} config - Additional configuration
 * @returns {Promise<Response>} Fetch response
 */
export const enhancedFetch = async (url, options = {}, config = {}) => {
  const {
    skipRateLimit = false,
    rateLimitType = 'api',
    skipAuth = false,
  } = config;
  
  // Check rate limit
  if (!skipRateLimit) {
    const rateCheck = checkRateLimit(url, rateLimitType);
    if (!rateCheck.allowed) {
      throw new Error(rateCheck.message);
    }
  }
  
  // Add auth headers if not skipped
  const headers = skipAuth ? options.headers : {
    ...getAuthHeaders(options.isFormData),
    ...options.headers,
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle authentication errors
    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || 'Unauthorized');
      error.status = 401;
      error.data = errorData;
      throw error;
    }
    
    // Handle other HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
    
    return response;
  } catch (error) {
    // Enhance error with user-friendly message
    error.userMessage = getErrorMessage(error);
    throw error;
  }
};

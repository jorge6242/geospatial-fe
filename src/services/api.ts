/**
 * @fileoverview Simplified Axios configuration for HTTP requests
 * Basic setup without interceptors for cleaner technical test implementation
 */

import axios from 'axios';

// Backend base URL - adjust according to your configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Axios instance with base configuration
 */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Helper function to add auth token to requests
 * Call this manually when needed instead of using interceptors
 */
export const addAuthHeader = (config: any, token?: string) => {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
  if (authToken) {
    // Ensure headers object exists
    if (!config.headers) {
      config.headers = {};
    }
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
};

/**
 * Helper function for centralized error handling
 * Call this in your services instead of using response interceptors
 */
export const handleApiError = (error: any) => {
  if (error.response?.status === 401) {
    // Handle unauthorized - could redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_user');
      // Optional: redirect to login
      // window.location.href = '/auth';
    }
  }
  return Promise.reject(error);
};

export default apiClient;
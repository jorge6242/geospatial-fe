/**
 * @fileoverview Authentication service with pure functions
 * Implementing Repository Pattern with functional paradigm
 */

import apiClient, { addAuthHeader } from './api';
import type {
  LoginCredentials,
  RegisterCredentials,
  LoginResponse,
  RegisterResponse,
  RefreshResponse,
} from '@/types/auth';

/**
 * Handle authentication errors in a centralized way
 * @param error - Axios error
 * @returns Formatted error
 */
function handleAuthError(error: any): Error {
  if (error.response) {
    // Error with server response
    const message = error.response.data?.message || error.response.data?.error;

    switch (error.response.status) {
      case 400:
        return new Error(message || 'Invalid input data');
      case 401:
        return new Error('Invalid credentials');
      case 409:
        return new Error('Email is already registered');
      default:
        return new Error(message || 'Server error');
    }
  } else if (error.request) {
    // Network error
    return new Error('Connection error. Please check your internet connection.');
  } else {
    // Unknown error
    return new Error(error.message || 'Unexpected error');
  }
}

/**
 * Login with credentials
 * @param credentials - User's email and password
 * @returns Promise with login response
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });

    return response.data;
  } catch (error) {
    throw handleAuthError(error);
  }
}

/**
 * Register a new user
 * @param credentials - New user data
 * @returns Promise with registration response
 */
export async function register(credentials: RegisterCredentials): Promise<RegisterResponse> {
  try {
    const response = await apiClient.post<RegisterResponse>('/auth/register', {
      email: credentials.email,
      password: credentials.password,
    });

    return response.data;
  } catch (error) {
    throw handleAuthError(error);
  }
}

/**
 * Refresh access token using refresh token
 * @param refreshToken - Refresh token
 * @returns Promise with new token response
 */
export async function refreshToken(refreshToken: string): Promise<RefreshResponse> {
  try {
    const response = await apiClient.post<RefreshResponse>('/auth/refresh', {
      refreshToken,
    });

    return response.data;
  } catch (error) {
    throw handleAuthError(error);
  }
}

/**
 * Verify if token is valid
 * @returns Promise with current user
 */
export async function verifyToken(): Promise<{ user: any }> {
  try {
    const config = addAuthHeader({ method: 'GET', url: '/auth/me' });
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    throw handleAuthError(error);
  }
}

// Default export as object for backward compatibility
const authService = {
  login,
  register,
  refreshToken,
  verifyToken
};

export default authService;
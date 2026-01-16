/**
 * @fileoverview TanStack Query hooks for authentication
 * Implementing Custom Hooks pattern with smart caching
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login, register, refreshToken } from '@/services/authService';
import type { LoginCredentials, RegisterCredentials } from '@/types/auth';

/**
 * Hook for handling login with TanStack Query
 * Includes cache invalidation and optimistic updates
 */
export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),

    onSuccess: (data) => {
      // Save token and user in localStorage if "remember me" is active
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      }

      // Invalidate auth-related queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },

    onError: (error) => {
      // Clear authentication data on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth_user');
      }

      console.error('Login error:', error);
    },

    // Additional configuration
    retry: false, // Do not retry login automatically
    gcTime: 0, // Do not cache login mutations
  });
}

/**
 * Hook for handling registration with TanStack Query
 */
export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => register(credentials),

    onSuccess: (data) => {
      // Optional: Auto-login after registration
      // For now, just invalidate cache
      queryClient.invalidateQueries({ queryKey: ['auth'] });

      console.log('User registered successfully:', data.message);
    },

    onError: (error) => {
      console.error('Registration error:', error);
    },

    // Additional configuration
    retry: false, // Do not retry registration automatically
    gcTime: 0, // Do not cache registration mutations
  });
}

/**
 * Hook for handling logout
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth_user');
      }

      // Simulate delay for UX
      await new Promise(resolve => setTimeout(resolve, 300));
    },

    onSuccess: () => {
      // Clear all query cache
      queryClient.clear();
    },

    onError: (error) => {
      console.error('Logout error:', error);
    }
  });
}

/**
 * Hook for handling refresh token with TanStack Query
 * Automatically renews tokens when they expire
 */
export function useRefreshTokenMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (refreshTokenValue: string) => refreshToken(refreshTokenValue),

    onSuccess: (data) => {
      // Update tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      }

      // Invalidate auth-related queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },

    onError: (error) => {
      console.error('Refresh token error:', error);

      // If refresh fails, clear data and redirect
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth_user');

        // Redirect to login
        window.location.href = '/auth';
      }

      // Clear complete cache
      queryClient.clear();
    },

    // Additional configuration
    retry: false, // Do not retry refresh automatically
    gcTime: 0, // Do not cache refresh mutations
  });
}
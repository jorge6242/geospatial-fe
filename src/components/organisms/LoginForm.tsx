/**
 * @fileoverview LoginForm Component - Main organism for login
 * Implementing SOLID principles and Clean Architecture
 */

'use client';

import React from 'react';
import { Button } from '@/components/atoms';
import { InputField, CheckboxField } from '@/components/molecules';
import { useFormWithValidation } from '@/hooks/useFormValidation';
import { useAuth } from '@/context/AuthContext';
import { loginSchema, type LoginFormData } from '@/lib/schemas';

export interface LoginFormProps {
  /** Callback on successful login completion */
  onSuccess?: () => void;
  /** Callback when an error occurs */
  onError?: (error: string) => void;
}

/**
 * LoginForm component that handles user authentication
 * Following Single Responsibility and composition principles
 */
export function LoginForm({ onSuccess, onError }: LoginFormProps) {
  const { login, isLoading, error: authError } = useAuth();
  
  const {
    register,
    handleSubmit,
    getFieldError,
    hasFieldError,
    formState: { isSubmitting, errors }
  } = useFormWithValidation<LoginFormData>({
    schema: loginSchema,
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  /**
   * Handler para el envío del formulario
   */
  const onSubmit = async (data: LoginFormData) => {
    try {
      const success = await login(data);
      
      if (success) {
        onSuccess?.();
      } else {
        onError?.(authError || 'Error de autenticación');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado';
      onError?.(message);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className="space-y-6"
      noValidate
    >
      <div className="space-y-4">
        <InputField
          label="Email"
          type="email"
          placeholder="your@email.com"
          required
          error={getFieldError('email')}
          className='text-black'
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          }
          {...register('email')}
        />

        <InputField
          label="Password"
          type="password"
          placeholder="••••••••"
          required
          error={getFieldError('password')}
          helperText="Minimum 6 characters"
          className='text-black'
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
          {...register('password')}
        />
      </div>

      <div className="flex items-center justify-between">
        <CheckboxField
          label="Remember me"
          {...register('rememberMe')}
        />

        <button
          type="button"
          className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
        >
          Forgot your password?
        </button>
      </div>

      {authError && (
        <div 
          className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg"
          role="alert"
          aria-live="polite"
        >
          {authError}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        isLoading={isSubmitting || isLoading}
        disabled={Object.keys(errors).length > 0}
      >
        {isSubmitting || isLoading ? 'Signing in...' : 'Sign In'}
      </Button>

      {/* Development info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-600">
        <p><strong>Connected to backend:</strong></p>
        <p>Use your backend credentials to sign in</p>
      </div>
    </form>
  );
}
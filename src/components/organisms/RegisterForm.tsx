/**
 * @fileoverview RegisterForm Component - Organism for registration
 * Implementing SOLID principles and Clean Architecture
 */

'use client';

import React from 'react';
import { Button } from '@/components/atoms';
import { InputField } from '@/components/molecules';
import { useFormWithValidation } from '@/hooks/useFormValidation';
import { useAuth } from '@/context/AuthContext';
import { registerSchema, type RegisterFormData } from '@/lib/schemas';

export interface RegisterFormProps {
  /** Callback on successful registration completion */
  onSuccess?: () => void;
  /** Callback when an error occurs */
  onError?: (error: string) => void;
  /** Callback to switch to login */
  onSwitchToLogin?: () => void;
}

/**
 * RegisterForm component that handles user registration
 * Following Single Responsibility and composition principles
 */
export function RegisterForm({ onSuccess, onError, onSwitchToLogin }: RegisterFormProps) {
  const { register: registerUser, isLoading, error: authError } = useAuth();
  
  const {
    register,
    handleSubmit,
    getFieldError,
    formState: { isSubmitting, errors }
  } = useFormWithValidation<RegisterFormData>({
    schema: registerSchema,
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  /**
   * Handler para el envío del formulario
   */
  const onSubmit = async (data: RegisterFormData) => {
    try {
      const success = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password
      });
      
      if (success) {
        onSuccess?.();
      } else {
        onError?.(authError || 'Error de registro');
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
          label="Full name"
          type="text"
          placeholder="Your name"
          required
          error={getFieldError('name')}
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          {...register('name')}
        />

        <InputField
          label="Email"
          type="email"
          placeholder="your@email.com"
          required
          error={getFieldError('email')}
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
          helperText="Minimum 6 characters, include uppercase, lowercase, and number"
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
          {...register('password')}
        />

        <InputField
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          required
          error={getFieldError('confirmPassword')}
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          {...register('confirmPassword')}
        />
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
        {isSubmitting || isLoading ? 'Creating account...' : 'Create Account'}
      </Button>

      {/* Link to switch to login */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Sign in here
          </button>
        </p>
      </div>
    </form>
  );
}
/**
 * @fileoverview Validation schemes with Zod
 * Implementing robust and type-safe validation
 */

import { z } from 'zod';

/**
 * Schema for login validation
 * Applying strict validation principles
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'The email is required')
    .email('Must be a valid email')
    .max(100, 'Email too long'),
  
  password: z
    .string()
    .min(1, 'The password is required')
    .min(6, 'Minimum 6 characters')
    .max(50, 'Máximo 50 caracteres'),
  
  rememberMe: z.boolean().optional().default(false)
});

/**
 * Schema for registration validation
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'The name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Only letters and spaces allowed'),
    
  email: z
    .string()
    .min(1, 'The email is required')
    .email('Must be a valid email')
    .max(100, 'Email too long'),
  
  password: z
    .string()
    .min(6, 'Minimum 6 characters')
    .max(50, 'Maximum 50 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain at least: 1 lowercase, 1 uppercase, and 1 number'),
    
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Schema for user validation
 */
export const userSchema = z.object({
  id: z.string().uuid('IInvalid ID'),
  email: z.string().email('Invalid email'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  avatar: z.string().url('Invalid URL').optional(),
  createdAt: z.string().datetime('Invalid date'),
  updatedAt: z.string().datetime('Invalid date')
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type UserFormData = z.infer<typeof userSchema>;
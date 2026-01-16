/**
 * @fileoverview Funciones utilitarias siguiendo principios SOLID
 * Single Responsibility: cada función tiene una responsabilidad específica
 */

import { type ClassValue, clsx } from 'clsx';

/**
 * Utility para combinar clases de Tailwind CSS de manera conditional
 * @param inputs - Classes de CSS a combinar
 * @returns String de clases CSS combinadas
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Utility para formatear fechas de manera consistente
 * @param date - Fecha a formatear
 * @returns Fecha formateada en español
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Utility para validar si un email es válido
 * @param email - Email a validar
 * @returns Boolean indicando si es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Utility para generar avatar placeholder basado en iniciales  
 * @param name - Nombre del usuario (opcional)
 * @param email - Email del usuario como fallback
 * @returns URL del avatar placeholder
 */
export function getAvatarFallback(name?: string | null, email?: string): string {
  let initials = 'U'; // Default fallback
  
  if (name && name.trim()) {
    // Si hay nombre, usar las iniciales del nombre
    initials = name
      .trim()
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  } else if (email) {
    // Si no hay nombre pero hay email, usar las primeras 2 letras del email
    initials = email.substring(0, 2).toUpperCase();
  }
    
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0ea5e9&color=fff&size=40`;
}

/**
 * Utility para storage seguro en localStorage
 * @param key - Clave del item
 * @param value - Valor a guardar
 */
export function secureStorageSet(key: string, value: unknown): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.warn('Error saving to localStorage:', error);
  }
}

/**
 * Utility para obtener datos del localStorage de manera segura
 * @param key - Clave del item
 * @returns Valor parseado o null
 */
export function secureStorageGet<T>(key: string): T | null {
  try {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      // Try to parse as JSON first
      try {
        return JSON.parse(item);
      } catch {
        // If JSON parsing fails, return the raw string (for JWT tokens, etc.)
        return item as T;
      }
    }
    return null;
  } catch (error) {
    console.warn('Error reading from localStorage:', error);
    return null;
  }
}

/**
 * Utility para remover datos del localStorage
 * @param key - Clave del item a remover
 */
export function secureStorageRemove(key: string): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn('Error removing from localStorage:', error);
  }
}
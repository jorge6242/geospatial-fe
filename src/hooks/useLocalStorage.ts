/**
 * @fileoverview Custom hook for localStorage management
 * Implementing Single Responsibility principle
 */

import { useState, useEffect, useCallback } from 'react';
import { secureStorageGet, secureStorageSet, secureStorageRemove } from '@/lib/utils';

/**
 * Custom hook for secure localStorage management
 * @param key - localStorage key
 * @param initialValue - Default initial value
 * @returns Array with [value, setter, remover]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue?: T
): [T | null, (value: T) => void, () => void] {

  const [storedValue, setStoredValue] = useState<T | null>(() => {
    try {
      const item = secureStorageGet<T>(key);
      return item !== null ? item : initialValue || null;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue || null;
    }
  });

  /**
   * Function to update value in localStorage
   */
  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value);
      secureStorageSet(key, value);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  /**
   * Function to remove value from localStorage
   */
  const removeValue = useCallback(() => {
    try {
      setStoredValue(null);
      secureStorageRemove(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue, removeValue];
}
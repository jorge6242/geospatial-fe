/**
 * @fileoverview useLoadingState hook for smart loading state management
 * Avoids flickering and optimizes UX in interactive maps
 */

import { useEffect, useState, useRef } from 'react';

interface UseLoadingStateOptions {
  /** Delay before showing loading (avoids flashes) */
  delayMs?: number;
  /** Minimum time loading must be displayed */
  minDisplayMs?: number;
  /** Whether it's initial load (always show) or interaction */
  isInitialLoad?: boolean;
}

interface UseLoadingStateReturn {
  /** Whether to show loading overlay */
  shouldShowLoading: boolean;
  /** Reset loading state */
  resetLoading: () => void;
}

/**
 * Hook for smart loading state management
 * Avoids flickering and improves UX in asynchronous operations
 */
export function useLoadingState(
  isLoading: boolean,
  options: UseLoadingStateOptions = {}
): UseLoadingStateReturn {
  const {
    delayMs = 500,      // 500ms before showing
    minDisplayMs = 200, // 200ms minimum visible
    isInitialLoad = false
  } = options;

  const [shouldShowLoading, setShouldShowLoading] = useState(isInitialLoad && isLoading);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const minDisplayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | undefined>(undefined);
  const isShowingRef = useRef(false);

  useEffect(() => {
    // Clear previous timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (minDisplayTimeoutRef.current) {
      clearTimeout(minDisplayTimeoutRef.current);
    }

    if (isLoading && !isShowingRef.current) {
      // Started loading
      startTimeRef.current = Date.now();

      if (isInitialLoad) {
        // For initial load, show immediately
        setShouldShowLoading(true);
        isShowingRef.current = true;
      } else {
        // For interactions, delay before showing
        timeoutRef.current = setTimeout(() => {
          if (isLoading) { // Check if still loading
            setShouldShowLoading(true);
            isShowingRef.current = true;
          }
        }, delayMs);
      }
    } else if (!isLoading && isShowingRef.current) {
      // Finished loading
      const elapsedTime = Date.now() - (startTimeRef.current || 0);

      if (elapsedTime < minDisplayMs) {
        // If minimum time hasn't passed, wait
        minDisplayTimeoutRef.current = setTimeout(() => {
          setShouldShowLoading(false);
          isShowingRef.current = false;
        }, minDisplayMs - elapsedTime);
      } else {
        // Minimum time has passed, hide immediately
        setShouldShowLoading(false);
        isShowingRef.current = false;
      }
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (minDisplayTimeoutRef.current) clearTimeout(minDisplayTimeoutRef.current);
    };
  }, [isLoading, delayMs, minDisplayMs, isInitialLoad]);

  const resetLoading = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (minDisplayTimeoutRef.current) clearTimeout(minDisplayTimeoutRef.current);
    setShouldShowLoading(false);
    isShowingRef.current = false;
  };

  return {
    shouldShowLoading,
    resetLoading,
  };
}
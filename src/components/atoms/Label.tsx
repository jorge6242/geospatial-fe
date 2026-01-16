/**
 * @fileoverview Label Component - Atom for form labels
 * Following accessibility and Single Responsibility principles
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** If the label is required */
  required?: boolean;
  /** Visual variant */
  variant?: 'default' | 'error';
  /** Label size */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Accessible and semantically correct Label component
 * Implements web accessibility best practices
 */
export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required = false, variant = 'default', size = 'md', children, ...props }, ref) => {
    
    const baseClasses = "block font-medium text-left";
    
    const variants = {
      default: "text-gray-700",
      error: "text-red-600"
    };
    
    const sizes = {
      sm: "text-xs mb-1",
      md: "text-sm mb-2",
      lg: "text-base mb-2"
    };

    return (
      <label
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
        {required && (
          <span 
            className="text-red-500 ml-1" 
            aria-label="Campo requerido"
            title="Campo requerido"
          >
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';
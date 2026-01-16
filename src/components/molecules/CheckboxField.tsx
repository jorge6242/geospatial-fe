/**
 * @fileoverview CheckboxField Component - Molecule for checkbox with label
 * Following accessibility and composition principles
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Checkbox label */
  label: string;
  /** Error message */
  error?: string;
  /** If required */
  required?: boolean;
}

/**
 * Accessible and semantically correct CheckboxField component
 */
export const CheckboxField = React.forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ label, error, required = false, className, id, ...props }, ref) => {
    
    const fieldId = id || `checkbox-${React.useId()}`;
    const errorId = `${fieldId}-error`;

    return (
      <div className={cn("space-y-1", className)}>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={fieldId}
            ref={ref}
            className={cn(
              "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500",
              error && "border-red-500"
            )}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            {...props}
          />
          
          <label 
            htmlFor={fieldId}
            className={cn(
              "text-sm font-medium cursor-pointer select-none",
              error ? "text-red-600" : "text-gray-700"
            )}
          >
            {label}
            {required && (
              <span 
                className="text-red-500 ml-1"
                aria-label="Campo requerido"
              >
                *
              </span>
            )}
          </label>
        </div>
        
        {error && (
          <p 
            id={errorId}
            className="text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

CheckboxField.displayName = 'CheckboxField';
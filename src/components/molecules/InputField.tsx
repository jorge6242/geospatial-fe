/**
 * @fileoverview InputField Component - Molecule that combines Label + Input + Error
 * Implementing composition and reusability principles
 */

import React from 'react';
import { Label, Input, type InputProps } from '@/components/atoms';
import { cn } from '@/lib/utils';

export interface InputFieldProps extends InputProps {
  /** Field label */
  label?: string;
  /** If the field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Unique ID for the field */
  id?: string;
}

/**
 * InputField component that encapsulates Label, Input, and error message
 * Follows composition and single responsibility principles
 */
export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ 
    label, 
    required = false, 
    error, 
    helperText, 
    id, 
    className, 
    ...inputProps 
  }, ref) => {
    
    // Generar ID único si no se proporciona
    const fieldId = id || `input-${React.useId()}`;
    const errorId = `${fieldId}-error`;
    const helperId = `${fieldId}-helper`;

    return (
      <div className={cn("space-y-1", className)}>
        {label && (
          <Label 
            htmlFor={fieldId}
            required={required}
            variant={error ? 'error' : 'default'}
          >
            {label}
          </Label>
        )}
        
        <Input
          id={fieldId}
          ref={ref}
          variant={error ? 'error' : 'default'}
          aria-invalid={!!error}
          aria-describedby={cn(
            error && errorId,
            helperText && helperId
          )}
          {...inputProps}
        />
        
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
        
        {helperText && !error && (
          <p 
            id={helperId}
            className="text-sm text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
/**
 * @fileoverview Custom hook for form handling
 * Wrapper over react-hook-form applying SOLID principles
 */

import { useForm, type UseFormProps, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ZodType } from 'zod';

interface UseFormWithValidationProps<T extends FieldValues> extends UseFormProps<T> {
  /** Zod schema for validation */
  schema: ZodType<T>;
}

export interface UseFormWithValidationReturn<T extends FieldValues> {
  handleSubmit: any;
  register: any;
  watch: any;
  setValue: any;
  getValues: () => T;
  reset: () => void;
  formState: {
    errors: any;
    isValid: boolean;
    isSubmitting: boolean;
    isDirty: boolean;
  };
  control: any;
  trigger: () => Promise<boolean>;
  getFieldError: (fieldName: keyof T) => string | undefined;
  hasFieldError: (fieldName: keyof T) => boolean;
  isFormValid: boolean;
  isDirty: boolean;
}

/**
 * Custom hook that extends react-hook-form with Zod validation
 * Following the Open/Closed principle (open for extension)
 */
export function useFormWithValidation<T extends FieldValues>({
  schema,
  ...props
}: UseFormWithValidationProps<T>): UseFormWithValidationReturn<T> {

  const form = useForm<T>({
    resolver: zodResolver(schema as any),
    mode: 'onBlur',
    ...props
  });

  /**
   * Helper function to get specific field error
   */
  const getFieldError = (fieldName: keyof T) => {
    const error = form.formState.errors[fieldName];
    return error?.message as string | undefined;
  };

  /**
   * Helper function to check if field has error
   */
  const hasFieldError = (fieldName: keyof T) => {
    return !!form.formState.errors[fieldName];
  };

  /**
   * Helper function to check if form is valid
   */
  const isFormValid = !Object.keys(form.formState.errors).length;

  return {
    handleSubmit: form.handleSubmit,
    register: form.register,
    watch: form.watch,
    setValue: form.setValue,
    getValues: form.getValues,
    reset: form.reset,
    formState: form.formState,
    control: form.control,
    trigger: form.trigger,
    getFieldError,
    hasFieldError,
    isFormValid,
    isDirty: form.formState.isDirty
  };
}
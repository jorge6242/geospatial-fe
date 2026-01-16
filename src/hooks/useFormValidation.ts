/**
 * @fileoverview Custom hook for forms with Zod validation
 * Wrapper over react-hook-form to simplify usage
 */

import { useForm, UseFormProps, UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';

interface UseFormWithValidationProps<TSchema extends FieldValues> extends UseFormProps<TSchema> {
  schema: ZodSchema<TSchema>;
}

interface UseFormWithValidationReturn<TSchema extends FieldValues> extends UseFormReturn<TSchema> {
  /**
   * Gets the error message of a specific field
   */
  getFieldError: (field: FieldPath<TSchema>) => string | undefined;

  /**
   * Checks if a field has an error
   */
  hasFieldError: (field: FieldPath<TSchema>) => boolean;
}

/**
 * Custom hook that combines react-hook-form with Zod validation
 * Following composition principle and reusability
 */
export function useFormWithValidation<TSchema extends FieldValues>(
  props: UseFormWithValidationProps<TSchema>
): UseFormWithValidationReturn<TSchema> {

  const { schema, ...formProps } = props;

  const form = useForm<TSchema>({
    resolver: zodResolver(schema as any),
    mode: 'onChange', // Validate in real-time
    ...formProps,
  });

  /**
   * Helper function to get field errors
   */
  const getFieldError = (field: FieldPath<TSchema>): string | undefined => {
    return form.formState.errors[field]?.message as string | undefined;
  };

  /**
   * Helper function to check if field has error
   */
  const hasFieldError = (field: FieldPath<TSchema>): boolean => {
    return !!form.formState.errors[field];
  };

  return {
    ...form,
    getFieldError,
    hasFieldError,
  } as any;
}
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface ActionResult {
  success?: boolean;
  error?: string;
}

interface UseFormSubmitOptions {
  onSuccess?: (result: ActionResult) => void;
  onError?: (error: string) => void;
  successMessage?: string;
  errorMessage?: string;
  routerRefresh?: boolean;
}

interface UseFormSubmitReturn {
  submitting: boolean;
  submit: (formData: FormData) => Promise<void>;
}

export function useFormSubmit(
  action: (formData: FormData) => Promise<ActionResult>,
  options: UseFormSubmitOptions = {}
): UseFormSubmitReturn {
  const {
    onSuccess,
    onError,
    successMessage = 'Saved successfully',
    errorMessage = 'Something went wrong',
    routerRefresh = false
  } = options;

  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const submit = useCallback(async (formData: FormData) => {
    setSubmitting(true);
    
    try {
      const result = await action(formData);
      
      if (result?.success) {
        toast({
          title: 'Success',
          description: successMessage,
        });
        onSuccess?.(result);
        
        if (routerRefresh) {
          router.refresh();
        }
      } else {
        const errorMsg = result?.error || errorMessage;
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
        onError?.(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : errorMessage;
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
      onError?.(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }, [action, onSuccess, onError, successMessage, errorMessage, routerRefresh, router]);

  return { submitting, submit };
}

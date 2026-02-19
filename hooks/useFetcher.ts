'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseFetcherOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseFetcherReturn<T> {
  data: T | undefined;
  error: Error | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useFetcher<T>(
  fetchFn: () => Promise<T>,
  options: UseFetcherOptions<T> = {}
): UseFetcherReturn<T> {
  const { initialData, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, onSuccess, onError]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, error, loading, refresh };
}

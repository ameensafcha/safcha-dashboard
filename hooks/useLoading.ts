'use client';

import { useState, useCallback } from 'react';

interface UseLoadingReturn {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  withLoading: <T>(fn: () => Promise<T>) => Promise<T | undefined>;
}

export function useLoading(initialLoading = false): UseLoadingReturn {
  const [loading, setLoading] = useState(initialLoading);

  const withLoading = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
    setLoading(true);
    try {
      const result = await fn();
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, setLoading, withLoading };
}

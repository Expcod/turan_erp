"use client";

import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiResult<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
  setData: (data: T | null) => void;
}

export function useApi<T>(
  fetchFn: () => Promise<T>,
  dependencies: unknown[] = []
): UseApiResult<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchFn();
      setState({ data, loading: false, error: null });
    } catch (err) {
      const message = err instanceof ApiError 
        ? err.message 
        : err instanceof Error 
          ? err.message 
          : 'An error occurred';
      setState({ data: null, loading: false, error: message });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    refetch: fetchData,
    setData,
  };
}

interface UseMutationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseMutationResult<T, P> extends UseMutationState<T> {
  mutate: (params: P) => Promise<T | null>;
  reset: () => void;
}

export function useMutation<T, P = void>(
  mutationFn: (params: P) => Promise<T>
): UseMutationResult<T, P> {
  const [state, setState] = useState<UseMutationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (params: P): Promise<T | null> => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await mutationFn(params);
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const message = err instanceof ApiError 
        ? err.message 
        : err instanceof Error 
          ? err.message 
          : 'An error occurred';
      setState({ data: null, loading: false, error: message });
      return null;
    }
  }, [mutationFn]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Enterprise-level background sync for offline support
 */
export function useBackgroundSync() {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(true);
  const syncQueueRef = useRef<Array<{ queryKey: string[], data: any }>>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Process sync queue when coming back online
      syncQueueRef.current.forEach(({ queryKey, data }) => {
        queryClient.setQueryData(queryKey, data);
      });
      syncQueueRef.current = [];
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient]);

  const queueForSync = useCallback((queryKey: string[], data: any) => {
    if (!isOnline) {
      syncQueueRef.current.push({ queryKey, data });
    }
  }, [isOnline]);

  return { isOnline, queueForSync };
}

/**
 * Smart cache management with LRU eviction
 */
export function useSmartCache() {
  const queryClient = useQueryClient();
  const accessTimesRef = useRef(new Map<string, number>());
  const maxCacheSize = 50; // Adjust based on memory constraints

  const trackAccess = useCallback((queryKey: string[]) => {
    const key = JSON.stringify(queryKey);
    accessTimesRef.current.set(key, Date.now());
  }, []);

  const evictLRU = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    if (queries.length > maxCacheSize) {
      // Sort by last access time
      const sortedQueries = queries
        .map(query => ({
          query,
          lastAccess: accessTimesRef.current.get(JSON.stringify(query.queryKey)) || 0
        }))
        .sort((a, b) => a.lastAccess - b.lastAccess);

      // Remove oldest queries
      const toRemove = sortedQueries.slice(0, queries.length - maxCacheSize);
      toRemove.forEach(({ query }) => {
        cache.remove(query);
        accessTimesRef.current.delete(JSON.stringify(query.queryKey));
      });
    }
  }, [queryClient, maxCacheSize]);

  // Periodic cleanup
  useEffect(() => {
    const interval = setInterval(evictLRU, 60000); // Every minute
    return () => clearInterval(interval);
  }, [evictLRU]);

  return { trackAccess, evictLRU };
}

/**
 * Adaptive loading based on connection speed
 */
export function useAdaptiveLoading() {
  const [connectionSpeed, setConnectionSpeed] = useState<'slow' | 'fast'>('fast');
  const [shouldPreload, setShouldPreload] = useState(true);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const updateConnectionSpeed = () => {
        const effectiveType = connection.effectiveType;
        const isSlowConnection = effectiveType === 'slow-2g' || effectiveType === '2g';
        
        setConnectionSpeed(isSlowConnection ? 'slow' : 'fast');
        setShouldPreload(!isSlowConnection);
      };

      updateConnectionSpeed();
      connection.addEventListener('change', updateConnectionSpeed);

      return () => {
        connection.removeEventListener('change', updateConnectionSpeed);
      };
    }
  }, []);

  const getOptimalChunkSize = useCallback(() => {
    return connectionSpeed === 'slow' ? 10 : 50;
  }, [connectionSpeed]);

  const getOptimalStaleTime = useCallback(() => {
    return connectionSpeed === 'slow' ? 10 * 60 * 1000 : 5 * 60 * 1000;
  }, [connectionSpeed]);

  return {
    connectionSpeed,
    shouldPreload,
    getOptimalChunkSize,
    getOptimalStaleTime,
  };
}

/**
 * Request deduplication and batching
 */
export function useRequestOptimization() {
  const requestMapRef = useRef(new Map<string, Promise<any>>());
  const batchedRequestsRef = useRef(new Map<string, any[]>());
  const batchTimeoutRef = useRef<NodeJS.Timeout>();

  const deduplicateRequest = useCallback(<T>(key: string, requestFn: () => Promise<T>): Promise<T> => {
    if (requestMapRef.current.has(key)) {
      return requestMapRef.current.get(key)!;
    }

    const promise = requestFn().finally(() => {
      requestMapRef.current.delete(key);
    });

    requestMapRef.current.set(key, promise);
    return promise;
  }, []);

  const batchRequest = useCallback((batchKey: string, request: any, batchSize = 10, delay = 100) => {
    if (!batchedRequestsRef.current.has(batchKey)) {
      batchedRequestsRef.current.set(batchKey, []);
    }

    const batch = batchedRequestsRef.current.get(batchKey)!;
    batch.push(request);

    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }

    return new Promise((resolve) => {
      batchTimeoutRef.current = setTimeout(() => {
        if (batch.length >= batchSize || batch.length > 0) {
          // Process batch
          const batchToProcess = [...batch];
          batch.length = 0; // Clear batch
          
          // Execute batched requests
          Promise.all(batchToProcess).then(resolve);
        }
      }, delay);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, []);

  return { deduplicateRequest, batchRequest };
}

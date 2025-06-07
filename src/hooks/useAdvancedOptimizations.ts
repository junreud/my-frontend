'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Advanced resource preloader with intersection observer
 * Implements enterprise-level preloading strategies used by Netflix, Airbnb
 */
export function useResourcePreloader() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const preloadedResourcesRef = useRef(new Set<string>());

  // Preload different types of resources
  const preloadResource = useCallback(async (url: string, type: string) => {
    try {
      switch (type) {
        case 'image':
          const img = new Image();
          img.src = url;
          break;
        
        case 'script':
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'script';
          link.href = url;
          document.head.appendChild(link);
          break;
        
        case 'style':
          const styleLink = document.createElement('link');
          styleLink.rel = 'preload';
          styleLink.as = 'style';
          styleLink.href = url;
          document.head.appendChild(styleLink);
          break;
        
        case 'fetch':
        default:
          // Use requestIdleCallback for non-critical fetches
          if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => {
              fetch(url, { mode: 'cors' }).catch(() => {
                // Silently handle preload failures
              });
            });
          } else {
            setTimeout(() => {
              fetch(url, { mode: 'cors' }).catch(() => {
                // Silently handle preload failures
              });
            }, 0);
          }
          break;
      }
    } catch (error) {
      // Silently handle preload errors to not affect main functionality
      console.debug('Preload failed for:', url, error);
    }
  }, []);

  // Create intersection observer for viewport-based preloading
  useEffect(() => {
    if (typeof window === 'undefined') return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const preloadUrl = element.dataset.preload;
            const preloadType = element.dataset.preloadType || 'fetch';
            
            if (preloadUrl && !preloadedResourcesRef.current.has(preloadUrl)) {
              preloadResource(preloadUrl, preloadType);
              preloadedResourcesRef.current.add(preloadUrl);
            }
          }
        });
      },
      {
        rootMargin: '100px', // Start preloading 100px before element enters viewport
        threshold: 0.1
      }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [preloadResource]);

  // Register element for intersection-based preloading
  const registerPreloadElement = useCallback((element: HTMLElement | null) => {
    if (!element || !observerRef.current) return;
    
    observerRef.current.observe(element);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.unobserve(element);
      }
    };
  }, []);

  // Preload critical resources immediately
  const preloadCritical = useCallback((resources: Array<{ url: string; type: string }>) => {
    resources.forEach(({ url, type }) => {
      if (!preloadedResourcesRef.current.has(url)) {
        preloadResource(url, type);
        preloadedResourcesRef.current.add(url);
      }
    });
  }, [preloadResource]);

  return {
    registerPreloadElement,
    preloadCritical,
    preloadResource
  };
}

/**
 * Request batching and deduplication hook
 * Implements enterprise-level request optimization
 */
export function useRequestOptimization() {
  const batchRef = useRef<Map<string, {
    requests: Array<() => Promise<unknown>>;
    timeout: NodeJS.Timeout;
  }>>(new Map());
  
  const pendingRequestsRef = useRef<Map<string, Promise<unknown>>>(new Map());

  // Batch multiple requests together
  const batchRequest = useCallback(<T>(
    batchKey: string,
    request: () => Promise<T>,
    delay: number = 50
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      const batch = batchRef.current.get(batchKey);
      
      if (batch) {
        // Add to existing batch
        batch.requests.push(async () => {
          try {
            const result = await request();
            resolve(result);
            return result;
          } catch (error) {
            reject(error);
            throw error;
          }
        });
      } else {
        // Create new batch
        const timeout = setTimeout(async () => {
          const currentBatch = batchRef.current.get(batchKey);
          if (currentBatch) {
            batchRef.current.delete(batchKey);
            
            // Execute all batched requests
            try {
              await Promise.all(currentBatch.requests.map(req => req()));
            } catch (error) {
              console.error('Batch execution error:', error);
            }
          }
        }, delay);
        
        batchRef.current.set(batchKey, {
          requests: [async () => {
            try {
              const result = await request();
              resolve(result);
              return result;
            } catch (error) {
              reject(error);
              throw error;
            }
          }],
          timeout
        });
      }
    });
  }, []);

  // Deduplicate identical requests
  const deduplicateRequest = useCallback(<T>(
    requestKey: string,
    request: () => Promise<T>
  ): Promise<T> => {
    const existing = pendingRequestsRef.current.get(requestKey);
    
    if (existing) {
      return existing as Promise<T>;
    }
    
    const promise = request().finally(() => {
      pendingRequestsRef.current.delete(requestKey);
    });
    
    pendingRequestsRef.current.set(requestKey, promise);
    return promise;
  }, []);

  // Clear all pending batches and requests
  const clearPending = useCallback(() => {
    batchRef.current.forEach(batch => clearTimeout(batch.timeout));
    batchRef.current.clear();
    pendingRequestsRef.current.clear();
  }, []);

  return {
    batchRequest,
    deduplicateRequest,
    clearPending
  };
}

/**
 * Memory optimization hook with cleanup strategies
 * Implements enterprise-level memory management
 */
export function useMemoryOptimization() {
  const cleanupTasksRef = useRef<Array<() => void>>([]);
  const memoryPressureRef = useRef(false);

  // Trigger all cleanup tasks
  const triggerCleanup = useCallback(() => {
    cleanupTasksRef.current.forEach(task => {
      try {
        task();
      } catch (error) {
        console.error('Cleanup task failed:', error);
      }
    });
  }, []);

  useEffect(() => {
    // Monitor memory pressure if supported
    if ('memory' in performance && 'addEventListener' in performance) {
      const handleMemoryWarning = () => {
        memoryPressureRef.current = true;
        triggerCleanup();
      };

      // Experimental API may not be available
      performance.addEventListener?.('memory-warning', handleMemoryWarning);

      return () => {
        // Experimental API may not be available
        performance.removeEventListener?.('memory-warning', handleMemoryWarning);
      };
    }
  }, [triggerCleanup]);

  // Register cleanup task
  const registerCleanupTask = useCallback((task: () => void) => {
    cleanupTasksRef.current.push(task);
    
    return () => {
      const index = cleanupTasksRef.current.indexOf(task);
      if (index > -1) {
        cleanupTasksRef.current.splice(index, 1);
      }
    };
  }, []);

  // Force garbage collection if available (dev mode)
  const forceGC = useCallback(() => {
    if (process.env.NODE_ENV === 'development' && 'gc' in window) {
      // Dev tools API may not be available
      (window as { gc?: () => void }).gc?.();
    }
  }, []);

  // Get memory usage if available
  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      interface MemoryInfo {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      }
      
      const memoryInfo = (performance as { memory: MemoryInfo }).memory;
      return {
        used: memoryInfo.usedJSHeapSize,
        total: memoryInfo.totalJSHeapSize,
        limit: memoryInfo.jsHeapSizeLimit,
        pressure: memoryPressureRef.current
      };
    }
    return null;
  }, []);

  return {
    registerCleanupTask,
    triggerCleanup,
    forceGC,
    getMemoryUsage,
    isMemoryPressure: memoryPressureRef.current
  };
}

const advancedOptimizations = {
  useResourcePreloader,
  useRequestOptimization,
  useMemoryOptimization
};

export default advancedOptimizations;

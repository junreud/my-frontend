'use client';

import { useEffect, useRef, useCallback } from 'react';

// Performance API 확장 타입
interface ExtendedPerformanceEntry extends PerformanceEntry {
  processingStart?: number;
  hadRecentInput?: boolean;
  value?: number;
  responseStart?: number;
}

// Global window 타입 확장
declare global {
  interface Window {
    gtag?: (command: string, action: string, options: Record<string, unknown>) => void;
  }
}

/**
 * Performance monitoring hook using Web Vitals
 * Tracks Core Web Vitals and custom performance metrics
 */
export function useWebVitals() {
  const metricsRef = useRef({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
    customMetrics: {} as Record<string, number>
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Track Web Vitals using Performance Observer
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              metricsRef.current.fcp = entry.startTime;
            }
            break;
          case 'largest-contentful-paint':
            metricsRef.current.lcp = entry.startTime;
            break;
          case 'first-input':
            metricsRef.current.fid = (entry as ExtendedPerformanceEntry).processingStart! - entry.startTime;
            break;
          case 'layout-shift':
            if (!(entry as ExtendedPerformanceEntry).hadRecentInput) {
              metricsRef.current.cls += (entry as ExtendedPerformanceEntry).value!;
            }
            break;
          case 'navigation':
            metricsRef.current.ttfb = (entry as ExtendedPerformanceEntry).responseStart!;
            break;
        }
      }
    });

    // Start observing
    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift', 'navigation'] });
    } catch (e) {
      console.warn('Performance Observer not supported:', e);
    }

    return () => observer.disconnect();
  }, []);

  const trackCustomMetric = useCallback((name: string, value: number) => {
    metricsRef.current.customMetrics[name] = value;
    
    // Report to analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'custom_metric', {
        metric_name: name,
        metric_value: value,
      });
    }
  }, []);

  const getMetrics = useCallback(() => ({ ...metricsRef.current }), []);

  return { trackCustomMetric, getMetrics };
}

/**
 * Smart prefetching hook for critical resources
 */
export function useSmartPrefetch() {
  const prefetchedResources = useRef(new Set<string>());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const prefetchResource = useCallback((url: string, type: 'script' | 'style' | 'image' | 'fetch' = 'fetch') => {
    if (prefetchedResources.current.has(url)) return;
    
    prefetchedResources.current.add(url);

    switch (type) {
      case 'script':
        const scriptLink = document.createElement('link');
        scriptLink.rel = 'preload';
        scriptLink.as = 'script';
        scriptLink.href = url;
        document.head.appendChild(scriptLink);
        break;
        
      case 'style':
        const styleLink = document.createElement('link');
        styleLink.rel = 'preload';
        styleLink.as = 'style';
        styleLink.href = url;
        document.head.appendChild(styleLink);
        break;
        
      case 'image':
        const img = new Image();
        img.src = url;
        break;
        
      case 'fetch':
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(() => {
            fetch(url, { 
              method: 'GET',
              credentials: 'include',
              cache: 'force-cache'
            }).catch(() => {});
          });
        } else {
          setTimeout(() => {
            fetch(url, { 
              method: 'GET',
              credentials: 'include',
              cache: 'force-cache'
            }).catch(() => {});
          }, 100);
        }
        break;
    }
  }, []);

  const prefetchOnIntersection = useCallback((element: Element, urls: string[]) => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              urls.forEach(url => prefetchResource(url));
              observerRef.current?.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '100px' }
      );
    }

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.unobserve(element);
      }
    };
  }, [prefetchResource]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { prefetchResource, prefetchOnIntersection };
}

/**
 * Memory optimization hook
 */
export function useMemoryOptimization() {
  const cleanupTasks = useRef<(() => void)[]>([]);

  const addCleanupTask = useCallback((task: () => void) => {
    cleanupTasks.current.push(task);
  }, []);

  const runCleanup = useCallback(() => {
    cleanupTasks.current.forEach(task => {
      try {
        task();
      } catch (e) {
        console.warn('Cleanup task failed:', e);
      }
    });
    cleanupTasks.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      runCleanup();
    };
  }, [runCleanup]);

  // Cleanup on memory pressure
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMemoryPressure = () => {
      runCleanup();
    };

    // Listen for memory pressure events
    if ('memory' in performance && 'addEventListener' in performance) {
      const perfWithEvents = performance as Performance & {
        addEventListener(type: 'memorywarning', listener: () => void): void;
        removeEventListener(type: 'memorywarning', listener: () => void): void;
      };
      
      perfWithEvents.addEventListener('memorywarning', handleMemoryPressure);
      
      return () => {
        perfWithEvents.removeEventListener('memorywarning', handleMemoryPressure);
      };
    }
  }, [runCleanup]);

  return { addCleanupTask, runCleanup };
}

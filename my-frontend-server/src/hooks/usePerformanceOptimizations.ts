'use client';

import React, { useMemo, memo, useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Performance API 확장 타입
interface ExtendedPerformanceEntry extends PerformanceEntry {
  processingStart?: number;
  hadRecentInput?: boolean;
  value?: number;
  responseStart?: number;
}

/**
 * Enterprise-level performance hook for aggressive prefetching
 * Used by top companies like Netflix, Airbnb for instant navigation
 */
export function useAgressivePrefetch() {
  const queryClient = useQueryClient();
  const [isIdle, setIsIdle] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Detect when browser is idle
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleIdle = () => setIsIdle(true);
    const handleActive = () => setIsIdle(false);

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(handleIdle);
    }

    document.addEventListener('mousemove', handleActive);
    document.addEventListener('keydown', handleActive);
    document.addEventListener('scroll', handleActive);

    return () => {
      document.removeEventListener('mousemove', handleActive);
      document.removeEventListener('keydown', handleActive);
      document.removeEventListener('scroll', handleActive);
    };
  }, []);

  // Viewport-based prefetching
  const prefetchInViewport = React.useCallback((element: Element, queryKey: string[], queryFn: () => Promise<unknown>) => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              queryClient.prefetchQuery({
                queryKey,
                queryFn,
                staleTime: 5 * 60 * 1000, // 5 minutes
              });
            }
          });
        },
        { rootMargin: '50px' }
      );
    }

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.unobserve(element);
      }
    };
  }, [queryClient]);

  // Aggressive background prefetching when idle
  const backgroundPrefetch = React.useCallback((queries: Array<{ queryKey: string[], queryFn: () => Promise<unknown> }>) => {
    if (!isIdle) return;

    queries.forEach(({ queryKey, queryFn }) => {
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: 30 * 60 * 1000, // 30 minutes for background prefetch
      });
    });
  }, [isIdle, queryClient]);

  return {
    isIdle,
    prefetchInViewport,
    backgroundPrefetch,
  };
}

/**
 * Resource preloader for critical assets
 */
export function useResourcePreloader() {
  const preloadedRef = useRef(new Set<string>());

  const preloadImage = React.useCallback((src: string): Promise<void> => {
    if (preloadedRef.current.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        preloadedRef.current.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const preloadFont = React.useCallback((fontFamily: string, fontWeight = '400') => {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = `/fonts/${fontFamily}-${fontWeight}.woff2`;
    
    document.head.appendChild(link);
  }, []);

  const preloadScript = React.useCallback((src: string): Promise<void> => {
    if (preloadedRef.current.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => {
        preloadedRef.current.add(src);
        resolve();
      };
      script.onerror = reject;
      
      document.head.appendChild(script);
    });
  }, []);

  return {
    preloadImage,
    preloadFont,
    preloadScript,
  };
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Observe performance metrics
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
            }
            break;
          case 'largest-contentful-paint':
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
            break;
          case 'first-input':
            setMetrics(prev => ({ ...prev, fid: (entry as ExtendedPerformanceEntry).processingStart! - entry.startTime }));
            break;
          case 'layout-shift':
            if (!(entry as ExtendedPerformanceEntry).hadRecentInput) {
              setMetrics(prev => ({ ...prev, cls: prev.cls + (entry as ExtendedPerformanceEntry).value! }));
            }
            break;
          case 'navigation':
            setMetrics(prev => ({ ...prev, ttfb: (entry as ExtendedPerformanceEntry).responseStart! }));
            break;
        }
      });
    });

    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift', 'navigation'] });

    return () => observer.disconnect();
  }, []);

  return metrics;
}

/**
 * Memory optimization for large datasets
 */
export function useVirtualization<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );

    return {
      start: Math.max(0, start - overscan),
      end,
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index,
    }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    visibleRange,
    totalHeight,
    setScrollTop,
  };
}

/**
 * Critical rendering path optimization
 */
export const CriticalCSS = memo(() => {
  useEffect(() => {
    // Inject critical CSS for above-the-fold content
    const criticalCSS = `
      .critical-above-fold {
        content-visibility: auto;
        contain-intrinsic-size: 0 500px;
      }
      .lazy-below-fold {
        content-visibility: auto;
        contain-intrinsic-size: 0 200px;
      }
    `;

    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
});

CriticalCSS.displayName = 'CriticalCSS';

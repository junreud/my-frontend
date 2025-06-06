'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useResourcePreloader, useMemoryOptimization } from '@/hooks/useAdvancedOptimizations';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  blurDataURL?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Progressive image loading with blur-up effect
 * Implements enterprise-level image optimization used by Medium, Unsplash
 */
export const ProgressiveImage = memo<ProgressiveImageProps>(({
  src,
  alt,
  className = '',
  placeholder,
  blurDataURL,
  priority = false,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder || blurDataURL || '');
  
  const { registerPreloadElement } = useResourcePreloader();
  const { registerCleanupTask } = useMemoryOptimization();

  useEffect(() => {
    const img = new Image();
    
    const handleLoad = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };

    const handleError = (error: Event) => {
      setIsError(true);
      onError?.(new Error('Failed to load image'));
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    
    // Start loading the full image
    img.src = src;

    // Register cleanup
    const cleanup = registerCleanupTask(() => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    });

    return () => {
      cleanup();
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [src, onLoad, onError, registerCleanupTask]);

  if (isError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <span className="text-gray-400 text-sm">이미지 로드 실패</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={currentSrc}
        alt={alt}
        className={`
          w-full h-full object-cover transition-all duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-70 blur-sm'}
          ${!currentSrc ? 'hidden' : ''}
        `}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="w-full h-full" />
        </div>
      )}
    </div>
  );
});

ProgressiveImage.displayName = 'ProgressiveImage';

interface ProgressiveTabsProps {
  children: React.ReactNode;
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  preloadTabs?: boolean;
}

/**
 * Progressive tab loading with content preloading
 * Implements enterprise-level progressive enhancement
 */
export const ProgressiveTabs = memo<ProgressiveTabsProps>(({
  children,
  defaultTab,
  onTabChange,
  preloadTabs = true
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || '');
  const [loadedTabs, setLoadedTabs] = useState(new Set([defaultTab || '']));
  const { preloadCritical } = useResourcePreloader();

  // Preload tab content based on user interaction patterns
  useEffect(() => {
    if (preloadTabs && activeTab) {
      // Preload adjacent tabs for faster switching
      const tabElements = document.querySelectorAll('[data-tab-id]');
      const currentIndex = Array.from(tabElements).findIndex(
        el => el.getAttribute('data-tab-id') === activeTab
      );
      
      // Preload next and previous tabs
      const adjacentTabs = [
        tabElements[currentIndex + 1]?.getAttribute('data-tab-id'),
        tabElements[currentIndex - 1]?.getAttribute('data-tab-id')
      ].filter(Boolean);

      adjacentTabs.forEach(tabId => {
        if (tabId && !loadedTabs.has(tabId)) {
          setTimeout(() => {
            setLoadedTabs(prev => new Set([...prev, tabId]));
          }, 100);
        }
      });
    }
  }, [activeTab, loadedTabs, preloadTabs]);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
    setLoadedTabs(prev => new Set([...prev, tabId]));
    onTabChange?.(tabId);
  }, [onTabChange]);

  return (
    <div className="progressive-tabs">
      {/* Tab content with progressive loading */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const tabId = child.props['data-tab-id'];
          const isActive = tabId === activeTab;
          const isLoaded = loadedTabs.has(tabId);
          
          return React.cloneElement(child as React.ReactElement<any>, {
            'data-tab-loaded': isLoaded,
            'data-tab-active': isActive,
            style: {
              display: isActive ? 'block' : 'none',
            }
          });
        }
        return child;
      })}
    </div>
  );
});

ProgressiveTabs.displayName = 'ProgressiveTabs';

interface LazyContentProps {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  fallback?: React.ReactNode;
  onVisible?: () => void;
}

/**
 * Lazy content loading with intersection observer
 * Implements enterprise-level lazy loading patterns
 */
export const LazyContent = memo<LazyContentProps>(({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  fallback,
  onVisible
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [elementRef, setElementRef] = useState<HTMLDivElement | null>(null);
  
  const { registerCleanupTask } = useMemoryOptimization();

  useEffect(() => {
    if (!elementRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            onVisible?.();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(elementRef);

    const cleanup = registerCleanupTask(() => {
      observer.disconnect();
    });

    return () => {
      cleanup();
      observer.disconnect();
    };
  }, [elementRef, threshold, rootMargin, isVisible, onVisible, registerCleanupTask]);

  return (
    <div ref={setElementRef} className="lazy-content">
      {isVisible ? children : (fallback || <Skeleton className="h-32 w-full" />)}
    </div>
  );
});

LazyContent.displayName = 'LazyContent';

interface SmartPrefetchProps {
  href: string;
  children: React.ReactNode;
  prefetchOn?: 'hover' | 'visible' | 'immediate';
  prefetchDelay?: number;
  className?: string;
  onClick?: () => void;
}

/**
 * Smart prefetching link with multiple trigger strategies
 * Implements enterprise-level prefetching used by Next.js, Gatsby
 */
export const SmartPrefetch = memo<SmartPrefetchProps>(({
  href,
  children,
  prefetchOn = 'hover',
  prefetchDelay = 100,
  className = '',
  onClick
}) => {
  const [isPrefetched, setIsPrefetched] = useState(false);
  const { preloadResource, registerPreloadElement } = useResourcePreloader();
  const { registerCleanupTask } = useMemoryOptimization();

  const prefetch = useCallback(() => {
    if (!isPrefetched) {
      preloadResource(href, 'fetch');
      setIsPrefetched(true);
    }
  }, [href, isPrefetched, preloadResource]);

  const handleMouseEnter = useCallback(() => {
    if (prefetchOn === 'hover') {
      setTimeout(prefetch, prefetchDelay);
    }
  }, [prefetchOn, prefetch, prefetchDelay]);

  const handleVisible = useCallback(() => {
    if (prefetchOn === 'visible') {
      prefetch();
    }
  }, [prefetchOn, prefetch]);

  useEffect(() => {
    if (prefetchOn === 'immediate') {
      prefetch();
    }
  }, [prefetchOn, prefetch]);

  // Register for intersection-based prefetching
  useEffect(() => {
    if (prefetchOn === 'visible') {
      return registerPreloadElement(document.querySelector(`[href="${href}"]`) as HTMLElement);
    }
  }, [prefetchOn, href, registerPreloadElement]);

  return (
    <a
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      data-preload={prefetchOn === 'visible' ? href : undefined}
      data-preload-type="fetch"
    >
      {children}
    </a>
  );
});

SmartPrefetch.displayName = 'SmartPrefetch';

export default {
  ProgressiveImage,
  ProgressiveTabs,
  LazyContent,
  SmartPrefetch
};

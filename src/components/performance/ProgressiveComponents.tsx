'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import Image from 'next/image'; // Import next/image
import { Skeleton } from '@/components/ui/skeleton';
import { useResourcePreloader, useMemoryOptimization } from '@/hooks/useAdvancedOptimizations';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  width: number; // Added: required for sizing
  height: number; // Added: required for sizing
  className?: string;
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
  width,
  height,
  className = '',
  blurDataURL,
  priority = false,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  
  // Hooks are kept assuming they might have other side effects or are part of a broader pattern.
  // If their sole purpose was for the manual new Image() logic, they might be removable here.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { registerPreloadElement } = useResourcePreloader();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { registerCleanupTask } = useMemoryOptimization();

  // Removed useEffect for manual image loading (new Image(), addEventListener, etc.)
  // next/image handles its own loading lifecycle.

  if (isError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ width, height }} // Ensure error placeholder respects dimensions
      >
        <span className="text-gray-400 text-sm">이미지 로드 실패</span>
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden ${className}`} // Parent needs to be relative for layout="fill"
      style={{ width, height }} // Set dimensions on the container
    >
      <Image
        src={src}
        alt={alt}
        layout="fill" // Fills the parent container
        objectFit="cover" // Behaves like CSS object-fit: cover
        className={`
          transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'} 
        `} // Apply fade-in transition
        placeholder={blurDataURL ? 'blur' : 'empty'} // Use blur placeholder if available
        blurDataURL={blurDataURL}
        priority={priority}
        onLoadingComplete={() => {
          setIsLoaded(true);
          onLoad?.();
        }}
        onError={() => {
          setIsError(true);
          onError?.(new Error(`Failed to load image: ${src}`));
        }}
      />
      {/* Show skeleton only if no blur placeholder is active and image hasn't loaded */}
      {!isLoaded && !blurDataURL && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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

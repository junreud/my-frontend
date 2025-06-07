'use client';

import React, { Suspense, lazy, memo, useState, useTransition, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Enterprise-level code splitting with intelligent loading
 * Used by companies like Spotify, Discord for optimal performance
 */

// Lazy load heavy components with chunk names for better caching
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const KeywordRankingChart = lazy(() => 
  import('@/app/dashboard/marketing-keywords/KeywordRankingChart').then(module => ({
    default: module.default
  }))
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const KeywordRankingTable = lazy(() => 
  import('@/app/dashboard/marketing-keywords/KeywordRankingTableVirtualized').then(module => ({
    default: module.default
  }))
);

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Smart lazy loading wrapper with error boundaries and suspense
 */
export const LazyComponentLoader = memo(({ 
  children, 
  fallback, 
  errorFallback: ErrorFallback,
  onError 
}: LazyComponentProps) => {
  const defaultFallback = <Skeleton className="h-64 w-full" />;
  const defaultErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="text-lg font-semibold text-red-800 mb-2">로딩 오류</h3>
      <p className="text-red-600 mb-4">컴포넌트를 불러올 수 없습니다: {error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        다시 시도
      </button>
    </div>
  );

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback || defaultErrorFallback}
      onError={onError}
      onReset={() => window.location.reload()}
    >
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
});

LazyComponentLoader.displayName = 'LazyComponentLoader';

/**
 * Progressive enhancement for tabs - loads content only when visible
 */
interface ProgressiveTabsProps {
  defaultTab: string;
  tabs: Array<{
    id: string;
    label: string;
    content: () => React.ReactNode;
    preload?: boolean;
  }>;
}

export const ProgressiveTabs = memo(({ defaultTab, tabs }: ProgressiveTabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loadedTabs, setLoadedTabs] = useState(new Set([defaultTab]));
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tabId: string) => {
    startTransition(() => {
      setActiveTab(tabId);
      setLoadedTabs(prev => new Set([...prev, tabId]));
    });
  };

  const activeTabContent = useMemo(() => {
    const tab = tabs.find(t => t.id === activeTab);
    return tab && loadedTabs.has(activeTab) ? tab.content() : null;
  }, [activeTab, tabs, loadedTabs]);

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            disabled={isPending}
          >
            {tab.label}
            {isPending && activeTab === tab.id && (
              <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {isPending && (
          <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
            <Skeleton className="h-32 w-full" />
          </div>
        )}
        
        <LazyComponentLoader>
          {activeTabContent}
        </LazyComponentLoader>
      </div>
    </div>
  );
});

ProgressiveTabs.displayName = 'ProgressiveTabs';

/**
 * Smart image loading with progressive enhancement
 */
interface SmartImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  blur?: boolean;
}

export const SmartImage = memo(({ 
  src, 
  alt, 
  width, 
  height, 
  className,
  priority = false,
  blur = true 
}: SmartImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => setIsLoaded(true);
  const handleError = () => setHasError(true);

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">이미지 로드 실패</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <Skeleton className="absolute inset-0" />
      )}
      
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${blur && !isLoaded ? 'blur-sm' : ''}`}
        style={{
          contentVisibility: 'auto',
          containIntrinsicSize: `${width || 300}px ${height || 200}px`,
        }}
      />
    </div>
  );
});

SmartImage.displayName = 'SmartImage';

/**
 * Virtualized list for large datasets
 */
interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  height: number;
  className?: string;
}

export const VirtualizedList = memo(<T,>({ 
  items, 
  renderItem, 
  itemHeight, 
  height,
  className 
}: VirtualizedListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(height / itemHeight) + 2,
    items.length
  );

  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={visibleStart + index} style={{ height: itemHeight }}>
              {renderItem(item, visibleStart + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}) as <T>(props: VirtualizedListProps<T>) => JSX.Element;

// Add displayName property to the function
(VirtualizedList as any).displayName = 'VirtualizedList';

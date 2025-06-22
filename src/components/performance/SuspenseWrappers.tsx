'use client';

import React, { Suspense, lazy, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from 'react-error-boundary';

/**
 * Enterprise-level Suspense wrappers with error boundaries
 * Used by companies like Discord, Slack for graceful loading states
 */

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
      <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h2>
      <p className="text-red-600 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

// High-order component for lazy loading with Suspense
export function withSuspense<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  const SuspenseWrapper = (props: P) => (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={fallback || <ComponentSkeleton />}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );

  SuspenseWrapper.displayName = `withSuspense(${Component.displayName || Component.name})`;
  return SuspenseWrapper;
}

// Default loading skeleton
function ComponentSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-1/3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

// Specialized skeletons for different components
export function KeywordListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-12" />
          </div>
          <div className="mt-2 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="h-80 p-4">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="relative h-64">
        <div className="absolute inset-0 flex items-end justify-around">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-8"
              style={{ height: `${Math.random() * 60 + 20}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-6 border border-gray-200 rounded-lg">
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <KeywordListSkeleton />
      </div>
    </div>
  );
}

// Lazy loading utilities for code splitting
export const createLazyComponent = <P extends object>(
  componentImport: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(componentImport);
  return withSuspense(LazyComponent, fallback);
};

// Critical vs non-critical component wrapper
export function CriticalBoundary({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode 
}) {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <Suspense fallback={fallback || <ComponentSkeleton />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

export function NonCriticalBoundary({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode 
}) {
  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <div className="p-2 text-sm text-gray-500 border border-gray-200 rounded">
          <span>Optional component failed to load</span>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-2">
              <summary>Error details</summary>
              <pre className="text-xs mt-1">{error.message}</pre>
            </details>
          )}
        </div>
      )}
    >
      <Suspense fallback={fallback || <div className="animate-pulse bg-gray-100 h-32 rounded" />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

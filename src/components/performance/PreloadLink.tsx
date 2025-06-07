'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

interface PreloadLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetchOnHover?: boolean;
  prefetchOnMount?: boolean;
  queryKeys?: string[];
  onPrefetch?: () => Promise<void>;
}

/**
 * Enterprise-level PreloadLink with aggressive prefetching
 * - Preloads route and data on hover/mount
 * - Supports query prefetching
 * - Uses requestIdleCallback for performance
 * - Debounced prefetching to avoid excessive requests
 */
export function PreloadLink({ 
  href, 
  children, 
  className,
  prefetchOnHover = true,
  prefetchOnMount = false,
  queryKeys = [],
  onPrefetch
}: PreloadLinkProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const prefetchedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const performPrefetch = React.useCallback(async () => {
    if (prefetchedRef.current) return;
    
    prefetchedRef.current = true;
    
    // Use requestIdleCallback for better performance
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        router.prefetch(href);
        
        // Prefetch related queries
        if (onPrefetch) {
          onPrefetch();
        }
        
        // Warm up query cache
        queryKeys.forEach(key => {
          queryClient.prefetchQuery({
            queryKey: [key],
            staleTime: 30 * 1000, // 30 seconds
          });
        });
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        router.prefetch(href);
        if (onPrefetch) onPrefetch();
      }, 100);
    }
  }, [href, router, queryClient, queryKeys, onPrefetch]);

  // Prefetch on mount if enabled
  useEffect(() => {
    if (prefetchOnMount) {
      performPrefetch();
    }
  }, [prefetchOnMount, performPrefetch]);

  const handleMouseEnter = () => {
    if (!prefetchOnHover) return;
    
    // Debounce prefetch to avoid excessive requests
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      performPrefetch();
    }, 50); // 50ms debounce
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Optional: Add click analytics or loading state
    e.preventDefault();
    
    // Show instant feedback
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.7';
    
    router.push(href);
  };

  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      prefetch={false} // We handle prefetching manually
    >
      {children}
    </Link>
  );
}

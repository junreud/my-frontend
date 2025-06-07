import { QueryClient } from '@tanstack/react-query';

// Type definitions for query data
interface KeywordData {
  id: string;
  keyword: string;
  keywordId: string;
  isOptimistic?: boolean;
  createdAt: string;
}

interface RankingDetail {
  keyword: string;
  ranking: number;
  updatedAt: string;
}

interface RankingData {
  rankingDetails: RankingDetail[];
}

interface ErrorResponse {
  response?: {
    status: number;
  };
}

/**
 * Enterprise-level React Query configuration
 * Optimized for maximum performance and user experience
 */
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Aggressive stale time for better performance
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
        
        // Smart retry logic
        retry: (failureCount, error: unknown) => {
          // Don't retry on authentication errors
          const errorResponse = error as ErrorResponse;
          const status = errorResponse?.response?.status;
          if (status === 401 || status === 403) {
            return false;
          }
          // Exponential backoff for other errors
          return failureCount < 3;
        },
        
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Optimize refetch behavior
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        refetchOnMount: 'always',
        
        // Background refetch for better UX
        refetchInterval: 5 * 60 * 1000, // 5 minutes for critical data
        refetchIntervalInBackground: false,
        
        // Network mode for offline support
        networkMode: 'online',
      },
      mutations: {
        // Retry mutations on network failure
        retry: (failureCount, error: unknown) => {
          const errorResponse = error as ErrorResponse;
          const status = errorResponse?.response?.status;
          if (status && status >= 400 && status < 500) {
            return false; // Don't retry client errors
          }
          return failureCount < 2;
        },
        
        networkMode: 'online',
      },
    },
  });
};

/**
 * Query key factories for consistent cache management
 */
export const queryKeys = {
  // User-related queries
  user: () => ['user'] as const,
  userProfile: (userId: string) => ['user', 'profile', userId] as const,
  
  // Business-related queries  
  businesses: () => ['businesses'] as const,
  userBusinesses: (userId: string) => ['businesses', 'user', userId] as const,
  businessDetails: (businessId: string) => ['businesses', 'details', businessId] as const,
  
  // Keyword-related queries
  keywords: () => ['keywords'] as const,
  userKeywords: (userId: string, businessId?: string) => 
    businessId 
      ? ['keywords', 'user', userId, 'business', businessId] as const
      : ['keywords', 'user', userId] as const,
  keywordRankings: (userId: string, businessId: string) => 
    ['keywords', 'rankings', userId, businessId] as const,
  keywordHistory: (businessId: string, keywordId: string, days: number) => 
    ['keywords', 'history', businessId, keywordId, days] as const,
  
  // Analytics queries
  analytics: () => ['analytics'] as const,
  businessAnalytics: (businessId: string, period: string) => 
    ['analytics', 'business', businessId, period] as const,
} as const;

/**
 * Prefetch strategies for different scenarios
 */
export const prefetchStrategies = {
  // Critical path prefetching (login → dashboard)
  dashboardCriticalPath: async (queryClient: QueryClient, userId: string) => {
    const prefetchPromises = [
      queryClient.prefetchQuery({
        queryKey: queryKeys.userBusinesses(userId),
        staleTime: 2 * 60 * 1000, // 2 minutes
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.user(),
        staleTime: 5 * 60 * 1000, // 5 minutes
      }),
    ];
    
    await Promise.allSettled(prefetchPromises);
  },
  
  // Marketing keywords page prefetching
  marketingKeywordsPath: async (queryClient: QueryClient, userId: string, businessId: string) => {
    const prefetchPromises = [
      queryClient.prefetchQuery({
        queryKey: queryKeys.userKeywords(userId, businessId),
        staleTime: 1 * 60 * 1000, // 1 minute for keywords
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.keywordRankings(userId, businessId),
        staleTime: 30 * 1000, // 30 seconds for rankings
      }),
    ];
    
    await Promise.allSettled(prefetchPromises);
  },
  
  // Background prefetching for analytics
  backgroundAnalytics: async (queryClient: QueryClient, businessId: string) => {
    const periods = ['7d', '30d', '90d'];
    
    const prefetchPromises = periods.map(period =>
      queryClient.prefetchQuery({
        queryKey: queryKeys.businessAnalytics(businessId, period),
        staleTime: 5 * 60 * 1000, // 5 minutes
      })
    );
    
    await Promise.allSettled(prefetchPromises);
  },
} as const;

/**
 * Optimistic update helpers
 */
export const optimisticUpdates = {
  // Add keyword optimistically
  addKeyword: (queryClient: QueryClient, userId: string, businessId: string, keyword: string) => {
    const queryKey = queryKeys.userKeywords(userId, businessId);
    
    queryClient.setQueryData(queryKey, (old: KeywordData[] | undefined) => {
      if (!old) return old;
      
      const newKeyword: KeywordData = {
        id: `temp-${Date.now()}`,
        keyword,
        keywordId: `temp-${Date.now()}`,
        isOptimistic: true,
        createdAt: new Date().toISOString(),
      };
      
      return [...old, newKeyword];
    });
    
    return () => {
      queryClient.setQueryData(queryKey, (old: KeywordData[] | undefined) => {
        if (!old) return old;
        return old.filter((k) => !k.isOptimistic);
      });
    };
  },
  
  // Update ranking optimistically
  updateRanking: (queryClient: QueryClient, userId: string, businessId: string, keyword: string, newRank: number) => {
    const queryKey = queryKeys.keywordRankings(userId, businessId);
    
    queryClient.setQueryData(queryKey, (old: RankingData | undefined) => {
      if (!old?.rankingDetails) return old;
      
      return {
        ...old,
        rankingDetails: old.rankingDetails.map((detail) => 
          detail.keyword === keyword 
            ? { ...detail, ranking: newRank, updatedAt: new Date().toISOString() }
            : detail
        ),
      };
    });
    
    return () => {
      queryClient.invalidateQueries({ queryKey });
    };
  },
} as const;

/**
 * Cache warming utilities
 */
export const cacheWarming = {
  // Warm cache on app startup
  warmCriticalQueries: async (queryClient: QueryClient) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    
    // Warm up frequently accessed queries
    await prefetchStrategies.dashboardCriticalPath(queryClient, userId);
  },
  
  // Warm cache on route prefetch
  warmRouteQueries: async (queryClient: QueryClient, route: string, params: Record<string, string>) => {
    switch (route) {
      case '/dashboard/marketing-keywords':
        if (params.userId && params.businessId) {
          await prefetchStrategies.marketingKeywordsPath(queryClient, params.userId, params.businessId);
        }
        break;
      
      case '/dashboard/analytics':
        if (params.businessId) {
          await prefetchStrategies.backgroundAnalytics(queryClient, params.businessId);
        }
        break;
    }
  },
} as const;

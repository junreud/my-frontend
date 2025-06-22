'use client';

import { lazy } from 'react';

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

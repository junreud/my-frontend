"use client";

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useWorkHistories');

interface WorkHistoriesParams {
  enabled?: boolean;
  workTypes?: string[];
  executors?: string[];
  userId?: string | number;
}

export function useWorkHistories({ 
  enabled = true, 
  workTypes,
  executors,
  userId
}: WorkHistoriesParams = {}) {
  return useQuery({
    queryKey: ['work-histories', { workTypes, executors, userId }],
    queryFn: async () => {
      try {
        // Construct URL with query parameters
        let url = '/api/admin/work-histories';
        const params = new URLSearchParams();
        if (workTypes?.length) params.append('workTypes', workTypes.join(','));
        if (executors?.length) params.append('executors', executors.join(','));
        if (userId) params.append('userId', userId.toString());
        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;
        
        // API returns unwrapped array
        const response = await apiClient.get(url);
        return response.data;
      } catch (error) {
        logger.error('작업 이력 로드 중 오류:', error);
        throw error;
      }
    },
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
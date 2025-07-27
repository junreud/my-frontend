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
        
        // API returns wrapped response {success: true, message, data}
        const response = await apiClient.get(url);
        const responseData = response.data;
        
        // 백엔드 응답 구조 확인
        if (!responseData.success) {
          logger.warn('워크 히스토리 API 요청 실패:', responseData);
          return [];
        }
        
        const data = responseData.data;
        
        // 응답 데이터가 배열인지 확인
        if (!Array.isArray(data)) {
          logger.warn('워크 히스토리 응답이 배열이 아닙니다:', data);
          return [];
        }
        
        logger.debug('워크 히스토리 데이터 로드됨:', data);
        return data;
      } catch (error) {
        logger.error('작업 이력 로드 중 오류:', error);
        // 에러 발생 시 빈 배열 반환
        return [];
      }
    },
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
"use client";

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useUserWorkHistories');

// Work history data type
export interface WorkHistory {
  id: number;
  user_id: number;
  place_id: string;
  work_type: string;
  executor: string;
  contract_keyword: string | null;
  work_keyword: string | null;
  char_count: number | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  user_start_date: string | null;
  user_end_date: string | null;
  company_characteristics: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 현재 로그인한 사용자의 작업 이력을 조회하는 커스텀 훅
 */
export function useUserWorkHistories() {
  return useQuery({
    queryKey: ['user-work-histories'],
    queryFn: async (): Promise<WorkHistory[]> => {
      try {
        logger.info('사용자 작업 이력 조회 요청');
        const response = await apiClient.get('/api/user/work-histories');
        
        if (response.data.success) {
          logger.info(`사용자 작업 이력 ${response.data.data.length}개 로드됨`);
          return response.data.data;
        } else {
          throw new Error(response.data.message || '작업 이력을 가져오는데 실패했습니다');
        }
      } catch (error) {
        logger.error('작업 이력 로드 중 오류:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5분 동안 캐시 유지
  });
}
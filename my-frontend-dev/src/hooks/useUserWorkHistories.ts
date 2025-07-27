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
  return useQuery<WorkHistory[]>({
    queryKey: ['user-work-histories'],
    queryFn: async (): Promise<WorkHistory[]> => {
      try {
        // 클라이언트 사이드에서 토큰 확인
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (!token) {
            logger.warn('토큰이 없어 작업 이력을 조회할 수 없습니다');
            return [];
          }
        }

        logger.info('사용자 작업 이력 조회 요청');
        // API returns unwrapped array of work histories
        const response = await apiClient.get<WorkHistory[]>('/api/user/work-histories');
        const data = response.data;
        
        // 응답 데이터가 배열인지 확인
        if (!Array.isArray(data)) {
          logger.warn('작업 이력 응답이 배열이 아닙니다:', data);
          return [];
        }
        
        logger.info(`사용자 작업 이력 ${data.length}개 로드됨`);
        return data;
      } catch (error) {
        logger.error('작업 이력 로드 중 오류:', error);
        // 인증 에러인 경우 빈 배열 반환
        if (error instanceof Error && error.message.includes('로그인')) {
          return [];
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5분 동안 캐시 유지
    enabled: typeof window !== 'undefined', // 클라이언트 사이드에서만 실행
  });
}
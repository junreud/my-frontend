import { useQuery } from '@tanstack/react-query';
import { KeywordRankingData } from '@/types';
import apiClient from '@/lib/apiClient';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useKeywordRankingTable');

interface UseKeywordRankingTableProps {
  keyword: string;
  placeId: string | number;
  rangeValue: number; // 비교 기간 추가
  userId?: number | string;
  options?: { enabled?: boolean };
}

export function useKeywordRankingTable({ 
  keyword,
  placeId,
  rangeValue,
  userId,
  options
}: UseKeywordRankingTableProps) {

  const result = useQuery<KeywordRankingData, Error>({
    queryKey: [
      'keywordRankingTable',
      keyword,
      String(placeId),
      rangeValue,
      userId ? String(userId) : 'no-user'
    ],
    enabled: Boolean(keyword) && Boolean(placeId) && Boolean(userId) && (options?.enabled !== false),
    queryFn: async () => {
      if (!keyword || !placeId || !userId) {
        logger.warn('keyword, placeId 또는 userId가 없습니다.');
        throw new Error('필수 파라미터가 누락되었습니다.');
      }

      try {
        logger.info(`키워드 순위 테이블 조회 시작: keyword=${keyword}, placeId=${placeId}, rangeValue=${rangeValue}`);
        
        const response = await apiClient.get<KeywordRankingData>('/keyword/keyword-ranking-table', {
          params: {
            keyword,
            placeId: String(placeId),
            rangeValue
          }
        });

        const data = response.data;
        
        logger.info('키워드 순위 테이블 조회 성공:', {
          status: response.status,
          rankingDetailsCount: data.rankingDetails?.length || 0,
          keyword,
          placeId,
          rangeValue,
          hasData: data.metadata?.hasData
        });

        return data;
      } catch (error) {
        logger.error('키워드 순위 테이블 조회 실패:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5분간 캐시
    gcTime: 10 * 60 * 1000, // 10분간 메모리 유지
    refetchOnWindowFocus: false, // 윈도우 포커스시 리패치 방지
    refetchOnMount: false, // 마운트시 리패치 방지 (캐시된 데이터가 있으면)
    refetchInterval: false, // 자동 리패치 방지
  });

  return result;
}

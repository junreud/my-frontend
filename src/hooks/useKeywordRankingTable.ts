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

        // 표준 응답 형식 처리: { success: boolean, message: string, data: {...} }
        let actualData = response.data;
        if (actualData && typeof actualData === 'object' && 'success' in actualData && 'data' in actualData) {
          const wrappedResponse = actualData as unknown as { success: boolean; message: string; data: KeywordRankingData };
          actualData = wrappedResponse.data;
          logger.info('표준 응답 형식 감지 - data 필드 추출');
        }

        const data = actualData as KeywordRankingData;
        
        logger.info('키워드 순위 테이블 조회 성공:', {
          status: response.status,
          rankingDetailsCount: data.rankingDetails?.length || 0,
          keyword,
          placeId,
          rangeValue,
          hasData: data.metadata?.hasData
        });

        return data;
      } catch (error: unknown) {
        logger.error('키워드 순위 테이블 조회 실패:', error);
        
        // Handle 404 errors gracefully
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 404) {
            const friendlyMessage = `선택된 키워드 '${keyword}'가 해당 업체에 등록되지 않았습니다.`;
            logger.info(`업체 변경으로 인한 404 처리: ${friendlyMessage}`); // info level로 변경
            
            // Return empty data structure instead of throwing
            return {
              rankingDetails: [],
              rankingList: [],
              metadata: {
                hasData: false,
                keyword,
                placeId: String(placeId),
                message: friendlyMessage
              }
            } as KeywordRankingData;
          }
        }
        
        // Only log other errors
        logger.error('키워드 순위 테이블 조회 실패:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5분간 캐시
    gcTime: 10 * 60 * 1000, // 10분간 메모리 유지
    refetchOnWindowFocus: false, // 윈도우 포커스시 리패치 방지
    refetchOnMount: false, // 마운트시 리패치 방지 (캐시된 데이터가 있으면)
    refetchInterval: false, // 자동 리패치 방지
    retry: (failureCount, error) => {
      // 404 에러는 재시도하지 않음 (예상된 에러이므로)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          return false;
        }
      }
      // 다른 에러는 최대 2번 재시도
      return failureCount < 2;
    },
  });

  return result;
}

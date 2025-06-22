import { useQuery } from '@tanstack/react-query';
import { KeywordRankingDetail, KeywordRankData } from '@/types';
import apiClient from '@/lib/apiClient';
import { createLogger } from '@/lib/logger';
import { transformToChartData, getCurrentRanking } from '@/utils/dataTransformers';
import { useUser } from './useUser';

const logger = createLogger('useKeywordRankingDetails');

interface UseKeywordRankingDetailsProps {
  activeBusinessId?: number | string; // activeBusinessId로 변경 (필수!)
  keyword?: string;
  userId?: number | string;
  options?: { enabled?: boolean };
}

interface TransformedKeywordData {
  rankingDetails: KeywordRankingDetail[];
  chartData: ReturnType<typeof transformToChartData>;
  currentRanking: number | null;
  rankingList: KeywordRankData[] | null;
}

export function useKeywordRankingDetails({ 
  activeBusinessId,
  keyword,
  userId: explicitUserId,
  options
}: UseKeywordRankingDetailsProps) {

  const { data: userData } = useUser({ 
    enabled: !explicitUserId 
  });

  const userId = explicitUserId || userData?.id;

  const result = useQuery<KeywordRankingDetail[], Error, TransformedKeywordData>({
    queryKey: [
      'keywordRankingDetails',
      activeBusinessId ? String(activeBusinessId) : 'no-business',
      userId ? String(userId) : 'no-user',
      keyword || 'no-keyword'
    ],
    enabled: Boolean(activeBusinessId) && Boolean(userId) && (options?.enabled !== false),
    placeholderData: (previousData) => previousData, // Keep previous data while refetching
    queryFn: async () => {
      if (!activeBusinessId || !userId) {
        logger.warn('activeBusinessId 또는 userId가 없습니다.');
        return [];
      }

      try {
        const apiUrl = `/keyword/keyword-rankings-by-business?placeId=${activeBusinessId}`;
        logger.info(`API 호출 시도: ${apiUrl}`);
        
        const response = await apiClient.get(apiUrl);
        
        logger.info('API 응답 성공:', {
          status: response.status,
          dataStructure: response.data,
          dataType: typeof response.data,
          dataLength: Array.isArray(response.data) ? response.data.length : 'not array',
          firstItem: Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : null
        });

        // 백엔드에서 직접 배열을 반환하는 경우와 wrapped response 모두 처리
        const actualData = Array.isArray(response.data) ? response.data : (response.data?.data || response.data);

        // 빈 객체나 null/undefined인 경우 빈 배열 반환
        if (!actualData || (typeof actualData === 'object' && Object.keys(actualData).length === 0)) {
          logger.info('순위 데이터가 없습니다. 빈 배열을 반환합니다.');
          return [];
        }

        if (!Array.isArray(actualData)) {
          logger.error('순위 상세 데이터 형식 오류:', actualData);
          return [];
        }

        return actualData;
      } catch (error: unknown) {
        logger.error('키워드 순위 데이터 가져오기 실패:', error);
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response: { status: number; data: unknown } };
          logger.error('에러 응답 상태:', axiosError.response.status);
          logger.error('에러 응답 데이터:', axiosError.response.data);
        }
        // 에러가 발생해도 빈 배열을 반환하여 UI가 깨지지 않도록 함
        return [];
      }
    },
    select: (data) => {
      if (!Array.isArray(data)) {
        logger.error('데이터 변환 오류: 유효한 배열이 아님', data);
        return {
          rankingDetails: [],
          chartData: [],
          currentRanking: null,
          rankingList: null
        };
      }

      const rankingList: KeywordRankData[] = data.map(item => ({
        id: Number(item.id),
        keyword_id: Number(item.keyword_id),
        ranking: item.ranking === null ? 0 : Number(item.ranking),
        place_id: Number(item.place_id),
        place_name: item.place_name || '',
        category: item.category || undefined,
        receipt_review_count: item.receipt_review_count ?? null,
        blog_review_count: item.blog_review_count ?? null,
        savedCount: item.savedCount ?? null,
        crawled_at: item.crawled_at,
      }));

      return {
        rankingDetails: data,
        chartData: transformToChartData(data),
        currentRanking: getCurrentRanking(data) ?? null,
        rankingList
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  return result;
}
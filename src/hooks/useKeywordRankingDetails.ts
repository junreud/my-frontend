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
  userId: explicitUserId
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
    enabled: Boolean(activeBusinessId) && Boolean(userId),
    queryFn: async () => {
      if (!activeBusinessId || !userId) {
        logger.warn('activeBusinessId 또는 userId가 없습니다.');
        return [];
      }

      const response = await apiClient.get(
        `/api/keyword-ranking-details?placeId=${activeBusinessId}&userId=${userId}${keyword ? `&keyword=${encodeURIComponent(keyword)}` : ''}`
      );

      // 디버깅을 위한 API 응답 로깅 추가
      console.log('[Debug] Keyword API Response:', {
        responseData: response.data,
        firstItem: Array.isArray(response.data?.data) && response.data?.data.length > 0 
          ? response.data?.data[0] 
          : null,
        hasIsRestaurantFlag: Array.isArray(response.data?.data) && response.data?.data.length > 0
          ? 'isRestaurant' in response.data?.data[0]
          : false
      });

      const actualData = response.data?.data || response.data;

      if (!Array.isArray(actualData)) {
        logger.error('순위 상세 데이터 형식 오류:', response.data);
        return [];
      }

      return actualData;
    },
    select: (data) => {
      if (!Array.isArray(data)) {
        logger.error('데이터 변환 오류: 유효한 배열이 아님', data);
        return {
          rankingDetails: [],
          chartData: [],
          currentRanking: null,
          rankingList: []
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
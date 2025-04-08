// useKeywordRankingDetails.ts
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
  queryKey?: string[];
  enabled?: boolean;
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
      userId ? String(userId) : 'no-user'
    ],
    enabled: Boolean(activeBusinessId) && Boolean(userId),
    queryFn: async () => {
      if (!activeBusinessId || !userId) {
        logger.warn('activeBusinessId 또는 userId가 없습니다.');
        return [];
      }

      const response = await apiClient.get(
        `/api/keyword-ranking-details?placeId=${activeBusinessId}&userId=${userId}`
      );

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

      const filteredData = keyword
        ? data.filter(item => item.keyword === keyword)
        : data;

      if (!filteredData.length) {
        return {
          rankingDetails: [],
          chartData: [],
          currentRanking: null,
          rankingList: []
        };
      }

      const rankingList: KeywordRankData[] = filteredData.map(item => ({
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
        rankingDetails: filteredData,
        chartData: transformToChartData(filteredData),
        currentRanking: getCurrentRanking(filteredData) ?? null,
        rankingList
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  return result;
}
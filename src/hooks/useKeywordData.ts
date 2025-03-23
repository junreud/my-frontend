import { useQueries } from '@tanstack/react-query';
import { KeywordRankData, KeywordHistoricalData } from '@/types';
import apiClient from '@/lib/apiClient';

interface UseKeywordDataProps {
  placeId?: number | string;
  keyword?: string;
  historical?: boolean;
}
interface KeywordDataResult {
  data: KeywordRankData[];
  historicalData: KeywordHistoricalData[];
  chartData: KeywordHistoricalData[];
}

export function useKeywordData({ placeId, keyword, historical = false }: UseKeywordDataProps) {
  // 병렬 쿼리 실행을 위한 useQueries 사용
  const results = useQueries({
    queries: [
      {
        queryKey: ['keywordRanks', placeId, keyword],
        queryFn: async () => {
          if (!placeId || !keyword) return [];
          const response = await apiClient.get(`/api/keyword-ranks?placeId=${placeId}&keyword=${encodeURIComponent(keyword)}`);
          return response.data;
        },
        enabled: !!placeId && !!keyword,
        staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 신선한 상태로 유지
      },
      {
        queryKey: ['keywordHistory', placeId, keyword, historical],
        queryFn: async () => {
          if (!placeId || !keyword || !historical) return [];
          const response = await apiClient.get(`/api/keyword-history?placeId=${placeId}&keyword=${encodeURIComponent(keyword)}`);
          
          // 차트 데이터 변환
          const chartData = response.data.map((item: any) => ({
            date: item.crawled_at.split('T')[0],
            ranking: item.ranking,
            uv: 300 - item.ranking // 차트 시각화를 위한 변환
          }));
          
          return {
            historyData: response.data,
            chartData
          };
        },
        enabled: !!placeId && !!keyword && historical,
        staleTime: 1000 * 60 * 10, // 10분 동안 데이터를 신선한 상태로 유지
      }
    ]
  });

  // 현재 순위 데이터 쿼리
  const ranksQuery = results[0];
  // 히스토리 데이터 쿼리
  const historyQuery = results[1];

  // 로딩, 에러 상태 결합
  const loading = ranksQuery.isLoading || (historical && historyQuery.isLoading);
  const error = ranksQuery.error || (historical && historyQuery.error) || null;

  return {
    data: ranksQuery.data || [],
    historicalData: historical && historyQuery.data ? historyQuery.data.historyData : [],
    chartData: historical && historyQuery.data ? historyQuery.data.chartData : [],
    loading,
    error,
    // React Query 관련 추가 상태들
    isLoading: loading,
    isError: !!error,
    isSuccess: ranksQuery.isSuccess && (!historical || historyQuery.isSuccess),
    // 데이터 리패칭 함수
    refetch: () => {
      ranksQuery.refetch();
      if (historical) historyQuery.refetch();
    }
  };
}

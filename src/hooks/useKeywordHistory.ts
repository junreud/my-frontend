import { useQuery } from '@tanstack/react-query';
import { ChartDataItem } from '@/app/dashboard/marketing-keywords/KeywordRankingChart';
import apiClient from '@/lib/apiClient';

/**
 * Fetches keyword ranking history for a specific business and keyword over a given number of days.
 */
export function useKeywordHistory(
  placeId?: string | null,
  keywordId?: number | null,
  days: number = 30,
  options?: { enabled?: boolean }
) {
  return useQuery<ChartDataItem[], Error>({
    queryKey: ['keywordHistory', placeId, keywordId, days],
    queryFn: async () => {
      if (!placeId || !keywordId) {
        throw new Error('placeId 또는 keywordId가 유효하지 않습니다');
      }
      try {
        const response = await apiClient.get(
          `/keyword/history?placeId=${placeId}&keywordId=${keywordId}&days=${days}`
        );
        // API returns { keyword: string, history: KeywordBasicCrawlResult[] }
        const rawHistory = response.data.history;
        if (!Array.isArray(rawHistory)) return [];
        // Map raw history data to ChartDataItem shape
        return rawHistory.map(item => ({
          date: item.last_crawled_at || item.created_at || '',
          date_key: item.last_crawled_at || item.created_at || '', // Include required date_key field
          place_id: item.place_id,
          ranking: item.ranking,
          blog_review_count: item.blog_review_count ?? null,
          receipt_review_count: item.receipt_review_count ?? null,
          savedCount: item.saved_count ?? item.savedCount ?? null
        }));
      } catch (error) {
        console.error('[useKeywordHistory] 키워드 히스토리 조회 오류:', error);
        throw error instanceof Error
          ? error
          : new Error('키워드 히스토리 조회 중 알 수 없는 오류');
      }
    },
    enabled: !!placeId && !!keywordId && (options?.enabled !== false),
    staleTime: 1000 * 60 * 5, // 5분
  });
}

import { useQuery } from '@tanstack/react-query';
import { ChartDataItem } from '@/app/dashboard/marketing-keywords/KeywordRankingChart';
import { API_BASE_URL } from '@/lib/config';

/**
 * Fetches keyword ranking history for a specific business and keyword over a given number of days.
 */
export function useKeywordHistory(
  placeId?: string | null,
  keywordId?: number | null,
  days: number = 30
) {
  return useQuery<ChartDataItem[], Error>({
    queryKey: ['keywordHistory', placeId, keywordId, days],
    queryFn: async () => {
      if (!placeId || !keywordId) return [];
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
      const res = await fetch(
        `${API_BASE_URL}/keyword/history?placeId=${placeId}&keywordId=${keywordId}&days=${days}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
          credentials: 'include',
        }
      );
      if (!res.ok) throw new Error('Failed to fetch keyword history');
      return res.json();
    },
    enabled: !!placeId && !!keywordId,
    staleTime: 1000 * 60 * 5, // 5분
  });
}

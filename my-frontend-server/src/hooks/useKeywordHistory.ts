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
  const result = useQuery<ChartDataItem[], Error>({
    queryKey: ['keywordHistory', placeId, keywordId, days],
    queryFn: async () => {
      console.log('[useKeywordHistory] queryFn 실행:', { placeId, keywordId, days });
      
      if (!placeId || !keywordId) {
        console.error('[useKeywordHistory] placeId 또는 keywordId가 유효하지 않습니다:', { placeId, keywordId });
        throw new Error('placeId 또는 keywordId가 유효하지 않습니다');
      }
      try {
        const url = `/keyword/history?placeId=${placeId}&keywordId=${keywordId}&days=${days}`;
        console.log('[useKeywordHistory] API 호출:', url);
        
        const response = await apiClient.get(url);
        console.log('[useKeywordHistory] API 응답 상세:', {
          status: response.status,
          dataType: typeof response.data,
          dataKeys: response.data ? Object.keys(response.data) : [],
          dataLength: response.data ? JSON.stringify(response.data).length : 0,
          fullResponse: response.data,
          hasSuccessField: response.data && 'success' in response.data,
          hasDataField: response.data && 'data' in response.data
        });
        
        // 표준 응답 형식 처리: { success: boolean, message: string, data: {...} }
        let actualResponseData = response.data;
        if (actualResponseData && typeof actualResponseData === 'object' && 'success' in actualResponseData && 'data' in actualResponseData) {
          actualResponseData = actualResponseData.data;
          console.log('[useKeywordHistory] 표준 응답 형식 감지 - data 필드 추출:', Object.keys(actualResponseData || {}));
        }
        
        // API returns { keyword: string, isRestaurant: boolean, history: KeywordBasicCrawlResult[] }
        const rawHistory = actualResponseData?.history;
        const keywordIsRestaurant = actualResponseData?.isRestaurant || false;
        console.log('[useKeywordHistory] rawHistory 상세:', {
          type: typeof rawHistory,
          isArray: Array.isArray(rawHistory),
          length: Array.isArray(rawHistory) ? rawHistory.length : 'not array',
          firstItem: Array.isArray(rawHistory) && rawHistory.length > 0 ? rawHistory[0] : null,
          rawValue: rawHistory
        });
        
        if (!Array.isArray(rawHistory)) {
          console.warn('[useKeywordHistory] rawHistory가 배열이 아닙니다:', rawHistory);
          console.warn('[useKeywordHistory] 전체 응답 데이터 구조:', actualResponseData);
          
          // 응답이 직접 배열인지 확인
          if (Array.isArray(actualResponseData)) {
            console.log('[useKeywordHistory] 응답 데이터가 직접 배열입니다. 이를 사용합니다.');
            const directArrayData = actualResponseData;
            const mappedData = directArrayData.map(item => ({
              date: item.last_crawled_at || item.created_at || '',
              date_key: item.last_crawled_at || item.created_at || '',
              place_id: item.place_id,
              ranking: item.ranking,
              blog_review_count: item.blog_review_count ?? null,
              receipt_review_count: item.receipt_review_count ?? null,
              savedCount: item.saved_count ?? item.savedCount ?? null,
              isRestaurant: keywordIsRestaurant // 키워드의 레스토랑 여부 추가
            }));
            return mappedData;
          }
          
          return [];
        }
        
        // Map raw history data to ChartDataItem shape
        const mappedData = rawHistory.map(item => ({
          date: item.last_crawled_at || item.created_at || '',
          date_key: item.last_crawled_at || item.created_at || '', // Include required date_key field
          place_id: item.place_id,
          ranking: item.ranking,
          blog_review_count: item.blog_review_count ?? null,
          receipt_review_count: item.receipt_review_count ?? null,
          savedCount: item.saved_count ?? item.savedCount ?? null,
          isRestaurant: keywordIsRestaurant // 키워드의 레스토랑 여부 추가
        }));
        
        console.log('[useKeywordHistory] 변환된 데이터:', {
          originalLength: rawHistory.length,
          mappedLength: mappedData.length,
          firstMappedItem: mappedData[0] || null,
          sampleData: mappedData.slice(0, 3)
        });
        return mappedData;
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

  console.log('[useKeywordHistory] 훅 결과:', {
    isLoading: result.isLoading,
    isError: result.isError,
    data: result.data,
    error: result.error,
    enabled: !!placeId && !!keywordId && (options?.enabled !== false)
  });

  return result;
}

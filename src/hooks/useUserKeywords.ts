// useUserKeywords.ts
import { useQuery } from '@tanstack/react-query';
import { UserKeyword, ApiKeywordResponse } from '@/types/index';
import apiClient from '@/lib/apiClient';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useUserKeywords');

export function useUserKeywords(userId?: number | string, activeBusinessId?: number | string) {
  const queryKey = ['userKeywords', String(userId), String(activeBusinessId)];

  const fetchKeywords = async () => {
    if (!userId || !activeBusinessId) return [];
    try {
      const response = await apiClient.get<ApiKeywordResponse[]>(
        `/api/user-keywords?userId=${userId}&placeId=${activeBusinessId}`
      );
      logger.debug('키워드 데이터 로드 성공', response.data);
      return response.data
        .filter(item => item.keyword !== null)
        .map(item => ({
          id: item.id,
          keyword: item.keyword,
          keywordId: item.keyword_id,
        }));
    } catch (err) {
      logger.error('키워드 데이터 로딩 중 오류 발생:', err);
      throw err instanceof Error ? err : new Error(String(err));
    }
  };

  const result = useQuery<UserKeyword[], Error>({
    queryKey,
    queryFn: fetchKeywords,
    enabled: !!userId && !!activeBusinessId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    keywords: result.data || [],
    loading: result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
}
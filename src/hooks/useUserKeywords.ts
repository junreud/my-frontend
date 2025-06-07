// useUserKeywords.ts
import { useQuery } from '@tanstack/react-query';
import { UserKeyword, ApiKeywordResponse } from '@/types/index';
import apiClient from '@/lib/apiClient';
import { useEffect } from 'react';

export function useUserKeywords(userId?: number | string, activeBusinessId?: number | string) {
  const queryKey = ['userKeywords', String(userId), String(activeBusinessId)];

  const fetchKeywords = async () => {
    if (!userId || !activeBusinessId) {
      throw new Error('userId 또는 activeBusinessId가 유효하지 않습니다');
    }
    try {
      const response = await apiClient.get<ApiKeywordResponse[]>(
        `/api/user-keywords?userId=${userId}&placeId=${activeBusinessId}`
      );
      const rawData: ApiKeywordResponse[] = response.data;

      const mappedData: UserKeyword[] = rawData
        .map((item: ApiKeywordResponse) => {
          // Handle possible casing and ensure keyword field
          const raw = item.keyword ?? (item as unknown as Record<string, unknown>).Keyword;
          const kw = typeof raw === 'string' ? raw.trim() : '';
          return { 
            id: item.id, 
            keyword: kw, 
            keywordId: item.keyword_id,
            user_id: item.user_id,
            place_id: item.place_id,
            created_at: item.created_at
          };
        })
        .filter((k: UserKeyword) => k.keyword && k.keyword.length > 0);
      return mappedData;
    } catch (err) {
      console.error('[useUserKeywords] fetchKeywords 오류:', err);
      throw err instanceof Error ? err : new Error(String(err));
    }
  };

  const result = useQuery<UserKeyword[], Error>({
    queryKey,
    queryFn: fetchKeywords,
    enabled: !!userId && !!activeBusinessId,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  // Log query state changes
  useEffect(() => {
    console.log('[useUserKeywords] 상태:', {
      enabled: !!userId && !!activeBusinessId,
      isLoading: result.isLoading,
      isError: result.isError,
    });
  }, [userId, activeBusinessId, result.isLoading, result.isError]);

  return {
    keywords: result.data || [],
    // Ensure loading reflects the enabled state as well
    loading: (!userId || !activeBusinessId) ? true : result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
}
// useUserKeywords.ts
import { useQuery } from '@tanstack/react-query';
import { UserKeyword, ApiKeywordResponse } from '@/types/index';
import apiClient from '@/lib/apiClient';
import { useEffect, useMemo } from 'react'; // Add useMemo

export function useUserKeywords(userId?: number | string, activeBusinessId?: number | string) {
  const queryKey = useMemo(() => ['userKeywords', String(userId), String(activeBusinessId)], [userId, activeBusinessId]);

  const fetchKeywords = async () => {
    console.log('[useUserKeywords] fetchKeywords attempting with:', { userId, activeBusinessId });
    if (!userId || !activeBusinessId) {
      console.log('[useUserKeywords] fetchKeywords: IDs missing (userId or activeBusinessId is falsy), returning [].');
      return [];
    }
    try {
      console.log(`[useUserKeywords] Fetching /api/user-keywords?userId=${userId}&placeId=${activeBusinessId}`);
      const response = await apiClient.get<ApiKeywordResponse[]>(
        `/api/user-keywords?userId=${userId}&placeId=${activeBusinessId}`
      );
      console.log('[useUserKeywords] Raw API response.data:', response.data);
      console.log('[useUserKeywords] response.data[0] keys:', response.data.length > 0 ? Object.keys(response.data[0]) : []);
      console.log('[useUserKeywords] response.data keywords:', response.data.map(item => item.keyword));
      const rawData = response.data;
      const mappedData = rawData
        .map(item => {
          // Handle possible casing and ensure keyword field
          const raw = (item as Record<string, any>).keyword ?? (item as Record<string, any>).Keyword;
          const kw = typeof raw === 'string' ? raw.trim() : '';
          return { id: item.id, keyword: kw, keywordId: item.keyword_id };
        })
        .filter(k => k.keyword.length > 0);
      console.log('[useUserKeywords] Mapped data:', mappedData);
      return mappedData;
    } catch (err) {
      console.error('[useUserKeywords] fetchKeywords API error:', err);
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
    console.log('[useUserKeywords] Query state changed:', {
      queryKey,
      enabled: !!userId && !!activeBusinessId,
      isLoading: result.isLoading,
      isFetching: result.isFetching,
      isSuccess: result.isSuccess,
      isError: result.isError,
      data: result.data,
      error: result.error,
    });
  }, [userId, activeBusinessId, result.isLoading, result.isFetching, result.isSuccess, result.isError, result.data, result.error, queryKey]);

  return {
    keywords: result.data || [],
    // Ensure loading reflects the enabled state as well
    loading: (!userId || !activeBusinessId) ? true : result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
}
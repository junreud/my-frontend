// useUserKeywords.ts
import { useQuery } from '@tanstack/react-query';
import { UserKeyword, ApiKeywordResponse } from '@/types/index';
import apiClient from '@/lib/apiClient';
import { useEffect } from 'react';

export function useUserKeywords(userId?: number | string, activeBusinessId?: number | string, options?: { enabled?: boolean }) {
  const queryKey = ['userKeywords', String(userId), String(activeBusinessId)];

  const fetchKeywords = async () => {
    if (!userId || !activeBusinessId) {
      throw new Error('userId 또는 activeBusinessId가 유효하지 않습니다');
    }
    try {
      const response = await apiClient.get<{success: boolean, data: ApiKeywordResponse[]}>(
        `/api/user-keywords?userId=${userId}&placeId=${activeBusinessId}`
      );
      const responseData = response.data;
      
      console.log('[useUserKeywords] API 응답 원본:', responseData);

      // 백엔드 응답 구조: {success: true, data: [...]}
      const rawData: ApiKeywordResponse[] = responseData.data || [];
      console.log('[useUserKeywords] rawData:', rawData);
      
      const mappedData: UserKeyword[] = rawData
        .map((item: ApiKeywordResponse) => {
          const mapped = { 
            id: item.id, 
            keyword: item.keyword, // 백엔드에서 직접 keyword 필드를 반환
            keywordId: item.keyword_id,
            user_id: item.user_id,
            place_id: item.place_id,
            created_at: item.created_at
          };
          console.log('[useUserKeywords] 매핑된 키워드:', mapped);
          return mapped;
        })
        .filter((k: UserKeyword) => k.keyword && k.keyword.length > 0);
        
      console.log('[useUserKeywords] 최종 필터링된 키워드:', mappedData);
      return mappedData;
    } catch (err) {
      console.error('[useUserKeywords] fetchKeywords 오류:', err);
      throw err instanceof Error ? err : new Error(String(err));
    }
  };

  const result = useQuery<UserKeyword[], Error>({
    queryKey,
    queryFn: fetchKeywords,
    enabled: !!userId && !!activeBusinessId && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  // Log query state changes
  useEffect(() => {
    console.log('[useUserKeywords] 상태:', {
      enabled: !!userId && !!activeBusinessId,
      isLoading: result.isLoading,
      isError: result.isError,
      dataLength: result.data?.length || 0,
      data: result.data
    });
  }, [userId, activeBusinessId, result.isLoading, result.isError, result.data]);

  return {
    keywords: result.data || [],
    // Ensure loading reflects the enabled state as well
    loading: (!userId || !activeBusinessId) ? true : result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
}
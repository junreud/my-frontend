import { useQuery } from '@tanstack/react-query';
import { UserKeyword, ApiKeywordResponse } from '@/types/index';
import apiClient from '@/lib/apiClient';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useUserKeywords');

// 백엔드 API 응답 타입

/**
 * 사용자와 장소에 연결된 키워드 목록을 가져오는 훅 (React Query 사용)
 */
export function useUserKeywords(userId?: number, placeId?: number | string) {
  const queryKey = ['userKeywords', userId, placeId];
  
  const fetchKeywords = async () => {
    if (!userId || !placeId) {
      return [];
    }
    
    try {
      const response = await apiClient.get<ApiKeywordResponse[]>(`/api/user-keywords?userId=${userId}&placeId=${placeId}`);
      logger.debug('키워드 데이터 로드 성공', response.data);
      
      // 백엔드 응답을 컴포넌트에서 사용하기 쉬운 형태로 변환
      const transformedKeywords: UserKeyword[] = response.data
        .filter(item => item.keyword !== null)
        .map(item => {
          return {
            id: item.id,
            keyword: item.keyword,
            keywordId: item.keyword_id,
          };
        });
      
      return transformedKeywords;
    } catch (err) {
      logger.error('키워드 데이터 로딩 중 오류 발생:', err);
      throw err instanceof Error ? err : new Error(String(err));
    }
  };

  const { data = [], isLoading, error } = useQuery<UserKeyword[], Error>({
    queryKey,
    queryFn: fetchKeywords,
    enabled: !!userId && !!placeId,
    staleTime: 5 * 60 * 1000,
  });

  return { keywords: data, loading: isLoading, error };
}
import { useQuery } from '@tanstack/react-query';
import { KeywordRankingDetail, KeywordRankData } from '@/types';
import apiClient from '@/lib/apiClient';
import { createLogger } from '@/lib/logger';
import { transformToChartData, getCurrentRanking } from '@/utils/dataTransformers';
import { useUser } from './useUser'; // 추가
import { useEffect } from 'react';

const logger = createLogger('useKeywordRankingDetails');

interface UseKeywordRankingDetailsProps {
  placeId?: number | string;
  keyword?: string; // Used only for frontend filtering
  userId?: number | string; // 선택적으로 userId 받기
}

interface TransformedKeywordData {
  rankingDetails: KeywordRankingDetail[];
  chartData: ReturnType<typeof transformToChartData>;
  currentRanking: number | null;
  rankingList: KeywordRankData[] | null; // keywordRankData를 KeywordRankData로 수정
}

export function useKeywordRankingDetails({ 
  placeId, 
  keyword, // Used only for frontend filtering
  userId: explicitUserId // 외부에서 전달받은 userId (선택적)
}: UseKeywordRankingDetailsProps) {
  // 필요한 경우에만 useUser 호출 (이미 userId가 있으면 호출하지 않음)
  const { data: userData } = useUser({ 
    enabled: !explicitUserId // 명시적 userId가 없을 때만 useUser 쿼리 활성화
      
  });
  
  // 명시적으로 전달된 userId 또는 useUser에서 가져온 userId 사용
  const userId = explicitUserId || userData?.id;

  const result = useQuery<KeywordRankingDetail[], Error, TransformedKeywordData>({
    queryKey: ['keywordRankingDetails', placeId, userId], // Removed keyword from queryKey
    queryFn: async () => {
      console.log('Debug: placeId:', placeId, 'userId:', userId);
      if (!placeId || !userId) return [];
      
      try {
        const response = await apiClient.get(
          `/api/keyword-ranking-details?placeId=${placeId}&userId=${userId}`
        );
        
        // 응답 구조 확인 및 적절한 처리
        const responseData = response.data;
        logger.debug('순위 상세 데이터 원본:', responseData);
        
        // 백엔드가 { success: true, data: [...] } 형식인 경우
        const actualData = responseData.data || responseData;
        
        // 데이터가 배열인지 확인
        if (!Array.isArray(actualData)) {
          logger.error('순위 상세 데이터 형식 오류:', responseData);
          return []; // 빈 배열 반환
        }
        
        return actualData;
      } catch (err) {
        logger.error('순위 상세 데이터 로딩 중 오류 발생:', err);
        throw err instanceof Error ? err : new Error(String(err));
      }
    },
    select: (data) => {
      // 데이터 유효성 검사 추가
      if (!data || !Array.isArray(data)) {
        logger.error('데이터 변환 오류: 유효한 배열이 아님', data);
        return {
          rankingDetails: [],
          chartData: [],
          currentRanking: null,
          rankingList: [] as KeywordRankData[] // 명시적 타입 캐스팅
        };
      }
      
      // 키워드 필터링
      const filteredData = keyword 
        ? data.filter(item => item.keyword === keyword)
        : data;
      
      // chartData 변환 전 유효성 확인
      if (!filteredData || filteredData.length === 0) {
        return {
          rankingDetails: filteredData,
          chartData: [],
          currentRanking: null,
          rankingList: [] as KeywordRankData[] // 명시적 타입 캐스팅
        };
      }
      
      // KeywordRankData 타입에 맞는 데이터 생성
      const rankingList = filteredData.map(item => ({
        keyword: item.keyword || '',
        ranking: item.ranking,
        place_id: item.place_id,
        category: item.category || '',
        place_name: item.place_name || '',
        date_key: item.date_key || '',
        // 이 필드들은 KeywordRankData 타입에 필요한 모든 필드입니다
        // 필드가 부족하면 추가하세요
      })) as unknown as KeywordRankData[]; // 타입 단언
      
      return {
        rankingDetails: filteredData,
        chartData: transformToChartData(filteredData),
        currentRanking: getCurrentRanking(filteredData),
        rankingList // 필드 이름과 변수 이름이 같으므로 단축 구문 사용
      } as TransformedKeywordData;
    },
    enabled: !!placeId && !!userId, // Removed keyword from enabled condition
    staleTime: 1000 * 60 * 5, // 5분 캐싱
  });

  const { isLoading, isError, data, error } = result;

  useEffect(() => {
    console.log('useKeywordRankingDetails 상태:', {
      isLoading,
      isError,
      data,
      error,
      placeId,
      userId,
    });
  }, [isLoading, isError, data, error, placeId, userId]);

  return result;
}
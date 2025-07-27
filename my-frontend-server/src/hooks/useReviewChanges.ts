// hooks/useReviewChanges.ts
import { useQuery } from '@tanstack/react-query';
import { getBatchReviewChanges, type ReviewChanges } from '@/services/businessServices';
import { useEffect, useState } from 'react';

export interface UseReviewChangesResult {
  reviewChangesData: Record<string, ReviewChanges>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * 여러 업체의 리뷰 변화량을 조회하는 hook
 */
export function useReviewChanges(placeIds: string[]): UseReviewChangesResult {
  const [hasToken, setHasToken] = useState(false);

  // 클라이언트 사이드에서만 토큰 확인
  useEffect(() => {
    const token = localStorage.getItem('token');
    setHasToken(!!token);
  }, []);

  const {
    data: reviewChangesData = {},
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['reviewChanges', placeIds],
    queryFn: async () => {
      if (placeIds.length === 0) return {};
      return await getBatchReviewChanges(placeIds);
    },
    enabled: placeIds.length > 0 && hasToken, // 토큰이 있을 때만 실행
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    refetchOnWindowFocus: false,
  });

  return {
    reviewChangesData,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

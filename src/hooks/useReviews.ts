import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { createLogger } from "@/lib/logger";

const logger = createLogger("useReviews");

export interface Review {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  platform: 'blog' | 'receipt';
  url?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  totalCount: number;
  unansweredCount?: number; // 영수증 리뷰에서만 사용
  naverUrl?: string;
}

export interface CrawlResult {
  message: string;
  totalCrawled: number;
  totalSaved: number;
  reviews: Review[];
}

// 블로그 리뷰 가져오기
export function useBlogReviews(placeId: string | undefined, options?: { enabled?: boolean }) {
  return useQuery<ReviewsResponse>({
    queryKey: ['blog-reviews', placeId],
    queryFn: async () => {
      if (!placeId) {
        throw new Error('placeId가 제공되지 않았습니다');
      }
      
      logger.info('블로그 리뷰 조회 시작', { placeId });
      
      try {
        const response = await apiClient.get(`/api/reviews/test/blog/${placeId}`);
        
        console.log('블로그 리뷰 API 요청 URL:', `/api/reviews/test/blog/${placeId}`);
        console.log('블로그 리뷰 API 응답:', response.data);
        
        // API 응답 구조 확인: {success: true, data: {reviews, totalCount, naverUrl}}
        if (response.data && (response.data.success === true || response.data.reviews)) {
          const responseData = response.data.success ? response.data.data : response.data;
          
          logger.info('블로그 리뷰 조회 성공', { 
            count: responseData.reviews?.length || 0,
            naverUrl: responseData.naverUrl 
          });
          return responseData;
        } else {
          logger.error('블로그 리뷰 API 응답 실패:', response.data);
          throw new Error(response.data.message || '블로그 리뷰 조회에 실패했습니다');
        }
      } catch (error: unknown) {
        logger.error('블로그 리뷰 조회 오류:', error);
        
        // 이미 우리가 던진 에러라면 그대로 다시 던지기
        if (error instanceof Error && error.message.includes('블로그 리뷰 조회에 실패했습니다')) {
          throw error;
        }
        
        // 새로운 에러라면 한번만 감싸서 던지기
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`블로그 리뷰 조회 중 오류 발생: ${errorMessage}`);
      }
    },
    enabled: !!placeId && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000, // 5분 캐시
    refetchOnWindowFocus: false,
    retry: 1, // 1번만 재시도
  });
}

// 영수증 리뷰 가져오기  
export function useReceiptReviews(placeId: string | undefined, options?: { enabled?: boolean }) {
  return useQuery<ReviewsResponse>({
    queryKey: ['receipt-reviews', placeId],
    queryFn: async () => {
      if (!placeId) {
        throw new Error('placeId가 제공되지 않았습니다');
      }
      
      logger.info('영수증 리뷰 조회 시작', { placeId });
      
      try {
        const response = await apiClient.get(`/api/reviews/test/receipt/${placeId}`);
        
        console.log('영수증 리뷰 API 요청 URL:', `/api/reviews/test/receipt/${placeId}`);
        console.log('영수증 리뷰 API 응답:', response.data);
        
        // API 응답 구조 확인: {success: true, data: {reviews, totalCount, naverUrl}}
        if (response.data && (response.data.success === true || response.data.reviews)) {
          const responseData = response.data.success ? response.data.data : response.data;
          
          logger.info('영수증 리뷰 조회 성공', { 
            count: responseData.reviews?.length || 0,
            naverUrl: responseData.naverUrl 
          });
          return responseData;
        } else {
          logger.error('영수증 리뷰 API 응답 실패:', response.data);
          throw new Error(response.data.message || '영수증 리뷰 조회에 실패했습니다');
        }
      } catch (error: unknown) {
        console.log('영수증 리뷰 조회 에러 상세:', error);
        logger.error('영수증 리뷰 조회 오류:', error);
        
        // 이미 우리가 던진 에러라면 그대로 다시 던지기
        if (error instanceof Error && error.message.includes('영수증 리뷰 조회에 실패했습니다')) {
          throw error;
        }
        
        // 새로운 에러라면 한번만 감싸서 던지기
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`영수증 리뷰 조회 중 오류 발생: ${errorMessage}`);
      }
    },
    enabled: !!placeId && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000, // 5분 캐시
    refetchOnWindowFocus: false,
    retry: 1, // 1번만 재시도
  });
}

// 네이버 리뷰 크롤링
export function useCrawlReviews() {
  const queryClient = useQueryClient();
  
  return useMutation<CrawlResult, Error, { placeId: string; sortType?: 'recommend' | 'latest'; maxPages?: number }>({
    mutationFn: async ({ placeId, sortType = 'recommend', maxPages = 3 }) => {
      logger.info('리뷰 크롤링 시작', { placeId, sortType, maxPages });
      
      const response = await apiClient.post(`/api/reviews/crawl/${placeId}`, {
        sortType,
        maxPages
      });
      
      console.log('리뷰 크롤링 API 응답:', response.data);
      
      // API 응답 구조 확인: {success: true, data: {message, totalCrawled, totalSaved, reviews}}
      if (response.data && (response.data.success === true || response.data.message)) {
        const responseData = response.data.success ? response.data.data : response.data;
        
        logger.info('리뷰 크롤링 성공', responseData);
        return responseData;
      } else {
        throw new Error(response.data.message || '리뷰 크롤링에 실패했습니다');
      }
    },
    onSuccess: (data, variables) => {
      // 크롤링 성공 시 기존 리뷰 데이터 무효화하여 새로 가져오기
      queryClient.invalidateQueries({ queryKey: ['blog-reviews', variables.placeId] });
      queryClient.invalidateQueries({ queryKey: ['receipt-reviews', variables.placeId] });
      logger.info('리뷰 크롤링 완료, 캐시 무효화됨');
    },
    onError: (error) => {
      logger.error('리뷰 크롤링 실패:', error);
    },
    // 중요: mutation이 중복 실행되는 것을 방지
    retry: false,
    gcTime: 1000 * 60 * 5, // 5분 후에 가비지 컬렉션
  });
}

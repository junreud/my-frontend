import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { createLogger } from "@/lib/logger";
import { ReanalysisResponse } from "@/types";

const logger = createLogger("useReviews");

export interface Review {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  platform: 'blog' | 'receipt';
  platform_type?: 'blog' | 'cafe' | 'other'; // 플랫폼 세부 타입
  url?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
  // 답변 관련 필드들
  reply?: string;
  reply_date?: string;
  reply_generated_by_ai?: boolean;
  reply_status?: 'draft' | 'published' | 'rejected';
  // 실제 사업자 답변 관련 필드들 (새로 추가)
  has_owner_reply?: boolean;
  owner_reply_content?: string;
  // 광고 분석 관련 필드들
  isAd?: boolean;
  adConfidence?: number;
  adAnalyzedAt?: string;
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

// ===== AI 답변 생성 관련 훅들 =====

export interface ReplySettings {
  tone?: string;
  key_messages?: string[];
  avoid_words?: string[];
  template_content?: string;
}

export interface GenerateRepliesResult {
  success: boolean;
  message: string;
  summary: {
    success: number;
    failure: number;
    total: number;
  };
  errors?: Array<{
    reviewId: string;
    error: string;
  }>;
}

// AI 답변 설정 조회
export function useReplySettings(placeId: string | undefined) {
  return useQuery<ReplySettings>({
    queryKey: ['reply-settings', placeId],
    queryFn: async () => {
      if (!placeId) {
        throw new Error('placeId가 제공되지 않았습니다');
      }
      
      logger.info('답변 설정 조회 시작', { placeId });
      
      const response = await apiClient.get(`/api/review-reply/ai-settings/${placeId}`);
      
      if (response.data?.success) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || '답변 설정 조회에 실패했습니다');
      }
    },
    enabled: !!placeId,
    staleTime: 10 * 60 * 1000, // 10분 캐시
  });
}

// AI 답변 설정 저장
export function useSaveReplySettings() {
  const queryClient = useQueryClient();
  
  return useMutation<ReplySettings, Error, { placeId: string; settings: ReplySettings }>({
    mutationFn: async ({ placeId, settings }) => {
      logger.info('답변 설정 저장 시작', { placeId, settings });
      
      const response = await apiClient.post(`/api/review-reply/ai-settings/${placeId}`, settings);
      
      if (response.data?.success) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || '답변 설정 저장에 실패했습니다');
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reply-settings', variables.placeId] });
      logger.info('답변 설정 저장 성공');
    },
    onError: (error) => {
      logger.error('답변 설정 저장 실패:', error);
    },
  });
}

// AI 답변 일괄 생성
export function useGenerateReplies() {
  const queryClient = useQueryClient();
  
  return useMutation<GenerateRepliesResult, Error, { 
    placeId: string; 
    useSettings?: boolean; 
    reviewType?: 'blog' | 'receipt';
    limit?: number;
  }>({
    mutationFn: async ({ placeId, useSettings = true, reviewType = 'receipt', limit }) => {
      logger.info('AI 답변 일괄 생성 시작', { placeId, useSettings, reviewType, limit });
      
      const response = await apiClient.post(`/api/review-reply/ai-generate/${placeId}`, {
        useSettings,
        reviewType,
        limit
      });
      
      if (response.data?.success) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'AI 답변 생성에 실패했습니다');
      }
    },
    onSuccess: (data, variables) => {
      // 성공 시 리뷰 데이터 새로고침
      queryClient.invalidateQueries({ queryKey: ['blog-reviews', variables.placeId] });
      queryClient.invalidateQueries({ queryKey: ['receipt-reviews', variables.placeId] });
      logger.info('AI 답변 생성 성공', data);
    },
    onError: (error) => {
      logger.error('AI 답변 생성 실패:', error);
    },
  });
}

// 단일 리뷰 AI 답변 생성
export function useGenerateSingleReply() {
  const queryClient = useQueryClient();
  
  return useMutation<{ reviewId: string; reply: string }, Error, { 
    reviewId: string; 
    useSettings?: boolean;
  }>({
    mutationFn: async ({ reviewId, useSettings = true }) => {
      logger.info('단일 AI 답변 생성 시작', { reviewId, useSettings });
      
      const response = await apiClient.post(`/api/review-reply/ai-generate-single/${reviewId}`, {
        useSettings
      });
      
      if (response.data?.success) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || '단일 AI 답변 생성에 실패했습니다');
      }
    },
    onSuccess: (data) => {
      // 성공 시 모든 리뷰 데이터 새로고침 (placeId를 모르므로 전체 새로고침)
      queryClient.invalidateQueries({ queryKey: ['blog-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['receipt-reviews'] });
      logger.info('단일 AI 답변 생성 성공', data);
    },
    onError: (error) => {
      logger.error('단일 AI 답변 생성 실패:', error);
    },
  });
}

// 광고 분석 재실행
export function useReanalyzeAd() {
  const queryClient = useQueryClient();
  
  return useMutation<{ reviewId: string; isAd: boolean; confidence: number }, Error, { reviewId: string }>({
    mutationFn: async ({ reviewId }) => {
      logger.info('광고 분석 재실행 시작', { reviewId });
      
      const response = await apiClient.post(`/api/reviews/admin/reanalyze-ad/${reviewId}`);
      
      if (response.data?.success) {
        logger.info('광고 분석 재실행 성공', response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || '광고 분석 재실행에 실패했습니다');
      }
    },
    onSuccess: () => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['blog-reviews'] });
      logger.info('광고 분석 재실행 완료, 캐시 무효화됨');
    },
    onError: (error) => {
      logger.error('광고 분석 재실행 실패:', error);
    }
  });
}

// 전체 리뷰 광고 분석 재실행
export function useReanalyzeAllAds() {
  const queryClient = useQueryClient();
  
  return useMutation<ReanalysisResponse, Error, { placeId: string; limit?: number; onlyUnchecked?: boolean }>({
    mutationFn: async ({ placeId, limit = 50, onlyUnchecked = false }) => {
      logger.info('전체 광고 분석 재실행 시작', { placeId, limit, onlyUnchecked });
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000); // 5분 타임아웃
        
        const response = await apiClient.post(
          `/api/reviews/admin/reanalyze-all-ads/${placeId}?limit=${limit}&onlyUnchecked=${onlyUnchecked}`,
          {},
          { 
            signal: controller.signal,
            timeout: 300000 // 5분 타임아웃
          }
        );
        
        clearTimeout(timeoutId);
        
        if (response.data?.success) {
          logger.info('전체 광고 분석 재실행 성공', response.data.data);
          return response.data.data;
        } else {
          throw new Error(response.data.message || '전체 광고 분석 재실행에 실패했습니다');
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error('분석 요청이 타임아웃되었습니다. 다시 시도해주세요.');
          }
          if (error.message.includes('timeout')) {
            throw new Error('서버 응답 시간이 초과되었습니다. 다시 시도해주세요.');
          }
        }
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['blog-reviews', variables.placeId] });
      logger.info('전체 광고 분석 재실행 완료, 캐시 무효화됨');
    },
    onError: (error) => {
      logger.error('전체 광고 분석 재실행 실패:', error);
    }
  });
}

// 선택된 리뷰들 광고 분석
export function useAnalyzeSelectedReviews() {
  const queryClient = useQueryClient();
  
  return useMutation<ReanalysisResponse, Error, { placeId: string; reviewIds: string[] }>({
    mutationFn: async ({ placeId, reviewIds }) => {
      logger.info('선택된 리뷰 광고 분석 시작', { placeId, reviewIds: reviewIds.length });
      
      if (reviewIds.length === 0) {
        throw new Error('분석할 리뷰를 선택해주세요');
      }
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000); // 5분 타임아웃
        
        const response = await apiClient.post(
          `/api/reviews/admin/analyze-selected-reviews/${placeId}`,
          { reviewIds },
          { 
            signal: controller.signal,
            timeout: 300000 // 5분 타임아웃
          }
        );
        
        clearTimeout(timeoutId);
        
        if (response.data?.success) {
          logger.info('선택된 리뷰 광고 분석 성공', response.data.data);
          return response.data.data;
        } else {
          throw new Error(response.data.message || '선택된 리뷰 분석에 실패했습니다');
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error('분석 요청이 타임아웃되었습니다. 다시 시도해주세요.');
          }
          if (error.message.includes('timeout')) {
            throw new Error('서버 응답 시간이 초과되었습니다. 다시 시도해주세요.');
          }
        }
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['blog-reviews', variables.placeId] });
      logger.info('선택된 리뷰 광고 분석 완료, 캐시 무효화됨');
    },
    onError: (error) => {
      logger.error('선택된 리뷰 광고 분석 실패:', error);
    }
  });
}

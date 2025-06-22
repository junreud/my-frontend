import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { createLogger } from "@/lib/logger";

const logger = createLogger("useReviewReplies");

export interface ReplySettings {
  tone: 'friendly' | 'professional' | 'warm' | 'casual';
  template_style: 'standard' | 'detailed' | 'brief';
  keywords: string[];
  auto_generate: boolean;
  is_active: boolean;
}

export interface UnansweredReview {
  id: string;
  naver_review_id: string;
  content: string;
  author: string;
  review_date: string;
  title: string;
}

export interface GeneratedReply {
  reviewId: string;
  naver_review_id: string;
  originalContent: string;
  success: boolean;
  reply?: string;
  usedKeywords?: string[];
  tone?: string;
  templateStyle?: string;
  error?: string;
}

export interface SaveSettingsResponse {
  message: string;
  settings: ReplySettings;
}

export interface GenerateRepliesResponse {
  message: string;
  results: GeneratedReply[];
  summary: {
    total: number;
    success: number;
    failure: number;
  };
}

// AI 답변 설정 조회
export function useReplySettings(placeId: string | undefined) {
  return useQuery<ReplySettings>({
    queryKey: ['reply-settings', placeId],
    queryFn: async () => {
      if (!placeId) {
        throw new Error('placeId가 제공되지 않았습니다');
      }
      
      logger.info('AI 답변 설정 조회 시작', { placeId });
      
      const response = await apiClient.get(`/api/review-replies/settings/${placeId}`);
      
      if (response.data?.success) {
        return response.data.data;
      } else {
        const errorMessage = response.data?.message || 'AI 답변 설정 조회에 실패했습니다';
        logger.error('AI 답변 설정 조회 실패:', { placeId, error: errorMessage, responseData: response.data });
        throw new Error(errorMessage);
      }
    },
    enabled: !!placeId,
    staleTime: 5 * 60 * 1000, // 5분 캐시
    retry: 1, // 1번만 재시도
    retryDelay: 1000, // 1초 후 재시도
  });
}

// AI 답변 설정 저장
export function useSaveReplySettings() {
  const queryClient = useQueryClient();
  
  return useMutation<SaveSettingsResponse, Error, { placeId: string; settings: Partial<ReplySettings>; businessName?: string }>({
    mutationFn: async ({ placeId, settings, businessName }) => {
      logger.info('AI 답변 설정 저장 시작', { placeId, settings });
      
      const response = await apiClient.post(`/api/review-replies/settings/${placeId}`, {
        ...settings,
        business_name: businessName
      });
      
      if (response.data?.success) {
        logger.info('AI 답변 설정 저장 성공', { placeId, response: response.data });
        return response.data.data;
      } else {
        const errorMessage = response.data?.message || 'AI 답변 설정 저장에 실패했습니다';
        logger.error('AI 답변 설정 저장 실패:', { placeId, error: errorMessage, responseData: response.data });
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data, variables) => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['reply-settings', variables.placeId] });
      logger.info('AI 답변 설정 저장 완료');
    },
    onError: (error) => {
      logger.error('AI 답변 설정 저장 실패:', error);
    }
  });
}

// 답변 없는 리뷰 조회
export function useUnansweredReviews(placeId: string | undefined, limit = 10) {
  return useQuery<{ reviews: UnansweredReview[]; count: number }>({
    queryKey: ['unanswered-reviews', placeId, limit],
    queryFn: async () => {
      if (!placeId) {
        throw new Error('placeId가 제공되지 않았습니다');
      }
      
      logger.info('답변 없는 리뷰 조회 시작', { placeId, limit });
      
      const response = await apiClient.get(`/api/review-replies/unanswered/${placeId}?limit=${limit}`);
      
      if (response.data?.success) {
        return response.data.data;
      } else {
        const errorMessage = response.data?.message || '답변 없는 리뷰 조회에 실패했습니다';
        logger.error('답변 없는 리뷰 조회 실패:', { placeId, error: errorMessage, responseData: response.data });
        throw new Error(errorMessage);
      }
    },
    enabled: !!placeId,
    staleTime: 2 * 60 * 1000, // 2분 캐시 (자주 변할 수 있는 데이터)
    retry: 1, // 1번만 재시도
  });
}

// AI 답변 생성
export function useGenerateReplies() {
  const queryClient = useQueryClient();
  
  return useMutation<GenerateRepliesResponse, Error, { placeId: string; reviewIds?: string[]; useSettings?: boolean }>({
    mutationFn: async ({ placeId, reviewIds, useSettings = true }) => {
      logger.info('AI 답변 생성 시작', { placeId, reviewIds, useSettings });
      
      const response = await apiClient.post(`/api/review-replies/generate/${placeId}`, {
        reviewIds,
        useSettings
      });
      
      if (response.data?.success) {
        return response.data.data;
      } else {
        const errorMessage = response.data?.message || 'AI 답변 생성에 실패했습니다';
        logger.error('AI 답변 생성 실패:', { placeId, error: errorMessage, responseData: response.data });
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data, variables) => {
      // 관련 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['unanswered-reviews', variables.placeId] });
      queryClient.invalidateQueries({ queryKey: ['receipt-reviews', variables.placeId] });
      logger.info('AI 답변 생성 완료', data.summary);
    },
    onError: (error) => {
      logger.error('AI 답변 생성 실패:', error);
    }
  });
}

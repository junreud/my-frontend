// services/businessServices.ts
import { ApiError } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// 리뷰 변화량 데이터 타입
export interface ReviewChanges {
  current: {
    blogReviewCount: number;
    receiptReviewCount: number;
    lastUpdated: string;
  };
  changes: {
    blogChange: number;
    receiptChange: number;
    comparisonDate: string | null;
  };
  total: number;
  totalChange: number;
}

export interface ReviewChangesResponse {
  success: boolean;
  message: string;
  data: ReviewChanges;
}

export interface BatchReviewChangesResponse {
  success: boolean;
  message: string;
  data: Record<string, ReviewChanges>;
}

/**
 * 단일 업체의 리뷰 변화량 조회
 */
export async function getReviewChanges(placeId: string): Promise<ReviewChanges> {
  try {
    // 클라이언트 사이드에서만 localStorage 접근
    if (typeof window === 'undefined') {
      throw new Error('서버 사이드에서는 실행할 수 없습니다.');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/api/place/${placeId}/review-changes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `리뷰 변화량 조회 실패: ${response.status}`);
    }

    const result: ReviewChangesResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || '리뷰 변화량 조회에 실패했습니다.');
    }

    return result.data;
  } catch (error) {
    console.error('[getReviewChanges] Error:', error);
    const apiError = error as ApiError;
    throw new Error(apiError.message || '리뷰 변화량 조회 중 오류가 발생했습니다.');
  }
}

/**
 * 여러 업체의 리뷰 변화량 일괄 조회
 */
export async function getBatchReviewChanges(placeIds: string[]): Promise<Record<string, ReviewChanges>> {
  try {
    // 클라이언트 사이드에서만 localStorage 접근
    if (typeof window === 'undefined') {
      throw new Error('서버 사이드에서는 실행할 수 없습니다.');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    if (placeIds.length === 0) {
      return {};
    }

    if (!placeIds || placeIds.length === 0) {
      return {};
    }

    const response = await fetch(`${API_BASE_URL}/api/place/batch-review-changes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ placeIds }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `일괄 리뷰 변화량 조회 실패: ${response.status}`);
    }

    const result: BatchReviewChangesResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || '일괄 리뷰 변화량 조회에 실패했습니다.');
    }

    return result.data;
  } catch (error) {
    console.error('[getBatchReviewChanges] Error:', error);
    const apiError = error as ApiError;
    throw new Error(apiError.message || '일괄 리뷰 변화량 조회 중 오류가 발생했습니다.');
  }
}

/**
 * 변화량을 표시용 텍스트로 변환
 */
export function formatChange(change: number): string {
  if (change === 0) return '±0';
  return change > 0 ? `+${change}` : `${change}`;
}

/**
 * 변화량에 따른 색상 클래스 반환
 */
export function getChangeColorClass(change: number): string {
  if (change > 0) return 'text-green-600';
  if (change < 0) return 'text-red-600';
  return 'text-gray-500';
}

/**
 * 변화량에 따른 배경 색상 클래스 반환
 */
export function getChangeBadgeClass(change: number): string {
  if (change > 0) return 'bg-green-100 text-green-700';
  if (change < 0) return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-600';
}

// types/index.ts

/**
 * API 에러 응답 형식
 */
export interface ApiError {
  message: string;
  status?: number;
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status?: number;
  };
}

/**
 * 플랫폼 타입
 */
export type Platform = 'naver' | 'kakao' | 'google' | string;

/**
 * 업체(비즈니스) 기본 정보
 */
export interface Business {
  place_name: string
  platform: Platform
  category?: string
  place_id?: string
  isNewlyOpened?: boolean
}
export interface UserKeyword {
  id: number;
  keywordId: number;
  // Optional fields from the other definition that might be needed
  user_id?: number;
  place_id?: number | string;
  keyword?: string;
  created_at?: string;
}
export interface ApiKeywordResponse {
  id: number;
  user_id: number;
  place_id: number | string;
  keyword_id: number;
  keyword: string;
  created_at: string;
  updated_at: string;
}


/**
 * URL 정규화 API 응답
 */
export interface NormalizeResponse {
  success: boolean
  normalizedUrl: string
  alreadyRegistered: boolean
  placeInfo: {
    place_id: string
    place_name: string
    category?: string
    platform: Platform
    userid: string
    [key: string]: unknown
  }
}

/**
 * ChatGPT 키워드 생성 API 응답
 */
export interface ChatGptKeywords {
  success: boolean
  locationKeywords: string[]
  featureKeywords: string[]
}

/**
 * 키워드 조합 API 응답
 */
export interface CombinedKeywordsResponse {
  success: boolean;
  // API가 candidateKeywords 또는 combinedKeywords를 반환할 수 있음
  candidateKeywords?: string[];
  combinedKeywords?: string[];
}

/**
 * 검색량 조회 API에서 개별 키워드 데이터
 */
export interface ExternalData {
  keyword: string
  monthlySearchVolume: number
}

/**
 * 검색량 조회 API 응답
 */
export interface SearchVolumeResponse {
  success: boolean
  externalDataList: ExternalData[]
}

/**
 * 키워드 그룹화 API 응답
 */
export interface GroupedKeywordsResponse {
  success: boolean
  finalKeywords: FinalKeyword[]
}

/**
 * 최종 키워드 구조
 */
export interface FinalKeyword {
  combinedKeyword: string
  details?: Array<{
    monthlySearchVolume?: number
    rank?: number
  }>
}

/**
 * 진행 단계 (ProgressStep)
 */
export type ProgressStep = 
  | "idle" 
  | "normalizing" 
  | "storing" 
  | "chatgpt" 
  | "combining" 
  | "checking" 
  | "grouping" 
  | "complete"

/**
 * 키워드 생성에 필요한 정보
 */
export interface PlaceInfoWithUser {
  place_id: string;
  place_name: string;
  category?: string;
  platform: Platform;
  userId: string;
  
  // 실제 데이터에 있는 추가 필드들을 명시적으로 정의
  address?: string;
  roadAddress?: string;
  x?: number;
  y?: number;
  placeId?: string;
  blogReviewTitles?: string[];
  shopIntro?: string;
  isNewlyOpened?: boolean;
  
  // 그외 추가 필드를 위한 인덱스 시그니처
  [key: string]: unknown;
}

// 키워드 관련 타입
export interface KeywordRankData {
  id: number;
  place_id: number;
  keyword_id: number;
  ranking: number;
  place_name: string;
  category?: string;
  receipt_review_count: number;
  blog_review_count: number;
  savedCount?: number;
  crawled_at: string;
}

export interface KeywordHistoricalData {
  date: string;
  ranking: number;
  uv: number; // For chart representation
}

export interface FinalKeyword {
  combinedKeyword: string;
  details?: Array<{
    keyword: string;
    monthlySearchVolume?: number;
  }>;
}

export interface Platform {
  id: string;
  name: string;
  platform: string;
  // 기타 속성
}

export interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}
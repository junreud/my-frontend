// types/index.ts

/**
 * API 에러 응답 형식
 */
export interface ApiError extends Error {
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
export interface User {
  id: string | number;
  name: string;
  email: string;
  role?: string;
  // 필요한 다른 속성들
}
/**
 * 플랫폼 타입 정의
 */
export interface Platform {
  id: string;
  name: string;
  platform: string;
  [key: string]: unknown;
  
}

/**
 * 업체(비즈니스) 기본 정보
 */
export interface Business {
  place_name: string;
  platform: Platform;
  category?: string;
  place_id?: string;
  isNewlyOpened?: boolean;
  main_keyword?: string;
}

export interface UserKeyword {
  id: number;
  keywordId: number;
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
  success: boolean;
  normalizedUrl: string;
  alreadyRegistered: boolean;
  placeInfo: {
    place_id: string;
    place_name: string;
    category?: string;
    platform: Platform;
    userid: string;
    [key: string]: unknown;
  }
}

/**
 * ChatGPT 키워드 생성 API 응답
 */
export interface ChatGptKeywords {
  success: boolean;
  locationKeywords: string[];
  featureKeywords: string[];
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
  keyword: string;
  monthlySearchVolume: number;
}

/**
 * 검색량 조회 API 응답
 */
export interface SearchVolumeResponse {
  success: boolean;
  externalDataList: ExternalData[];
}

/**
 * 키워드 그룹화 API 응답
 */
export interface GroupedKeywordsResponse {
  success: boolean;
  finalKeywords: FinalKeyword[];
}

/**
 * 최종 키워드 구조
 */
export interface FinalKeyword {
  combinedKeyword: string;
  details?: Array<{
    keyword?: string;
    monthlySearchVolume?: number;
    rank?: number;
  }>;
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
  | "complete";

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
  place_id: string;
  date_key: string;
  blog_review_count?: number;
  receipt_review_count?: number;
}

export interface KeywordRankingDetail {
  ranking: number;
  place_id: string;
  date_key: string;
  place_name: string;
  category: string;
  blog_review_count: number | null;
  receipt_review_count: number | null;
  savedCount: number | null;
  keywordList: string[] | null;
  keyword?: string;
}

export interface KeywordRankingChartProps {
  chartData: KeywordHistoricalData[];
  activeBusiness: Business | null; 
}

/**
 * 키워드 순위 데이터 API 응답 타입
 */
export interface KeywordRankingData {
  rankingDetails: KeywordRankingDetail[];
  rankingList: KeywordRankData[];
  chartData?: KeywordHistoricalData[];
  metadata?: {
    totalCount?: number;
    currentPage?: number;
    lastUpdated?: string;
  };
}

export interface KeywordRankingTableProps {
  isLoading: boolean;
  selectedKeyword: string;
  activeBusiness: Business | null;
  isError: boolean;
  keywordData: KeywordRankingData | null;
  historicalData: KeywordHistoricalData[] | null;
  rangeValue: number;
}
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

/**
 * URL 정규화 API 응답
 */
export interface NormalizeResponse {
  success: boolean
  normalizedUrl: string
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
  success: boolean
  candidateKeywords: string[]
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
  | "generating" 
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
  [key: string]: unknown;
}
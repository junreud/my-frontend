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
  url_registration?: number;  // add registration flag
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
  platform: string;
  category?: string;
  place_id?: string;
  isNewlyOpened?: boolean;
  main_keyword?: string;
  isRestaurant?: boolean; // Add restaurant flag
  blog_review_count?: number | null;   // Add optional review counts
  receipt_review_count?: number | null;
  is_favorite?: boolean; // Favorite flag
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
  receipt_review_count: number | null;  // ✅ null 허용 추가
  blog_review_count: number | null;     // ✅ null 허용 추가
  savedCount?: number | null;           // 선택적으로 null 허용 추가 가능
  crawled_at?: string;
}

/**
 * 키워드 데이터의 기본 필드를 정의하는 기본 인터페이스
 */
export interface BaseKeywordData {
  date: string;
  date_key: string;  // 옵셔널 제거
  place_id: string | number;
  ranking: number | null;
  blog_review_count?: number | null;
  receipt_review_count?: number | null;
  savedCount?: number | null;
  
  // 다양한 API 응답 필드명에 대응하기 위한 추가 필드
  saved?: number | null;  // 저장 수의 대체 필드명
  saved_count?: number | null;  // 저장 수의 또 다른 대체 필드명
  blogReviews?: number | null;  // blog_review_count의 대체 필드명
  receiptReviews?: number | null;  // receipt_review_count의 대체 필드명
}

export interface KeywordHistoricalData {
  date_key: string;
  date: string;
  ranking: number | null;
  uv?: number | null;
  blog_review_count?: number | null;
  receipt_review_count?: number | null;
  saved_count?: number | null;
  place_id: string | number | null; // null 허용으로 변경
  receiptReviews?: number | null;
  blogReviews?: number | null;
  saved?: number | null;
  savedCount?: number | null;
}
/**
 * 키워드 차트 데이터 포인트
 * (KeywordHistoricalData와 동일한 구조 사용)
 */
export type ChartDataPoint = KeywordHistoricalData & {
  keywordItems?: string[];
};

export interface KeywordRankingDetail extends BaseKeywordData {
  id: string | number;
  keyword_id: string | number;
  keyword: string;
  place_name: string;
  category: string;
  keywordList: string[] | null;
  crawled_at?: string;
  isRestaurant?: boolean;  // 키워드의 레스토랑 여부 (개별 항목)
}

/**
 * 키워드 순위 데이터 API 응답 타입
 */
export interface KeywordRankingData {
  rankingDetails: KeywordRankingDetail[];
  rankingList: KeywordRankData[];
  chartData?: KeywordHistoricalData[];  // 옵셔널로 통일
  metadata?: {
    totalCount?: number;
    currentPage?: number;
    lastUpdated?: string;
    keyword?: string;
    isRestaurant?: boolean; // 키워드의 레스토랑 여부 추가
    targetDate?: string;
    placeId?: string | number;
    rangeValue?: number;
    hasData?: boolean;
    message?: string;
  };
}

export interface KeywordRankingChartProps {
  chartData: KeywordHistoricalData[];  // 여기서는 필수 속성으로 유지
  activeBusiness: Business | null; 
}

export interface KeywordRankingTableProps {
  isLoading: boolean;
  selectedKeyword: string;
  activeBusiness: Business | null;
  isError: boolean;
  keywordData: KeywordRankingData | null;
  historicalData: KeywordHistoricalData[] | null;
  rangeValue: number;
  isRestaurantKeyword?: boolean;  // 레스토랑 여부에 따라 저장수 컬럼 표시 여부
}

export interface ICustomerInfo {
  id: number;
  posting_id: string;
  title: string;
  company_name: string;
  address: string | null;
  naverplace_url: string | null;
  created_at: string;
  updated_at: string;
  source_filter: string | null; // source_filter 컬럼 추가
  contacts?: IContactInfo[];
  favorite?: boolean; // 즐겨찾기 여부
  friend_add_status?: 'pending' | 'success' | 'fail' | 'already_registered'; // 친구추가 상태
  blacklist?: boolean; // 블랙리스트 여부
}

export interface IContactInfo {
  id: number;
  customer_id: number;
  phone_number: string | null;
  contact_person: string | null;
  created_at: string;
  updated_at: string;
  CustomerInfo?: ICustomerInfo;
  favorite?: boolean;    // 즐겨찾기 여부
  blacklist?: boolean;   // 블랙리스트 여부
  friend_add_status?: 'pending' | 'success' | 'fail' | 'already_registered'; // 친구추가 상태
}

// 메인 키워드 상태 타입 추가
export interface MainKeywordStatus {
  keyword: string;
  currentRank: number;
  diff: number;
}

export interface UserBusiness {
  place_id: string; // 업체의 고유 ID (예: Google Place ID)
  display_name: string; // 업체 표시 이름
  // 필요에 따라 다른 업체 관련 속성 추가 가능
}

/**
 * 제거된 키워드 정보
 */
export interface RemovedKeyword {
  keyword: string;
  reason: string;
}

/**
 * 키워드 조회 응답 (제거된 키워드 정보 포함)
 */
export interface KeywordResponseWithRemoved {
  keywordDetails?: ApiKeywordResponse[];
  removedKeywords?: RemovedKeyword[];
  message?: string;
}

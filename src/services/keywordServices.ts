import apiClient from "@/lib/apiClient"
import axios from 'axios' // axios 객체 직접 import 추가
import { createLogger, LOG_PRIORITIES } from "@/lib/logger"
import {
  NormalizeResponse,
  CombinedKeywordsResponse,
  ChatGptKeywords,
  SearchVolumeResponse,
  GroupedKeywordsResponse,
  FinalKeyword,
  Business,
  Platform,
  ExternalData,
  PlaceInfoWithUser,
} from "@/types"
import type { LogLevel } from "@/lib/logger"  // LogLevel 타입 가져오기

const logger = createLogger('KeywordService');

// 간소화된 API 함수들 - 응답 타입 수정
export async function normalizeUrl(url: string, platform: Platform, userId?: string): Promise<NormalizeResponse> {
  logger.info("normalizeUrl 함수 호출:", { url, platform, userId });
  
  try {
    const response = await apiClient.post<NormalizeResponse>("/keyword/normalize", {
      url, 
      platform,
      userId
    });
    
    logger.info("normalizeUrl 반환 데이터:", response.data);
    
    return response.data;
  } catch (error: unknown) {
    logger.error("normalizeUrl API 오류:", error);
    throw error;
  }
}

export async function storePlace(userId: string, placeInfo: Partial<Business>): Promise<{ success: boolean }> {
  logger.info("내 업체 정보 저장:", { userId, placeInfo });
  
  try {
    const response = await apiClient.post<{ success: boolean }>("/keyword/store-place", {
      user_id: userId,
      ...placeInfo,
    });
    
    logger.debug("내 업체 정보 저장 응답:", response);    
    return response.data;
  } catch (error: unknown) {
    logger.error("내 업체 정보 저장 실패:", error);
    throw error;
  }
}

export async function chatgptKeywordsHandler(placeInfo: Partial<PlaceInfoWithUser>): Promise<ChatGptKeywords> {
  logger.info("AI 키워드생성 호출:", { placeInfo });
  
  // platform이 undefined인 경우 기본값 설정 및 필수 필드 보강
  const enhancedPlaceInfo = {
    ...placeInfo,
    platform: placeInfo.platform || 'naver', // 기본값 설정
  };
  
  try {
    // API 구조에 맞게 객체 구성하고 헤더 추가
    const response = await apiClient.post<ChatGptKeywords>(
      "/keyword/chatgpt", 
      { placeInfo: enhancedPlaceInfo },
      { 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    logger.info("AI 키워드생성 응답:", response);

    // 응답 검증
    if (!response.data) {
      logger.error("서버 응답 데이터가 없습니다");
      return { success: false, locationKeywords: [], featureKeywords: [] };
    }
    
    return response.data;
  } catch (error: unknown) {
    logger.error("AI 키워드생성 오류:", error);
    
    // AxiosError 타입 체크
    if (axios.isAxiosError(error)) {
      logger.error("오류 세부 정보:", error.response?.data || error.message || "알 수 없는 오류");
    } else {
      logger.error("오류 메시지:", error instanceof Error ? error.message : "알 수 없는 오류");
    }
    
    // 기본 키워드 생성 없이 실패 응답만 반환
    throw error;
  }
}

export async function combineKeywords(locationKeywords: string[], featureKeywords: string[]): Promise<CombinedKeywordsResponse> {
  logger.info("키워드 조합 함수 호출:", { locationKeywords, featureKeywords });
  
  try {
    const response = await apiClient.post<CombinedKeywordsResponse>("/keyword/combine", {
      locationKeywords,
      featureKeywords,
    });
    
    logger.info("키워드 조합 함수 데이터:", response.data);
    
    return response.data;
  } catch (error: unknown) {
    logger.error("combineKeywords API 오류:", error);
    throw error;
  }
}

export async function checkSearchVolume(normalizedUrl: string, candidateKeywords: string[]): Promise<SearchVolumeResponse> {
  logger.info("월 검색량 함수 호출:", { normalizedUrl, candidateKeywords });
  
  try {
    const response = await apiClient.post<SearchVolumeResponse>(
      `/keyword/search-volume?normalizedUrl=${normalizedUrl}`,
      { candidateKeywords }
    );
    
    logger.info("월 검색량 데이터:", response.data);
    
    return response.data;
  } catch (error: unknown) {
    logger.error("checkSearchVolume API 오류:", error);
    throw error;
  }
}

export async function groupKeywords(externalDataList: ExternalData[]): Promise<GroupedKeywordsResponse> {
  logger.info("키워드 그룹화 시작", { dataCount: externalDataList.length });
  
  // 데이터 검증
  if (!Array.isArray(externalDataList)) {
    logger.error("유효하지 않은 데이터 형식: 배열이 아님");
    return { success: false, finalKeywords: [] };
  }
  
  // 빈 데이터 검증: 그룹화 없이 성공으로 처리
  if (externalDataList.length === 0) {
    logger.warn("전달된 키워드가 없습니다. 그룹화 단계를 건너뜁니다.");
    return { success: true, finalKeywords: [] };
  }
  
  // 데이터 형식 검증
  const isValidData = externalDataList.every(item => 
    typeof item === 'object' && 
    item !== null && 
    typeof item.keyword === 'string' && 
    typeof item.monthlySearchVolume === 'number'
  );
  
  if (!isValidData) {
    logger.error("groupKeywords: 유효하지 않은 데이터 형식", externalDataList);
    return { success: false, finalKeywords: [] };
  }
  
  // 최대 재시도 횟수 설정
  const maxRetries = 2;
  let retries = 0;
  
  // 백오프 지연 시간 (ms)
  const backoffDelay = (attempt: number) => Math.min(1000 * (2 ** attempt), 10000);
  
  while (retries <= maxRetries) {
    logger.debug(`그룹화 시도 ${retries + 1}/${maxRetries + 1}`);
        try {

      const response = await apiClient.post<GroupedKeywordsResponse>(
        "/keyword/group",
        { externalDataList },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000 // 타임아웃을 30초로 증가
        }
      );
      
      logger.info("groupKeywords 반환 데이터:", response.data);
      
      if (!response.data || !Array.isArray(response.data.finalKeywords)) {
        logger.error("유효하지 않은 응답 형식:", response.data);
        return { success: false, finalKeywords: [] };
      }
      logger.info("키워드 그룹화 성공", { keywordCount: response.data.finalKeywords.length });
      return response.data;
    } catch (error: unknown) {
      logger.group(`그룹화 시도 ${retries + 1} 실패`, () => {
        logger.error("오류 정보", error);
        
        if (axios.isAxiosError(error) && error.response) {
          logger.debug("서버 응답", {
            status: error.response.status,
            data: error.response.data
          });
        }
      });
      // 서버 응답 디버깅 - Axios 에러인 경우에만 response 프로퍼티에 접근
      if (axios.isAxiosError(error) && error.response) {
        logger.error("서버 응답 내용:", error.response.data);
      }
      
      // 타임아웃 에러인 경우 재시도
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        retries++;
        
        // 최대 재시도 횟수를 초과하지 않았다면 재시도
        if (retries <= maxRetries) {
          const delay = backoffDelay(retries);
          logger.info(`타임아웃 발생, ${delay}ms 후 재시도 (${retries}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // 최대 재시도 횟수를 초과했거나 타임아웃 이외의 오류인 경우
      return { 
        success: false, 
        finalKeywords: [] 
      };
    }
  }
  
  // 이 부분에 도달하지 않아야 하지만, TypeScript를 위해 명시적 반환
  return { 
    success: false, 
    finalKeywords: [] 
  };
}

export async function saveSelectedKeywords(
  finalKeywords: FinalKeyword[], 
  user_id: string | number, 
  place_id: string | number
): Promise<{ success: boolean }> {
  logger.info("선택한 키워드 저장 및 크롤링:", { 
    finalKeywords, 
    user_id, 
    place_id 
  });
  
  try {
    // API가 기대하는 형식으로 데이터 구성
    const apiPayload = {
      user_id,
      place_id,
      finalKeywords
    };
    
    logger.debug("API 페이로드:", apiPayload);
    
    const response = await apiClient.post<{ success: boolean }>(
      "/keyword/save-selected",
      apiPayload,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    return response.data;
  } catch (error: unknown) {
    logger.error("선택한 키워드 저장 및 크롤링 오류:", error);
    
    // 오류 응답이 있는 경우 추가 로깅
    if (typeof window !== 'undefined') {
      window.setLogLevel = (level: LogLevel) => {
        if (LOG_PRIORITIES[level] !== undefined) {
          localStorage.setItem('log_level', level);
          console.log(`로그 레벨이 '${level}'로 변경되었습니다.`);
        } else {
          console.error(`유효하지 않은 로그 레벨: ${level}`);
        }
      };
    }
    
    throw error;
  }
}
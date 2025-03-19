import apiClient from "@/lib/apiClient"
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

// 간소화된 API 함수들 - 응답 타입 수정
export async function normalizeUrl(url: string, platform: Platform): Promise<NormalizeResponse> {
  console.log("normalizeUrl 함수 호출:", { url, platform });
  
  try {
    const response = await apiClient.post<NormalizeResponse>("/keyword/normalize", {
      url, 
      platform,
    });
    
    console.log("normalizeUrl API 응답:", response);
    console.log("normalizeUrl 반환 데이터:", response.data);
    
    return response.data;
  } catch (error) {
    console.error("normalizeUrl API 오류:", error);
    throw error;
  }
}

export async function storePlace(userId: string, placeInfo: Partial<Business>): Promise<{ success: boolean }> {
  console.log("storePlace 함수 호출:", { userId, placeInfo });
  
  try {
    const response = await apiClient.post<{ success: boolean }>("/keyword/store-place", {
      user_id: userId,
      ...placeInfo,
    });
    
    console.log("storePlace API 응답:", response);
    console.log("storePlace 반환 데이터:", response.data);
    
    return response.data;
  } catch (error) {
    console.error("storePlace API 오류:", error);
    throw error;
  }
}

export async function generateKeywords(placeInfo: Partial<PlaceInfoWithUser>): Promise<ChatGptKeywords> {
  console.log("generateKeywords 함수 호출:", { placeInfo });
  
  try {
    const response = await apiClient.post<ChatGptKeywords>("/keyword/chatgpt", {
      placeInfo
    });
    
    console.log("generateKeywords API 응답:", response);
    console.log("generateKeywords 반환 데이터:", response.data);
    
    return response.data;
  } catch (error) {
    console.error("generateKeywords API 오류:", error);
    throw error;
  }
}

export async function combineKeywords(locationKeywords: string[], featureKeywords: string[]): Promise<CombinedKeywordsResponse> {
  console.log("combineKeywords 함수 호출:", { locationKeywords, featureKeywords });
  
  try {
    const response = await apiClient.post<CombinedKeywordsResponse>("/keyword/combine", {
      locationKeywords,
      featureKeywords,
    });
    
    console.log("combineKeywords API 응답:", response);
    console.log("combineKeywords 반환 데이터:", response.data);
    
    return response.data;
  } catch (error) {
    console.error("combineKeywords API 오류:", error);
    throw error;
  }
}

export async function checkSearchVolume(normalizedUrl: string, candidateKeywords: string[]): Promise<SearchVolumeResponse> {
  console.log("checkSearchVolume 함수 호출:", { normalizedUrl, candidateKeywords });
  
  try {
    const response = await apiClient.post<SearchVolumeResponse>(
      `/keyword/search-volume?normalizedUrl=${normalizedUrl}`,
      { candidateKeywords }
    );
    
    console.log("checkSearchVolume API 응답:", response);
    console.log("checkSearchVolume 반환 데이터:", response.data);
    
    return response.data;
  } catch (error) {
    console.error("checkSearchVolume API 오류:", error);
    throw error;
  }
}

export async function groupKeywords(externalDataList: ExternalData[]): Promise<GroupedKeywordsResponse> {
  console.log("groupKeywords 함수 호출:", { externalDataList });
  
  try {
    const response = await apiClient.post<GroupedKeywordsResponse>("/keyword/group", {
      externalDataList
    });
    
    console.log("groupKeywords API 응답:", response);
    console.log("groupKeywords 반환 데이터:", response.data);
    
    return response.data;
  } catch (error) {
    console.error("groupKeywords API 오류:", error);
    throw error;
  }
}

export async function saveSelectedKeywords(finalKeywords: FinalKeyword[]): Promise<{ success: boolean }> {
  console.log("saveSelectedKeywords 함수 호출:", { finalKeywords });
  
  try {
    const response = await apiClient.post<{ success: boolean }>("/keyword/save-selected", {
      finalKeywords
    });
    
    console.log("saveSelectedKeywords API 응답:", response);
    console.log("saveSelectedKeywords 반환 데이터:", response.data);
    
    return response.data;
  } catch (error) {
    console.error("saveSelectedKeywords API 오류:", error);
    throw error;
  }
}
// hooks/useUserBusinesses.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";
import apiClient from "@/lib/apiClient";
import { Business } from "@/types";
import { useUser } from "@/hooks/useUser";
import { AxiosError } from 'axios'; // Import AxiosError from axios

// Business limits by role
const BUSINESS_LIMITS = {
  user: 1,
  plus: 10,
  admin: 999, // Admins can create virtually unlimited businesses
} as const;

export function useUserBusinesses(userId: string | undefined, options?: { enabled?: boolean }) {
  const [activeBusiness, setActiveBusinessState] = useState<Business | null>(null);
  const [userRole, setUserRole] = useState<string>("user");
  const { data: userData } = useUser();

  useEffect(() => {
    try {
      const storedBusiness = localStorage.getItem('activeBusiness');
      if (storedBusiness) {
        const parsed = JSON.parse(storedBusiness);
        setActiveBusinessState(parsed);
      }
    } catch (error) {
      console.error("Failed to restore active business from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    if (userData?.role) {
      setUserRole(userData.role);
    }
  }, [userData]);

  const {
    data: businesses,
    isLoading,
    isError,
    error: queryError, // Capture the error object from useQuery
    refetch,
  } = useQuery<Business[], Error>({
    queryKey: ["userBusinesses", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('userId가 제공되지 않았습니다');
      }
      
      console.log('[useUserBusinesses] API 호출 시작:', { userId, type: typeof userId });
      
      try {
        const response = await apiClient.get(`/api/place?userId=${userId}`);
        const apiResponsePayload = response.data;

        console.log('[useUserBusinesses] API 응답 받음:', apiResponsePayload);

        // API 응답에서 data 프로퍼티를 추출합니다
         
        let businessesArray: Business[] = [];

        if (apiResponsePayload && typeof apiResponsePayload === 'object' && apiResponsePayload !== null && Array.isArray(apiResponsePayload.data)) {
          businessesArray = apiResponsePayload.data;
          console.log('[useUserBusinesses] 응답에서 data 배열 추출:', businessesArray);
        } 
        else if (Array.isArray(apiResponsePayload)) {
          // 호환성을 위해 직접 배열 응답도 처리
          businessesArray = apiResponsePayload as Business[];
          console.log('[useUserBusinesses] 직접 배열 응답 처리:', businessesArray);
        } 
        else {
          console.error("예상치 못한 API 응답 구조입니다:", apiResponsePayload);
          throw new Error("예상치 못한 API 응답 구조"); 
        }
        
        const processedBusinesses = businessesArray
          .filter((business) => business != null) // null/undefined 필터링
          .map((business) => {
            const displayName = business.place_name || "내 업체 " + String(business.place_id).slice(-4);
            
            return {
              ...business,
              display_name: displayName,
              place_name: business.place_name || "이름 없음",
              is_favorite: business.is_favorite, // Favorite flag from API
              platform: business.platform || 'naver', // 기본값 설정
              category: business.category, // category 명시적으로 전달
              isNewlyOpened: Boolean(business.isNewlyOpened) // 숫자를 boolean으로 변환
            };
          });
          
        console.log('[useUserBusinesses] 처리된 비즈니스 데이터:', processedBusinesses);
        return processedBusinesses;
      } catch (err) {
        console.error("[useUserBusinesses] 비즈니스 데이터 조회 오류:", err);
        if (err instanceof AxiosError) {
          console.error("서버 오류 응답:", err.response?.data);
          const status = err.response?.status;
          if (status === 401) {
            throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
          } else if (status === 403) {
            throw new Error('업체 정보에 접근할 권한이 없습니다.');
          } else if (status && status >= 500) {
            throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
          }
        } else if (err instanceof Error) {
          console.error("일반 오류 메시지:", err.message);
        }
        throw err; 
      }
    },
    enabled: !!userId && (options?.enabled !== false), 
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      // 401, 403 오류는 재시도하지 않음
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          return false;
        }
      }
      // 다른 오류는 최대 2번까지 재시도
      return failureCount < 2;
    },
  });

  // Query enabled 상태 로깅
  useEffect(() => {
    console.log('[useUserBusinesses] Query enabled 상태:', {
      userId,
      hasUserId: !!userId,
      optionsEnabled: options?.enabled !== false,
      finalEnabled: !!userId && (options?.enabled !== false),
      isLoading,
      isError
    });
  }, [userId, options?.enabled, isLoading, isError]);

  // Log query error if it exists
  useEffect(() => {
    if (queryError) {
      console.error("Query Error in useUserBusinesses:", queryError);
    }
  }, [queryError]);

  // Helper functions for business limit checks
  const getBusinessLimit = (role: string) => {
    return BUSINESS_LIMITS[role as keyof typeof BUSINESS_LIMITS] || BUSINESS_LIMITS.user;
  };
  
  const canAddMoreBusinesses = () => {
    if (!businesses) return false;
    const limit = getBusinessLimit(userRole);
    return businesses.length < limit;
  };
  
  const getRemainingBusinessCount = () => {
    if (!businesses) return 0;
    const limit = getBusinessLimit(userRole);
    return Math.max(0, limit - businesses.length);
  };

  const queryClient = useQueryClient();
  
  const setActiveBusinessOptimistic = useCallback(async (business: Business | null) => {
    if (activeBusiness?.place_id === business?.place_id) {
      return;
    }
    
    setActiveBusinessState(business);
    
    if (business) {
      localStorage.setItem('activeBusiness', JSON.stringify(business));
    } else {
      localStorage.removeItem('activeBusiness');
    }
    
    if (business && userId) {
      setTimeout(() => {
        const placeIdStr = String(business.place_id);
        const userIdStr = String(userId);
        
        queryClient.invalidateQueries({
          queryKey: ['keywordRankingDetails', placeIdStr, userIdStr],
        });
        
        queryClient.invalidateQueries({
          queryKey: ['userKeywords', userIdStr, placeIdStr],
        });
      }, 0);
    }
  }, [queryClient, userId, activeBusiness?.place_id]);

  useEffect(() => {
    if (activeBusiness || !businesses?.length) return;
    
    const storedBusinessId = localStorage.getItem('activeBusiness');
    if (storedBusinessId) {
      try {
        const parsed = JSON.parse(storedBusinessId);
        const matchedBusiness = businesses.find((b: Business) => 
          String(b.place_id) === String(parsed.place_id)
        );
  
        if (matchedBusiness) {
          setActiveBusinessState(matchedBusiness);
          return;
        }
      } catch (e) {
        console.error("저장된 업체 정보 처리 오류:", e);
      }
    }
  
    if (businesses[0]) {
      setActiveBusinessState(businesses[0]);
      localStorage.setItem('activeBusiness', JSON.stringify(businesses[0]));
    }
    
  }, [businesses, activeBusiness]);

  return {
    businesses,
    activeBusiness,
    setActiveBusiness: setActiveBusinessOptimistic, // Use the renamed function
    isLoading,
    isError,
    error: queryError, // Expose the error from useQuery
    refetch,
    businessLimit: getBusinessLimit(userRole),
    canAddMoreBusinesses: canAddMoreBusinesses(),
    remainingBusinessCount: getRemainingBusinessCount(),
    userRole,
  };
}

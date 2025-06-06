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

export function useUserBusinesses(userId: string | undefined) {
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
        console.log("useUserBusinesses에 userId가 제공되지 않았습니다");
        return [];
      }
      console.log("userId에 대한 비즈니스 데이터 조회:", userId);
      try {
        const response = await apiClient.get('/api/place?userId=' + userId);
        const apiResponsePayload = response.data;

        console.log("비즈니스 API 응답 (axios response.data):", apiResponsePayload);

        console.log("API 응답 구조 (apiResponsePayload):", {
          hasDataProperty: apiResponsePayload && typeof apiResponsePayload === 'object' ? 'data' in apiResponsePayload : 'payload not an object',
          dataTypeOfPayload: typeof apiResponsePayload,
          isPayloadArray: Array.isArray(apiResponsePayload),
          topLevelKeysInPayload: apiResponsePayload && typeof apiResponsePayload === 'object' && apiResponsePayload !== null ? Object.keys(apiResponsePayload) : "payload is not a non-null object",
          isDataPropertyArray: apiResponsePayload && typeof apiResponsePayload === 'object' && apiResponsePayload !== null && apiResponsePayload.data ? Array.isArray(apiResponsePayload.data) : "payload.data is not accessible or payload not an object"
        });

        let businessesArray: Business[] = [];

        if (apiResponsePayload && typeof apiResponsePayload === 'object' && apiResponsePayload !== null && Array.isArray(apiResponsePayload.data)) {
          businessesArray = apiResponsePayload.data;
        } 
        else if (Array.isArray(apiResponsePayload)) {
          console.warn("API 응답이 직접 배열입니다. 이는 현재 백엔드 설계와 다릅니다. 확인이 필요합니다.", apiResponsePayload);
          businessesArray = apiResponsePayload as Business[];
        } 
        else {
          console.error("예상치 못한 API 응답 구조입니다. 'data' 속성에서 배열을 찾을 수 없거나, 페이로드가 올바르지 않습니다:", apiResponsePayload);
          throw new Error("예상치 못한 API 응답 구조"); 
        }
        
        return businessesArray.map((business) => {
          const displayName = business.place_name || "내 업체 " + String(business.place_id).slice(-4);
          
          return {
            ...business,
            display_name: displayName, 
            place_name: business.place_name || "이름 없음"
          };
        });
      } catch (err) { // Changed variable name to err to avoid conflict with queryError
        console.error("비즈니스 데이터 조회 오류:", err);
        if (err instanceof AxiosError && err.response) {
          console.error("서버 오류 응답:", err.response.data);
        } else if (err instanceof Error) {
          console.error("일반 오류 메시지:", err.message);
        }
        throw err; 
      }
    },
    enabled: !!userId, 
    staleTime: 1000 * 60 * 5, 
  });

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

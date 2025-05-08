// hooks/useUserBusinesses.ts
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState, useCallback } from "react"
import apiClient from "@/lib/apiClient"
import { Business } from "@/types"
import { useUser } from "@/hooks/useUser" // Import useUser hook


// Business limits by role
const BUSINESS_LIMITS = {
  user: 1,
  plus: 10,
  admin: 999, // Admins can create virtually unlimited businesses
} as const;

export function useUserBusinesses(userId: string | undefined) {
  const [activeBusiness, setActiveBusinessState] = useState<Business | null>(null)
  const [userRole, setUserRole] = useState<string>("user") // Default to 'user' role
  
  // Use the useUser hook instead of direct API call
  const { data: userData } = useUser();

  // Load active business from localStorage on mount
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

  // Get user role from useUser hook
  useEffect(() => {
    if (userData?.role) {
      setUserRole(userData.role);
    }
  }, [userData]);

  const {
    data: businesses,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["userBusinesses", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("useUserBusinesses에 userId가 제공되지 않았습니다");
        return [];
      }
      console.log("userId에 대한 비즈니스 데이터 조회:", userId);
      try {
        const response = await apiClient.get(`/api/place?userId=${userId}`);
        console.log("비즈니스 API 응답:", response.data);
        
        // 문제가 여기에 있을 수 있음 - response.data의 실제 구조를 확인하고
        // 비즈니스 배열을 정확하게 추출합니다
        
        // 정확한 구조를 확인하기 위한 상세 로깅 추가
        
        console.log("API 응답 구조:", {
          hasBusinessesProperty: 'businesses' in response.data,
          dataType: typeof response.data,
          isArray: Array.isArray(response.data),
          topLevelKeys: Object.keys(response.data)
        });
        
        // 다양한 가능한 응답 구조를 처리하는 로직
        if (Array.isArray(response.data)) {
          // response.data가 이미 비즈니스 배열인 경우
          return response.data;
        } else if (response.data.businesses && Array.isArray(response.data.businesses)) {
          // response.data에 businesses 속성이 배열인 경우
          return response.data.businesses;
        } else if (response.data && Array.isArray(response.data)) {
          // API가 데이터를 data 속성으로 감싸는 경우
          return response.data;
        } else if (response.data && response.data.businesses && Array.isArray(response.data.businesses)) {
          // API가 data.businesses와 같은 중첩 구조를 사용하는 경우
          return response.data.businesses;
        } else {
          // 인식 가능한 구조가 없는 경우, 로그 기록 후 빈 배열 반환
          console.error("예상치 못한 API 응답 구조:", response.data);
          return [];
        }
      } catch (error) {
        console.error("비즈니스 데이터 조회 오류:", error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })

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

  // Updated setActiveBusiness function
  const queryClient = useQueryClient();
  
  const setActiveBusiness = useCallback(async (business: Business | null) => {
    // 1. 동일한 business면 아무것도 안함 - 현재 구현과 동일
    if (activeBusiness?.place_id === business?.place_id) {
      return; // 같은 비즈니스면 아무 작업도 하지 않음
    }
    
    // 2. 상태 업데이트와 localStorage 저장
    setActiveBusinessState(business);
    
    if (business) {
      localStorage.setItem('activeBusiness', JSON.stringify(business));
    } else {
      localStorage.removeItem('activeBusiness');
    }
    
    // 3. 상태 업데이트 후 별도 실행으로 무한 루프 방지
    if (business && userId) {
      // 상태 업데이트 로직과 쿼리 무효화를 분리하기 위해 setTimeout 사용
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
    // 이미 activeBusiness가 설정되어 있으면 작업 중지
    if (activeBusiness || !businesses?.length) return;
    
    const storedBusinessId = localStorage.getItem('activeBusiness');
    if (storedBusinessId) {
      try {
        const parsed = JSON.parse(storedBusinessId);
        const matchedBusiness = businesses.find((b: Business) => 
          String(b.place_id) === String(parsed.place_id)
        );
  
        if (matchedBusiness) {
          setActiveBusinessState(matchedBusiness); // 직접 상태 설정으로 변경
          return;
        }
      } catch (e) {
        console.error("저장된 업체 정보 처리 오류:", e);
      }
    }
  
    // localStorage에 맞는게 없으면 기본 첫번째 업체로 설정
    setActiveBusinessState(businesses[0]); // 직접 상태 설정으로 변경
    localStorage.setItem('activeBusiness', JSON.stringify(businesses[0]));
    
  }, [businesses, activeBusiness, setActiveBusiness]); // 누락된 의존성 추가

  return {
    businesses,
    activeBusiness,
    setActiveBusiness,
    isLoading,
    isError,
    refetch,
    // Add new properties
    businessLimit: getBusinessLimit(userRole),
    canAddMoreBusinesses: canAddMoreBusinesses(),
    remainingBusinessCount: getRemainingBusinessCount(),
    userRole,
  }
}
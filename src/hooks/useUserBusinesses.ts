// hooks/useUserBusinesses.ts
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import apiClient from "@/lib/apiClient"
import { Business } from "@/types"

export function useUserBusinesses(userId: string | undefined) {
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null)

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

  // 첫 로드 시 첫 번째 비즈니스를 active로 설정
  useEffect(() => {
    if (businesses?.length && !activeBusiness) {
      setActiveBusiness(businesses[0])
    }
  }, [businesses, activeBusiness])

  return {
    businesses,
    activeBusiness,
    setActiveBusiness,
    isLoading,
    isError,
    refetch,
  }
}
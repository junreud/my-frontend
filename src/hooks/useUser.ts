"use client"

import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient"
import { AxiosError } from 'axios'

// (A) Business 타입
export interface Business {
  place_name: string
}

// (B) User 타입에 businesses 추가
export interface User {
  id: number
  name: string
  email: string
  avatar_url: string
  businesses?: Business[]
  role: string;
  url_registration?: number; // 추가: 사용자 가입 상태 확인용
}

// (C) React Query로 user 정보 가져오기 + staleTime 설정
export function useUser(options: Partial<UseQueryOptions<User>> = {}) {
  return useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/api/user/me")
        console.log('[useUser] API response (auto-unwrapped):', res.data);
        
        // API 클라이언트에서 이미 unwrap된 데이터가 옴
        return res.data;
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        // 401 오류의 경우 더 구체적인 에러 메시지
        if (error instanceof AxiosError && error.response?.status === 401) {
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5분 동안은 캐싱된 데이터 사용
    retry: (failureCount, error) => {
      // 401 오류는 재시도하지 않음
      if (error instanceof AxiosError && error.response?.status === 401) {
        return false;
      }
      // 다른 오류는 최대 2번까지 재시도
      return failureCount < 2;
    },
    // cacheTime: 1000 * 60 * 10, // 필요하면 캐시 유지 시간도 추가
    ...options // 외부에서 전달된 옵션 병합
  })
}

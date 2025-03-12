"use client"

import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient"

// (A) Business 타입
export interface Business {
  place_name: string
  platform: string
}

// (B) User 타입에 businesses 추가
export interface User {
  id: number
  name: string
  email: string
  avatar_url?: string
  // ...
  businesses?: Business[]
}

// (C) React Query로 user 정보 가져오기 + staleTime 설정
export function useUser() {
  return useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await apiClient.get("/api/user/me")
      return res.data
    },
    staleTime: 1000 * 60 * 5, // 5분 동안은 캐싱된 데이터 사용
    // cacheTime: 1000 * 60 * 10, // 필요하면 캐시 유지 시간도 추가
  })
}

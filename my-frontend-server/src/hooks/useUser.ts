"use client"

import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { useState, useEffect } from "react"
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
  // 클라이언트 사이드에서만 실행되도록 useState로 관리
  const [isClient, setIsClient] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    // 브라우저 환경에서만 실행
    if (typeof window !== 'undefined') {
      setIsClient(true);
      setCurrentPath(window.location.pathname);
    }
  }, []);

  // 공개 페이지에서는 useUser를 비활성화
  const publicPages = [
    '/', 
    '/login', 
    '/signup', 
    '/password-reset',
    '/service',
    '/company-info',
    '/blog',
    '/support',
    '/faq',
    '/about',
    '/estimate',
    '/terms',
    '/privacy'
  ];
  const isPublicPage = publicPages.includes(currentPath);
  
  // 더 확실한 클라이언트 사이드 감지
  const shouldEnable = isClient && !isPublicPage;

  // 디버깅 로그를 한 번만 실행하도록 수정
  useEffect(() => {
    if (isClient) {
      console.log('[useUser] Hook 초기화:', { 
        isClient,
        isPublicPage, 
        currentPath: currentPath || 'SSR',
        windowUndefined: typeof window === 'undefined',
        shouldEnable
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]); // isClient가 변경될 때만 실행

  const query = useQuery<User>({
    queryKey: ["user"],
    enabled: shouldEnable, // 공개 페이지에서는 비활성화
    queryFn: async () => {
      console.log('[useUser] API 호출 시작');
      console.log('[useUser] localStorage 토큰:', localStorage.getItem("accessToken") ? "있음" : "없음");
      
      try {
        // 10초 타임아웃 추가
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('[useUser] 타임아웃으로 요청 취소');
          controller.abort();
        }, 10000);
        
        console.log('[useUser] axios 요청 전송 중...');
        const res = await apiClient.get("/api/user/me", {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('[useUser] API 응답 상태:', res.status);
        console.log('[useUser] API 응답 데이터:', res.data);
        
        // 백엔드 응답이 {success, data: {...}} 형태로 래핑된 경우 unwrap
        let userData;
        if (res.data && typeof res.data === 'object' && 'data' in res.data && res.data.data) {
          userData = res.data.data;
          console.log('[useUser] 래핑된 응답에서 data 추출:', userData);
        } else {
          userData = res.data;
          console.log('[useUser] 직접 응답 사용:', userData);
        }
        
        return userData;
      } catch (error) {
        console.error('[useUser] API 호출 실패:', error);
        
        // 타임아웃 에러 처리
        if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
          console.error('[useUser] API 호출 타임아웃 (10초)');
          throw new Error('API_TIMEOUT');
        }
        
        // 401 오류는 로그인하지 않은 상태이므로 조용히 처리
        if (error instanceof AxiosError && error.response?.status === 401) {
          console.log('[useUser] 로그인하지 않은 사용자 - 401 오류 무시');
          throw new Error('NOT_AUTHENTICATED'); // 특별한 에러 메시지로 구분
        }
        console.error('[useUser] 예상치 못한 오류:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5분 동안은 캐싱된 데이터 사용
    gcTime: 1000 * 60 * 10, // 캐시 유지 시간
    retry: (failureCount, error) => {
      // 401 오류는 재시도하지 않음
      if (error instanceof AxiosError && error.response?.status === 401) {
        return false;
      }
      // 다른 오류는 최대 2번까지 재시도
      return failureCount < 2;
    },
    retryDelay: 1000, // 1초 후 재시도
    // cacheTime: 1000 * 60 * 10, // 필요하면 캐시 유지 시간도 추가
    ...options // 외부에서 전달된 옵션 병합
  });

  // React Query 상태 로깅
  useEffect(() => {
    console.log('[useUser] Query 상태 변경:', {
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      isError: query.isError,
      data: query.data ? {
        id: query.data.id,
        name: query.data.name,
        email: query.data.email,
        role: query.data.role
      } : 'null',
      error: query.error?.message || 'none'
    });
  }, [query.isLoading, query.isFetching, query.isError, query.data, query.error]);

  return query;
}

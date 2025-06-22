// lib/apiClient.ts
import axios from "axios";
import { API_BASE_URL } from "./config";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // HttpOnly 쿠키 전송을 위해 필요
});

// request interceptor (액세스 토큰 헤더 붙이기)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    console.log(`[apiClient] 요청: ${config.method?.toUpperCase()} ${config.url}`);
    console.log(`[apiClient] 저장된 토큰:`, token ? `${token.substring(0, 20)}...` : '없음');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[apiClient] Authorization 헤더 설정됨`);
    } else {
      console.log(`[apiClient] Authorization 헤더 없음`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let pendingRequests: (() => void)[] = [];

// response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // 백엔드 응답이 {success, message, data} 형태로 래핑된 경우는 그대로 유지
    // unwrap하지 않고 클라이언트에서 직접 처리하도록 함
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 현재 경로가 공개 페이지인지 확인
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const publicPaths = ['/', '/login', '/signup', '/password-reset'];
      
      // 공개 페이지에서는 토큰 갱신을 시도하지 않음
      if (publicPaths.includes(currentPath)) {
        console.log(`[apiClient] 공개 페이지에서 401 오류 - 토큰 갱신 건너뛰기: ${currentPath}`);
        return Promise.reject(error);
      }

      // localStorage에 토큰이 없으면 갱신을 시도하지 않음
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.log(`[apiClient] 액세스 토큰이 없음 - 토큰 갱신 건너뛰기`);
        if (typeof window !== 'undefined') {
          console.log(`[apiClient] 로그인 페이지로 리디렉트`);
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      // (1) 이미 refresh 진행 중이라면, 동시 요청들은 기다렸다가 재시도
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push(() => {
            apiClient(originalRequest).then(resolve).catch(reject);
          });
        });
      }

      // (2) 처음 만나는 401이면, _retry 플래그 세팅
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // (3) /auth/refresh 호출
        console.log(`[apiClient] 토큰 갱신 시도...`);
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        console.log(`[apiClient] 토큰 갱신 응답:`, res.data);
        
        // 백엔드 응답이 { success, message, data: { accessToken, refreshToken } } 형태로 래핑되어 있는 경우 처리
        let newAccessToken;
        if (res.data && typeof res.data === 'object' && 'data' in res.data && res.data.data && res.data.data.accessToken) {
          newAccessToken = res.data.data.accessToken;
        } else if (res.data && res.data.accessToken) {
          newAccessToken = res.data.accessToken;
        } else {
          console.error(`[apiClient] 예상치 못한 토큰 갱신 응답 구조:`, res.data);
          throw new Error('토큰 갱신 응답에서 accessToken을 찾을 수 없습니다.');
        }
        
        console.log(`[apiClient] 새 토큰 받음:`, newAccessToken ? `${newAccessToken.substring(0, 20)}...` : '없음');
      
        // (4) localStorage에 토큰 갱신
        localStorage.setItem("accessToken", newAccessToken);
        console.log(`[apiClient] localStorage에 토큰 저장 완료`);
      
        // (5) 대기 중이던 요청들 재시도
        pendingRequests.forEach((callback) => callback());
        pendingRequests = [];
      
        // 원래 요청 재시도
        console.log(`[apiClient] 원래 요청 재시도: ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`);
        return apiClient(originalRequest); 
      } catch (err) {
        console.log(`[apiClient] 토큰 갱신 실패 - 로그인되지 않은 사용자일 가능성 높음`);
        pendingRequests = [];
        // 쿠키 문제일 경우 로그아웃으로 처리
        localStorage.removeItem("accessToken");
        console.log(`[apiClient] localStorage에서 토큰 제거됨`);
        // 토큰 만료 시 로그인 페이지로 리디렉션 (홈페이지는 제외)
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          // 홈페이지('/'), 로그인 페이지, 회원가입 페이지는 리다이렉트하지 않음
          const publicPaths = ['/', '/login', '/signup', '/password-reset'];
          if (!publicPaths.includes(currentPath)) {
            console.log(`[apiClient] 로그인 페이지로 리디렉션`);
            window.location.href = '/login';
          } else {
            console.log(`[apiClient] 공개 페이지이므로 리디렉션 건너뛰기: ${currentPath}`);
          }
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

/**
 * Wrapper for server-side fetching using axios instance
 */
export async function fetchServerAPI(endpoint: string) {
  const response = await apiClient.get(endpoint);
  return response.data;
}

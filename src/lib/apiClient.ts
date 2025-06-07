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
    // 백엔드 응답이 {success, message, data} 형태로 래핑된 경우 자동으로 unwrap
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      console.log(`[apiClient] Unwrapping response data for ${response.config.url}`);
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
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
        console.log(`[apiClient] 토큰 갱신 실패:`, err);
        pendingRequests = [];
        // 쿠키 문제일 경우 로그아웃으로 처리
        localStorage.removeItem("accessToken");
        console.log(`[apiClient] localStorage에서 토큰 제거됨`);
        // 토큰 만료 시 로그인 페이지로 리디렉션
        if (typeof window !== 'undefined') {
          console.log(`[apiClient] 로그인 페이지로 리디렉션`);
          window.location.href = '/login';
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

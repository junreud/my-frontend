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
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let pendingRequests: (() => void)[] = [];

// response interceptor
apiClient.interceptors.response.use(
  (response) => response,
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
        // (3) /auth/refresh로 POST
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newAccessToken = res.data.accessToken;
      
        // (4) localStorage에 토큰 갱신
        localStorage.setItem("accessToken", newAccessToken);
      
        // (5) 대기 중이던 요청들 재시도
        pendingRequests.forEach((callback) => callback());
        pendingRequests = [];
      
        // 원래 요청 재시도
        return apiClient(originalRequest); 
      } catch (err) {
        isRefreshing = false;
        pendingRequests = [];
        // 쿠키 문제일 경우 로그아웃으로 처리
        localStorage.removeItem("accessToken");
        // 토큰 만료 시 로그인 페이지로 리디렉션
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }

      // (6) 새 토큰으로 원래 요청 재시도
      return apiClient(originalRequest);
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

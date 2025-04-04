/**
 * 환경 설정 관련 유틸리티
 * - 개발/배포 환경에 따른 API URL 설정
 * - 기타 환경별 설정값 관리
 */

/**
 * 환경 감지 및 API URL 결정
 */
export const getApiBaseUrl = () => {
  // 클라이언트 측에서 호스트 이름으로 환경 감지
  if (typeof window !== 'undefined') {
    // localhost나 127.0.0.1이면 개발 환경으로 간주
    const isLocalhost = 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1';
    
    return isLocalhost 
      ? 'https://localhost:4000' 
      : process.env.NEXT_PUBLIC_API_URL || 'https://api.lakabes.com';
  }
  
  // 서버 사이드 렌더링 중
  return process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL || 'https://api.lakabe.com'
    : 'https://localhost:4000';
};

export const API_BASE_URL = getApiBaseUrl();

// 상수값 등 추가 설정 추가 가능
export const APP_CONFIG = {
  apiUrl: API_BASE_URL,
  maxItemsPerPage: 100,
  // 추가 설정...
};

/**
 * 환경 설정 관련 유틸리티
 * - 개발/배포 환경에 따른 API URL 설정
 * - 간단하고 예측 가능한 설정
 */

/**
 * 환경 감지 및 API URL 결정
 */
export const getApiBaseUrl = () => {
  // 클라이언트 측에서 호스트 이름으로 환경 감지
  if (typeof window !== 'undefined') {
    const isLocalhost = 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      // 개발 환경: 환경변수로 포트 설정 가능
      const backendPort = process.env.NEXT_PUBLIC_BACKEND_PORT || '4000';
      return `https://localhost:${backendPort}`;
    } else {
      return process.env.NEXT_PUBLIC_API_URL || 'https://api.lakabes.com';
    }
  }
  
  // 서버 사이드 렌더링
  const backendPort = process.env.NEXT_PUBLIC_BACKEND_PORT || '4000';
  return process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL || 'https://api.lakabe.com'
    : `https://localhost:${backendPort}`;
};

export const API_BASE_URL = getApiBaseUrl();

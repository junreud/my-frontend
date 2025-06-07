// 디버깅용 토큰 확인 유틸리티
export function debugToken() {
  if (typeof window === 'undefined') {
    console.log('[DEBUG] 서버 사이드에서는 localStorage 접근 불가');
    return;
  }
  
  const token = localStorage.getItem('accessToken');
  console.log('[DEBUG] 현재 저장된 토큰:', token ? `${token.substring(0, 30)}...` : '없음');
  
  if (token) {
    try {
      // JWT 페이로드 디코딩 (검증은 하지 않음)
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('[DEBUG] 토큰 페이로드:', {
        userId: payload.userId,
        exp: payload.exp,
        iat: payload.iat,
        expiresAt: new Date(payload.exp * 1000).toISOString(),
        isExpired: Date.now() / 1000 > payload.exp
      });
    } catch (error) {
      console.log('[DEBUG] 토큰 파싱 실패:', error);
    }
  }
  
  // 쿠키 확인
  console.log('[DEBUG] 현재 쿠키:', document.cookie);
}

// 전역에서 사용할 수 있도록 window에 추가
if (typeof window !== 'undefined') {
  (window as unknown as { debugToken: typeof debugToken }).debugToken = debugToken;
}

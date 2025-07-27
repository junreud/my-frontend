// 토큰 디버깅 유틸리티
export function createExpiredToken() {
  // 만료된 토큰을 생성 (exp가 과거 시간)
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    userId: 8,
    iat: Math.floor(Date.now() / 1000) - 3600, // 1시간 전 발급
    exp: Math.floor(Date.now() / 1000) - 1800  // 30분 전 만료
  };
  const signature = "fake_signature_for_testing";
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function testTokenRefresh() {
  console.log('[Token Debug] 토큰 갱신 테스트 시작');
  
  // 현재 토큰 백업
  const currentToken = localStorage.getItem('accessToken');
  console.log('[Token Debug] 현재 토큰 백업:', currentToken ? `${currentToken.substring(0, 20)}...` : '없음');
  
  // 만료된 토큰 설정
  const expiredToken = createExpiredToken();
  localStorage.setItem('accessToken', expiredToken);
  console.log('[Token Debug] 만료된 토큰 설정 완료');
  
  // API 요청을 통해 토큰 갱신 테스트
  console.log('[Token Debug] 페이지를 새로고침하여 토큰 갱신 테스트를 진행하세요');
  
  return { currentToken, expiredToken };
}

// 전역에서 사용할 수 있도록 window에 추가
if (typeof window !== 'undefined') {
  (window as unknown as { testTokenRefresh: typeof testTokenRefresh; createExpiredToken: typeof createExpiredToken }).testTokenRefresh = testTokenRefresh;
  (window as unknown as { testTokenRefresh: typeof testTokenRefresh; createExpiredToken: typeof createExpiredToken }).createExpiredToken = createExpiredToken;
}

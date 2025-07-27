import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
console.log('▶ ㅇㅁㄴㅇㄹㅁㄴㅇㄹroot middleware 실행');

export function middleware(request: NextRequest) {
  // 1. 요청에서 인증 쿠키 읽기 (!! 실제 쿠키 이름 'authToken' 확인 필요 !!)
  const token = request.cookies.get('authToken')?.value

  // 2. 요청 헤더 복사 및 수정
  const requestHeaders = new Headers(request.headers)

  if (token) {
    // 'Authorization' 헤더에 Bearer 토큰 설정 (백엔드 API 요구사항에 맞게)
    requestHeaders.set('Authorization', `Bearer ${token}`)
  } else {
    // 토큰이 없을 경우 'Authorization' 헤더 제거 (선택적)
    requestHeaders.delete('Authorization')
  }

  // 3. 수정된 헤더로 다음 요청 생성
  return NextResponse.next({
    request: {
      // New request headers
      headers: requestHeaders,
    },
  })
}

// 미들웨어를 적용할 경로 설정
export const config = {
  matcher: [
    /*
     * 인증이 필요한 페이지만 매칭
     * - dashboard 관련 경로
     * - 기타 보호된 경로들
     * 공개 페이지는 제외: /, /service, /company-info, /blog, /support, /faq, /about, /estimate, /terms, /privacy
     */
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/settings/:path*',
    // 다른 보호된 경로들이 있다면 여기에 추가
  ],
}

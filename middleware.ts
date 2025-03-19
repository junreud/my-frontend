// app/middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// 차단할(또는 보호할) 경로 설정
export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};

export async function middleware(req: NextRequest) {
  // NextAuth에 내장된 JWT 검사 함수
  //  - JWT를 해독해 { name, email, role, ... } 등의 payload를 얻을 수 있음
  //  - 쿠키 이름, secret 설정은 next-auth 설정에 맞게 조정
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = req.nextUrl;

  // 1) /admin/** 접근: admin만 허용
  if (pathname.startsWith('/admin')) {
    if (!token || token.role !== 'admin') {
      // 권한 없으면 로그인 페이지로 리다이렉트
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // 2) /dashboard/** 접근: 로그인된 유저(admin or user 등)만 허용
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    // 만약 dashboard도 role 특정해야 한다면 token.role 검사 추가
  }

  // 나머지 경로(/login, / 등)는 누구나 접근 가능
  return NextResponse.next();
}
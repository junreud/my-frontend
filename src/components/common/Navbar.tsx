"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useScrollDirection from "../../hooks/useScrollDirection";
import { Container } from "@/components/common/Container";
import { useUser } from "@/hooks/useUser"; // 추가: useUser 훅 import

interface User {
  role?: "admin" | "user" | "plus" | "pending"; // 추가: 'plus'와 'pending' 역할
}

// NavbarProps: user가 null이면 미로그인, 아니면 User 타입
// user를 선택적 prop으로 변경
interface NavbarProps {
  user?: User | null;
}

export default function Navbar({ user: propUser = null }: NavbarProps) {
  const scrollDirection = useScrollDirection();
  const pathname = usePathname();
  
  // 클라이언트 사이드 렌더링 여부 확인
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 현재 경로는 usePathname으로 가져오기
  const currentPath = pathname;
  
  // 현재 페이지인지 확인하는 함수
  const isCurrentPage = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };
  
  // 공개 페이지인지 확인
  const isPublicPage = [
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
  ].includes(currentPath);
  
  // useUser 훅은 클라이언트에서만 호출하고, 공개 페이지에서는 비활성화
  const userQuery = useUser({
    retry: false, // 재시도 비활성화
    enabled: isClient && !isPublicPage, // 클라이언트이고 공개 페이지가 아닐 때만 실행
    throwOnError: false, // 에러를 throw하지 않음
  });
  
  // 클라이언트 사이드에서만 fetch된 데이터 사용, 에러는 무시
  const fetchedUser = isClient && !userQuery.isError ? userQuery.data : null;
  const isLoading = isClient ? userQuery.isLoading : false;
  
  // prop으로 전달된 user와 fetch된 user 중 유효한 것 사용
  const user = propUser || fetchedUser || null;

  // 로그인 상태 & role
  const isLoggedIn = !!user;
  const userRole = user?.role;


  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  };

  // 링크 URL/문구 (초기값: 비로그인)
  let linkUrl = "/login";
  let linkText = "로그인";

  if (isLoggedIn) {
    // 로그인 상태
    if (userRole === "admin") {
      linkUrl = "/dashboard";
      linkText = "어드민 대시보드";
    } else if (userRole === "user") {
      linkUrl = "/dashboard";
      linkText = "내업체";
    } else if (userRole === "plus") {
      linkUrl = "/dashboard";
      linkText = "내업체";
    } else if (userRole === "pending") {
      linkUrl = "/pending";
      linkText = "심사중";
    } else {
      // 역할이 지정되지 않은 경우
      linkUrl = "/pending";
      linkText = "심사중";
    }
  }



  // 로딩 중 상태 표시 (선택적)
  if (isLoading) {
    // 로딩 중일 때는 간소화된 UI 또는 스켈레톤 UI 표시
    // 여기서는 그냥 기본 UI로 진행 (별도 처리 없음)
  }

  return (
    <nav
      className={`
        font-pretendard
        bg-base-100 fixed top-0 left-0 right-0 z-50
        transition-transform duration-300
        border-b border-gray-200
        bg-white
        ${scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"}
      `}
      aria-label="주요 내비게이션"
    >
      <Container>
        <div className="navbar h-14 flex items-center">
          {/* navbar-start */}
          <div className="navbar-start">
            {/* 모바일용 햄버거 버튼 (763px 이하) */}
            <div className="dropdown p-0 [@media(min-width:763px)]:hidden">
              <label
                tabIndex={0}
                role="button"
                className="btn btn-ghost"
                aria-label="메뉴 열기"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h8m-8 6h16"
                  />
                </svg>
              </label>
              {/* 모바일용 드롭다운 */}
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-white rounded-box mt-1 w-52 p-2 shadow z-[1]"
              >
                <li>
                  <Link href="/service" className={`transition-all duration-300 hover:bg-blue-50 rounded-lg ${isCurrentPage('/service') ? 'font-bold text-blue-600 bg-blue-50' : 'hover:text-blue-600'}`}>
                    서비스
                  </Link>
                </li>
                <li>
                  <Link href="/about" className={`transition-all duration-300 hover:bg-blue-50 rounded-lg ${isCurrentPage('/about') ? 'font-bold text-blue-600 bg-blue-50' : 'hover:text-blue-600'}`}>
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/company-info" className={`transition-all duration-300 hover:bg-blue-50 rounded-lg ${isCurrentPage('/company-info') ? 'font-bold text-blue-600 bg-blue-50' : 'hover:text-blue-600'}`}>
                    회사소개
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className={`transition-all duration-300 hover:bg-blue-50 rounded-lg ${isCurrentPage('/blog') ? 'font-bold text-blue-600 bg-blue-50' : 'hover:text-blue-600'}`}>
                    블로그
                  </Link>
                </li>
                <li>
                  <Link href="/support" className={`transition-all duration-300 hover:bg-blue-50 rounded-lg ${isCurrentPage('/support') ? 'font-bold text-blue-600 bg-blue-50' : 'hover:text-blue-600'}`}>
                    고객지원
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className={`transition-all duration-300 hover:bg-blue-50 rounded-lg ${isCurrentPage('/faq') ? 'font-bold text-blue-600 bg-blue-50' : 'hover:text-blue-600'}`}>
                    자주 묻는 질문
                  </Link>
                </li>
              </ul>
            </div>

            {/* 로고 */}
            <Link href="/" className="btn btn-ghost text-xl px-0 hover:bg-white">
              LAKABE
            </Link>
          </div>
          {/* /navbar-start */}

          {/* navbar-center (데스크톱) */}
          <div className="navbar-center hidden [@media(min-width:763px)]:flex">
            <ul className="menu menu-horizontal px-1 gap-x-4">
              <li>
                <Link href="/service" className={`transition-all duration-300 hover:bg-blue-50 rounded-lg px-3 py-2 ${isCurrentPage('/service') ? 'font-bold text-blue-600 bg-blue-50' : 'hover:text-blue-600'}`}>
                  서비스
                </Link>
              </li>
              <li>
                <Link href="/about" className={`transition-all duration-300 hover:bg-blue-50 rounded-lg px-3 py-2 ${isCurrentPage('/about') ? 'font-bold text-blue-600 bg-blue-50' : 'hover:text-blue-600'}`}>
                  About
                </Link>
              </li>
              <li>
                <Link href="/company-info" className={`transition-all duration-300 hover:bg-blue-50 rounded-lg px-3 py-2 ${isCurrentPage('/company-info') ? 'font-bold text-blue-600 bg-blue-50' : 'hover:text-blue-600'}`}>
                  회사소개
                </Link>
              </li>
              <li>
                <Link href="/blog" className={`transition-all duration-300 hover:bg-blue-50 rounded-lg px-3 py-2 ${isCurrentPage('/blog') ? 'font-bold text-blue-600 bg-blue-50' : 'hover:text-blue-600'}`}>
                  블로그
                </Link>
              </li>
              <li>
                <Link href="/support" className={`transition-all duration-300 hover:bg-blue-50 rounded-lg px-3 py-2 ${isCurrentPage('/support') ? 'font-bold text-blue-600 bg-blue-50' : 'hover:text-blue-600'}`}>
                  고객지원
                </Link>
              </li>
              <li>
                <Link href="/faq" className={`transition-all duration-300 hover:bg-blue-50 rounded-lg px-3 py-2 ${isCurrentPage('/faq') ? 'font-bold text-blue-600 bg-blue-50' : 'hover:text-blue-600'}`}>
                  자주 묻는 질문
                </Link>
              </li>
            </ul>
          </div>
          {/* /navbar-center */}

          {/* navbar-end */}
          <div className="navbar-end flex items-center gap-2">
            {/* 역할/로그인 상태별 버튼 */}
            <Link href={linkUrl}>
              <button className="btn btn-neutral rounded-full text-white">
                {linkText}
              </button>
            </Link>
            {/* 견적받기 버튼 (로그인 상태에 따라 표시) */}
            {(!isLoggedIn || userRole === "user" || userRole === "plus") && (
              <Link href="/estimate">
                <button className="btn btn-neutral rounded-full text-white">
                  견적받기
                </button>
              </Link>
            )}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="btn btn-neutral rounded-full text-white"
              >
                로그아웃
              </button>
            )}
          </div>
          {/* /navbar-end */}
        </div>
      </Container>
    </nav>
  );
}

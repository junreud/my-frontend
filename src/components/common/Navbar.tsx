"use client";

import React from "react";
import Link from "next/link";
import useScrollDirection from "../../hooks/useScrollDirection";
import { Container } from "@/components/common/Container";

export default function Navbar() {
  const scrollDirection = useScrollDirection();

  // 드롭다운 항목 배열
  const serviceItems = [
    { text: "네이버플레이스", href: "/service/place" },
    { text: "블로그", href: "/service/blog" },
  ];

  return (
    <nav
      className={`
        font-pretendard             /* 폰트 적용 */
        bg-base-100 fixed top-0 left-0 right-0 z-50
        transition-transform duration-300
        border-b border-gray-200 /* 하단 경계선 */
        bg-white
        ${scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"}
      `}
      aria-label="주요 내비게이션"
    >
      <Container>
        {/* 전체 navbar */}
        <div className="navbar h-14 flex items-center">
          {/* ─────────────── navbar-start ─────────────── */}
          <div className="navbar-start">
            {/* 모바일용(763px 이하) 햄버거 버튼 */}
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

              {/* 모바일용 드롭다운 메뉴 */}
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-white rounded-box mt-1 w-52 p-2 shadow z-[1]"
              >
                <li>
                  <Link href="/co-info">회사소개</Link>
                </li>

                {/* 모바일: '서비스' 드롭다운 */}
                <li
                  className="dropdown dropdown-hover dropdown-bottom dropdown-center"
                  tabIndex={0}
                >
                  <Link href="/service" className="justify-between">
                    서비스
                    <svg
                      className="ml-1 h-4 w-4 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.708l3.71-3.496a.75.75 0 111.04 1.08l-4.25 4a.75.75 0 01-1.04 0l-4.25-4a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                  {/* 서비스 하위 메뉴 (모바일) */}
                  <ul className="dropdown-content menu bg-white p-2 shadow rounded-box w-52 mt-0">
                    {serviceItems.map((item, idx) => (
                      <li key={idx}>
                        <Link href={item.href}>{item.text}</Link>
                      </li>
                    ))}
                  </ul>
                </li>

                <li>
                  <Link href="/faq">자주 묻는 질문</Link>
                </li>
              </ul>
            </div>

            {/* 로고 */}
            <Link href="/" className="btn btn-ghost text-xl px-0 hover:bg-white">
              LAKABE
            </Link>
          </div>
          {/* ─────────────── /navbar-start ─────────────── */}

          {/* ─────────────── navbar-center (데스크톱) ─────────────── */}
          <div className="navbar-center hidden [@media(min-width:763px)]:flex">
            <ul className="menu menu-horizontal px-1 gap-x-4">
              <li>
                <Link href="/co-info">회사소개</Link>
              </li>

              {/* 데스크톱: '서비스' 드롭다운 */}
              <li
                className="dropdown dropdown-hover dropdown-bottom dropdown-center"
                tabIndex={0}
              >
                <Link href="/service" className="btn-ghost flex items-center gap-1">
                  서비스
                  <svg
                    className="ml-1 h-4 w-4 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.708l3.71-3.496a.75.75 0 111.04 1.08l-4.25 4a.75.75 0 01-1.04 0l-4.25-4a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                {/* 서비스 하위 메뉴 (데스크톱) */}
                <ul className="dropdown-content menu p-2 shadow bg-white rounded-box w-40 mt-0">
                  {serviceItems.map((item, idx) => (
                    <li key={idx}>
                      <Link href={item.href}>{item.text}</Link>
                    </li>
                  ))}
                </ul>
              </li>

              <li>
                <Link href="/faq">자주 묻는 질문</Link>
              </li>
            </ul>
          </div>
          {/* ─────────────── /navbar-center ─────────────── */}

          {/* ─────────────── navbar-end ─────────────── */}
          <div className="navbar-end">
            <Link href="/estimate">
              <span className="btn btn-sm custom-btn px-4 py-1 rounded-full bg-white text-black hv">
                견적받기
              </span>
            </Link>
          </div>
          {/* ─────────────── /navbar-end ─────────────── */}
        </div>
      </Container>
    </nav>
  );
}

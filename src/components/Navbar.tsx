"use client";

import React from "react";
import Link from "next/link";
import useScrollDirection from "./useScrollDirection";

export default function Navbar() {
  const scrollDirection = useScrollDirection();

  // 드롭다운 항목 배열
  const serviceItems = [
    { text: "네이버플레이스", href: "/service?id=place" },
    { text: "블로그", href: "/service?id=blog" },
  ];

  return (
    <nav
      className={`navbar bg-base-100 fixed top-0 left-0 right-0 z-50 transition-transform duration-300 
        ${scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"}
        h-8
      `}
      aria-label="주요 내비게이션"
    >
      {/* navbar-start */}
      <div className="navbar-start">
        {/* 모바일 메뉴 버튼 */}
        <div className="dropdown">
          <label
            tabIndex={0}
            role="button"
            className="btn btn-ghost lg:hidden"
            aria-label="메뉴 열기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </label>
          {/* 모바일 드롭다운 메뉴 */}
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 
                  rounded-box z-[1] mt-3 w-52 p-2 shadow
                  sm:hidden"
          >
            <li>
              <Link href="/co-info">회사소개</Link>
            </li>

            {/* 서비스 (모바일) */}
            <li tabIndex={0} className="dropdown dropdown-hover">
              <Link href="/service" className="justify-between">
                서비스
                <svg
                  className="ml-1 h-4 w-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.516 7.548L10 12.032l4.484-4.484 1.032 1.032L10 14.096 4.484 8.58z" />
                </svg>
              </Link>
              <ul className="menu bg-base-100 p-2 shadow rounded-box w-52 mt-1">
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

        <Link href="/" className="btn btn-ghost text-xl">LAKABE</Link>
      </div>

      {/* navbar-center (데스크톱) */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-x-4">
          <li>
            <Link href="/co-info">회사소개</Link>
          </li>

          {/* 서비스 (데스크톱) */}
          <li tabIndex={0} className="dropdown dropdown-hover">
            {/* 상위 링크: /service */}
            <Link href="/service" className="btn-ghost flex items-center gap-1">
              서비스
              <svg
                className="ml-1 h-4 w-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M5.516 7.548L10 12.032l4.484-4.484 1.032 1.032L10 14.096 4.484 8.58z" />
              </svg>
            </Link>
            {/* 하위 드롭다운 */}
            <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-1">
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

      {/* navbar-end */}
      <div className="navbar-end">
        <Link href="/estimate">
          <span className="btn btn-sm custom-btn px-4 py-1 rounded-full">견적받기</span>
        </Link>
      </div>
    </nav>
  );
}

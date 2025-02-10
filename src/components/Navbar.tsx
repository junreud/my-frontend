"use client";

import React from "react";
import Link from "next/link";
import useScrollDirection from "./useScrollDirection";
import DropdownMenu from "./ui/DropdownMenu";

const Navbar = () => {
  const scrollDirection = useScrollDirection();

  // 드롭다운 항목 배열
  const serviceItems = [
    { text: "네이버플레이스", href: "/service?id=place" },
    { text: "블로그", href: "/service?id=blog" },
  ];

  return (
    <nav
      className={`navbar bg-base-100 fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
      }`}
      aria-label="주요 내비게이션"
    >
      {/* navbar-start */}
      <div className="navbar-start">
        <div className="dropdown">
          <div
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
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link href="/co-info">회사소개</Link>
            </li>
            <li>
              <Link href="/service">
                <DropdownMenu label="서비스" items={serviceItems} />
              </Link>
            </li>
            <li>
              <Link href="/faq">자주 묻는 질문</Link>
            </li>
          </ul>
        </div>
        <Link href="/">
          <span className="btn btn-ghost text-xl">LAKABE</span>
        </Link>
      </div>

      {/* navbar-center */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-x-4">
          <li>
            <Link href="/co-info">회사소개</Link>
          </li>
          <li>
            {/* 여기서도 desktop용 “서비스” 메뉴 */}
            <Link href="/service">
              <DropdownMenu label="서비스" items={serviceItems} />
            </Link>
          </li>
          <li>
            <Link href="/faq">자주 묻는 질문</Link>
          </li>
        </ul>
      </div>

      {/* navbar-end */}
      <div className="navbar-end">
        <Link href="/estimate">
          <span className="btn custom-btn px-4 py-1 rounded-full">견적받기</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;

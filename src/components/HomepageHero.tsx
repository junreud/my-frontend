"use client";
import React from "react";
import Link from "next/link";
import FadeInSection from "./animations/FadeInComponent";

const HomepageHero = () => {
  return (
    <div
      className="hero min-h-screen relative" // relative로 설정 → 하단 화살표를 absolute로 배치할 예정
      style={{
        backgroundImage: 'url("../images/HomepageHero-bg.jpg)',
      }}
    >
      {/* Hero 메인 콘텐츠 */}
      <div className="hero-content text-black text-center flex-col items-start">
        <div className="max-w-3xl">
          <FadeInSection delay={1} once>
            <h1 className="mb-5 text-6xl font-bold leading-snug max-w-3xl pb-28">
              광고의 모든 것,<br />
              라카비에서 쉽고 간편하게
            </h1>
            <Link href="/estimate">
              <span className="btn custom-btn px-8 cursor-pointer rounded-full">
                견적받기
              </span>
            </Link>
          </FadeInSection>
        </div>
      </div>

      {/* 하단 중앙의 움직이는 화살표 */}
      <div className="absolute bottom-6 w-full flex justify-center">
        {/* 필요하다면 다른 섹션(#next-section)으로 스크롤 이동할 수 있게 a/link 처리 */}
        <a
          href="#next-section" // 스크롤 이동용 앵커 (필요 시 변경/제거 가능)
          className="text-grey-800 animate-bounce"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 z-[1000]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default HomepageHero;

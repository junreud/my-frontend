"use client";
import Link from "next/link";
import PopInComponent from "./animations/PopInComponent";
import { Component as Mychart} from "@/components/HomepageGraph"
import Page from "./Dialog";
import Mockup from "./Mockup";
import ArrowIcon from "./ArrowIcon";
import FadeSlideUp from "./animations/FadeSlideUp";

export default function Homepage() {
  return (
    <div className="space-y-60">

      {/* 1) 플레이스 작업 (검은 배경) */}
      <section className="bg-white text-white p-6 sm:p-8 mt-60">
      <h2 className="text-black text-left text-lg sm:text-xl font-bold mb-20">
        플레이스 작업
      </h2>
      {/* 모바일: 세로 / 데스크톱(sm:flex): 가로 */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-24">
        {/* Mockup 1 */}
        <FadeSlideUp
        fadeInDuration={0.8}
        delay={0.3}
        once = {true}
        >
        <Mockup
          Src = "/images/beforeRestaurant.png"
          alt="마케팅 전 플레이스"
          className="max-w-full" // 혹은 원하는 추가 클래스
        />
        </FadeSlideUp>
        
        {/* SVG 화살표 */}
        <FadeSlideUp
        fadeInDuration={0.8}
        delay={0.8}
        once = {true}
        >
        <ArrowIcon className="text-white sm:rotate-0 rotate-90" />
        </FadeSlideUp>
        
        {/* Mockup 2 */}
        <FadeSlideUp
        fadeInDuration={0.8}
        delay={1.3}
        once = {true}
        >
        <Mockup
          Src = "/images/afterRestaurant.png"
          alt="마케팅 후 플레이스"
        />
        </FadeSlideUp>
      </div>
    </section>

      {/* 2) 순위 섹션 */}
      <section className="w-full px-2 py-8 sm:p-8">
        <h2 className="text-center text-lg sm:text-xl font-bold mb-6">
          실제 작업 업체
        </h2>
        <div className="mx-auto w-{800px} h-{600px} items-start justify-center mb-4">
          <Mychart />
        </div>
        <p className="text-center text-sm sm:text-base">
          플레이스 방문자 수 120% 증가
        </p>
      </section>
      {/* 3) 내 업체도 될까? / 무료상담 (검은 배경 바) */}
      <section className="bg-gray-100 flex flex-row items-center justify-center gap-36 px-6 py-36 sm:p-8">
        <PopInComponent>
        <div className="font-bold text-base sm:text-lg">
          내 업체도 될까?
        </div>

        </PopInComponent>
        <Link href="/estimate">
        <PopInComponent>
          <span className="bg-white text-gray-500 px-4 py-2 rounded-md cursor-pointer text-sm sm:text-base border">
            비용 보러가기
          </span>

        </PopInComponent>
        </Link>
      </section>

      {/* 4) 블로그 체험단/기자단 */}
      <section className="px-6 py-8 mb-6 sm:p-8">
        <h2 className="text-lg sm:text-xl font-bold mb-4">
          블로그 체험단/기자단
        </h2>
        {/* 모바일: 한 줄씩, 데스크톱: 좌 비디오 / 우 목록 */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 비디오 자리 */}
          <div className="w-full sm:w-40 h-40 bg-gray-200 flex items-center justify-center">
            비디오
          </div>
          {/* 정보 목록 */}
          <ul className="flex-1 space-y-2 text-sm sm:text-base">
            <li>소비자가 궁금한 정보 해결 V</li>
            <li>블로그 상위노출을 통한 유입 V</li>
            <li>블로그리뷰 접수 V</li>
            <li>건 수 계약 가능!</li>
          </ul>
        </div>
      </section>

      {/* 5) 체험단 / 기자단이 뭔가요? (검은 바) */}
      <Page />
    </div>
  );
}

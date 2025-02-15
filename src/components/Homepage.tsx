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
      <h2 className="text-black text-left text-lg sm:text-3xl font-bold mb-6 ml-12">
        플레이스 작업
      </h2>
      <p className="text-black my-2 ml-12 mb-16">
        안녕하세요
      </p>
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
          className="max-w-full" // 혹은 원하는 추가 클래스
        />
        </FadeSlideUp>
      </div>
    </section>

      {/* 2) 순위 섹션 */}
      <section className="px-2 py-20 sm:px-36">
        <h2 className="text-center text-lg sm:text-xl font-bold mb-6">
          실제 작업 업체
        </h2>
        <div className="mx-auto items-start justify-center mb-4">
          <Mychart />
        </div>
        <p className="text-center text-sm sm:text-base">
          플레이스 방문자 수 120% 증가
        </p>
      </section>
    </div>
  );
}

"use client";
import { Component as Mychart} from "@/components/HomePage/HomepageGraph"
import Mockup from "../ui/Mockup";
import ArrowIcon from "../ui/ArrowIcon";
import SequentialFadeSlideUp from "../animations/SequentialFadeSlideUp"

export default function Homepage() {
  return (
    <div className="space-y-60">

      {/* 1) 플레이스 작업 (검은 배경) */}
      <section className="bg-white text-white p-6 sm:p-8 mt-60">
      <h2 className="text-black text-left text-lg sm:text-3xl font-bold mb-6 ml-12">
        플레이스 작업
      </h2>
      <p className="text-black my-2 ml-12 mb-16">
        네이버 플레이스 마케팅 전문 솔루션으로 고객님의 매장을 더 많은 고객에게 알리세요. <br />
        리뷰 관리부터 방문자 수 증대까지, AI 기반 자동화 시스템으로 효율적인 마케팅을 경험하실 수 있습니다.
      </p>
      <div>
        <SequentialFadeSlideUp fadeInDuration={0.3} delay={0.1} once={true} rootMargin="-50% 0px 0px 0px">
          <Mockup
            src="/images/beforeRestaurant.png"
            alt="마케팅 전 플레이스"
            className="max-w-full" // 혹은 원하는 추가 클래스
          />
          <ArrowIcon className="text-white sm:rotate-0 rotate-90" />
          <Mockup
            src="/images/afterRestaurant.png"
            alt="마케팅 후 플레이스"
            className="max-w-full" // 혹은 원하는 추가 클래스
          />
        </SequentialFadeSlideUp>
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
          <span className="font-bold text-blue-600">플레이스 방문자 수 120% 증가</span> | 
          <span className="font-semibold text-green-600 ml-2">리뷰 평점 4.8점 달성</span> | 
          <span className="font-semibold text-purple-600 ml-2">3개월 내 검색 노출 85% 향상</span>
        </p>
      </section>
    </div>
  );
}

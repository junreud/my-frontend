"use client";
import Link from "next/link";
import PopInComponent from "./animations/PopInComponent";
import { Component as Mychart} from "@/components/HomepageGraph"

export default function Homepage() {
  return (
    <div className="space-y-12">

      {/* 1) 플레이스 작업 (검은 배경) */}
      <section className="bg-black text-white p-6 sm:p-8">
        <h2 className="text-center text-lg sm:text-xl font-bold mb-6">
          플레이스 작업
        </h2>
        {/* 모바일: 세로(위아래), 데스크톱: 가로(양옆) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* 이미지 1 */}
          <div className="w-40 h-60 bg-white text-black flex items-center justify-center">
            이미지 1
          </div>
          <span className="text-lg sm:text-xl">=&gt;</span>
          {/* 이미지 2 */}
          <div className="w-40 h-60 bg-white text-black flex items-center justify-center">
            이미지 2
          </div>
        </div>
      </section>

      {/* 2) 순위 섹션 */}
      <section className="w-full px-2 py-8 sm:p-8">
        <h2 className="text-center text-lg sm:text-xl font-bold mb-6">
          순위
        </h2>
        <div className="mx-auto w-{800px} h-{600px} items-start justify-center mb-4">
          <Mychart />
        </div>
        <p className="text-center text-sm sm:text-base">
          플레이스 방문자 수 120% 증가
        </p>
      </section>
      {/* 3) 내 업체도 될까? / 무료상담 (검은 배경 바) */}
      <section className="bg-black text-white flex flex-row sm:flex-row items-center justify-center gap-36 px-6 py-8 sm:p-8">
        <PopInComponent>
        <div className="font-bold text-base sm:text-lg">
          내 업체도 될까?
        </div>

        </PopInComponent>
        <Link href="/consult">
        <PopInComponent>
          <span className="bg-white text-black px-4 py-2 rounded-md cursor-pointer text-sm sm:text-base">
            무료상담
          </span>

        </PopInComponent>
        </Link>
      </section>

      {/* 4) 블로그 체험단/기자단 */}
      <section className="px-6 py-8 sm:p-8">
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
      <section className="bg-black text-white px-6 py-8 sm:p-8">
        <div className="text-center text-base sm:text-lg">
          <span className="text-red-500 font-bold">체험단</span> / <span className="text-blue-500 font-bold">기자단</span>이 뭔가요?
        </div>
      </section>

      {/* 6) 자세히 알아보기 버튼 */}
      <section className="px-6 py-8 sm:p-8 text-center">
        <Link href="/details">
          <span className="border border-black px-6 py-2 rounded-md cursor-pointer text-sm sm:text-base">
            자세히 알아보기
          </span>
        </Link>
      </section>
    </div>
  );
}

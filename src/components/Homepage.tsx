"use client";
import Link from "next/link";

export default function Homepage() {
  return (
    <div className="space-y-8">

      {/* 1) 플레이스 작업 (검은 배경) */}
      <section className="bg-black text-white p-8">
        <h2 className="text-xl font-bold text-center mb-6">플레이스 작업</h2>
        <div className="flex justify-center items-center gap-4">
          {/* 이미지 1 */}
          <div className="w-40 h-60 bg-white text-black flex items-center justify-center">
            이미지 1
          </div>
          <span className="text-xl">=&gt;</span>
          {/* 이미지 2 */}
          <div className="w-40 h-60 bg-white text-black flex items-center justify-center">
            이미지 2
          </div>
        </div>
      </section>

      {/* 2) 순위 섹션 */}
      <section className="p-8">
        <h2 className="text-xl font-bold text-center mb-6">순위</h2>
        <div className="mx-auto w-64 h-36 bg-gray-200 flex items-center justify-center mb-4">
          <span className="text-gray-700">실제업체 이미지</span>
        </div>
        <p className="text-center text-sm">
          플레이스 방문자 수 120% 증가
        </p>
      </section>

      {/* 3) 내 업체도 될까? / 무료상담 (검은 배경 바) */}
      <section className="bg-black text-white flex flex-col sm:flex-row items-center justify-center gap-4 p-8">
        <div className="font-bold text-lg">내 업체도 될까?</div>
        <Link href="/consult">
          <span className="bg-white text-black px-4 py-2 rounded-md cursor-pointer">
            무료상담
          </span>
        </Link>
      </section>

      {/* 4) 블로그 체험단/기자단 */}
      <section className="p-8">
        <h2 className="text-xl font-bold mb-4">블로그 체험단/기자단</h2>
        <div className="flex gap-8">
          {/* 비디오 자리 */}
          <div className="w-40 h-40 bg-gray-200 flex items-center justify-center">
            비디오
          </div>
          <ul className="flex-1 space-y-2">
            <li>소비자가 궁금한 정보 해결 V</li>
            <li>블로그 상위노출을 통한 유입 V</li>
            <li>블로그리뷰 접수 V</li>
            <li>건 수 계약 가능!</li>
          </ul>
        </div>
      </section>

      {/* 5) 체험단 / 기자단이 뭔가요? (검은 바) */}
      <section className="bg-black text-white p-8">
        <div className="text-center text-lg">
          <span className="text-red-500 font-bold">체험단</span> / <span className="text-blue-500 font-bold">기자단</span>이 뭔가요?
        </div>
      </section>

      {/* 6) 자세히 알아보기 버튼 */}
      <section className="p-8 text-center">
        <Link href="/details">
          <span className="border border-black px-6 py-2 rounded-md cursor-pointer">
            자세히 알아보기
          </span>
        </Link>
      </section>
    </div>
  );
}

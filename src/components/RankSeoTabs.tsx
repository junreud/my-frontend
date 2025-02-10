"use client";
import { Tab } from "@headlessui/react";

// ─────────────────────────────────────────────────────────────
// 순위작업 탭 컨텐츠
// ─────────────────────────────────────────────────────────────
function RankTabContent() {
  return (
    <div className="space-y-8">
      {/* 단계 섹션 - 이미지 세로 길이 늘림 */}
      <section className="p-4 border rounded-md">
        <h2 className="mb-4 text-xl font-semibold">단계</h2>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex flex-col items-center border p-4">
              {/* 이미지 세로 길이 좀 더 여유 있게 (h-40 예시) */}
              <div className="h-40 w-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-500">단계 {num} 이미지</span>
              </div>
              <p className="mt-2 font-medium">단계 {num}</p>
              <p className="text-sm text-gray-600 mt-1">
                {num === 1 && "작업영역 파악 (예: 경쟁업체, 검색량 등 분석)"}
                {num === 2 && "작업 시작 (예: 24시간 모니터링 가능)"}
                {num === 3 && "추가 작업 또는 종료 (목표 달성 여부)"}
                {num === 4 && "추가 작업 또는 종료 (목표 달성 여부)"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 레퍼런스 섹션 - 지도 오른쪽 배치 */}
      <section className="p-4 border rounded-md">
        <h2 className="mb-4 text-xl font-semibold">레퍼런스</h2>
        {/* 좌-우 레이아웃: 왼쪽 레퍼런스 목록 / 오른쪽 지도 */}
        <div className="flex gap-4">
          {/* 왼쪽 (레퍼런스 목록) */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">맛집</h3>
              <ul className="text-sm text-gray-600 mt-1">
                <li>경기도</li>
                <li>서울</li>
                <li>인천</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium">헬스장</h3>
              <ul className="text-sm text-gray-600 mt-1">
                <li>경기도</li>
                <li>서울</li>
                <li>인천</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium">스크린골프</h3>
              <ul className="text-sm text-gray-600 mt-1">
                <li>경기도</li>
                <li>서울</li>
                <li>인천</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium">기타</h3>
              <ul className="text-sm text-gray-600 mt-1">
                <li>경기도</li>
                <li>서울</li>
                <li>인천</li>
              </ul>
            </div>
          </div>

          {/* 오른쪽 (지도) */}
          <div className="w-1/2 h-48 bg-gray-300 flex items-center justify-center">
            <span className="text-sm text-gray-700">지도 (대한민국)</span>
          </div>
        </div>
      </section>

      {/* 작업방식 섹션 */}
      <section className="p-4 border rounded-md">
        <h2 className="mb-4 text-xl font-semibold">작업방식</h2>
        <div className="flex">
          {/* 왼쪽 버튼 그룹: 리워드, 블로그배포, 슬롯 */}
          <div className="w-1/4 border-r pr-4">
            <ul className="space-y-2 text-sm">
              <li className="font-medium">리워드</li>
              <li>블로그배포</li>
              <li>슬롯</li>
            </ul>
          </div>
          {/* 오른쪽 내용 */}
          <div className="w-3/4 pl-4">
            <div className="mb-2 h-36 w-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-700">이미지 or 정보</span>
            </div>
            <p className="text-sm text-gray-700">
              저장하기, 유입 버튼 등이 있는 영역
            </p>
          </div>
        </div>
      </section>

      {/* 계약조건 섹션 */}
      <section className="p-4 border rounded-md">
        <h2 className="mb-4 text-xl font-semibold">계약조건</h2>
        <p className="text-sm text-gray-700">
          라카비의 분석을 토대로 예상 작업량을 산정 후 작업.
          목표 수익 미달 시 30% 환불 등...
        </p>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SEO 최적화 탭 컨텐츠
// ─────────────────────────────────────────────────────────────
function SeoTabContent() {
  return (
    <div className="space-y-8">
      {/* 1. 업체명, 업종셋팅 영역 */}
      <section className="p-4 border rounded-md">
        <h2 className="mb-2 text-xl font-semibold">1. 업체명, 업종셋팅</h2>
        {/* 첨부 사진처럼 텍스트 → divider → 사진 → 설명 */}
        <p className="text-sm text-gray-700 mb-4">
          업체명에 '필수 단어'가 포함되어야 한다는 검색 로직이 있습니다. 
          예) 업소명에 'OOO'이 반드시 들어가야 노출 확률이 높아짐.
        </p>
        <hr className="my-4 border-gray-300" />
        {/* 예시 이미지 */}
        <div className="h-36 w-full bg-gray-300 flex items-center justify-center mb-4">
          <span className="text-gray-700">업체명 관련 이미지</span>
        </div>
        <p className="text-sm text-gray-700">
          세팅 설명: <br />
          - 업소명: '라카비 헤어샵' 처럼 핵심 키워드 넣기 <br />
          - 업종: 검색량 많은 업종 카테고리 설정 
        </p>
      </section>

      {/* 2. 대표사진, 메뉴사진 */}
      <section className="p-4 border rounded-md">
        <h2 className="mb-2 text-xl font-semibold">2. 대표사진, 메뉴사진</h2>
        <p className="text-sm text-gray-700 mb-4">
          사진 등록 규정, 이미지 크기(가로x세로), 파일 형식(JPG/PNG) 등.
        </p>
        <hr className="my-4 border-gray-300" />
        <div className="flex gap-4">
          <div className="w-1/2 h-36 bg-gray-300 flex items-center justify-center">
            <span className="text-gray-700">대표사진</span>
          </div>
          <div className="w-1/2 h-36 bg-gray-300 flex items-center justify-center">
            <span className="text-gray-700">메뉴사진</span>
          </div>
        </div>
        <p className="text-sm text-gray-700 mt-4">
          예) 대표사진은 가게 정면이 잘 보이도록, 메뉴사진은 대표 메뉴 위주...
        </p>
      </section>

      {/* 3. 기타 세팅 */}
      <section className="p-4 border rounded-md">
        <h2 className="mb-2 text-xl font-semibold">3. 그 외 세팅</h2>
        <p className="text-sm text-gray-700 mb-4">
          주변 지역/검색어에 따라 업소 정보 확장 설정. 
          예) 지역 키워드, 특정 태그(맛집, 노포, 새벽영업 등)
        </p>
        <hr className="my-4 border-gray-300" />
        <div className="flex gap-4">
          <div className="w-1/3 h-36 bg-gray-300 flex items-center justify-center">
            <span className="text-gray-700">이미지A</span>
          </div>
          <div className="w-1/3 h-36 bg-gray-300 flex items-center justify-center">
            <span className="text-gray-700">이미지B</span>
          </div>
          <div className="w-1/3 h-36 bg-gray-300 flex items-center justify-center">
            <span className="text-gray-700">이미지C</span>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 메인 컴포넌트 (Tabs)
// ─────────────────────────────────────────────────────────────
export default function RankSeoTabs() {
  const tabNames = ["순위작업", "SEO 최적화"];

  return (
    <div className="w-full px-4 pt-20 pb-16">
      {/* 상단 여백: pt-10 */}
      <div className="mx-auto max-w-5xl">
        <Tab.Group>
          {/* 탭 목록 - 수평 중앙 정렬 */}
          <Tab.List className="flex justify-center gap-6 mb-6">
            {tabNames.map((name) => (
              <Tab
                key={name}
                className="rounded-md py-2 px-4 text-base font-semibold 
                           data-[selected]:bg-gray-100 
                           data-[selected]:text-blue-600
                           data-[hover]:bg-gray-50 
                           focus:outline-none focus:ring-2 
                           data-[focus]:ring-blue-400"
              >
                {name}
              </Tab>
            ))}
          </Tab.List>

          {/* 탭 패널 */}
          <Tab.Panels>
            <Tab.Panel>
              <RankTabContent />
            </Tab.Panel>
            <Tab.Panel>
              <SeoTabContent />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}

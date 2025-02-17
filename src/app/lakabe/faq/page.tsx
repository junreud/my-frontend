"use client";

import { useState, useEffect } from "react";
import FaqDisclosures from "@/components/ui/FaqDisclosures";

export default function FaqPage() {
  // JSON 파일로부터 불러온 데이터를 저장할 state
  const [faqData, setFaqData] = useState<{ [key: string]: any[] } | null>(null);

  // 현재 선택된 카테고리
  const [category, setCategory] = useState<string>("플레이스");

  // 컴포넌트 마운트 시점에 FAQ JSON 파일 fetch
  useEffect(() => {
    fetch("/data/faqData.json") // public 폴더 내부는 루트(/) 기준으로 접근 가능
      .then((res) => res.json())
      .then((data) => {
        setFaqData(data);
      })
      .catch((error) => {
        console.error("FAQ 데이터를 불러오는 중 오류가 발생했습니다:", error);
      });
  }, []);

  // 로딩 상태 처리 (데이터가 아직 없는 경우)
  if (!faqData) {
    return <div>로딩 중...</div>;
  }

  // 카테고리 목록 가져오기
  const categories = Object.keys(faqData);

  return (
    <div>
      <section className="mx-auto max-w-7xl py-16 px-4">
        <h2 className="mb-8 text-3xl font-semibold mt-20">자주 묻는 질문</h2>

        {/* 전체 레이아웃: 왼쪽 메뉴 + 오른쪽 Q&A */}
        <div className="flex gap-8">
          {/* 왼쪽 메뉴: 카테고리 목록 */}
          <nav className="w-1/4 space-y-2 border-r pr-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`block w-full text-left py-2 px-2 font-medium ${
                  category === cat ? "bg-gray-200 text-gray-900" : "text-gray-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>

          {/* 오른쪽 Q&A */}
          <div className="w-3/4">
            {/* 혹시 카테고리 key가 존재하지 않으면 예외처리 */}
            {faqData[category] ? (
              <FaqDisclosures items={faqData[category]} />
            ) : (
              <div>해당 카테고리에 대한 FAQ가 없습니다.</div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4 text-center py-24 flex:row">
          <h2 className="text-3xl font-semibold">
            만약 문제가 해결되지 않았다면 언제든 연락해주세요.
          </h2>
        </div>
      </section>
    </div>
  );
}

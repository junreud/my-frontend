"use client";

import { useState } from "react";
import FaqDisclosures from "@/components/FaqDisclosures";

// 카테고리별 Q&A 데이터를 미리 준비
const FAQ_DATA = {
  플레이스: [
    {
      question: "홍보 정책은 어떻게 되나요?",
      answer:
        "목표 순위 진입 실적 시 전액 환불을 보장합니다. 협의된 조건에 따라 진행 가능합니다.",
    },
    {
      question: "정말로 이행 불가능이 없나요?",
      answer:
        "네, 정석적인 SEO 전략과 콘텐츠 강화, 구조 개선으로 순위를 올립니다. 어뷰징 없이 안정적으로 상위 유지가 가능합니다.",
    },
  ],
  "체험단/기자단": [
    {
      question: "언론 보도나 체험단 모집 기간은 얼마나 걸리나요?",
      answer:
        "업종, 경쟁도에 따라 다르지만 보통 1~4주 내 변화를 확인 가능합니다. 구체적인 기간은 상담 시 안내드립니다.",
    },
  ],
  블로그: [
    {
      question: "블로그 마케팅 비용이 궁금해요",
      answer:
        "안녕하세요. 블로그는 포스팅 수, 키워드 난이도에 따라 상이합니다. 상담 시 상세 안내해 드립니다.",
    },
    {
      question: "제 블로그 노출 상태가 안 좋아요",
      answer:
        "안녕하세요. 블로그 지수 개선, 컨텐츠 보강 등을 통해 노출을 높일 수 있습니다. 자세한 방법은 상담을 통해 안내드립니다.",
    },
  ],
  환불: [
    {
      question: "환불 규정은 어떻게 되나요?",
      answer:
        "목표한 사항을 달성하지 못하면 전액 환불을 보장해 드립니다. 상황에 따라 달라질 수 있으니 문의 부탁드립니다.",
      defaultOpen: true, // 처음부터 펼쳐두고 싶다면
    },
  ],
  결제: [
    {
      question: "결제 방법이 궁금합니다",
      answer:
        "카드, 계좌이체, 현금영수증 발행 모두 가능합니다. 상황에 맞게 선택해 주세요.",
    },
  ],
  계약: [
    {
      question: "계약 절차가 어떻게 되나요?",
      answer:
        "견적 안내 후, 계약서 작성 및 결제 진행하면 마케팅 작업이 시작됩니다. 구체사항은 상담 시 안내드립니다.",
    },
  ],
};

export default function FaqPage() {
  const [category, setCategory] = useState<keyof typeof FAQ_DATA>("플레이스");

  // 카테고리 목록
  const categories = Object.keys(FAQ_DATA) as (keyof typeof FAQ_DATA)[];

  return (
    <section className="mx-auto max-w-7xl py-16 px-4">
      <h2 className="mb-8 text-2xl font-semibold">자주 묻는 질문</h2>

      {/* 전체 레이아웃: 왼쪽 메뉴 + 오른쪽 Q&A */}
      <div className="flex gap-8">
        {/* 왼쪽 메뉴 */}
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
          <FaqDisclosures items={FAQ_DATA[category]} />
        </div>
      </div>
    </section>
  );
}

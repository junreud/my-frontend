"use client";

import { useState, useEffect } from "react";
import FaqDisclosures from "@/components/ui/FaqDisclosures";
import Navbar from "@/components/common/Navbar";
import { Container } from "@/components/common/Container";
import Footer from "@/components/common/Footer";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqData {
  [category: string]: FaqItem[];
}

export default function FaqPage() {
  const [faqData, setFaqData] = useState<FaqData | null>(null);
  const [category, setCategory] = useState<string>("플레이스");

  useEffect(() => {
    fetch("/data/faqData.json")
      .then((res) => res.json())
      .then((data: FaqData) => {  // <-- 타입 단언
        setFaqData(data);
      })
      .catch((error) => {
        console.error("FAQ 데이터를 불러오는 중 오류:", error);
      });
  }, []);

  if (!faqData) {
    return <div>로딩 중...</div>;
  }

  // 카테고리 목록 가져오기
  const categories = Object.keys(faqData);

  return (
    <div>
            <Container>
            <Navbar />
            </Container>
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
      <Footer />
    </div>
  );
}

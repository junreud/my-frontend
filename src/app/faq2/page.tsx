"use client";

import { useState, useEffect } from "react";
import FaqDisclosures from "@/components/ui/FaqDisclosures";
import Navbar from "@/components/common/Navbar";
import { Container } from "@/components/common/Container";
import Footer from "@/components/common/Footer";
import FAQHero from "@/components/FAQPage/FAQHero";
import LoadingSpinner from "@/components/ui/LoadingStates/LoadingSpinner";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqData {
  [category: string]: FaqItem[];
}

// 간단한 검색 컴포넌트
const FAQSearchComponent = ({ 
  searchTerm, 
  onSearchChange, 
  placeholder 
}: { 
  searchTerm: string; 
  onSearchChange: (value: string) => void; 
  placeholder: string; 
}) => (
  <div className="relative max-w-2xl mx-auto">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder={placeholder}
      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
    />
  </div>
);

export default function FaqPage() {
  const [faqData, setFaqData] = useState<FaqData | null>(null);
  const [category, setCategory] = useState<string>("플레이스");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const mockFaqData: FaqData = {
      "플레이스": [
        {
          question: "네이버 플레이스 등록은 어떻게 하나요?",
          answer: "네이버 플레이스 등록은 네이버 플레이스 등록 센터에서 할 수 있습니다. 사업자등록증과 기본 정보만 있으면 간단하게 등록 가능합니다."
        },
        {
          question: "플레이스 운영 시간은 언제 업데이트되나요?",
          answer: "플레이스 운영 시간은 실시간으로 업데이트됩니다. 관리자 페이지에서 언제든 수정할 수 있으며, 고객들에게 즉시 반영됩니다."
        }
      ],
      "리뷰": [
        {
          question: "리뷰 자동 답변 기능은 어떻게 작동하나요?",
          answer: "AI 기반 자동 답변 시스템이 리뷰의 감정과 내용을 분석하여 적절한 답변을 자동으로 생성합니다."
        }
      ],
      "마케팅": [
        {
          question: "마케팅 효과는 언제부터 나타나나요?",
          answer: "일반적으로 2-4주 후부터 가시적인 효과를 확인할 수 있습니다."
        }
      ]
    };

    const timer = setTimeout(() => {
      setFaqData(mockFaqData);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const getFilteredFaqs = () => {
    if (!faqData || !faqData[category]) return [];
    
    if (!searchTerm) return faqData[category];
    
    return faqData[category].filter(
      item => 
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Container>
          <Navbar />
        </Container>
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  const categories = faqData ? Object.keys(faqData) : [];
  const filteredFaqs = getFilteredFaqs();

  return (
    <div className="min-h-screen bg-gray-50">
      <Container>
        <Navbar />
      </Container>
      
      <main role="main" aria-label="자주 묻는 질문">
        <FAQHero />
        
        <section className="mx-auto max-w-7xl py-8 lg:py-16 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <FAQSearchComponent
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="궁금한 내용을 검색해보세요..."
            />
          </div>

          <div className="mb-8 text-center">
            <p className="text-sm text-gray-600 mb-3">인기 검색어</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["리뷰 관리", "플레이스 등록", "마케팅 효과"].map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => setSearchTerm(keyword)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors duration-200"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>

          <div className={`flex ${isMobile ? 'flex-col' : 'gap-8'}`}>
            <nav 
              className={`${isMobile ? 'w-full mb-6' : 'w-1/4'} ${isMobile ? '' : 'border-r pr-4'}`}
              aria-label="FAQ 카테고리"
            >
              <h2 className="text-lg font-semibold mb-4 text-gray-900">카테고리</h2>
              <div className={`${isMobile ? 'flex gap-2 overflow-x-auto pb-2' : 'space-y-2'}`}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setSearchTerm(""); 
                    }}
                    className={`${isMobile ? 'whitespace-nowrap' : 'block w-full text-left'} py-3 px-4 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      category === cat 
                        ? "bg-blue-600 text-white shadow-md" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 bg-white"
                    }`}
                    aria-pressed={category === cat}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </nav>

            <div className={`${isMobile ? 'w-full' : 'w-3/4'}`}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {category} 관련 질문
                </h2>
                <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                  {filteredFaqs.length}개의 질문
                </span>
              </div>

              {filteredFaqs.length > 0 ? (
                <div className="space-y-4">
                  <FaqDisclosures items={filteredFaqs} />
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? "검색 결과가 없습니다" : "이 카테고리에는 질문이 없습니다"}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm 
                      ? "다른 키워드로 검색해보시거나 카테고리를 변경해보세요" 
                      : "다른 카테고리를 확인해보세요"
                    }
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      검색어 초기화
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white py-12 lg:py-16 border-t">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              원하는 답변을 찾지 못하셨나요?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              언제든지 저희 고객지원팀에 문의해주세요. 빠르고 정확한 답변을 드리겠습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                1:1 문의하기
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                전화 상담 예약
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

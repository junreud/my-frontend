"use client";
import { useState } from "react";
import FadeInSection from "../animations/FadeInComponent";

const FAQSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const popularSearches = [
    "결제 방법",
    "환불 정책", 
    "서비스 시작",
    "계정 설정",
    "요금제 변경",
    "기술 지원"
  ];

  const handleSearch = async (term: string) => {
    setIsSearching(true);
    // 실제 검색 로직을 여기에 구현
    console.log('Searching for:', term);
    setTimeout(() => {
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection>
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              원하는 답변을 빠르게 찾아보세요
            </h2>
            <p className="text-gray-600">
              키워드로 검색하거나 아래 인기 검색어를 클릭해보세요
            </p>
          </div>
        </FadeInSection>

        <FadeInSection delay={0.2}>
          {/* 검색 박스 */}
          <div className="relative mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
                placeholder="질문이나 키워드를 입력하세요..."
                className="w-full px-6 py-4 pr-12 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
              />
              <button
                onClick={() => handleSearch(searchTerm)}
                disabled={isSearching}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                {isSearching ? (
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </FadeInSection>

        <FadeInSection delay={0.4}>
          {/* 인기 검색어 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">인기 검색어</h3>
            <div className="flex flex-wrap gap-3">
              {popularSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchTerm(term);
                    handleSearch(term);
                  }}
                  className="px-4 py-2 bg-white text-gray-700 rounded-full border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 transition-all duration-200 hover:shadow-sm"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </FadeInSection>

        {/* 빠른 액션 */}
        <FadeInSection delay={0.6}>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-semibold mb-2">실시간 채팅</h3>
              <p className="text-sm text-gray-600 mb-4">즉시 도움받기</p>
              <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                채팅 시작
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-3xl mb-3">📧</div>
              <h3 className="font-semibold mb-2">이메일 문의</h3>
              <p className="text-sm text-gray-600 mb-4">자세한 상담</p>
              <button className="w-full border border-indigo-600 text-indigo-600 py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors">
                문의하기
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-3xl mb-3">📞</div>
              <h3 className="font-semibold mb-2">전화 상담</h3>
              <p className="text-sm text-gray-600 mb-4">1588-1234</p>
              <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                전화걸기
              </button>
            </div>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
};

export default FAQSearch;

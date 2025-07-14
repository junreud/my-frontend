"use client";
import { useState, useEffect } from "react";
import FadeInSection from "../animations/FadeInComponent";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import LoadingSpinner from "../ui/LoadingStates/LoadingSpinner";

const CompanyOverview = () => {
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    // 가상의 데이터 로딩 시뮬레이션
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 py-12 pt-24 sm:py-16 sm:pt-28 lg:py-20 lg:pt-32 flex items-center justify-center min-h-[600px] relative overflow-hidden">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <section 
      className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white py-12 pt-24 sm:py-16 sm:pt-28 lg:py-20 lg:pt-32 relative overflow-hidden min-h-[600px]"
      aria-labelledby="company-overview-title"
    >
      {/* 배경 애니메이션 - 모바일에서는 단순화 */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-10 left-10 w-12 sm:w-16 lg:w-20 h-12 sm:h-16 lg:h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-8 sm:w-12 lg:w-16 h-8 sm:h-12 lg:h-16 bg-white/5 rounded-full animate-bounce"></div>
        {!isMobile && (
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-ping"></div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <FadeInSection immediate={true}>
            <div>
              <h1 
                id="company-overview-title"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight"
              >
                네이버 플레이스 마케팅의
                <span className="block text-yellow-300 mt-2">새로운 기준</span>
              </h1>
              <p className="text-lg sm:text-xl opacity-90 mb-6 sm:mb-8 leading-relaxed">
                2021년부터 지역 비즈니스의 성공을 위해 혁신적인 마케팅 솔루션을 제공해왔습니다. 
                AI 기반 자동화 시스템으로 소상공인들의 꿈을 현실로 만들어갑니다.
              </p>
              
              {/* 성과 지표 - 모바일에서는 세로 배치 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white/10 backdrop-blur rounded-lg p-4 sm:p-6 text-center sm:text-left hover:bg-white/20 transition-colors duration-300">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-300">1,000+</div>
                  <div className="text-sm sm:text-base opacity-90">만족한 고객</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4 sm:p-6 text-center sm:text-left hover:bg-white/20 transition-colors duration-300">
                  <div className="text-2xl sm:text-3xl font-bold text-green-300">150%</div>
                  <div className="text-sm sm:text-base opacity-90">평균 성과 향상</div>
                </div>
              </div>

              {/* CTA 버튼 - 모바일 친화적 */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button 
                  className="bg-yellow-400 text-yellow-900 px-6 py-3 rounded-lg font-medium hover:bg-yellow-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-blue-600"
                  aria-label="무료 체험 시작하기"
                >
                  무료 체험 시작
                </button>
                <button 
                  className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                  aria-label="더 자세히 알아보기"
                >
                  더 알아보기
                </button>
              </div>
            </div>
          </FadeInSection>

          <FadeInSection immediate={true} delay={0.3}>
            <div className="relative mt-8 lg:mt-0">
              {/* 가상의 대시보드 미리보기 - 모바일 최적화 */}
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 sm:p-6 hover:bg-white/15 transition-colors duration-300">
                <div className="bg-white/20 rounded-lg p-3 sm:p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-white/30 rounded w-16 sm:w-20 h-3 sm:h-4"></div>
                    <div className="bg-green-400 rounded-full w-3 h-3 animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white/20 rounded w-full h-2 sm:h-3"></div>
                    <div className="bg-white/20 rounded w-3/4 h-2 sm:h-3"></div>
                    <div className="bg-white/20 rounded w-1/2 h-2 sm:h-3"></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/20 rounded-lg p-3 hover:bg-white/30 transition-colors duration-300">
                    <div className="bg-white/30 rounded w-10 sm:w-12 h-2 sm:h-3 mb-2"></div>
                    <div className="bg-yellow-400 rounded w-6 sm:w-8 h-1 sm:h-2"></div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 hover:bg-white/30 transition-colors duration-300">
                    <div className="bg-white/30 rounded w-10 sm:w-12 h-2 sm:h-3 mb-2"></div>
                    <div className="bg-blue-400 rounded w-8 sm:w-10 h-1 sm:h-2"></div>
                  </div>
                </div>
              </div>
              
              {/* 플로팅 요소들 - 모바일에서는 크기 조정 */}
              <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 bg-yellow-400 text-yellow-900 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium animate-bounce">
                실시간 분석
              </div>
              <div className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 bg-green-400 text-green-900 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium animate-pulse">
                AI 자동화
              </div>
            </div>
          </FadeInSection>
        </div>
      </div>

      {/* 스크롤 다운 인디케이터 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce" aria-hidden="true">
        <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

export default CompanyOverview;

"use client";
import React from "react";
import Link from "next/link";
import FadeInSection from "../animations/FadeInComponent";
import Mockup from "../ui/Mockup";

const HomepageHero = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 pt-16 overflow-hidden">
      {/* 배경 장식 요소 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-300/15 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* 왼쪽 콘텐츠 */}
          <div className="text-white">
            <FadeInSection immediate={true} delay={0.1}>
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                AI 기반 마케팅 자동화 플랫폼
              </div>
            </FadeInSection>

            <FadeInSection immediate={true} delay={0.2}>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
                마케팅의 새로운
                <span className="block bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  혁신을 경험하세요
                </span>
              </h1>
            </FadeInSection>

            <FadeInSection immediate={true} delay={0.3}>
              <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed mb-8 max-w-xl">
                네이버 플레이스부터 블로그 마케팅까지, 
                <strong className="text-white">AI가 자동으로</strong> 최적화해드립니다.
                <span className="block mt-2 text-cyan-200">
                  평균 3개월 내 200% 성장 보장
                </span>
              </p>
            </FadeInSection>

            <FadeInSection immediate={true} delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/estimate" className="group">
                  <button className="bg-white text-purple-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl">
                    무료 체험 시작하기
                    <svg className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                    </svg>
                  </button>
                </Link>
                <Link href="/service" className="group">
                  <button className="border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
                    서비스 알아보기
                  </button>
                </Link>
              </div>
            </FadeInSection>

            <FadeInSection immediate={true} delay={1.0}>
              <div className="mt-12 grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-300">2,500+</div>
                  <div className="text-sm text-blue-200">이용 업체</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-300">200%</div>
                  <div className="text-sm text-blue-200">평균 성장률</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-300">3개월</div>
                  <div className="text-sm text-blue-200">성과 보장</div>
                </div>
              </div>
            </FadeInSection>
          </div>

          {/* 오른쪽 시각적 요소 */}
          <div className="relative">
            <FadeInSection immediate={true} delay={0.6}>
              <div className="relative">
                {/* 메인 대시보드 목업 */}
                <div className="bg-white rounded-3xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="text-xs text-gray-500">대시보드</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
                        +47%
                      </div>
                      <div className="h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold">
                        #2위
                      </div>
                    </div>
                    <div className="h-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl"></div>
                  </div>
                </div>

                {/* 플로팅 카드들 */}
                <div className="absolute -top-8 -left-8 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl animate-float">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">순위 상승</div>
                      <div className="text-xs text-gray-600">17위 → 1위</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-8 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl animate-float-delayed">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">방문자 증가</div>
                      <div className="text-xs text-gray-600">+180%</div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </div>

      {/* 스크롤 인디케이터 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite 1.5s;
        }
      `}</style>
    </div>
  );
};

export default HomepageHero;

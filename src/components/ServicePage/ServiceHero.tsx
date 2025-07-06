"use client";
import React from "react";
import Link from "next/link";
import ServiceMenuOptions from "@/components/ServicePage/ServiceMenuOptions";
import FadeInSection from "../animations/FadeInComponent";

const ServiceHero = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 min-h-screen flex items-center">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: "url('/images/HomepageHerobg.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-indigo-900/80" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-white">
            <FadeInSection delay={0.2} once>
              <div className="mb-6">
                <span className="inline-block bg-blue-500/20 text-blue-200 px-4 py-2 rounded-full text-sm font-medium border border-blue-400/30">
                  소상공인 맞춤 마케팅 플랫폼
                </span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                왜 <span className="text-yellow-300">&quot;라카비&quot;</span> 일까요?
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-blue-100 leading-relaxed">
                Location + Marketing + Big Data = <strong>라카비</strong><br/>
                위치 기반 마케팅 빅데이터로 당신의 비즈니스를 성장시키세요
              </p>
            </FadeInSection>

            <FadeInSection delay={0.4} once>
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-lg">실시간 키워드 추적</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-lg">AI 기반 분석</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-lg">통합 마케팅 관리</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-lg">24/7 모니터링</span>
                </div>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.6} once>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/signup">
                  <button className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-300 shadow-lg">
                    무료로 시작하기
                  </button>
                </Link>
                <Link href="/estimate">
                  <button className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-300">
                    견적 받기
                  </button>
                </Link>
              </div>
            </FadeInSection>
          </div>

          {/* Right Column - Service Selection */}
          <div className="lg:pl-12">
            <FadeInSection delay={0.8} once>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  서비스별 상세 정보 보기
                </h3>
                <div className="flex justify-center">
                  <ServiceMenuOptions />
                </div>
                
                <div className="mt-8 grid grid-cols-2 gap-4 text-center text-white">
                  <div>
                    <div className="text-2xl font-bold text-yellow-300">2,500+</div>
                    <div className="text-sm opacity-80">등록 업체</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-300">15,000+</div>
                    <div className="text-sm opacity-80">관리 키워드</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-300">120%</div>
                    <div className="text-sm opacity-80">평균 성과 향상</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-300">98%</div>
                    <div className="text-sm opacity-80">고객 만족도</div>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>

        {/* Bottom Arrow */}
        <FadeInSection delay={1.0} once>
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="animate-bounce">
              <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};

export default ServiceHero;

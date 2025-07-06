"use client";
import React from "react";
import FadeInSection from "../animations/FadeInComponent";

const ServiceOverview = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4">
        <FadeInSection delay={0.2} once>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              라카비가 제공하는 <span className="text-blue-600">통합 마케팅 솔루션</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              소상공인을 위한 스마트한 디지털 마케팅 플랫폼으로, 
              네이버 플레이스부터 블로그 마케팅까지 모든 것을 한 곳에서 관리하세요.
            </p>
          </div>
        </FadeInSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FadeInSection delay={0.4} once>
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">네이버 플레이스 최적화</h3>
              <p className="text-gray-600 mb-4">
                키워드 분석, 순위 추적, 경쟁사 모니터링을 통한 체계적인 플레이스 관리
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• 실시간 키워드 순위 추적</li>
                <li>• AI 기반 키워드 추천</li>
                <li>• 경쟁사 분석 리포트</li>
                <li>• 저장수/리뷰 모니터링</li>
              </ul>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.6} once>
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">블로그 마케팅</h3>
              <p className="text-gray-600 mb-4">
                체험단, 기자단 관리부터 블로그 리뷰 분석까지 완벽한 블로그 마케팅
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• 블로그 체험단/기자단 모집</li>
                <li>• 리뷰 품질 분석</li>
                <li>• 블로그 상위노출 전략</li>
                <li>• 콘텐츠 효과 측정</li>
              </ul>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.8} once>
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">데이터 분석 & 인사이트</h3>
              <p className="text-gray-600 mb-4">
                실시간 데이터 수집과 AI 분석을 통한 마케팅 성과 최적화
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• 실시간 성과 대시보드</li>
                <li>• 고객 행동 패턴 분석</li>
                <li>• ROI 측정 및 개선방안</li>
                <li>• 맞춤형 마케팅 전략</li>
              </ul>
            </div>
          </FadeInSection>
        </div>

        <FadeInSection delay={1.0} once>
          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                성공적인 마케팅의 핵심
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                단순한 도구가 아닌, 성과를 만드는 파트너
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">120%</div>
                  <div className="text-sm text-gray-600">평균 방문자 증가율</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">2,500+</div>
                  <div className="text-sm text-gray-600">등록된 업체 수</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">15,000+</div>
                  <div className="text-sm text-gray-600">관리 중인 키워드</div>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};

export default ServiceOverview;

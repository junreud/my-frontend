"use client";
import React, { useState } from "react";
import FadeInSection from "../animations/FadeInComponent";

const ServiceAdvantages = () => {
  const [activeTab, setActiveTab] = useState(0);

  const advantages = [
    {
      icon: (
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      title: "AI 자동화 시스템",
      description: "인공지능이 24시간 최적의 마케팅 전략을 분석하고 실행합니다",
      features: [
        "실시간 키워드 분석 및 자동 최적화",
        "경쟁사 동향 모니터링 및 대응 전략 제안",
        "고객 행동 패턴 분석으로 타겟팅 정확도 95% 향상",
        "자동 콘텐츠 스케줄링으로 최적 시간대 포스팅"
      ],
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-purple-50",
      stats: { number: "95%", label: "정확도 향상" }
    },
    {
      icon: (
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
      ), 
      title: "실시간 성과 추적",
      description: "모든 마케팅 활동을 실시간으로 추적하고 즉시 최적화합니다",
      features: [
        "실시간 순위 변동 알림으로 즉각 대응",
        "방문자, 전환율, ROI 통합 대시보드",
        "경쟁사 대비 성과 비교 분석",
        "예측 분석으로 향후 트렌드 미리 파악"
      ],
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      stats: { number: "24/7", label: "실시간 모니터링" }
    },
    {
      icon: (
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      title: "통합 마케팅 플랫폼",
      description: "네이버 플레이스부터 블로그까지 모든 채널을 하나로 관리",
      features: [
        "네이버 플레이스, 블로그, SNS 통합 관리",
        "채널 간 데이터 연동으로 시너지 효과 극대화",
        "일관된 브랜딩으로 고객 신뢰도 향상",
        "크로스 채널 캠페인으로 효율성 200% 증대"
      ],
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      stats: { number: "200%", label: "효율성 증대" }
    },
    {
      icon: (
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63c-.34-1.02-1.28-1.74-2.46-1.74s-2.12.72-2.46 1.74L12.5 16H15v6h5z"/>
        </svg>
      ),
      title: "전문가 1:1 지원",
      description: "마케팅 전문가가 성공까지 함께 동행하며 맞춤 전략을 제공합니다",
      features: [
        "업종별 전문가 매칭으로 특화된 전략 수립",
        "주간 성과 리뷰 및 개선방안 제시",
        "24시간 기술지원으로 문제 즉시 해결",
        "성공 사례 공유로 지속적인 성장 도모"
      ],
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      stats: { number: "1:1", label: "전담 지원" }
    }
  ];

  const successStories = [
    {
      business: "카페 'OO마루'",
      period: "3개월",
      results: [
        { metric: "네이버 순위", before: "20위", after: "2위", improvement: "+18위" },
        { metric: "월 방문자", before: "1,200명", after: "4,800명", improvement: "+300%" },
        { metric: "월 매출", before: "800만원", after: "1,600만원", improvement: "+100%" }
      ],
      testimonial: "라카비 덕분에 매출이 두 배로 늘었어요. 특히 네이버 플레이스 관리가 정말 효과적이었습니다."
    },
    {
      business: "헤어샵 '스타일리스트'",
      period: "2개월",
      results: [
        { metric: "예약 증가", before: "30건/월", after: "85건/월", improvement: "+183%" },
        { metric: "신규 고객", before: "10명/월", after: "35명/월", improvement: "+250%" },
        { metric: "리뷰 점수", before: "4.2점", after: "4.8점", improvement: "+14%" }
      ],
      testimonial: "AI 자동화 덕분에 마케팅에 시간을 쓰지 않고도 고객이 계속 늘어나고 있습니다."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* 헤더 */}
        <FadeInSection immediate={true} delay={0.2}>
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              검증된 성과, 신뢰할 수 있는 파트너
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              라카비만의 <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">핵심 경쟁력</span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              AI 기술과 전문가 노하우의 완벽한 결합으로 <strong>평균 3개월 내 200% 성장</strong>을 보장합니다
            </p>
          </div>
        </FadeInSection>

        {/* 탭 네비게이션 */}
        <FadeInSection immediate={true} delay={0.4}>
          <div className="flex flex-wrap justify-center mb-16">
            <div className="bg-white rounded-2xl p-2 shadow-lg border">
              {advantages.map((advantage, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === index
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {advantage.title}
                </button>
              ))}
            </div>
          </div>
        </FadeInSection>

        {/* 활성 탭 콘텐츠 */}
        <FadeInSection immediate={true} delay={0.6} key={activeTab}>
          <div className="mb-20">
            <div className={`${advantages[activeTab].bgColor} rounded-3xl p-8 lg:p-12`}>
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${advantages[activeTab].color} text-white mb-6`}>
                    {advantages[activeTab].icon}
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    {advantages[activeTab].title}
                  </h3>
                  <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                    {advantages[activeTab].description}
                  </p>
                  <div className="space-y-4">
                    {advantages[activeTab].features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start">
                        <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${advantages[activeTab].color} flex items-center justify-center mr-4 mt-1 flex-shrink-0`}>
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-lg text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`inline-flex flex-col items-center justify-center w-48 h-48 rounded-full bg-gradient-to-r ${advantages[activeTab].color} text-white mb-6`}>
                    <div className="text-4xl font-bold">{advantages[activeTab].stats.number}</div>
                    <div className="text-lg opacity-90">{advantages[activeTab].stats.label}</div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">실제 성과</h4>
                    <p className="text-gray-600">평균적으로 이런 결과를 달성하고 있습니다</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* 성공 사례 */}
        <FadeInSection immediate={true} delay={0.8}>
          <div className="mb-20">
            <h3 className="text-4xl font-bold text-center text-gray-900 mb-12">
              실제 <span className="text-blue-600">성공 사례</span>
            </h3>
            <div className="grid lg:grid-cols-2 gap-8">
              {successStories.map((story, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-xl border">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-2xl font-bold text-gray-900">{story.business}</h4>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {story.period} 성과
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    {story.results.map((result, resultIndex) => (
                      <div key={resultIndex} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">{result.metric}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">{result.before}</span>
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span className="font-bold text-green-600">{result.after}</span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {result.improvement}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700">
                    &quot;{story.testimonial}&quot;
                  </blockquote>
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>

        {/* CTA 섹션 */}
        <FadeInSection immediate={true} delay={1.0}>
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-center text-white">
            <h3 className="text-4xl font-bold mb-6">
              지금 시작하면 <span className="text-yellow-300">첫 달 무료</span>
            </h3>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              성과가 없으면 100% 환불 보장. 위험 부담 없이 지금 바로 시작하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-purple-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300">
                무료 체험 시작하기
              </button>
              <button className="border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all duration-300">
                성공 사례 더 보기
              </button>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};

export default ServiceAdvantages;

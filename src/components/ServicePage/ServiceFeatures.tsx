"use client";
import React, { useState } from "react";
import FadeInSection from "../animations/FadeInComponent";

const ServiceFeatures = () => {
  const [activeTab, setActiveTab] = useState('place');

  const features = {
    place: {
      title: "네이버 플레이스 마케팅",
      subtitle: "검색 상위노출을 위한 체계적인 플레이스 관리",
      items: [
        {
          icon: "🎯",
          title: "스마트 키워드 분석",
          description: "AI가 분석한 최적의 키워드로 검색 노출 극대화",
          details: ["월간 검색량 기반 키워드 추천", "경쟁강도 분석", "지역별 맞춤 키워드"]
        },
        {
          icon: "📊",
          title: "실시간 순위 추적",
          description: "키워드별 순위 변동을 실시간으로 모니터링",
          details: ["일일 순위 변동 알림", "경쟁사 순위 비교", "히스토리 데이터 제공"]
        },
        {
          icon: "🔍",
          title: "경쟁사 분석",
          description: "동종업계 경쟁사의 마케팅 전략 분석",
          details: ["경쟁사 키워드 분석", "리뷰 전략 벤치마킹", "차별화 포인트 도출"]
        },
        {
          icon: "📈",
          title: "성과 리포팅",
          description: "데이터 기반의 상세한 성과 분석 리포트",
          details: ["방문자 증가율 측정", "전환율 분석", "ROI 계산"]
        }
      ]
    },
    blog: {
      title: "블로그 마케팅",
      subtitle: "체험단/기자단을 통한 자연스러운 블로그 마케팅",
      items: [
        {
          icon: "✍️",
          title: "체험단 모집 & 관리",
          description: "품질 높은 체험단을 모집하고 체계적으로 관리",
          details: ["검증된 블로거 네트워크", "체험단 매칭 시스템", "리뷰 품질 관리"]
        },
        {
          icon: "📝",
          title: "콘텐츠 기획",
          description: "SEO 최적화된 블로그 콘텐츠 기획 및 가이드",
          details: ["키워드 기반 콘텐츠 기획", "SEO 최적화 가이드", "콘텐츠 템플릿 제공"]
        },
        {
          icon: "🔗",
          title: "상위노출 전략",
          description: "네이버 블로그 상위노출을 위한 전략적 접근",
          details: ["백링크 구축", "내부링크 최적화", "키워드 밀도 조절"]
        },
        {
          icon: "📱",
          title: "리뷰 모니터링",
          description: "작성된 블로그 리뷰의 효과를 실시간 모니터링",
          details: ["노출수/클릭수 추적", "브랜드 언급량 모니터링", "감정 분석"]
        }
      ]
    },
    analytics: {
      title: "데이터 분석",
      subtitle: "AI와 빅데이터를 활용한 인사이트 제공",
      items: [
        {
          icon: "🤖",
          title: "AI 분석 엔진",
          description: "머신러닝을 활용한 고도화된 데이터 분석",
          details: ["고객 행동 패턴 분석", "예측 모델링", "개인화 추천"]
        },
        {
          icon: "📊",
          title: "실시간 대시보드",
          description: "모든 마케팅 성과를 한눈에 볼 수 있는 대시보드",
          details: ["실시간 성과 지표", "커스터마이징 가능한 위젯", "모바일 최적화"]
        },
        {
          icon: "📈",
          title: "트렌드 분석",
          description: "업계 트렌드와 시장 변화를 선제적으로 파악",
          details: ["키워드 트렌드 분석", "계절성 패턴 인식", "신규 기회 발굴"]
        },
        {
          icon: "🎯",
          title: "최적화 제안",
          description: "데이터 기반의 구체적인 개선 방안 제시",
          details: ["A/B 테스트 제안", "예산 최적화 방안", "타겟팅 개선안"]
        }
      ]
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <FadeInSection delay={0.2} once>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              서비스 <span className="text-blue-600">주요 기능</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              각 영역별 전문화된 기능으로 마케팅 효과를 극대화하세요
            </p>
          </div>
        </FadeInSection>

        {/* 탭 네비게이션 */}
        <FadeInSection delay={0.4} once>
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 rounded-xl p-2 inline-flex">
              {Object.entries(features).map(([key, feature]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === key
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {feature.title}
                </button>
              ))}
            </div>
          </div>
        </FadeInSection>

        {/* 탭 콘텐츠 */}
        <div className="relative">
          {Object.entries(features).map(([key, feature]) => (
            <div
              key={key}
              className={`transition-all duration-500 ${
                activeTab === key ? 'opacity-100 visible' : 'opacity-0 invisible absolute top-0 left-0 right-0'
              }`}
            >
              <FadeInSection delay={0.2} once>
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-lg text-gray-600">{feature.subtitle}</p>
                </div>
              </FadeInSection>

              <div className="grid md:grid-cols-2 gap-8">
                {feature.items.map((item, index) => (
                  <FadeInSection key={index} delay={0.3 + index * 0.1} once>
                    <div className="bg-gray-50 rounded-xl p-8 hover:bg-gray-100 transition-colors duration-300">
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{item.icon}</div>
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-gray-900 mb-3">
                            {item.title}
                          </h4>
                          <p className="text-gray-600 mb-4">
                            {item.description}
                          </p>
                          <ul className="space-y-2">
                            {item.details.map((detail, detailIndex) => (
                              <li key={detailIndex} className="flex items-center text-sm text-gray-500">
                                <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </FadeInSection>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 통합 솔루션 섹션 */}
        <FadeInSection delay={0.8} once>
          <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white text-center">
            <h3 className="text-3xl font-bold mb-6">
              모든 기능이 하나로 연결된 통합 솔루션
            </h3>
            <p className="text-xl mb-8 opacity-90">
              각각의 기능이 유기적으로 연결되어 시너지 효과를 극대화합니다
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🔄</div>
                <h4 className="text-lg font-semibold mb-2">데이터 연동</h4>
                <p className="text-sm opacity-80">모든 채널의 데이터가 실시간으로 연동</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h4 className="text-lg font-semibold mb-2">자동화</h4>
                <p className="text-sm opacity-80">반복 작업은 자동화로 효율성 극대화</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h4 className="text-lg font-semibold mb-2">최적화</h4>
                <p className="text-sm opacity-80">AI가 지속적으로 성과를 최적화</p>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};

export default ServiceFeatures;

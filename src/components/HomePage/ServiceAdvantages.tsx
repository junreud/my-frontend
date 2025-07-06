"use client";
import React from "react";
import FadeInSection from "../animations/FadeInComponent";

const ServiceAdvantages = () => {
  const advantages = [
    {
      icon: "🔄",
      title: "올인원 솔루션",
      description: "네이버 플레이스부터 블로그 마케팅까지 모든 디지털 마케팅을 한 곳에서",
      features: [
        "통합 대시보드로 모든 채널 관리",
        "채널 간 데이터 연동 및 분석",
        "일관된 브랜드 메시징 관리",
        "크로스 채널 성과 측정"
      ],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "🤖", 
      title: "AI 기반 자동화",
      description: "인공지능이 최적의 마케팅 전략을 자동으로 제안하고 실행",
      features: [
        "스마트 키워드 자동 추천",
        "최적 게시 시간 분석",
        "타겟 고객 자동 분석",
        "성과 예측 및 최적화"
      ],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: "💰",
      title: "비용 효율성",
      description: "기존 마케팅 비용의 절반으로 더 나은 성과를 달성",
      features: [
        "무료 체험으로 효과 먼저 확인",
        "사용한 만큼만 지불하는 과금 체계",
        "ROI 보장 프로그램",
        "숨겨진 비용 없는 투명한 요금"
      ],
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: "📊",
      title: "실시간 데이터",
      description: "실시간 모니터링으로 빠른 의사결정과 즉각적인 대응 가능",
      features: [
        "실시간 순위 변동 알림",
        "즉시 확인 가능한 성과 지표",
        "실시간 경쟁사 분석",
        "24/7 자동 모니터링"
      ],
      color: "from-orange-500 to-red-500"
    },
    {
      icon: "👥",
      title: "전문가 지원",
      description: "마케팅 전문가들의 1:1 맞춤 컨설팅 및 지원",
      features: [
        "전담 계정 매니저 배정",
        "월간 성과 리뷰 미팅",
        "마케팅 전략 컨설팅",
        "24/7 기술 지원"
      ],
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: "🚀",
      title: "빠른 성과",
      description: "평균 3개월 내 가시적인 성과, 보통 첫 달부터 효과 체감",
      features: [
        "첫 주부터 순위 변화 확인",
        "첫 달부터 방문자 증가",
        "3개월 내 매출 증가 보장",
        "6개월 후 평균 200% 성장"
      ],
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const competitorComparison = {
    categories: [
      "설정 시간",
      "월 이용료",
      "기능 범위", 
      "지원 수준",
      "성과 보장"
    ],
    competitors: [
      {
        name: "라카비",
        values: ["5분", "29,000원~", "올인원", "1:1 전담", "3개월 보장"],
        highlight: true
      },
      {
        name: "A사",
        values: ["2-3일", "150,000원~", "부분적", "이메일만", "없음"],
        highlight: false
      },
      {
        name: "B사", 
        values: ["1주일", "200,000원~", "플레이스만", "전화", "없음"],
        highlight: false
      },
      {
        name: "직접 관리",
        values: ["1개월+", "시간 비용", "제한적", "없음", "없음"],
        highlight: false
      }
    ]
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* 헤더 */}
        <FadeInSection delay={0.2} once>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              왜 <span className="text-blue-600">라카비</span>를 선택해야 할까요?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              단순한 도구가 아닌, 성과를 보장하는 마케팅 파트너
            </p>
          </div>
        </FadeInSection>

        {/* 주요 장점들 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {advantages.map((advantage, index) => (
            <FadeInSection key={advantage.title} delay={0.4 + index * 0.1} once>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${advantage.color} flex items-center justify-center text-2xl mb-6`}>
                  {advantage.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {advantage.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {advantage.description}
                </p>
                <ul className="space-y-3">
                  {advantage.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeInSection>
          ))}
        </div>

        {/* 경쟁사 비교 */}
        <FadeInSection delay={1.0} once>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              경쟁사 비교
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">구분</th>
                    {competitorComparison.competitors.map((competitor) => (
                      <th 
                        key={competitor.name}
                        className={`text-center py-4 px-4 font-semibold ${
                          competitor.highlight 
                            ? 'text-blue-600 bg-blue-50 rounded-t-lg' 
                            : 'text-gray-700'
                        }`}
                      >
                        {competitor.name}
                        {competitor.highlight && (
                          <div className="text-xs text-blue-500 font-normal mt-1">추천!</div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {competitorComparison.categories.map((category, categoryIndex) => (
                    <tr key={category} className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {category}
                      </td>
                      {competitorComparison.competitors.map((competitor) => (
                        <td 
                          key={`${category}-${competitor.name}`}                        className={`text-center py-4 px-4 ${
                          competitor.highlight 
                            ? 'bg-blue-50 text-blue-900 font-medium' 
                            : 'text-gray-600'
                        }`}
                      >
                        {competitor.values[categoryIndex]}
                        {competitor.highlight && (
                          <div className="text-xs text-green-600 mt-1">✓ 최고</div>
                        )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeInSection>

        {/* 성과 보장 섹션 */}
        <FadeInSection delay={1.2} once>
          <div className="mt-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-12 text-white text-center">
            <h3 className="text-3xl font-bold mb-6">
              성과 보장 약속
            </h3>
            <p className="text-xl mb-8 opacity-90">
              3개월 내 가시적인 성과가 없다면 100% 환불해드립니다
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl mb-4">📈</div>
                <h4 className="text-lg font-semibold mb-2">성과 측정</h4>
                <p className="text-sm opacity-80">
                  방문자, 순위, 매출 등 명확한 지표로 성과 측정
                </p>
              </div>
              <div>
                <div className="text-4xl mb-4">🔒</div>
                <h4 className="text-lg font-semibold mb-2">100% 환불</h4>
                <p className="text-sm opacity-80">
                  3개월 내 약속한 성과 미달성 시 전액 환불
                </p>
              </div>
              <div>
                <div className="text-4xl mb-4">👨‍💼</div>
                <h4 className="text-lg font-semibold mb-2">전담 지원</h4>
                <p className="text-sm opacity-80">
                  성과 달성까지 전담 매니저가 함께
                </p>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};

export default ServiceAdvantages;

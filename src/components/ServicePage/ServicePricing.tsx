"use client";
import React, { useState } from "react";
import Link from "next/link";
import FadeInSection from "../animations/FadeInComponent";

const ServicePricing = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: "Free",
      description: "개인 사용자 및 체험용",
      monthlyPrice: 0,
      yearlyPrice: 0,
      popular: false,
      features: [
        "플레이스 1개 등록",
        "기본 리뷰 알림",
        "팀 초대 불가",
      ],
      limitations: []
    },
    {
      name: "Starter",
      description: "소상공인을 위한 시작 플랜",
      monthlyPrice: 9900,
      yearlyPrice: 99000, // 2개월 할인
      popular: false,
      features: [
        "플레이스 최대 3개",
        "리뷰/방문자수 알림",
        "팀원 1명 초대",
        "자동화 일부 사용",
      ],
      limitations: []
    },
    {
      name: "Pro",
      description: "마케팅 집중 관리용",
      monthlyPrice: 29000,
      yearlyPrice: 290000, // 2개월 할인
      popular: true,
      features: [
        "플레이스 최대 10개",
        "리뷰 분석 및 응답 추천",
        "경쟁사 모니터링",
        "모든 자동화 기능",
        "팀원 최대 5명",
      ],
      limitations: []
    },
    {
      name: "Business",
      description: "대행사/프랜차이즈 본사 전용",
      monthlyPrice: "맞춤형",
      yearlyPrice: "맞춤형",
      popular: false,
      features: [
        "무제한 플레이스",
        "무제한 팀원",
        "API 연동 지원",
        "전용 고객지원",
      ],
      limitations: []
    }
  ];

  const formatPrice = (price: number | string) => {
    if (typeof price === 'string') return price;
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getPrice = (plan: typeof plans[0]) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (billingCycle === 'yearly' && typeof plan.monthlyPrice === 'number' && typeof plan.yearlyPrice === 'number' && plan.monthlyPrice > 0) {
      const monthlyCost = plan.monthlyPrice * 12;
      const yearlyCost = plan.yearlyPrice;
      const savings = monthlyCost - yearlyCost;
      return Math.round((savings / monthlyCost) * 100);
    }
    return 0;
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <FadeInSection delay={0.2} once>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              합리적인 <span className="text-blue-600">요금제</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              규모와 필요에 맞는 요금제를 선택하세요. 언제든지 업그레이드 가능합니다.
            </p>
            
            {/* 월간/연간 토글 */}
            <div className="flex items-center justify-center space-x-4">
              <span className={`font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                월간 결제
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                연간 결제
              </span>
              {billingCycle === 'yearly' && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  최대 20% 할인
                </span>
              )}
            </div>
          </div>
        </FadeInSection>

        <div className="grid lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <FadeInSection key={plan.name} delay={0.4 + index * 0.2} once>
              <div className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-blue-600 scale-105' : ''
              }`}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 text-sm font-medium">
                    가장 인기 있는 플랜
                  </div>
                )}
                
                <div className={`p-8 ${plan.popular ? 'pt-16' : ''}`}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">
                        {typeof getPrice(plan) === 'string' ? getPrice(plan) : `₩${formatPrice(getPrice(plan) as number)}`}
                      </span>
                      {typeof getPrice(plan) === 'number' && (getPrice(plan) as number) > 0 && (
                        <span className="text-gray-500 ml-2">
                          /{billingCycle === 'monthly' ? '월' : '년'}
                        </span>
                      )}
                    </div>
                    {billingCycle === 'yearly' && getSavings(plan) > 0 && (
                      <p className="text-green-600 text-sm mt-1">
                        월간 대비 {getSavings(plan)}% 절약
                      </p>
                    )}
                  </div>

                  <Link href="/signup">
                    <button className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}>
                      {plan.name === '엔터프라이즈' ? '문의하기' : '시작하기'}
                    </button>
                  </Link>

                  <div className="mt-8">
                    <h4 className="font-semibold text-gray-900 mb-4">포함 기능:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.limitations.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-4">제한사항:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, limitIndex) => (
                            <li key={limitIndex} className="flex items-start">
                              <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-500 text-sm">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>

        {/* 추가 정보 섹션 */}
        <FadeInSection delay={1.0} once>
          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                모든 플랜에 포함되는 기본 혜택
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">무료 체험</h4>
                  <p className="text-sm text-gray-600">14일 무료 체험 가능</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">보안</h4>
                  <p className="text-sm text-gray-600">SSL 암호화 및 데이터 보호</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">지원</h4>
                  <p className="text-sm text-gray-600">전문가 상담 및 교육</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">업데이트</h4>
                  <p className="text-sm text-gray-600">지속적인 기능 업데이트</p>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* FAQ 링크 */}
        <FadeInSection delay={1.2} once>
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              요금제에 대해 더 궁금한 점이 있으신가요?
            </p>
            <Link href="/faq" className="text-blue-600 hover:text-blue-700 font-medium">
              자주 묻는 질문 보기 →
            </Link>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};

export default ServicePricing;

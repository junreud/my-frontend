"use client";
import React, { useState } from "react";
import FadeInSection from "../animations/FadeInComponent";

const CustomerTestimonials = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "김민수",
      business: "맛있는 족발집",
      location: "서울 강남구",
      category: "음식점",
      rating: 5,
      testimonial: "라카비 도입 후 3개월 만에 네이버 플레이스 방문자가 200% 증가했어요. 특히 키워드 순위가 눈에 띄게 올라가면서 예약이 2배로 늘었습니다. 이제는 매일 예약 문의 전화가 끊이지 않아요.",
      results: {
        visitors: "+200%",
        reservations: "+150%",
        revenue: "+180%"
      },
      beforeAfter: {
        before: "키워드 순위 15-20위",
        after: "키워드 순위 3-5위"
      },
      period: "3개월"
    },
    {
      id: 2,
      name: "박수연",
      business: "수연이네 카페",
      location: "부산 해운대구",
      category: "카페",
      rating: 5,
      testimonial: "블로그 마케팅으로 젊은 고객들이 많이 찾아와요. 체험단 리뷰의 품질이 정말 좋아서 신뢰도가 높아졌습니다. 인스타그램에 올리는 고객들도 늘어서 자연스럽게 홍보 효과까지 얻고 있어요.",
      results: {
        visitors: "+150%",
        newCustomers: "+220%",
        revenue: "+160%"
      },
      beforeAfter: {
        before: "월 블로그 언급 2-3건",
        after: "월 블로그 언급 15-20건"
      },
      period: "2개월"
    },
    {
      id: 3,
      name: "이정훈",
      business: "정훈이네 치킨",
      location: "대구 중구",
      category: "치킨·닭강정",
      rating: 5,
      testimonial: "데이터 기반 마케팅이 이렇게 효과적일 줄 몰랐어요. 실시간 순위 추적으로 언제 광고를 늘리고 줄여야 할지 정확히 알 수 있어 예산 효율이 크게 개선됐습니다. ROI가 2배 이상 향상됐어요.",
      results: {
        visitors: "+180%",
        orders: "+170%",
        adEfficiency: "+250%"
      },
      beforeAfter: {
        before: "광고비 월 200만원, ROI 120%",
        after: "광고비 월 150만원, ROI 280%"
      },
      period: "4개월"
    }
  ];

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[activeTestimonial];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* 헤더 */}
        <FadeInSection immediate={true} delay={0.1}>
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              검증된 실제 성과 사례
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              고객들의 <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">성공 스토리</span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              라카비와 함께 <strong>실제로 성장한</strong> 업체들의 생생한 이야기를 들어보세요.<br/>
              <span className="text-blue-600">당신의 업체도 다음 성공 사례가 될 수 있습니다.</span>
            </p>
          </div>
        </FadeInSection>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* 왼쪽 - 고객 정보 및 후기 */}
          <FadeInSection immediate={true} delay={0.2} key={activeTestimonial}>
            <div className="bg-white rounded-3xl p-10 shadow-2xl relative border border-gray-100">
              {/* 인용 부호 */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-serif">
                &ldquo;
              </div>
              
              <div className="flex items-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mr-6 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {current.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{current.name}</h3>
                  <p className="text-lg text-gray-700 font-medium">{current.business}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-500">{current.location}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{current.category}</span>
                  </div>
                </div>
              </div>

              {/* 별점 */}
              <div className="flex items-center mb-6">
                {[...Array(current.rating)].map((_, i) => (
                  <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-lg font-semibold text-gray-700">{current.rating}.0</span>
              </div>

              <blockquote className="text-gray-700 text-lg leading-relaxed mb-8 italic">
                &quot;{current.testimonial}&quot;
              </blockquote>

              {/* Before/After */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-8">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                  </svg>
                  {current.period} 성과 변화
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                    <div>
                      <span className="text-red-600 font-semibold">Before:</span>
                      <p className="text-gray-600 mt-1">{current.beforeAfter.before}</p>
                    </div>
                    <svg className="w-6 h-6 text-green-500 mx-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="text-green-600 font-semibold">After:</span>
                      <p className="text-gray-600 mt-1">{current.beforeAfter.after}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 네비게이션 버튼 */}
              <div className="flex justify-between items-center">
                <button 
                  onClick={prevTestimonial}
                  className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 hover:shadow-lg"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex space-x-3">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`w-4 h-4 rounded-full transition-all duration-300 ${
                        index === activeTestimonial 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>

                <button 
                  onClick={nextTestimonial}
                  className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 hover:shadow-lg"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </FadeInSection>

          {/* 오른쪽 - 성과 지표 */}
          <FadeInSection immediate={true} delay={0.3}>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-8">
                {current.business}의 <span className="text-blue-600">실제 성과</span>
              </h3>
              
              {Object.entries(current.results).map(([key, value]) => (
                <div key={key} className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 capitalize">
                        {key === 'visitors' && '방문자 수'}
                        {key === 'reservations' && '예약 수'}
                        {key === 'revenue' && '매출'}
                        {key === 'newCustomers' && '신규 고객'}
                        {key === 'orders' && '주문 수'}
                        {key === 'adEfficiency' && '광고 효율'}
                      </h4>
                      <p className="text-gray-600">지난 3개월 대비</p>
                    </div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                      {value}
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${Math.min(parseInt(value.replace('%', '').replace('+', '')) / 3, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              ))}

              {/* 추가 성과 하이라이트 */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mt-8">
                <h4 className="text-xl font-bold mb-4">⭐ 특별한 성과</h4>
                <ul className="space-y-2 text-blue-100">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    네이버 플레이스 키워드 상위 3위 안에 안착
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    고객 리뷰 평점 4.8점 이상 유지
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    지역 내 경쟁업체 대비 확실한 우위 확보
                  </li>
                </ul>
              </div>
            </div>
          </FadeInSection>
        </div>

        {/* 하단 통계 */}
        <FadeInSection immediate={true} delay={0.4}>
          <div className="mt-20 bg-white rounded-3xl p-12 shadow-2xl border border-gray-100">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-12">
              전체 고객 <span className="text-blue-600">평균 성과</span>
            </h3>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="p-6">
                <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-3">+165%</div>
                <div className="text-lg text-gray-600 font-medium">평균 방문자 증가</div>
                <div className="text-sm text-gray-500 mt-1">최대 300% 증가 사례</div>
              </div>
              <div className="p-6">
                <div className="text-4xl lg:text-5xl font-bold text-green-600 mb-3">+180%</div>
                <div className="text-lg text-gray-600 font-medium">평균 매출 증가</div>
                <div className="text-sm text-gray-500 mt-1">최대 400% 증가 사례</div>
              </div>
              <div className="p-6">
                <div className="text-4xl lg:text-5xl font-bold text-purple-600 mb-3">97%</div>
                <div className="text-lg text-gray-600 font-medium">고객 만족도</div>
                <div className="text-sm text-gray-500 mt-1">지속 이용률 95%</div>
              </div>
              <div className="p-6">
                <div className="text-4xl lg:text-5xl font-bold text-orange-600 mb-3">2,500+</div>
                <div className="text-lg text-gray-600 font-medium">성공 사례</div>
                <div className="text-sm text-gray-500 mt-1">매월 +200개 증가</div>
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* CTA 섹션 */}
        <FadeInSection immediate={true} delay={0.5}>
          <div className="mt-16 text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              <span className="text-blue-600">당신의 성공 스토리</span>를 만들어보세요
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              3개월 후, 여기 있는 성공 사례 중 하나가 바로 당신의 이야기가 될 수 있습니다
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                무료 체험 시작하기
              </button>
              <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold text-lg py-4 px-8 rounded-2xl transition-all duration-300">
                더 많은 성공사례 보기
              </button>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};

export default CustomerTestimonials;
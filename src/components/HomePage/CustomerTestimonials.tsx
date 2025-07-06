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
      image: "/images/customer1.jpg", // 실제 이미지 경로로 교체 필요
      rating: 5,
      testimonial: "라카비 도입 후 3개월 만에 네이버 플레이스 방문자가 200% 증가했어요. 특히 키워드 순위가 눈에 띄게 올라가면서 예약이 2배로 늘었습니다.",
      results: {
        visitors: "+200%",
        reservations: "+150%",
        revenue: "+180%"
      },
      beforeAfter: {
        before: "키워드 순위 15-20위",
        after: "키워드 순위 3-5위"
      }
    },
    {
      id: 2,
      name: "박수연",
      business: "수연이네 카페",
      location: "부산 해운대구",
      image: "/images/customer2.jpg",
      rating: 5,
      testimonial: "블로그 마케팅으로 젊은 고객들이 많이 찾아와요. 체험단 리뷰의 품질이 정말 좋아서 신뢰도가 높아졌습니다. 매출도 꾸준히 상승하고 있어요.",
      results: {
        visitors: "+150%",
        newCustomers: "+220%",
        revenue: "+160%"
      },
      beforeAfter: {
        before: "월 블로그 언급 2-3건",
        after: "월 블로그 언급 15-20건"
      }
    },
    {
      id: 3,
      name: "이정훈",
      business: "정훈이네 치킨",
      location: "대구 중구",
      image: "/images/customer3.jpg",
      rating: 5,
      testimonial: "데이터 기반 마케팅이 이렇게 효과적일 줄 몰랐어요. 실시간 순위 추적으로 언제 광고를 늘리고 줄여야 할지 정확히 알 수 있어 예산 효율이 크게 개선됐습니다.",
      results: {
        visitors: "+180%",
        orders: "+170%",
        adEfficiency: "+250%"
      },
      beforeAfter: {
        before: "광고비 월 200만원, ROI 120%",
        after: "광고비 월 150만원, ROI 280%"
      }
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
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4">
        <FadeInSection delay={0.2} once>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              고객들의 <span className="text-blue-600">성공 스토리</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              라카비와 함께 성장한 실제 고객들의 이야기를 들어보세요
            </p>
          </div>
        </FadeInSection>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 왼쪽 - 고객 정보 및 후기 */}
          <FadeInSection delay={0.4} once>
            <div className="bg-white rounded-2xl p-8 shadow-xl relative">
              {/* 인용 부호 */}
              <div className="absolute -top-4 -left-4 text-6xl text-blue-200 font-serif">&ldquo;</div>
              
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gray-300 rounded-full mr-4 overflow-hidden">
                  {/* 실제 이미지가 있다면 img 태그 사용 */}
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                    {current.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{current.name}</h3>
                  <p className="text-gray-600">{current.business}</p>
                  <p className="text-sm text-gray-500">{current.location}</p>
                </div>
              </div>

              {/* 별점 */}
              <div className="flex mb-4">
                {[...Array(current.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {current.testimonial}
              </p>

              {/* Before/After */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">변화</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-red-600 font-medium">Before:</span>
                    <p className="text-gray-600">{current.beforeAfter.before}</p>
                  </div>
                  <div>
                    <span className="text-green-600 font-medium">After:</span>
                    <p className="text-gray-600">{current.beforeAfter.after}</p>
                  </div>
                </div>
              </div>

              {/* 네비게이션 버튼 */}
              <div className="flex justify-between items-center">
                <button 
                  onClick={prevTestimonial}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === activeTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <button 
                  onClick={nextTestimonial}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </FadeInSection>

          {/* 오른쪽 - 성과 지표 */}
          <FadeInSection delay={0.6} once>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {current.business}의 성과
              </h3>
              
              {Object.entries(current.results).map(([key, value]) => (
                <div key={key} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 capitalize">
                        {key === 'visitors' && '방문자 수'}
                        {key === 'reservations' && '예약 수'}
                        {key === 'revenue' && '매출'}
                        {key === 'newCustomers' && '신규 고객'}
                        {key === 'orders' && '주문 수'}
                        {key === 'adEfficiency' && '광고 효율'}
                      </h4>
                      <p className="text-gray-600">지난 3개월 대비</p>
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      {value}
                    </div>
                  </div>
                  <div className="mt-4 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${Math.min(parseInt(value.replace('%', '').replace('+', '')) / 3, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>

        {/* 하단 통계 */}
        <FadeInSection delay={0.8} once>
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              전체 고객 평균 성과
            </h3>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">120%</div>
                <div className="text-gray-600">평균 방문자 증가</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">150%</div>
                <div className="text-gray-600">평균 매출 증가</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
                <div className="text-gray-600">고객 만족도</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">2,500+</div>
                <div className="text-gray-600">성공 사례</div>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};

export default CustomerTestimonials;

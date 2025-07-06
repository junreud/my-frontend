"use client";
import React from "react";
import Link from "next/link";
import FadeInSection from "../animations/FadeInComponent";

const ServiceCTA = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
      <div className="max-w-6xl mx-auto px-4">
        <FadeInSection delay={0.2} once>
          <div className="text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              지금 시작하고 <span className="text-yellow-300">성과를 확인</span>하세요
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
              14일 무료 체험으로 라카비의 모든 기능을 경험해보세요. 
              신용카드 정보 없이도 바로 시작할 수 있습니다.
            </p>
          </div>
        </FadeInSection>

        <FadeInSection delay={0.4} once>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6 mb-12">
            <Link href="/signup">
              <button className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-300 shadow-lg">
                무료로 시작하기
              </button>
            </Link>
            <Link href="/estimate">
              <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-300">
                견적 받기
              </button>
            </Link>
          </div>
        </FadeInSection>

        <FadeInSection delay={0.6} once>
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">빠른 설정</h3>
              <p className="opacity-80">
                5분 만에 설정 완료하고 바로 마케팅 시작
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-4">💎</div>
              <h3 className="text-xl font-semibold mb-2">프리미엄 지원</h3>
              <p className="opacity-80">
                전담 매니저가 성공까지 함께 동행
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-2">보장된 성과</h3>
              <p className="opacity-80">
                3개월 내 가시적인 성과 보장
              </p>
            </div>
          </div>
        </FadeInSection>

        <FadeInSection delay={0.8} once>
          <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                이미 많은 사업자들이 라카비와 함께 성장하고 있습니다
              </h3>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center text-white">
              <div>
                <div className="text-3xl font-bold text-yellow-300 mb-2">2,500+</div>
                <div className="text-sm opacity-80">등록 업체</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-300 mb-2">15,000+</div>
                <div className="text-sm opacity-80">관리 키워드</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-300 mb-2">120%</div>
                <div className="text-sm opacity-80">평균 방문자 증가</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-300 mb-2">98%</div>
                <div className="text-sm opacity-80">고객 만족도</div>
              </div>
            </div>
          </div>
        </FadeInSection>

        <FadeInSection delay={1.0} once>
          <div className="mt-12 text-center">
            <p className="text-white/80 mb-4">
              궁금한 점이 있으시거나 상담이 필요하시다면
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-white">
              <a href="tel:1588-0000" className="flex items-center hover:text-yellow-300 transition-colors">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                1588-0000 (무료상담)
              </a>
              <a href="mailto:support@lacabi.com" className="flex items-center hover:text-yellow-300 transition-colors">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                support@lacabi.com
              </a>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};

export default ServiceCTA;

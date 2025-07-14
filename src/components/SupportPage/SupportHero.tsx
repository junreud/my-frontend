"use client";
import FadeInSection from "../animations/FadeInComponent";

const SupportHero = () => {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 pt-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeInSection immediate={true}>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            고객지원센터
          </h1>
          <p className="text-xl opacity-90 mb-8">
            언제든지 도움이 필요하시면 연락주세요. 최고의 서비스로 지원해드리겠습니다.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <div className="text-3xl mb-3">🕐</div>
              <h3 className="font-bold mb-2">24/7 지원</h3>
              <p className="text-sm opacity-90">연중무휴 고객지원</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold mb-2">빠른 응답</h3>
              <p className="text-sm opacity-90">평균 2시간 내 답변</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold mb-2">전문가 지원</h3>
              <p className="text-sm opacity-90">마케팅 전문가 상담</p>
            </div>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
};

export default SupportHero;

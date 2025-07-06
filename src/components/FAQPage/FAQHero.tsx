"use client";
import FadeInSection from "../animations/FadeInComponent";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const FAQHero = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-20 relative overflow-hidden">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 bg-black/10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1' fill-rule='nonzero'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <FadeInSection>
          <div className={`${isMobile ? 'text-4xl' : 'text-6xl'} mb-6`}>🤔</div>
          <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'} font-bold mb-6`}>
            자주 묻는 질문
          </h1>
          <p className={`${isMobile ? 'text-lg' : 'text-xl'} opacity-90 mb-8 max-w-2xl mx-auto`}>
            고객님들이 가장 궁금해하시는 질문들에 대한 답변을 정리했습니다. 
            원하는 답변을 빠르게 찾아보세요.
          </p>
          
          {/* 빠른 통계 */}
          <div className={`grid gap-6 mt-12 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">50+</div>
              <p className="text-sm opacity-90">자주 묻는 질문</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">2분</div>
              <p className="text-sm opacity-90">평균 해결 시간</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">95%</div>
              <p className="text-sm opacity-90">만족도</p>
            </div>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
};

export default FAQHero;

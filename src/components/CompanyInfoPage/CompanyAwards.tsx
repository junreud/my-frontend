"use client";
import FadeInSection from "../animations/FadeInComponent";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const CompanyAwards = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const awards = [
    {
      year: "2024",
      title: "대한민국 마케팅 혁신상",
      organization: "한국마케팅협회",
      category: "AI 기반 지역 마케팅 솔루션 부문",
      description: "인공지능을 활용한 혁신적인 지역 마케팅 솔루션으로 업계 표준을 제시한 공로를 인정받았습니다.",
      badge: "🏆"
    },
    {
      year: "2024",
      title: "네이버 비즈니스 인증 파트너",
      organization: "네이버",
      category: "플레이스 마케팅 전문 파트너",
      description: "네이버 플레이스 마케팅 분야에서 우수한 서비스 품질과 고객 만족도를 인정받았습니다.",
      badge: "💎"
    },
    {
      year: "2023",
      title: "스타트업 어워드 최우수상",
      organization: "중소벤처기업부",
      category: "테크 혁신 부문",
      description: "뛰어난 기술력과 시장 혁신성을 바탕으로 스타트업 생태계 발전에 기여한 공로를 인정받았습니다.",
      badge: "🚀"
    },
    {
      year: "2023-2024",
      title: "고객 만족도 1위",
      organization: "한국소프트웨어산업협회",
      category: "지역 마케팅 솔루션 부문 2년 연속",
      description: "고객 중심의 서비스와 지속적인 품질 개선으로 업계 최고 수준의 만족도를 달성했습니다.",
      badge: "⭐"
    }
  ];

  const certifications = [
    { name: "ISO 27001", description: "정보보안 관리시스템" },
    { name: "개인정보보호", description: "개인정보처리시스템 인증" },
    { name: "클라우드 보안", description: "AWS 보안 인증" },
    { name: "품질경영", description: "ISO 9001 품질경영시스템" }
  ];

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              수상 및 인증
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              업계에서 인정받은 우수성과 신뢰할 수 있는 서비스 품질을 증명합니다.
            </p>
          </div>
        </FadeInSection>

        {/* 주요 수상 내역 */}
        <div className={`grid gap-8 mb-20 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
          {awards.map((award, index) => (
            <FadeInSection key={index} delay={index * 0.1}>
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{award.badge}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                        {award.year}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {award.title}
                    </h3>
                    <p className="text-blue-600 font-medium mb-1">
                      {award.organization}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      {award.category}
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      {award.description}
                    </p>
                  </div>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>

        {/* 인증 현황 */}
        <FadeInSection delay={0.6}>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              보유 인증 현황
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {certifications.map((cert, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">
                    {cert.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {cert.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>

        {/* 언론 보도 */}
        <FadeInSection delay={0.8}>
          <div className="mt-20 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              언론 보도
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { outlet: "테크크런치", title: "AI 마케팅의 새로운 패러다임" },
                { outlet: "조선비즈", title: "소상공인을 위한 디지털 혁신" },
                { outlet: "매일경제", title: "지역 마케팅 솔루션의 미래" }
              ].map((article, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="text-lg font-medium text-blue-600 mb-2">
                    {article.outlet}
                  </div>
                  <p className="text-gray-700">
                    {article.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
};

export default CompanyAwards;

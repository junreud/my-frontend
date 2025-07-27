"use client";
import FadeInSection from "../animations/FadeInComponent";

const CompanyHistory = () => {
  const milestones = [
    {
      year: "2021",
      title: "회사 설립",
      description: "네이버 플레이스 마케팅의 필요성을 인식하고 전문 솔루션 개발 시작"
    },
    {
      year: "2022",
      title: "첫 고객사 확보",
      description: "50개 지역 매장과 파트너십을 맺으며 서비스 검증 완료"
    },
    {
      year: "2023",
      title: "AI 자동화 도입",
      description: "인공지능 기반 리뷰 분석 및 자동 응답 시스템 출시"
    },
    {
      year: "2024",
      title: "대폭적인 성장",
      description: "1,000개 이상의 고객사 확보 및 누적 150% 성과 달성"
    },
    {
      year: "2025",
      title: "서비스 고도화",
      description: "고급 분석 대시보드와 통합 마케팅 플랫폼 런칭"
    }
  ];

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              우리의 성장 여정
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              지역 비즈니스의 성공을 위해 끊임없이 발전해온 우리의 이야기입니다.
            </p>
          </div>
        </FadeInSection>

        <div className="relative">
          {/* 타임라인 선 */}
          <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-blue-200"></div>
          
          {milestones.map((milestone, index) => (
            <FadeInSection key={index} delay={index * 0.2}>
              <div className={`relative flex items-center mb-12 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}>
                {/* 타임라인 포인트 */}
                <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-lg z-10"></div>
                
                {/* 콘텐츠 카드 */}
                <div className={`bg-white rounded-xl p-6 shadow-lg ml-12 md:ml-0 ${
                  index % 2 === 0 ? 'md:mr-8 md:ml-auto' : 'md:ml-8 md:mr-auto'
                } md:w-5/12`}>
                  <div className={`text-2xl font-bold text-blue-600 mb-2 ${
                    index % 2 === 0 ? 'md:text-right' : 'md:text-left'
                  }`}>
                    {milestone.year}
                  </div>
                  <h3 className={`text-xl font-bold text-gray-900 mb-3 ${
                    index % 2 === 0 ? 'md:text-right' : 'md:text-left'
                  }`}>
                    {milestone.title}
                  </h3>
                  <p className={`text-gray-600 leading-relaxed ${
                    index % 2 === 0 ? 'md:text-right' : 'md:text-left'
                  }`}>
                    {milestone.description}
                  </p>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyHistory;

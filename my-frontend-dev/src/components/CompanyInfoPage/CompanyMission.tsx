"use client";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const CompanyMission = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const values = [
    {
      icon: "🎯",
      title: "명확한 목표",
      subtitle: "고객 성공이 우리의 성공",
      description: "모든 고객이 자신의 비즈니스 목표를 달성할 수 있도록 최고의 솔루션과 서비스를 제공합니다."
    },
    {
      icon: "🚀",
      title: "지속적 혁신",
      subtitle: "기술로 만드는 새로운 가능성",
      description: "AI와 빅데이터를 활용해 전통적인 마케팅의 한계를 뛰어넘는 혁신적인 솔루션을 개발합니다."
    },
    {
      icon: "🤝",
      title: "신뢰와 파트너십",
      subtitle: "함께 성장하는 동반자",
      description: "단순한 서비스 제공을 넘어 고객의 성장 파트너로서 장기적인 관계를 구축해갑니다."
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            우리의 사명과 비전
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-xl text-gray-600 mb-8">
              &ldquo;모든 지역 비즈니스가 디지털 마케팅의 힘으로 성공할 수 있도록 돕는다&rdquo;
            </p>
            <div className="bg-blue-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">
                Vision 2030
              </h3>
              <p className="text-lg text-blue-800 leading-relaxed">
                2030년까지 대한민국의 모든 소상공인이 AI 기반 마케팅 자동화를 통해 
                공정하고 효과적인 비즈니스 성장 기회를 얻을 수 있는 
                <strong className="font-bold"> 디지털 마케팅 민주화</strong>를 실현하겠습니다.
              </p>
            </div>
          </div>
        </div>

        <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-3'}`}>
          {values.map((value, index) => (
            <div key={index} className="relative group">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 h-full transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-blue-600 font-medium mb-4">
                  {value.subtitle}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
              
              {/* 호버 효과 그라데이션 */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              함께 만들어가는 미래
            </h3>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              우리의 꿈은 혼자서는 이룰 수 없습니다. 
              고객, 파트너, 그리고 우리 팀이 함께 만들어가는 성공 스토리입니다.
            </p>
            <button
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              aria-label="파트너십 문의하기"
            >
              파트너십 문의하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyMission;

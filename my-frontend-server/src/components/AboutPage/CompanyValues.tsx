"use client";
import FadeInSection from "../animations/FadeInComponent";

const CompanyValues = () => {
  const values = [
    {
      icon: "🎯",
      title: "고객 중심",
      description: "모든 결정과 행동은 고객의 성공을 위해 이루어집니다. 고객의 비즈니스 성장이 우리의 최우선 목표입니다."
    },
    {
      icon: "🚀",
      title: "혁신 추구",
      description: "최신 기술과 창의적인 아이디어를 통해 지속적으로 혁신하며, 업계를 선도하는 솔루션을 개발합니다."
    },
    {
      icon: "🤝",
      title: "신뢰와 투명성",
      description: "모든 고객과의 관계에서 신뢰를 바탕으로 하며, 투명하고 정직한 소통을 통해 장기적인 파트너십을 구축합니다."
    },
    {
      icon: "⚡",
      title: "탁월한 실행력",
      description: "빠르고 정확한 실행을 통해 고객의 기대를 뛰어넘는 결과를 제공하며, 약속한 것은 반드시 지킵니다."
    },
    {
      icon: "🌱",
      title: "지속적 학습",
      description: "변화하는 시장과 기술에 맞춰 지속적으로 학습하고 성장하며, 더 나은 서비스를 위해 끊임없이 발전합니다."
    },
    {
      icon: "💡",
      title: "창의적 문제해결",
      description: "고객의 다양한 비즈니스 상황에 맞는 창의적이고 효과적인 솔루션을 제공합니다."
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              우리의 핵심 가치
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              이러한 가치들이 우리가 하는 모든 일의 기준이 되며, 
              고객과 함께 성장하는 원동력이 됩니다.
            </p>
          </div>
        </FadeInSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <FadeInSection key={index} delay={index * 0.1}>
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyValues;

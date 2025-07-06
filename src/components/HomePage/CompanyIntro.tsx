"use client";
import React from "react";
import FadeInSection from "../animations/FadeInComponent";

const CompanyIntro = () => {
  const teamMembers = [
    {
      name: "김태현",
      role: "대표이사 & 기술총괄",
      description: "10년 이상의 마케팅 테크 경험으로 소상공인을 위한 혁신적인 솔루션을 개발",
      image: "/images/team1.jpg",
      expertise: ["마케팅 자동화", "데이터 분석", "AI/ML"]
    },
    {
      name: "박지영",
      role: "마케팅 디렉터",
      description: "네이버 플레이스 마케팅 전문가로 수천 개 업체의 성공을 이끌어낸 경험",
      image: "/images/team2.jpg", 
      expertise: ["플레이스 마케팅", "SEO", "콘텐츠 전략"]
    },
    {
      name: "이준호",
      role: "개발팀장",
      description: "풀스택 개발자로 확장 가능한 마케팅 플랫폼 아키텍처 설계 및 구현",
      image: "/images/team3.jpg",
      expertise: ["백엔드 개발", "클라우드 인프라", "데이터 엔지니어링"]
    }
  ];

  const companyValues = [
    {
      icon: "🎯",
      title: "고객 중심",
      description: "고객의 성공이 곧 우리의 성공입니다. 모든 제품과 서비스는 고객의 실질적인 성과 향상을 목표로 합니다."
    },
    {
      icon: "🚀",
      title: "혁신",
      description: "최신 기술과 창의적인 아이디어로 마케팅의 새로운 가능성을 열어갑니다."
    },
    {
      icon: "🤝",
      title: "파트너십",
      description: "고객과 장기적인 파트너십을 구축하여 함께 성장하는 관계를 지향합니다."
    },
    {
      icon: "📊",
      title: "데이터 기반",
      description: "모든 의사결정과 전략은 정확한 데이터 분석을 바탕으로 합니다."
    }
  ];

  const milestones = [
    {
      year: "2023",
      title: "라카비 서비스 런칭",
      description: "소상공인을 위한 통합 마케팅 플랫폼 정식 출시"
    },
    {
      year: "2023",
      title: "1,000개 업체 돌파", 
      description: "출시 6개월 만에 1,000개 업체 등록 달성"
    },
    {
      year: "2024",
      title: "AI 기능 추가",
      description: "인공지능 기반 키워드 분석 및 추천 시스템 도입"
    },
    {
      year: "2024",
      title: "2,500개 업체 달성",
      description: "누적 2,500개 업체와 함께 성장 중"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* 회사 소개 헤더 */}
        <FadeInSection delay={0.2} once>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              라카비를 <span className="text-blue-600">만드는 사람들</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              소상공인의 성공을 위해 끊임없이 연구하고 개발하는 전문가들이 
              여러분의 비즈니스 성장을 함께 만들어갑니다.
            </p>
          </div>
        </FadeInSection>

        {/* 미션 & 비전 */}
        <FadeInSection delay={0.4} once>
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">우리의 미션</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                모든 소상공인이 디지털 마케팅의 혜택을 누릴 수 있도록 
                쉽고 효과적인 마케팅 솔루션을 제공합니다. 
                복잡한 마케팅을 단순하게, 비싼 마케팅을 합리적으로 만드는 것이 우리의 사명입니다.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">우리의 비전</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                대한민국 모든 소상공인이 라카비와 함께 성장하는 세상을 꿈꿉니다. 
                AI와 빅데이터 기술로 마케팅의 미래를 선도하며, 
                소상공인의 디지털 전환을 이끄는 플랫폼이 되겠습니다.
              </p>
            </div>
          </div>
        </FadeInSection>

        {/* 팀 소개 */}
        <FadeInSection delay={0.6} once>
          <div className="mb-20">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
              전문가 팀
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <FadeInSection key={member.name} delay={0.8 + index * 0.2} once>
                  <div className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white font-bold text-2xl">
                      {member.name.charAt(0)}
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {member.name}
                    </h4>
                    <p className="text-blue-600 font-medium mb-4">
                      {member.role}
                    </p>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {member.description}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {member.expertise.map((skill) => (
                        <span 
                          key={skill}
                          className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </FadeInSection>

        {/* 회사 가치 */}
        <FadeInSection delay={1.0} once>
          <div className="mb-20">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
              우리의 가치
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {companyValues.map((value, index) => (
                <FadeInSection key={value.title} delay={1.2 + index * 0.1} once>
                  <div className="text-center p-6">
                    <div className="text-4xl mb-4">{value.icon}</div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      {value.title}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </FadeInSection>

        {/* 성장 스토리 */}
        <FadeInSection delay={1.4} once>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h3 className="text-3xl font-bold text-center mb-12">
              함께한 성장 스토리
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {milestones.map((milestone) => (
                <div key={milestone.year} className="text-center">
                  <div className="text-3xl font-bold text-yellow-300 mb-2">
                    {milestone.year}
                  </div>
                  <h4 className="text-lg font-semibold mb-3">
                    {milestone.title}
                  </h4>
                  <p className="text-blue-100 text-sm">
                    {milestone.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>

        {/* CTA 섹션 */}
        <FadeInSection delay={1.6} once>
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              라카비와 함께 성장하고 싶으신가요?
            </h3>
            <p className="text-gray-600 mb-8">
              우리는 언제나 열정적인 팀원을 기다리고 있습니다
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <a 
                href="mailto:careers@lacabi.com" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-300"
              >
                채용 문의
              </a>
              <a 
                href="mailto:partnership@lacabi.com" 
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium py-3 px-8 rounded-lg transition-colors duration-300"
              >
                파트너십 문의
              </a>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};

export default CompanyIntro;

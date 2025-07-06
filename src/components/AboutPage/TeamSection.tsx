"use client";
import FadeInSection from "../animations/FadeInComponent";

const TeamSection = () => {
  const team = [
    {
      name: "김준석",
      position: "CEO & Founder",
      description: "10년 이상의 디지털 마케팅 경험을 바탕으로 지역 비즈니스 성장을 위한 혁신적인 솔루션을 개발합니다.",
      image: "👨‍💼",
      expertise: ["전략 기획", "사업 개발", "팀 리더십"]
    },
    {
      name: "이지수",
      position: "CTO",
      description: "AI와 빅데이터 전문가로서 자동화된 마케팅 시스템의 핵심 기술을 책임지고 있습니다.",
      image: "👩‍💻",
      expertise: ["AI/ML", "시스템 설계", "기술 혁신"]
    },
    {
      name: "박민호",
      position: "마케팅 디렉터",
      description: "네이버 플레이스 마케팅 전문가로서 고객 성공을 위한 전략을 수립하고 실행합니다.",
      image: "👨‍🎯",
      expertise: ["플레이스 마케팅", "고객 성공", "데이터 분석"]
    },
    {
      name: "정서연",
      position: "고객지원 팀장",
      description: "고객의 목소리에 귀 기울이며 최상의 서비스 경험을 제공하기 위해 노력합니다.",
      image: "👩‍💼",
      expertise: ["고객 서비스", "교육 지원", "품질 관리"]
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              우리 팀을 소개합니다
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              각 분야의 전문가들이 모여 고객의 성공을 위해 최선을 다하고 있습니다.
            </p>
          </div>
        </FadeInSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <FadeInSection key={index} delay={index * 0.1}>
              <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <div className="text-blue-600 font-medium mb-4">
                  {member.position}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {member.description}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {member.expertise.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>

        <FadeInSection delay={0.5}>
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              함께 성장할 인재를 찾습니다
            </h3>
            <p className="text-gray-600 mb-6">
              혁신적인 마케팅 솔루션으로 세상을 바꾸고 싶은 분들을 환영합니다.
            </p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              채용 정보 보기
            </button>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
};

export default TeamSection;

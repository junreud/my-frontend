"use client";
import FadeInSection from "../animations/FadeInComponent";

const SupportChannels = () => {
  const channels = [
    {
      icon: "💬",
      title: "실시간 채팅",
      description: "가장 빠른 응답을 원하신다면",
      action: "채팅 시작",
      available: "24시간 운영"
    },
    {
      icon: "📧",
      title: "이메일 지원",
      description: "자세한 문의사항이 있으시다면",
      action: "이메일 보내기",
      available: "평균 2시간 내 답변"
    },
    {
      icon: "📞",
      title: "전화 상담",
      description: "직접 통화로 상담받고 싶다면",
      action: "전화 걸기",
      available: "평일 09:00-18:00"
    },
    {
      icon: "📚",
      title: "도움말 센터",
      description: "사용법과 팁을 확인하세요",
      action: "둘러보기",
      available: "언제나 이용 가능"
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              다양한 지원 채널
            </h2>
            <p className="text-lg text-gray-600">
              편하신 방법으로 언제든지 문의해주세요.
            </p>
          </div>
        </FadeInSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {channels.map((channel, index) => (
            <FadeInSection key={index} delay={index * 0.1}>
              <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{channel.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {channel.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {channel.description}
                </p>
                <p className="text-xs text-blue-600 mb-4 font-medium">
                  {channel.available}
                </p>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  {channel.action}
                </button>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportChannels;

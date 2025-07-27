"use client";
import Link from "next/link";
import FadeInSection from "../animations/FadeInComponent";

const FAQ = () => {
  const popularFaqs = [
    {
      question: "서비스를 시작하려면 어떻게 해야 하나요?",
      answer: "회원가입 후 원하는 요금제를 선택하시면 바로 시작할 수 있습니다. Free 플랜으로 먼저 체험해보신 후 업그레이드하시는 것을 추천드립니다."
    },
    {
      question: "효과는 언제부터 나타나나요?",
      answer: "일반적으로 1-2주 후부터 변화를 확인하실 수 있으며, 3개월 후에는 명확한 성과 향상을 경험하실 수 있습니다."
    },
    {
      question: "기술적인 문제가 생기면 어떻게 하나요?",
      answer: "24/7 고객지원을 제공합니다. 채팅, 이메일, 전화로 언제든지 문의하실 수 있으며, 평균 응답 시간은 2시간 이내입니다."
    }
  ];

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection immediate={true}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              인기 질문
            </h2>
            <p className="text-lg text-gray-600">
              가장 자주 묻는 질문들을 확인해보세요.
            </p>
          </div>
        </FadeInSection>

        <div className="space-y-6">
          {popularFaqs.map((faq, index) => (
            <FadeInSection key={index} immediate={true} delay={index * 0.1}>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </FadeInSection>
          ))}
        </div>

        <FadeInSection immediate={true} delay={0.4}>
          <div className="text-center mt-12">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                더 많은 질문과 답변이 필요하신가요?
              </h3>
              <p className="text-gray-600 mb-6">
                상세한 FAQ와 가이드를 확인하거나 직접 문의해보세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/faq"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  전체 FAQ 보기
                </Link>
                <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors inline-flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.436L3 21l1.436-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                  실시간 채팅
                </button>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
};

export default FAQ;

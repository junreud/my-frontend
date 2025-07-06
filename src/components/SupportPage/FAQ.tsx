"use client";
import { useState } from "react";
import FadeInSection from "../animations/FadeInComponent";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "서비스를 시작하려면 어떻게 해야 하나요?",
      answer: "회원가입 후 원하는 요금제를 선택하시면 바로 시작할 수 있습니다. Free 플랜으로 먼저 체험해보신 후 업그레이드하시는 것을 추천드립니다."
    },
    {
      question: "네이버 플레이스 등록이 안 되어 있어도 사용할 수 있나요?",
      answer: "네이버 플레이스 등록은 필수입니다. 등록이 안 되어 있다면 먼저 네이버 플레이스에 매장을 등록해주세요. 등록 방법은 고객지원팀에서 안내해드립니다."
    },
    {
      question: "결제는 어떻게 이루어지나요?",
      answer: "신용카드, 계좌이체, 무통장입금을 지원합니다. 월간 또는 연간 결제가 가능하며, 연간 결제 시 2개월 할인 혜택을 받으실 수 있습니다."
    },
    {
      question: "효과는 언제부터 나타나나요?",
      answer: "일반적으로 1-2주 후부터 변화를 확인하실 수 있으며, 3개월 후에는 명확한 성과 향상을 경험하실 수 있습니다. 업종과 지역에 따라 차이가 있을 수 있습니다."
    },
    {
      question: "여러 매장을 운영하는데 할인이 있나요?",
      answer: "Pro 플랜은 최대 10개, Business 플랜은 무제한 매장 등록이 가능합니다. 대량 등록 시 별도 할인 혜택을 제공하니 영업팀에 문의해주세요."
    },
    {
      question: "서비스 해지는 어떻게 하나요?",
      answer: "언제든지 대시보드에서 구독을 취소하실 수 있습니다. 결제일 하루 전까지 취소하시면 다음 달 요금이 청구되지 않습니다."
    },
    {
      question: "기술적인 문제가 생기면 어떻게 하나요?",
      answer: "24/7 고객지원을 제공합니다. 채팅, 이메일, 전화로 언제든지 문의하실 수 있으며, 평균 응답 시간은 2시간 이내입니다."
    },
    {
      question: "데이터는 얼마나 자주 업데이트되나요?",
      answer: "리뷰와 평점은 실시간으로, 방문자 수와 검색 순위는 일 1회 업데이트됩니다. Pro 플랜 이상에서는 실시간 모니터링이 가능합니다."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              자주 묻는 질문
            </h2>
            <p className="text-lg text-gray-600">
              궁금한 점이 있으시면 먼저 FAQ를 확인해보세요.
            </p>
          </div>
        </FadeInSection>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FadeInSection key={index} delay={index * 0.1}>
              <div className="bg-white rounded-lg shadow-sm">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    <div className={`transform transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}>
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            </FadeInSection>
          ))}
        </div>

        <FadeInSection delay={0.5}>
          <div className="text-center mt-12">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              원하는 답변을 찾지 못하셨나요?
            </h3>
            <p className="text-gray-600 mb-6">
              고객지원팀이 언제든지 도움을 드릴 준비가 되어 있습니다.
            </p>
            <div className="space-x-4">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                실시간 채팅
              </button>
              <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                이메일 문의
              </button>
            </div>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
};

export default FAQ;

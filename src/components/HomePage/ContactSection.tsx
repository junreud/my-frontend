"use client";
import React, { useState } from "react";
import Link from "next/link";
import FadeInSection from "../animations/FadeInComponent";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    business: "",
    phone: "",
    email: "",
    service: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const serviceOptions = [
    "네이버 플레이스 마케팅",
    "블로그 마케팅",
    "통합 마케팅 솔루션", 
    "컨설팅 문의",
    "기타"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 실제 API 호출로 교체 필요
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({
        name: "",
        business: "",
        phone: "",
        email: "",
        service: "",
        message: ""
      });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: "📞",
      title: "전화 상담",
      description: "평일 09:00 - 18:00",
      contact: "1588-0000",
      action: "tel:1588-0000",
      buttonText: "전화하기"
    },
    {
      icon: "✉️",
      title: "이메일 문의",
      description: "24시간 접수 가능",
      contact: "support@lacabi.com", 
      action: "mailto:support@lacabi.com",
      buttonText: "이메일 보내기"
    },
    {
      icon: "💬",
      title: "카카오톡 상담",
      description: "실시간 채팅 상담",
      contact: "@라카비",
      action: "https://pf.kakao.com/_lacabi",
      buttonText: "카톡 상담하기"
    }
  ];

  const faqs = [
    {
      question: "무료 체험은 어떻게 신청하나요?",
      answer: "회원가입 후 바로 14일 무료 체험이 시작됩니다. 신용카드 정보 없이도 모든 기능을 사용해보실 수 있습니다."
    },
    {
      question: "효과는 언제부터 나타나나요?",
      answer: "보통 첫 주부터 키워드 순위 변화를 확인할 수 있고, 첫 달부터 방문자 증가를 체감하실 수 있습니다."
    },
    {
      question: "계약 기간이 있나요?",
      answer: "최소 계약 기간은 없습니다. 월 단위로 이용 가능하며 언제든지 해지하실 수 있습니다."
    },
    {
      question: "여러 업체를 관리할 수 있나요?",
      answer: "네, 요금제에 따라 여러 업체를 등록하여 관리할 수 있습니다. 프로 플랜은 5개, 엔터프라이즈는 무제한입니다."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4">
        {/* 헤더 */}
        <FadeInSection delay={0.2} once>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              <span className="text-blue-600">무료 상담</span> 받아보세요
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              마케팅 전문가가 귀하의 비즈니스에 맞는 최적의 솔루션을 제안해드립니다
            </p>
          </div>
        </FadeInSection>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* 왼쪽 - 연락 방법들 */}
          <div>
            <FadeInSection delay={0.4} once>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">
                편한 방법으로 연락주세요
              </h3>
            </FadeInSection>

            <div className="space-y-6 mb-12">
              {contactMethods.map((method, index) => (
                <FadeInSection key={method.title} delay={0.6 + index * 0.1} once>
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{method.icon}</div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {method.title}
                          </h4>
                          <p className="text-gray-600 text-sm">{method.description}</p>
                          <p className="text-blue-600 font-medium">{method.contact}</p>
                        </div>
                      </div>
                      <a
                        href={method.action}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 text-sm"
                      >
                        {method.buttonText}
                      </a>
                    </div>
                  </div>
                </FadeInSection>
              ))}
            </div>

            {/* 자주 묻는 질문 */}
            <FadeInSection delay={1.0} once>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-6">
                  자주 묻는 질문
                </h4>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <h5 className="font-medium text-gray-900 mb-2">
                        Q. {faq.question}
                      </h5>
                      <p className="text-gray-600 text-sm">
                        A. {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Link href="/faq" className="text-blue-600 hover:text-blue-700 font-medium">
                    더 많은 FAQ 보기 →
                  </Link>
                </div>
              </div>
            </FadeInSection>
          </div>

          {/* 오른쪽 - 문의 폼 */}
          <FadeInSection delay={0.8} once>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                무료 상담 신청
              </h3>
              
              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <p className="text-green-800 font-medium">
                      문의가 성공적으로 접수되었습니다. 24시간 내 연락드리겠습니다.
                    </p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-800 font-medium">
                      문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      성함 *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="홍길동"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      업체명 *
                    </label>
                    <input
                      type="text"
                      name="business"
                      required
                      value={formData.business}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="홍길동 족발"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      연락처 *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="010-1234-5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이메일 *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    관심 서비스 *
                  </label>
                  <select
                    name="service"
                    required
                    value={formData.service}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  >
                    <option value="">서비스를 선택해주세요</option>
                    {serviceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    문의 내용
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                    placeholder="문의하실 내용을 자세히 적어주세요"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      접수 중...
                    </>
                  ) : (
                    "무료 상담 신청하기"
                  )}
                </button>
                
                <p className="text-xs text-gray-500 text-center">
                  개인정보는 상담 목적으로만 사용되며, 상담 완료 후 안전하게 폐기됩니다.
                </p>
              </form>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

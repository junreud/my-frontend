"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "📊",
    title: "무료 현황 분석",
    description: "현재 마케팅 현황을 분석하고 개선점을 찾아드립니다."
  },
  {
    icon: "🎯",
    title: "맞춤형 전략",
    description: "업종과 지역 특성에 맞는 최적의 마케팅 전략을 제안합니다."
  },
  {
    icon: "📈",
    title: "예상 효과 분석",
    description: "투입 예산 대비 예상되는 마케팅 효과를 구체적으로 제시합니다."
  },
  {
    icon: "🔧",
    title: "구현 방안",
    description: "전략을 실제로 구현하는 단계별 실행 계획을 제공합니다."
  }
];

const steps = [
  {
    step: "01",
    title: "정보 입력",
    description: "사업체와 마케팅 목표에 대한 기본 정보를 입력합니다."
  },
  {
    step: "02", 
    title: "분석 & 검토",
    description: "전문가가 입력하신 정보를 바탕으로 시장 분석을 진행합니다."
  },
  {
    step: "03",
    title: "맞춤 견적서",
    description: "24시간 내에 상세한 맞춤형 견적서를 이메일로 발송합니다."
  },
  {
    step: "04",
    title: "무료 상담",
    description: "견적서를 바탕으로 무료 상담을 통해 세부사항을 논의합니다."
  }
];

export default function EstimateProcess() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 견적서에 포함되는 내용 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">견적서에 포함되는 내용</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            단순한 가격 정보가 아닌, 실질적인 마케팅 솔루션을 제공합니다.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* 견적 진행 과정 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">견적 진행 과정</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            간단한 4단계로 맞춤형 마케팅 솔루션을 받아보세요.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center relative"
            >
              {/* 연결선 */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-blue-200 -translate-x-1/2 z-0"></div>
              )}
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

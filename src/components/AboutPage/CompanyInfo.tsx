"use client";
import FadeInSection from "../animations/FadeInComponent";

const CompanyInfo = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              지역 비즈니스의 성장을 위한 
              <span className="text-blue-600"> 마케팅 파트너</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              우리는 네이버 플레이스 마케팅 전문 솔루션을 통해 전국의 소상공인과 중소기업이 
              더 많은 고객에게 도달할 수 있도록 돕고 있습니다.
            </p>
          </div>
        </FadeInSection>

        <FadeInSection delay={0.2}>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                우리의 미션
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                모든 지역 비즈니스가 디지털 마케팅의 혜택을 누릴 수 있도록 하는 것이 우리의 사명입니다. 
                복잡한 마케팅 전략을 자동화하고 간소화하여, 사업주들이 본업에 집중할 수 있는 환경을 만들어갑니다.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">혁신적인 기술</h4>
                    <p className="text-gray-600">AI와 자동화를 통한 효율적인 마케팅 솔루션</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">고객 중심</h4>
                    <p className="text-gray-600">사용자의 성공이 우리의 성공이라는 믿음</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">지속적 성장</h4>
                    <p className="text-gray-600">끊임없는 연구개발과 서비스 개선</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">1,200+</div>
                  <div className="text-sm text-gray-600 mt-1">활성 고객사</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">150%</div>
                  <div className="text-sm text-gray-600 mt-1">평균 방문자 증가율</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">4.8/5</div>
                  <div className="text-sm text-gray-600 mt-1">고객 만족도</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">24/7</div>
                  <div className="text-sm text-gray-600 mt-1">고객 지원</div>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
};

export default CompanyInfo;

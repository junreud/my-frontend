"use client";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import AccessibleButton from "../ui/AccessibleButton";

const CompanyContact = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const offices = [
    {
      name: "본사",
      address: "서울특별시 강남구 테헤란로 123, 타워빌딩 15층",
      phone: "1588-1234",
      email: "contact@company.com",
      hours: "평일 09:00 - 18:00"
    },
    {
      name: "부산 지점",
      address: "부산광역시 해운대구 센텀중앙로 456, 센텀빌딩 8층",
      phone: "051-123-4567",
      email: "busan@company.com",
      hours: "평일 09:00 - 18:00"
    }
  ];

  const departments = [
    {
      name: "영업 문의",
      email: "sales@company.com",
      phone: "1588-1234",
      description: "서비스 도입 및 상담"
    },
    {
      name: "기술 지원",
      email: "support@company.com",
      phone: "1588-2345",
      description: "기술적 문제 해결"
    },
    {
      name: "파트너십",
      email: "partnership@company.com",
      phone: "1588-3456",
      description: "비즈니스 제휴 문의"
    },
    {
      name: "투자 관련",
      email: "ir@company.com",
      phone: "1588-4567",
      description: "투자 및 IR 문의"
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            연락처 및 위치
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            언제든지 편하게 연락주세요. 전문 담당자가 친절하게 안내해드리겠습니다.
          </p>
        </div>

        {/* 오피스 위치 */}
        <div className={`grid gap-8 mb-16 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
          {offices.map((office, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {office.name}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 mt-1">📍</span>
                    <div>
                      <p className="font-medium text-gray-900">주소</p>
                      <p className="text-gray-600">{office.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 mt-1">📞</span>
                    <div>
                      <p className="font-medium text-gray-900">전화</p>
                      <p className="text-gray-600">{office.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 mt-1">📧</span>
                    <div>
                      <p className="font-medium text-gray-900">이메일</p>
                      <p className="text-gray-600">{office.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 mt-1">🕒</span>
                    <div>
                      <p className="font-medium text-gray-900">운영시간</p>
                      <p className="text-gray-600">{office.hours}</p>
                    </div>
                  </div>
                </div>
                
                <AccessibleButton
                  onClick={() => alert('지도 서비스는 준비 중입니다.')}
                  className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  ariaLabel={`${office.name} 길찾기`}
                >
                  길찾기
                </AccessibleButton>
              </div>
          ))}
        </div>

        {/* 부서별 연락처 */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            부서별 연락처
          </h3>
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
            {departments.map((dept, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center">
                <h4 className="font-bold text-gray-900 mb-3">
                  {dept.name}
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">{dept.description}</p>
                  <p className="text-blue-600 font-medium">{dept.phone}</p>
                  <p className="text-gray-600">{dept.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 빠른 연락 */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">
            빠른 상담이 필요하신가요?
          </h3>
          <p className="text-lg opacity-90 mb-6">
            전문 상담사가 고객님의 비즈니스에 최적화된 솔루션을 제안해드립니다.
          </p>
          <div className={`flex gap-4 justify-center ${isMobile ? 'flex-col' : 'sm:flex-row'}`}>
            <AccessibleButton
              onClick={() => window.open('tel:1588-1234')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              ariaLabel="전화 상담 신청"
            >
              📞 전화 상담 신청
            </AccessibleButton>
            <AccessibleButton
              onClick={() => alert('실시간 채팅 기능은 준비 중입니다.')}
              className="bg-white/20 text-white border border-white/30 px-8 py-3 rounded-lg font-medium hover:bg-white/30 transition-colors"
              ariaLabel="실시간 채팅 시작"
            >
              💬 실시간 채팅
            </AccessibleButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyContact;

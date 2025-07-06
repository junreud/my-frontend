"use client";
import { useState, useEffect } from "react";
import FadeInSection from "../animations/FadeInComponent";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const CompanyStats = () => {
  const [stats, setStats] = useState([
    { value: 0, target: 1000, label: "활성 고객사", suffix: "+", icon: "👥" },
    { value: 0, target: 150, label: "평균 성과 향상", suffix: "%", icon: "📈" },
    { value: 0, target: 50, label: "전문 파트너사", suffix: "+", icon: "🤝" },
    { value: 0, target: 99, label: "고객 만족도", suffix: "%", icon: "⭐" }
  ]);

  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('company-stats');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setStats(prevStats => 
        prevStats.map(stat => ({
          ...stat,
          value: stat.value < stat.target 
            ? Math.min(stat.value + Math.ceil(stat.target / 50), stat.target)
            : stat.target
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, [isVisible]);

  const achievements = [
    {
      icon: "🏆",
      title: "대한민국 마케팅 혁신상",
      year: "2024",
      description: "AI 기반 지역 마케팅 솔루션 부문",
      color: "bg-gradient-to-br from-yellow-400 to-orange-500"
    },
    {
      icon: "🚀",
      title: "스타트업 어워드",
      year: "2023",
      description: "테크 혁신 부문 최우수상",
      color: "bg-gradient-to-br from-blue-400 to-purple-500"
    },
    {
      icon: "⭐",
      title: "고객 만족도 1위",
      year: "2023-2024",
      description: "지역 마케팅 솔루션 부문 2년 연속",
      color: "bg-gradient-to-br from-green-400 to-blue-500"
    },
    {
      icon: "💎",
      title: "신뢰할 수 있는 파트너",
      year: "2024",
      description: "네이버 공식 인증 파트너",
      color: "bg-gradient-to-br from-purple-400 to-pink-500"
    }
  ];

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              숫자로 보는 우리의 성과
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              지속적인 혁신과 고객 중심의 서비스로 만들어낸 의미있는 결과들입니다.
            </p>
          </div>
        </FadeInSection>

        {/* 주요 통계 */}
        <FadeInSection delay={0.2}>
          <div className={`grid gap-8 mb-20 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                    {stat.value.toLocaleString()}{stat.suffix}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FadeInSection>

        {/* 성과 및 인증 */}
        <FadeInSection delay={0.4}>
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              인정받은 우수성
            </h3>
            <p className="text-gray-600">
              업계에서 인정받은 혁신성과 고객 만족도를 자랑합니다.
            </p>
          </div>
        </FadeInSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((achievement, index) => (
            <FadeInSection key={index} delay={0.1 * index}>
              <div className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl mb-4">{achievement.icon}</div>
                <h4 className="font-bold text-gray-900 mb-2">
                  {achievement.title}
                </h4>
                <div className="text-blue-600 font-medium mb-2">
                  {achievement.year}
                </div>
                <p className="text-sm text-gray-600">
                  {achievement.description}
                </p>
              </div>
            </FadeInSection>
          ))}
        </div>

        {/* 성장 그래프 영역 */}
        <FadeInSection delay={0.6}>
          <div className="mt-20 bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              지속적인 성장 궤적
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h4 className="font-semibold mb-2">매년 200% 성장</h4>
                <p className="text-sm text-gray-600">고객 수 및 매출 지속 증가</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h4 className="font-semibold mb-2">목표 달성률 98%</h4>
                <p className="text-sm text-gray-600">고객 KPI 목표 달성</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔄</span>
                </div>
                <h4 className="font-semibold mb-2">재계약율 95%</h4>
                <p className="text-sm text-gray-600">높은 고객 충성도</p>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
};

export default CompanyStats;

"use client";
import React from "react";
import Link from "next/link";
import FadeInSection from "../animations/FadeInComponent";

const NewsSection = () => {
  const blogPosts = [
    {
      id: 1,
      title: "2024년 네이버 플레이스 마케팅 트렌드 분석",
      excerpt: "올해 변화한 네이버 플레이스 알고리즘과 효과적인 마케팅 전략을 분석해보았습니다.",
      date: "2024-06-15",
      category: "마케팅 인사이트",
      readTime: "5분",
      image: "/images/blog1.jpg",
      author: "박지영",
      tags: ["네이버플레이스", "SEO", "마케팅트렌드"]
    },
    {
      id: 2,
      title: "소상공인을 위한 블로그 마케팅 완벽 가이드",
      excerpt: "블로그 마케팅으로 매출을 200% 늘린 실제 사례와 실행 방법을 상세히 공개합니다.",
      date: "2024-06-10",
      category: "성공 사례",
      readTime: "8분", 
      image: "/images/blog2.jpg",
      author: "김태현",
      tags: ["블로그마케팅", "성공사례", "ROI"]
    },
    {
      id: 3,
      title: "AI가 바꾸는 소상공인 마케팅의 미래",
      excerpt: "인공지능 기술이 어떻게 마케팅 효율을 극대화하고 비용을 절감하는지 알아보세요.",
      date: "2024-06-05", 
      category: "기술 동향",
      readTime: "6분",
      image: "/images/blog3.jpg",
      author: "이준호",
      tags: ["AI", "자동화", "미래마케팅"]
    }
  ];

  const announcements = [
    {
      id: 1,
      title: "라카비 AI 키워드 분석 기능 출시",
      date: "2024-06-20",
      type: "기능 업데이트",
      important: true
    },
    {
      id: 2,
      title: "여름 프로모션: 첫 3개월 50% 할인",
      date: "2024-06-18",
      type: "프로모션",
      important: true
    },
    {
      id: 3,
      title: "서버 정기 점검 안내 (6/25 02:00-04:00)",
      date: "2024-06-15",
      type: "공지사항",
      important: false
    },
    {
      id: 4,
      title: "신규 업체 등록 프로세스 개선",
      date: "2024-06-12", 
      type: "개선사항",
      important: false
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '마케팅 인사이트':
        return 'bg-blue-100 text-blue-800';
      case '성공 사례':
        return 'bg-green-100 text-green-800';
      case '기술 동향':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAnnouncementColor = (type: string) => {
    switch (type) {
      case '기능 업데이트':
        return 'bg-blue-100 text-blue-800';
      case '프로모션':
        return 'bg-red-100 text-red-800';
      case '공지사항':
        return 'bg-yellow-100 text-yellow-800';
      case '개선사항':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* 헤더 */}
        <FadeInSection delay={0.2} once>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              <span className="text-blue-600">최신 소식</span>과 인사이트
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              마케팅 트렌드와 성공 사례를 통해 더 나은 성과를 만들어보세요
            </p>
          </div>
        </FadeInSection>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 왼쪽 2/3 - 블로그 포스트 */}
          <div className="lg:col-span-2">
            <FadeInSection delay={0.4} once>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900">
                  마케팅 인사이트
                </h3>
                <Link href="/blog" className="text-blue-600 hover:text-blue-700 font-medium">
                  전체 보기 →
                </Link>
              </div>
            </FadeInSection>

            <div className="space-y-8">
              {blogPosts.map((post, index) => (
                <FadeInSection key={post.id} delay={0.6 + index * 0.2} once>
                  <article className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="md:flex">
                      <div className="md:w-1/3">
                        <div className="h-48 md:h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <div className="text-white text-center">
                            <div className="text-4xl mb-2">📊</div>
                            <div className="text-sm font-medium">{post.category}</div>
                          </div>
                        </div>
                      </div>
                      <div className="md:w-2/3 p-6">
                        <div className="flex items-center space-x-4 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                            {post.category}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {formatDate(post.date)}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {post.readTime} 읽기
                          </span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                          <Link href={`/blog/${post.id}`}>
                            {post.title}
                          </Link>
                        </h4>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>by {post.author}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                              <span 
                                key={tag}
                                className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </FadeInSection>
              ))}
            </div>
          </div>

          {/* 오른쪽 1/3 - 공지사항 */}
          <div>
            <FadeInSection delay={0.8} once>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">
                공지사항
              </h3>
            </FadeInSection>

            <div className="space-y-4 mb-8">
              {announcements.map((announcement, index) => (
                <FadeInSection key={announcement.id} delay={1.0 + index * 0.1} once>
                  <div className={`p-4 rounded-lg border-l-4 ${
                    announcement.important 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getAnnouncementColor(announcement.type)}`}>
                        {announcement.type}
                      </span>
                      {announcement.important && (
                        <span className="text-red-600 text-xs font-bold">중요</span>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {announcement.title}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {formatDate(announcement.date)}
                    </p>
                  </div>
                </FadeInSection>
              ))}
            </div>

            {/* 뉴스레터 구독 */}
            <FadeInSection delay={1.4} once>
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                <h4 className="text-xl font-bold mb-4">
                  📧 뉴스레터 구독
                </h4>
                <p className="text-blue-100 mb-4 text-sm">
                  마케팅 인사이트와 성공 사례를 이메일로 받아보세요
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="이메일 주소 입력"
                    className="w-full px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <button className="w-full bg-white text-blue-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors">
                    구독하기
                  </button>
                </div>
                <p className="text-xs text-blue-200 mt-3">
                  주 1회 발송, 언제든 구독 해지 가능
                </p>
              </div>
            </FadeInSection>

            {/* 소셜 미디어 */}
            <FadeInSection delay={1.6} once>
              <div className="mt-8 bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">
                  소셜 미디어
                </h4>
                <div className="space-y-3">
                  <a href="#" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors">
                    <div className="w-8 h-8 bg-blue-600 rounded text-white text-sm font-bold flex items-center justify-center">
                      B
                    </div>
                    <span>네이버 블로그</span>
                  </a>
                  <a href="#" className="flex items-center space-x-3 text-gray-700 hover:text-yellow-600 transition-colors">
                    <div className="w-8 h-8 bg-yellow-400 rounded text-white text-sm font-bold flex items-center justify-center">
                      K
                    </div>
                    <span>카카오톡 채널</span>
                  </a>
                  <a href="#" className="flex items-center space-x-3 text-gray-700 hover:text-green-600 transition-colors">
                    <div className="w-8 h-8 bg-green-500 rounded text-white text-sm font-bold flex items-center justify-center">
                      Y
                    </div>
                    <span>유튜브 채널</span>
                  </a>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>

        {/* 하단 CTA */}
        <FadeInSection delay={1.8} once>
          <div className="mt-16 text-center bg-gray-50 rounded-2xl p-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              더 많은 인사이트가 필요하신가요?
            </h3>
            <p className="text-gray-600 mb-8">
              전문가의 1:1 컨설팅으로 더 깊이 있는 마케팅 전략을 세워보세요
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/estimate">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-300">
                  무료 컨설팅 신청
                </button>
              </Link>
              <Link href="/blog">
                <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium py-3 px-8 rounded-lg transition-colors duration-300">
                  블로그 전체 보기
                </button>
              </Link>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};

export default NewsSection;

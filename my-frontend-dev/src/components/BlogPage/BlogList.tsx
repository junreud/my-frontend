"use client";
import Link from "next/link";
import FadeInSection from "../animations/FadeInComponent";

const BlogList = () => {
  const posts = [
    {
      id: 1,
      title: "2025년 네이버 플레이스 마케팅 트렌드 전망",
      excerpt: "새해를 맞아 네이버 플레이스 마케팅 분야에서 주목해야 할 트렌드들을 정리했습니다. AI 기반 자동화부터 개인화된 고객 경험까지...",
      author: "김준석",
      date: "2025-01-02",
      category: "트렌드",
      readTime: "5분",
      image: "📊"
    },
    {
      id: 2,
      title: "리뷰 평점 4.5점 이상 유지하는 10가지 방법",
      excerpt: "고객 만족도를 높이고 지속적으로 좋은 리뷰를 받을 수 있는 실전 노하우를 공개합니다. 작은 변화가 만드는 큰 차이를 경험해보세요.",
      author: "박민호",
      date: "2024-12-28",
      category: "실전 가이드",
      readTime: "7분",
      image: "⭐"
    },
    {
      id: 3,
      title: "AI가 바꾸는 지역 마케팅의 미래",
      excerpt: "인공지능 기술이 소상공인의 마케팅 방식을 어떻게 혁신하고 있는지 살펴봅니다. 복잡했던 마케팅이 이제는 누구나 쉽게...",
      author: "이지수",
      date: "2024-12-25",
      category: "기술",
      readTime: "6분",
      image: "🤖"
    },
    {
      id: 4,
      title: "소상공인 성공 사례: 방문자 200% 증가 달성기",
      excerpt: "3개월 만에 방문자 수를 2배로 늘린 카페 사장님의 생생한 후기와 성공 비결을 인터뷰로 전해드립니다.",
      author: "정서연",
      date: "2024-12-22",
      category: "성공 사례",
      readTime: "8분",
      image: "🏆"
    },
    {
      id: 5,
      title: "검색 노출 순위 올리는 키워드 전략",
      excerpt: "네이버 검색에서 상위에 노출되기 위한 키워드 선택과 활용 전략을 단계별로 설명합니다. 무료 도구 활용법도 함께 제공합니다.",
      author: "김준석",
      date: "2024-12-20",
      category: "SEO",
      readTime: "9분",
      image: "🔍"
    },
    {
      id: 6,
      title: "경쟁사 분석으로 찾은 마케팅 기회",
      excerpt: "동종업계 경쟁사들의 마케팅 전략을 분석하여 우리만의 차별화 포인트를 찾는 방법을 알아봅니다.",
      author: "박민호",
      date: "2024-12-18",
      category: "분석",
      readTime: "6분",
      image: "📈"
    }
  ];

  return (
    <div>
      <div className="grid gap-8">
        {posts.map((post, index) => (
          <FadeInSection key={post.id} immediate={true} delay={index * 0.1}>
            <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-sm text-gray-500">{post.readTime} 읽기</span>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{post.image}</div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                      <Link href={`/blog/${post.id}`}>
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>by {post.author}</span>
                        <span>{post.date}</span>
                      </div>
                      <Link 
                        href={`/blog/${post.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        더 읽기 →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </FadeInSection>
        ))}
      </div>

      {/* 페이지네이션 */}
      <FadeInSection immediate={true} delay={0.5}>
        <div className="flex justify-center mt-12">
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-gray-500 hover:text-gray-700">이전</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded">1</button>
            <button className="px-4 py-2 text-gray-500 hover:text-gray-700">2</button>
            <button className="px-4 py-2 text-gray-500 hover:text-gray-700">3</button>
            <button className="px-4 py-2 text-gray-500 hover:text-gray-700">다음</button>
          </div>
        </div>
      </FadeInSection>
    </div>
  );
};

export default BlogList;

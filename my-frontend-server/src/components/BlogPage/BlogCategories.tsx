"use client";
import FadeInSection from "../animations/FadeInComponent";

const BlogCategories = () => {
  const categories = [
    { name: "전체", count: 24 },
    { name: "트렌드", count: 6 },
    { name: "실전 가이드", count: 8 },
    { name: "성공 사례", count: 4 },
    { name: "기술", count: 3 },
    { name: "SEO", count: 2 },
    { name: "분석", count: 1 }
  ];

  const recentPosts = [
    "2025년 네이버 플레이스 마케팅 트렌드 전망",
    "리뷰 평점 4.5점 이상 유지하는 10가지 방법",
    "AI가 바꾸는 지역 마케팅의 미래"
  ];

  return (
    <div className="space-y-8">
      {/* 카테고리 */}
      <FadeInSection immediate={true}>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">카테고리</h3>
          <ul className="space-y-2">
            {categories.map((category, index) => (
              <li key={index}>
                <button className="w-full text-left flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-gray-700">{category.name}</span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </FadeInSection>

      {/* 최신 글 */}
      <FadeInSection immediate={true} delay={0.1}>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">최신 글</h3>
          <ul className="space-y-3">
            {recentPosts.map((post, index) => (
              <li key={index}>
                <button className="text-left text-gray-700 hover:text-blue-600 transition-colors line-clamp-2">
                  {post}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </FadeInSection>

      {/* 태그 */}
      <FadeInSection immediate={true} delay={0.2}>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">인기 태그</h3>
          <div className="flex flex-wrap gap-2">
            {["네이버플레이스", "마케팅", "소상공인", "리뷰관리", "SEO", "분석", "자동화", "AI"].map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-blue-100 hover:text-blue-700 cursor-pointer transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </FadeInSection>

      {/* 뉴스레터 구독 */}
      <FadeInSection immediate={true} delay={0.3}>
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">뉴스레터 구독</h3>
          <p className="text-sm text-gray-600 mb-4">
            최신 마케팅 팁과 트렌드를 이메일로 받아보세요.
          </p>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="이메일 주소 입력"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              구독하기
            </button>
          </div>
        </div>
      </FadeInSection>
    </div>
  );
};

export default BlogCategories;

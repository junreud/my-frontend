"use client";
import FadeInSection from "../animations/FadeInComponent";

const BlogHero = () => {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeInSection>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            마케팅 인사이트 블로그
          </h1>
          <p className="text-xl opacity-90 mb-8">
            네이버 플레이스 마케팅의 최신 트렌드와 실전 노하우를 공유합니다.
          </p>
        </FadeInSection>
      </div>
    </div>
  );
};

export default BlogHero;

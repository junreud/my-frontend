import HomepageHero from "../components/HomePage/HomepageHero";
import { Container } from "@/components/common/Container";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Metadata } from "next";
import "./globals.css"
import dynamic from "next/dynamic";

// 동적 import로 코드 스플리팅
const Homepage = dynamic(() => import("@/components/HomePage/Homepage"), {
  loading: () => <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
});
const CustomerTestimonials = dynamic(() => import("@/components/HomePage/CustomerTestimonials"));
const CompanyIntro = dynamic(() => import("@/components/HomePage/CompanyIntro"));
const ServiceAdvantages = dynamic(() => import("@/components/HomePage/ServiceAdvantages"));
const ContactSection = dynamic(() => import("@/components/HomePage/ContactSection"));
const NewsSection = dynamic(() => import("@/components/HomePage/NewsSection"));

export const metadata: Metadata = {
  title: "라카비 - 네이버 플레이스 키워드 순위 관리 솔루션",
  description: "네이버 플레이스 키워드 순위 추적, 리뷰 관리, 블로그 마케팅을 한 번에! 라카비로 지역 비즈니스 마케팅을 성공시키세요.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
  openGraph: {
    title: "라카비 - 네이버 플레이스 키워드 순위 관리 솔루션",
    description: "네이버 플레이스 키워드 순위 추적, 리뷰 관리, 블로그 마케팅을 한 번에! 라카비로 지역 비즈니스 마케팅을 성공시키세요.",
    url: "https://lakabe.com",
    siteName: "라카비",
    images: [
      {
        url: "https://lakabe.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "라카비 - 네이버 플레이스 키워드 순위 관리 솔루션",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "라카비 - 네이버 플레이스 키워드 순위 관리 솔루션",
    description: "네이버 플레이스 키워드 순위 추적, 리뷰 관리, 블로그 마케팅을 한 번에! 라카비로 지역 비즈니스 마케팅을 성공시키세요.",
    images: ["https://lakabe.com/og-image.jpg"],
  },
  alternates: {
    canonical: "https://lakabe.com",
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: '라카비',
            alternateName: 'Lakabe',
            url: 'https://lakabe.com',
            description: '네이버 플레이스 키워드 순위 추적, 리뷰 관리, 블로그 마케팅을 한 번에! 라카비로 지역 비즈니스 마케팅을 성공시키세요.',
            publisher: {
              '@type': 'Organization',
              name: '라카비',
              url: 'https://lakabe.com',
              logo: {
                '@type': 'ImageObject',
                url: 'https://lakabe.com/logo.png'
              }
            },
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://lakabe.com/search?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
            mainEntity: {
              '@type': 'SoftwareApplication',
              name: '라카비',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web Browser',
              offers: {
                '@type': 'Offer',
                category: '마케팅 솔루션'
              },
              featureList: [
                '네이버 플레이스 키워드 순위 추적',
                '리뷰 관리',
                '블로그 마케팅',
                'SEO 최적화'
              ]
            }
          }),
        }}
      />
      {/* 모바일 최적화: sticky navigation */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <Container>
          <Navbar />
        </Container>
      </div>
      
      {/* Hero section - 모바일에서 높이 조정 */}
      <div className="min-h-[50vh] md:min-h-[80vh]">
        <HomepageHero />
      </div>
      
      {/* Main content with mobile spacing */}
      <div className="space-y-8 md:space-y-16">
        <Container>
          <div className="py-8 md:py-16">
            <Homepage />
          </div>
        </Container>
        
        <ServiceAdvantages />
        <CustomerTestimonials />
        <CompanyIntro />
        <NewsSection />
        <ContactSection />
      </div>
      
      <Footer />
    </>
  );
}
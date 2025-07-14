import HomepageHero from "../components/HomePage/HomepageHero";
import { Container } from "@/components/common/Container";
import Homepage from "@/components/HomePage/Homepage";
import CustomerTestimonials from "@/components/HomePage/CustomerTestimonials";
import CompanyIntro from "@/components/HomePage/CompanyIntro";
import ServiceAdvantages from "@/components/HomePage/ServiceAdvantages";
import ContactSection from "@/components/HomePage/ContactSection";
import NewsSection from "@/components/HomePage/NewsSection";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Metadata } from "next";
import "./globals.css"

export const metadata: Metadata = {
  title: "라카비 - 네이버 플레이스 키워드 순위 관리 솔루션",
  description: "네이버 플레이스 키워드 순위 추적, 리뷰 관리, 블로그 마케팅을 한 번에! 라카비로 지역 비즈니스 마케팅을 성공시키세요.",
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
      <Container>
        <Navbar />
      </Container>
      <HomepageHero />
      <Container>
        <Homepage />
      </Container>
      <ServiceAdvantages />
      <CustomerTestimonials />
      <CompanyIntro />
      <NewsSection />
      <ContactSection />
      <Footer />
    </>
  );
}
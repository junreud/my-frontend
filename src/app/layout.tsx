import "./globals.css";
import { ReactNode } from "react";
import { ReactQueryProvider } from "@/lib/reactQueryProvider";
import PageTransition from "@/components/animations/PageTransition";
import RouteProgressBar from "@/components/animations/RouteProgressBar";
import { AnalyticsProvider } from "@/components/Analytics/AnalyticsProvider";
import { Metadata, Viewport } from 'next';
// import CustomCursor from "@/components/animations/CustomCursor";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "라카비 - 네이버 플레이스 키워드 순위 관리 솔루션",
    template: "%s | 라카비"
  },
  description: "네이버 플레이스 키워드 순위 추적, 리뷰 관리, 블로그 마케팅을 한 번에! 라카비로 지역 비즈니스 마케팅을 성공시키세요.",
  keywords: ["네이버 플레이스", "키워드 순위", "지역 마케팅", "블로그 마케팅", "리뷰 관리", "라카비"],
  authors: [{ name: "라카비" }],
  creator: "라카비",
  publisher: "라카비",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "YOUR_GOOGLE_VERIFICATION_CODE",
    other: {
      "naver-site-verification": "YOUR_NAVER_VERIFICATION_CODE",
    },
  },
  alternates: {
    canonical: "https://lakabe.com",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://lakabe.com",
    siteName: "라카비",
    title: "라카비 - 네이버 플레이스 키워드 순위 관리 솔루션",
    description: "네이버 플레이스 키워드 순위 추적, 리뷰 관리, 블로그 마케팅을 한 번에! 라카비로 지역 비즈니스 마케팅을 성공시키세요.",
    images: [
      {
        url: "https://lakabe.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "라카비 - 네이버 플레이스 키워드 순위 관리 솔루션",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "라카비 - 네이버 플레이스 키워드 순위 관리 솔루션",
    description: "네이버 플레이스 키워드 순위 추적, 리뷰 관리, 블로그 마케팅을 한 번에! 라카비로 지역 비즈니스 마케팅을 성공시키세요.",
    images: ["https://lakabe.com/og-image.jpg"],
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
};

export default function RootLayout({ 
  children,
}: { 
  children: ReactNode; 
}) {
  return (
    <html lang="ko">
      <head>
        {/* JSON-LD 구조화된 데이터 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "라카비",
              "url": "https://lakabe.com",
              "logo": "https://lakabe.com/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+82-70-1234-5678",
                "contactType": "customer service",
                "areaServed": "KR",
                "availableLanguage": "Korean"
              }
            })
          }}
        />
      </head>
      <body>
        {/* <CustomCursor /> */}
        <AnalyticsProvider>
          <ReactQueryProvider>
            <RouteProgressBar />
            <PageTransition>
              <main>{children}</main>
            </PageTransition>
          </ReactQueryProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.BASE_URL, // API base URL for fetchServerAPI
    BASE_URL: process.env.BASE_URL,
    PRODUCTION_BASE_URL: process.env.PRODUCTION_BASE_URL,
  },
  images: {
    domains: ['lakabe.com', 'www.lakabe.com'], // 외부 도메인이 있다면 여기 추가
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1년
  },
  // 성능 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // 압축 활성화
  compress: true,
  // 정적 파일 최적화
  trailingSlash: false,
  // 실험적 기능
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  // 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/(.*).(ico|png|jpg|jpeg|gif|svg|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // 리다이렉트 설정
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;


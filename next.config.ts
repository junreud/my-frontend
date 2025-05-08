import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.BASE_URL, // API base URL for fetchServerAPI
    BASE_URL: process.env.BASE_URL,
    PRODUCTION_BASE_URL: process.env.PRODUCTION_BASE_URL,
  },
  images: {
    domains: [], // 외부 도메인이 있다면 여기 추가
  },
};

export default nextConfig;


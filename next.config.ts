import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    BASE_URL: process.env.BASE_URL,
    PRODUCTION_BASE_URL: process.env.PRODUCTION_BASE_URL,
  },
  images: {
    domains: [], // 외부 도메인이 있다면 여기 추가
  },
};

export default nextConfig;


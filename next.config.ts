import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    BASE_URL: process.env.BASE_URL,
    PRODUCTION_BASE_URL: process.env.PRODUCTION_BASE_URL,
  },
};

export default nextConfig;


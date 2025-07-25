// lib/getPlatformLogo.ts

// (A) 플랫폼별 이미지 경로 딕셔너리
const PLATFORM_LOGOS: Record<string, string> = {
    naver: "/images/platform/naver24.svg",
    instagram: "/images/platform/instagram24.svg",
    facebook: "/images/platform/facebook24.svg",
    kakao: "/images/platform/kakao96.svg",
    google: "/images/platform/google96.svg",
    "": "/images/platform/naver24.svg", // fallback for "전체"
    // ...
  }
  
  // (B) 함수: 없는 플랫폼이면 fallback
  export function getPlatformLogo(platform: string): string {
    if (platform in PLATFORM_LOGOS) {
      return PLATFORM_LOGOS[platform]
    }
    return "/images/platform/naver24.svg"
  }

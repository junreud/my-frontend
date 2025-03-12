// lib/getPlatformLogo.ts

// (A) 플랫폼별 이미지 경로 딕셔너리
const PLATFORM_LOGOS: Record<string, string> = {
    naver: "/images/platforms/naver24.svg",
    kakao: "/images/platforms/kakao96.svg",
    google: "/images/platforms/google96.svg",
    // ...
  }
  
  // (B) 함수: 없는 플랫폼이면 fallback
  export function getPlatformLogo(platform: string): string {
    if (platform in PLATFORM_LOGOS) {
      return PLATFORM_LOGOS[platform]
    }
    return "/images/platforms/default.png"
  }
  
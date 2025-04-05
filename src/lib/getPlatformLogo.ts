// lib/getPlatformLogo.ts

// (A) 플랫폼별 이미지 경로 딕셔너리
// const PLATFORM_LOGOS: Record<string, string> = {
//   naver: "/images/platform/naver24.svg",
//   kakao: "/images/platform/kakao96.svg",
//   google: "/images/platform/google96.svg",
//   // ...
// }

// (B) 함수: 항상 네이버 로고 반환하도록 수정
// 항상 네이버 로고만 반환하도록 수정된 간단한 함수
export function getPlatformLogo(): string {
  return "/images/platform/naver24.svg";
}
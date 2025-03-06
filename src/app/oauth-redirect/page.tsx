// /app/oauth-redirect/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OAuthRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromQuery = params.get("accessToken");

    if (tokenFromQuery) {
      localStorage.setItem("accessToken", tokenFromQuery);
    }
    // 끝나면 /dashboard 이동
    router.replace("/dashboard");
  }, [router]);

   // (2) 로딩 스피너 표시
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        {/* Tailwind 예시: 회전 애니메이션으로 로딩 원 만들기 */}
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-solid border-gray-300 border-t-transparent"></div>
      </div>
    );
  }

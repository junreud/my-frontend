"use client";

import React, { useState } from "react";
// Next.js 13 App Router에서 쿼리 파라미터를 읽으려면
// 'next/navigation'의 useSearchParams를 사용
import { useSearchParams } from "next/navigation";
import RecaptchaBox from "@/components/LogInPage/RecaptchaBox";
import LogInNavbar from "@/components/LogInPage/LogInHeader";

// TODO: Captcha 비밀키 토큰검증 API라우터 구현 필요
// TODO: 전화번호 전용 비밀번호 재설정 페이지 구현 필요

export default function PasswordResetPage() {
  // 쿼리 파라미터 가져오기
  const searchParams = useSearchParams();
  const queryEmail = searchParams.get("email") || "";

  // reCAPTCHA 토큰 저장 상태
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // URL 쿼리에서 넘어온 이메일을 기본값으로 세팅
  const [email, setEmail] = useState(queryEmail);

  // reCAPTCHA 완료 시 콜백
  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  // 폼 제출 시 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaToken) {
      alert("로봇이 아님을 확인해주세요.");
      return;
    }

    // 1) recaptcha 토큰 검증을 위한 API 호출
    const res = await fetch("/api/verify-recaptcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: captchaToken }),
    });

    const result = await res.json();
    if (!result.success) {
      alert("reCAPTCHA 검증에 실패했습니다.");
      return;
    }

    // 2) reCAPTCHA 검증 통과 후 비밀번호 재설정 이메일 전송 로직(실제 구현 필요)
    alert("비밀번호 재설정 링크를 전송했습니다(실제 구현 필요).");
  };

  return (
    <>
      <LogInNavbar />
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        {/* 카드(컨테이너) */}
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-md shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-2 text-center">
            비밀번호를 변경하세요.
          </h2>
          <p className="text-sm text-gray-600 mb-4 text-center">
            Enter your user account&apos;s verified email address and we will send you a password reset link.
          </p>

          {/* 이메일 입력 폼 */}
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일을 입력해주세요.
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mb-4 border border-gray-300 
                        rounded-md focus:outline-none focus:ring 
                        focus:ring-blue-200 text-sm"
              placeholder="you@example.com"
              required
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">
              계정 인증하기
            </label>
            {/* 별도 컴포넌트로 분리한 reCAPTCHA 영역 */}
            <RecaptchaBox
              sitekey="6LfhhtsqAAAAADqObtYf5hde6yIIGGHYX8Lga_ht" // 클라이언트용 사이트 키
              onChange={handleCaptchaChange}
            />

            {/* 비밀번호 재설정 이메일 전송 버튼 */}
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 
                        text-white font-medium py-2 px-4 rounded-md text-sm"
            >
              Send password reset email
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

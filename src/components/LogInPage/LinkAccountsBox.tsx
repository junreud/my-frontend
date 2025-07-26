"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL } from '@/lib/config';

interface LinkAccountLoginBoxProps {
  defaultEmail: string; // 쿼리 파라미터 등으로 받은 이메일
  onSuccess?: () => void; // 인증/연동 성공 시 수행할 콜백 (선택)
}

const LinkAccountLoginBox: React.FC<LinkAccountLoginBoxProps> = ({
  defaultEmail,
  onSuccess,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // (A) URL 쿼리에서 provider / providerId 받기 (ex: "kakao", "google")
  const provider = searchParams.get("provider") || "kakao";
  const providerId = searchParams.get("providerId") || "";

  // (B) 상태: 이메일은 readOnly, 비번은 사용자가 입력
  const [email] = useState(defaultEmail);
  const [password, setPassword] = useState("");

  /**
   * (C) "연동 로그인" 버튼 클릭 -> 한 번에:
   *   1) /auth/checkEmailAndPassword 로 비번 검증
   *   2) 성공 시 /auth/link-accounts 로 provider, providerId 업데이트
   *   3) 끝나면 대시보드 이동(혹은 onSuccess())
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // form submit 시 새로고침 방지
  
    try {
      // 1) 비밀번호 인증
      const res = await fetch(`${API_BASE_URL}/auth/checkEmailAndPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const errData = await res.json();
        alert("비번 인증 실패: " + errData.message);
        return;
      }
  
      alert("비번 인증 성공! 계정 연동 진행...");
  
      // 2) 소셜 계정 연동 -> /auth/link-accounts (토큰 발급)
      const linkRes = await fetch(`${API_BASE_URL}/auth/link-accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          provider,
          providerId,
        }),
      });
  
      if (!linkRes.ok) {
        const linkErr = await linkRes.json();
        alert("연동 실패: " + linkErr.message);
        return;
      }
  
      // 링크 성공 → 백엔드가 { message, accessToken } 반환
      const data = await linkRes.json();
      console.log("linkRes data =>", data); // { message, accessToken: ??? }

      alert("연동 완료! " + data.message);
  
      // 3) localStorage에 accessToken 저장
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        console.log("Access token stored in localStorage:", data.accessToken);
      } else {
        console.warn("No accessToken in response data");
      }
  
      // 4) onSuccess 콜백 or /dashboard 이동
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("서버 오류");
    }
  };
  

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-24">
      <div className="w-full max-w-[280px] mx-auto p-4">
        <h1 className="text-xl font-semibold mb-8 text-center">계정 연동 로그인</h1>

        <form onSubmit={handleSubmit}>
          {/* (1) 이메일: readOnly */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              이메일 주소
            </label>
            <input
              type="text"
              className="w-full px-2 py-1 border border-gray-300
                         rounded-md focus:outline-none focus:ring
                         focus:ring-blue-200 text-sm bg-gray-100"
              value={email}
              readOnly
            />
          </div>

          {/* (2) 비밀번호 입력 */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-gray-700">
                비밀번호
              </label>
              <a
                href={`/password_reset?email=${encodeURIComponent(email)}`}
                className="text-xs text-blue-600 hover:underline"
              >
                비밀번호를 잊으셨나요?
              </a>
            </div>
            <input
              type="password"
              placeholder="비밀번호 입력"
              className="w-full px-2 py-1 border border-gray-300
                         rounded-md focus:outline-none focus:ring
                         focus:ring-blue-200 text-sm mt-1 bg-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* (3) "로그인" 버튼 -> handleSubmit */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700
                       text-white font-medium py-1 px-3 rounded-md text-sm"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
};

export default LinkAccountLoginBox;

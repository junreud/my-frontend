// app/components/LogInPage/LinkAccountsBox.tsx
"use client"; // 여기서는 클라이언트 사이드 로직(이벤트 처리, Hooks)을 사용

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface LinkAccountLoginBoxProps {
  defaultEmail: string; // 읽어올 이메일
  onSuccess?: () => void; // 성공 시 실행할 함수 (선택)
}

const LinkAccountLoginBox: React.FC<LinkAccountLoginBoxProps> = ({
  defaultEmail,
  onSuccess
}) => {
  const router = useRouter();

  // 클라이언트 사이드 상태 관리
  const [email] = useState(defaultEmail); // readOnly
  const [password, setPassword] = useState("");

  // "로그인" 이벤트 핸들러 (fetch 예시)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert("로그인 실패: " + (errorData.message || "알 수 없는 오류"));
        return;
      }

      const data = await res.json();
      alert("로그인 성공: " + data.message);

      // 연동 로직 이후 동작
      if (onSuccess) {
        onSuccess();
      } else {
        // 예: 대시보드로 이동
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
      alert("서버 오류");
    }
  };

  return (
    <div className="mt-20 md:mt-36 bg-white flex flex-col items-center justify-center">
      <div className="w-full max-w-[280px] border border-gray-200 rounded-md p-4 shadow-sm">
        <h1 className="text-ml font-semibold mb-2 text-center">계정 연동 로그인</h1>

        <form onSubmit={handleSubmit}>
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

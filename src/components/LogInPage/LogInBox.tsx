//components/LogInPage/LogInBox.tsx
"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Next.js의 라우터 훅
import Link from "next/link"; // Next.js의 라우팅을 위해 next/link 사용
import Image from "next/image"; // Next.js의 이미지 컴포넌트

const LogInBox: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert("로그인 실패 : " + errorData.message || "알 수 없는 오류");
        return;
      }

      const data = await res.json();

      alert("로그인 성공 : " + data.email);

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("서버오류");
    }
  };
  
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:4000/auth/google";
  };
    
  const handleKakaoLogin = () => {
    window.location.href = "http://localhost:4000/auth/kakao";
  };

  return (
    // 모바일에서는 mt-20, 데스크톱 이상에서는 mt-36
    <div className="mt-20 md:mt-36 bg-white flex flex-col items-center justify-center">
      {/* 로그인 박스(카드) */}
      <div className="w-full max-w-[280px] border border-gray-200 rounded-md p-4 shadow-sm">
        {/* 상단 타이틀(또는 로고) */}
        <h1 className="text-ml font-semibold mb-2 text-center">
          로그인하기
        </h1>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              이메일 주소
            </label>
            <input
              type="text"
              placeholder="이메일"
              className="w-full px-2 py-1 border border-gray-300
                         rounded-md focus:outline-none focus:ring
                         focus:ring-blue-200 text-sm bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-gray-700">
                비밀번호
              </label>
              <a
                href="/password_reset"
                className="text-xs text-blue-600 hover:underline"
              >
                비밀번호를 잊으셨나요?
              </a>
            </div>
            <input
              type="password"
              placeholder="Password"
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

        {/* 구분선 */}
        <div className="my-4 flex items-center">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-400 text-xs">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* 소셜 로그인 버튼들 */}
        <div className="space-y-2">
          {/* 구글 로그인 버튼 */}
          <button
            className="relative w-full h-7 border border-gray-300 
                       rounded-md hover:bg-gray-50"
            onClick={handleGoogleLogin}
          >
            {/* 아이콘 위치 고정 */}
            <Image
              width={16}
              height={16}
              src="/icons/google96.svg"
              alt="Google 로고"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            />
            {/* 텍스트 중앙 배치 */}
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-medium">
              Google로 시작하기
            </span>
          </button>



          {/* 카카오 로그인 버튼 */}
          <button
            className="relative w-full h-7 rounded-md
                       hover:opacity-90 bg-[#FEE500] text-black"
            onClick={handleKakaoLogin}
          >
            <Image
              width={16}
              height={16}
              src="/icons/kakao-logo.png"
              alt="Kakao 로고"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-medium">
              카카오로 시작하기
            </span>
          </button>
        </div>

        {/* 회원가입 안내 */}
        <p className="text-center text-xs text-gray-500 mt-4">
          처음이신가요?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            계정 만들기
          </Link>
        </p>
        
      </div>
    </div>
  );
};

export default LogInBox;

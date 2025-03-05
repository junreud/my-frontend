"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type LogInBoxProps = {
  // (1) 부모에서 넘겨줄 콜백: (email, password)를 받아 Promise<void>를 반환하는 함수
  onLogin: (email: string, password: string) => Promise<void>;
};

const LogInBox: React.FC<LogInBoxProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // (2) 폼 제출 시 onLogin 콜백을 호출만 한다.
  //     실제 fetch 요청, localStorage 저장은 모두 부모 콜백이 담당
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onLogin(email, password);
    } catch (error) {
      console.error("로그인 에러:", error);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:4000/auth/google";
  };
  const handleKakaoLogin = () => {
    window.location.href = "http://localhost:4000/auth/kakao";
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[280px] border border-gray-200 rounded-md p-4 shadow-sm">
        <h1 className="text-ml font-semibold mb-2 text-center">로그인하기</h1>

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
              <Link
                href="/password_reset"
                className="text-xs text-blue-600 hover:underline"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>
            <input
              type="password"
              placeholder="비밀번호"
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

        <div className="my-4 flex items-center">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-400 text-xs">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <div className="space-y-2">
          <button
            className="relative w-full h-7 border border-gray-300 
                       rounded-md hover:bg-gray-50"
            onClick={handleGoogleLogin}
          >
            <Image
              width={16}
              height={16}
              src="/icons/google96.svg"
              alt="Google 로고"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            />
            <span
              className="absolute left-1/2 top-1/2 
                         -translate-x-1/2 -translate-y-1/2 
                         text-sm font-medium"
            >
              Google로 시작하기
            </span>
          </button>

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
            <span
              className="absolute left-1/2 top-1/2 
                         -translate-x-1/2 -translate-y-1/2 
                         text-sm font-medium"
            >
              카카오로 시작하기
            </span>
          </button>
        </div>

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

"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// ───────────────────────────────────────────────────
// shadcn/ui 컴포넌트 import
// ───────────────────────────────────────────────────
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type LogInBoxProps = {
  onLogin: (email: string, password: string) => Promise<void>;
};

const LogInBox: React.FC<LogInBoxProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 각 인풋의 포커스 상태
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);

  // 로그인 시도
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onLogin(email, password);
    } catch (error) {
      console.error("로그인 에러:", error);
    }
  };

  // 소셜 로그인
  const handleGoogleLogin = () => {
    window.location.href = "https://localhost:4000/auth/google";
  };
  const handleKakaoLogin = () => {
    window.location.href = "https://localhost:4000/auth/kakao";
  };

  // blur 시, 값이 없으면 라벨 내리기
  const handleBlurEmail = () => {
    if (!email) {
      setIsFocusedEmail(false);
    }
  };
  const handleBlurPassword = () => {
    if (!password) {
      setIsFocusedPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-start justify-center pt-12 mt-24">
      <div className="w-full max-w-[280px] p-4">
        <h1 className="text-xl font-semibold mb-2 text-center mb-8">로그인하기</h1>

        <form onSubmit={handleSubmit}>
          {/* =============================
              이메일 입력 (플로팅 라벨)
             ============================= */}
          <div className="mb-4 relative">
            <AnimatePresence>
              {(isFocusedEmail || email) && (
                <motion.label
                  key="emailLabel"
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 16, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-3 -top-2 text-xs text-gray-600 pointer-events-none"
                  style={{ zIndex: 1 }}
                >
                  <span className="bg-white inline-block leading-none">
                    이메일 주소
                  </span>
                </motion.label>
              )}
            </AnimatePresence>

            {/* (1) shadcn/ui - Input 컴포넌트 */}
            <motion.div layout>
              <Input
                type="text"
                placeholder={isFocusedEmail || email ? "" : "이메일 주소"}
                className="w-full px-3 py-3 text-sm bg-white 
                           border border-gray-300 rounded-md 
                           focus:outline-none focus:ring focus:ring-blue-200"
                value={email}
                onFocus={() => setIsFocusedEmail(true)}
                onBlur={handleBlurEmail}
                onChange={(e) => setEmail(e.target.value)}
              />
            </motion.div>
          </div>

          {/* =============================
              비밀번호 입력 (플로팅 라벨)
             ============================= */}
          <div className="mb-6 relative">
            {/* 상단의 "비밀번호를 잊으셨나요?" 링크 */}
            <div className="flex items-center justify-between mb-1">
              <Link
                href="/password_reset"
                className="text-xs text-blue-600 hover:underline ml-auto"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>

            <AnimatePresence>
              {(isFocusedPassword || password) && (
                <motion.label
                  key="passwordLabel"
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 16, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-3 top-3 text-xs text-gray-600 pointer-events-none"
                  style={{ zIndex: 1 }}
                >
                  <span className="bg-white inline-block leading-none">
                    비밀번호
                  </span>
                </motion.label>
              )}
            </AnimatePresence>

            {/* (2) shadcn/ui - Input 컴포넌트 */}
            <motion.div layout>
              <Input
                type="password"
                placeholder={isFocusedPassword || password ? "" : "비밀번호"}
                className="w-full px-3 py-3 text-sm bg-white 
                           border border-gray-300 rounded-md 
                           focus:outline-none focus:ring focus:ring-blue-200"
                value={password}
                onFocus={() => setIsFocusedPassword(true)}
                onBlur={handleBlurPassword}
                onChange={(e) => setPassword(e.target.value)}
              />
            </motion.div>
          </div>

          {/* =============================
              로그인 버튼
             ============================= */}
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white 
                       font-medium py-2 px-3 rounded-md text-sm"
          >
            로그인
          </Button>
        </form>

        <div className="my-4 flex items-center">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-400 text-xs">또는</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* =============================
            소셜 로그인 버튼들
           ============================= */}
        <div className="space-y-2">
          {/* (1) Google 로그인 버튼 */}
          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            className="relative w-full h-7 
                       border-gray-300 
                       rounded-md hover:bg-gray-100 
                       flex items-center justify-center
                       text-sm font-medium"
          >
            <Image
              width={16}
              height={16}
              src="/images/platform/google96.svg"
              alt="Google 로고"
              className="absolute left-3 h-4 w-4"
            />
            Google로 시작하기
          </Button>

          {/* (2) Kakao 로그인 버튼 */}
          <Button
            variant="outline"
            onClick={handleKakaoLogin}
            className="relative w-full h-7 
                       rounded-md hover:bg-[#e0b000] 
                       bg-[#FEE500] text-black 
                       border-none
                       flex items-center justify-center
                       text-sm font-medium"
          >
            <Image
              width={16}
              height={16}
              src="/icons/kakao-logo.png"
              alt="Kakao 로고"
              className="absolute left-3 h-4 w-4"
            />
            카카오로 시작하기
          </Button>
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

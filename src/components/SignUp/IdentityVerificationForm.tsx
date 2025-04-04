"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { checkEmailAvailability as apiCheckEmailAvailability } from "@/services/api";

// API 기본 URL 환경 변수에서 가져오기
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:4000';

export default function IdentityVerificationForm() {
  // -------------------------------------------------
  // [A] 이메일 관련 상태
  // -------------------------------------------------
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);

  const emailInputClass = () => {
    if (email && isEmailValid && !emailError) {
      return "border-green-500 focus:ring-green-200";
    }
    if (emailError) {
      return "border-red-500 focus:ring-red-200";
    }
    return "border-gray-300 focus:ring-blue-200";
  };

  const validateEmail = async (value: string) => {
    setEmail(value);
    setEmailError("");
    setIsEmailValid(false);

    // (1) 이메일 형식 체크
    const regex = /\S+@\S+\.\S+/;
    if (!regex.test(value)) {
      setEmailError("이메일 형식이 올바르지 않습니다.");
      return;
    }

    // (2) 중복확인 API
    const available = await apiCheckEmailAvailability(value);
    if (!available) {
      setEmailError("이미 가입된 이메일입니다.");
      return;
    }
    setIsEmailValid(true);
  };

  const handleEmailBlur = () => {
    if (!email) {
      setIsEmailFocused(false);
    }
    validateEmail(email);
  };

  // -------------------------------------------------
  // [B] 비밀번호 관련 상태 & 로직
  // -------------------------------------------------
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmFocused, setIsConfirmFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  // 규칙: 10글자 이상
  const hasMinLength = password.length >= 10;
  // 규칙: 특수문자 포함
  const hasSpecialChar = /[!@#$%^&*()_+|}{":;'?/>.<,]/.test(password);
  // 모든 규칙 충족 여부
  const isAllRulesPassed = hasMinLength && hasSpecialChar;
  // 비밀번호 확인 일치
  const hasMatch = password === confirmPassword;

  // (B-1) 비밀번호 변경
  const handlePasswordChange = (value: string) => {
    setPassword(value);
  };
  // (B-2) 비밀번호 확인 변경
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
  };

  // (B-3) 라벨 애니메이션 + 테두리 색상
  const passwordInputClass = () => {
    if (password && isAllRulesPassed) {
      return "border-green-500 focus:ring-green-200";
    }
    return "border-gray-300 focus:ring-blue-200";
  };
  const confirmPasswordInputClass = () => {
    if (confirmPassword && hasMatch) {
      return "border-green-500 focus:ring-green-200";
    }
    return "border-gray-300 focus:ring-blue-200";
  };

  const handlePasswordBlur = () => {
    if (!password) setIsPasswordFocused(false);
  };
  const handleConfirmBlur = () => {
    if (!confirmPassword) setIsConfirmFocused(false);
  };

  // 규칙 박스에서 "비밀번호 일치" 항목을 표시할지 여부
  const showMatchItem =
    isAllRulesPassed && (confirmPassword.length > 0 || isConfirmFocused);

  // -------------------------------------------------
  // [C] 인증번호 관련 상태
  // -------------------------------------------------
   // (C-0) 인증번호 인풋 포커스 상태
 const [isVerificationFocused, setIsVerificationFocused] = useState(false);

 // (C-0) 테두리 색상 로직 (예: 값이 있으면 초록, 없으면 기본)
 const verificationInputClass = () => {
   if (verificationCode) {
     return "border-green-500 focus:ring-green-200";
   }
   return "border-gray-300 focus:ring-blue-200";
 };

 // (C-0) blur 시, 값이 없으면 포커스 해제
 const handleVerificationBlur = () => {
   if (!verificationCode) {
     setIsVerificationFocused(false);
   }
 };
  // (1) '인증하기' 버튼 클릭 후, 인증번호 입력 섹션을 열지 여부
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  // (2) 사용자 입력 인증번호
  const [verificationCode, setVerificationCode] = useState("");

  // (C-1) '인증하기' 버튼 클릭 => /auth/signup 호출, 인증 메일 발송
  const handleAuthClick = async () => {
    // (1) 조건 모두 충족해야 진행
    if (!isEmailValid || !isAllRulesPassed || !hasMatch) {
      return;
    }

    try {
      // (2) 서버에 signup 요청 -> 인증 메일 발송 & Redis 저장
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        alert("인증 이메일 발송 실패 (이미 가입된 이메일이거나 서버 에러 등)");
        return;
      }

      // (3) 인증번호 입력 섹션 열기
      alert("인증 이메일이 발송되었습니다. 메일 내 코드를 확인 후 입력하세요.");
      setShowVerificationInput(true);
    } catch (err) {
      console.error(err);
      alert("서버 오류");
    }
  };

  // (C-2) '인증번호 확인' 버튼 클릭 => /auth/verify 호출
  const handleVerifyCode = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode, password }),
      });

      if (!response.ok) {
        alert("인증번호 검증 실패! 다시 시도해주세요.");
        return;
      }

      const data = await response.json();

      if (data.verified) {
        // (1) 인증 성공 메시지
        alert(data.message || "인증 성공!");

        // (2) add-info 페이지로 이동
        window.location.href = `/add-info?email=${encodeURIComponent(email)}`;
      } else {
        // (3) 인증 실패 or verified=false
        alert("인증이 완료되지 않았습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("서버 오류!");
    }
  };
   // [C-3] '재발송' 버튼 로직
   const handleResendCode = async () => {
     try {
       const response = await fetch(`${API_BASE_URL}/auth/signup`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ email, password }),
       });
       if (!response.ok) {
         alert("재발송 실패 (이미 가입된 이메일이거나 서버 에러 등)");
         return;
       }
       alert("인증 이메일을 다시 발송했습니다. 메일 내 코드를 확인하세요.");
     } catch (err) {
       console.error(err);
       alert("서버 오류(재발송 실패).");
     }
   };
  // -------------------------------------------------
  // [D] 소셜 로그인
  // -------------------------------------------------
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };
  const handleKakaoLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/kakao`;
  };

  // -------------------------------------------------
  // [E] 렌더링
  // -------------------------------------------------
  return (
    <div 
      // 상단 정렬(예시). 중앙 정렬(items-center) 시 높이 변동 시 폼이 흔들릴 수 있음
      className="min-h-screen bg-white flex flex-col items-start pt-12 mt-24"
    >
      <div className="w-full max-w-[280px] mx-auto p-4">
        {/* 상단 타이틀 */}
        <h1 className="text-xl font-semibold mb-8 text-center">계정 만들기</h1>

        {/* 이메일 입력 */}
        <div className="mb-3">
          <div className="relative">
            <AnimatePresence>
              {(isEmailFocused || email) && (
                <motion.label
                  key="emailLabel"
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  // 라벨 전체에는 bg-white 제거
                  className="absolute left-3 -top-2 text-xs text-gray-600 pointer-events-none"
                  style={{ zIndex: 1 }}
                >
                  {/* 글자만 흰색 배경 => span으로 감싸기 */}
                  <span className="bg-white inline-block leading-none">
                    이메일 주소
                  </span>
                </motion.label>
              )}
            </AnimatePresence>

            <motion.input
              type="email"
              placeholder={isEmailFocused || email ? "" : "이메일 주소"}
              className={`w-full px-3 py-3 rounded border focus:outline-none focus:ring text-sm bg-white ${emailInputClass()}`}
              value={email}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={handleEmailBlur}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
        </div>

        {/* 비밀번호 입력 */}
        <div className="mb-3">
          <div className="relative">
            <AnimatePresence>
              {(isPasswordFocused || password) && (
                <motion.label
                  key="passwordLabel"
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-3 -top-2 text-xs text-gray-600 pointer-events-none"
                  style={{ zIndex: 1 }}
                >
                  <span className="bg-white inline-block leading-none">
                    비밀번호
                  </span>
                </motion.label>
              )}
            </AnimatePresence>

            <motion.input
              type={isPasswordVisible ? "text" : "password"}
              placeholder={isPasswordFocused || password ? "" : "비밀번호"}
              className={`w-full px-3 py-3 pr-10 rounded border focus:outline-none focus:ring text-sm bg-white ${passwordInputClass()}`}
              value={password}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={handlePasswordBlur}
              onChange={(e) => handlePasswordChange(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500"
            >
              {isPasswordVisible ? "숨기기" : "보이기"}
            </button>
          </div>
        </div>

        {/* 비밀번호 규칙 박스 */}
        <AnimatePresence>
          {(password.length > 0 || isPasswordFocused) && (
            <motion.div
              key="passwordRules"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
              className="mb-3 p-3 border border-gray-200 rounded bg-gray-50 text-sm"
            >
              <p className="font-semibold mb-2 text-gray-600">비밀번호 규칙</p>

              {/* 규칙 1: 10글자 이상 */}
              <div className="flex items-center mb-1">
                {password.length >= 10 ? (
                  <span className="text-green-500 mr-2">✔</span>
                ) : (
                  <span className="text-gray-500 mr-2">-</span>
                )}
                <span
                  className={
                    password.length >= 10 ? "text-green-700" : "text-red-700"
                  }
                >
                  10글자 이상
                </span>
              </div>

              {/* 규칙 2: 특수문자 포함 */}
              <div className="flex items-center">
                {/[!@#$%^&*()_+|}{":;'?/>.<,]/.test(password) ? (
                  <span className="text-green-500 mr-2">✔</span>
                ) : (
                  <span className="text-gray-500 mr-2">-</span>
                )}
                <span
                  className={
                    /[!@#$%^&*()_+|}{":;'?/>.<,]/.test(password)
                      ? "text-green-700"
                      : "text-red-700"
                  }
                >
                  특수문자 포함
                </span>
              </div>

              {/* 규칙 3: 비밀번호 확인 일치여부 */}
              <AnimatePresence>
                {showMatchItem && (
                  <motion.div
                    key="matchItem"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center mt-1 overflow-hidden"
                  >
                    {password === confirmPassword ? (
                      <>
                        <span className="text-green-500 mr-2">✔</span>
                        <span className="text-green-700">비밀번호가 일치합니다.</span>
                      </>
                    ) : (
                      <>
                        <span className="text-red-500 mr-2">✘</span>
                        <span className="text-red-700">비밀번호가 일치하지 않습니다.</span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 비밀번호 확인 */}
        <AnimatePresence>
          {password.length > 0 && (
            <motion.div
              key="confirmPassword"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-3"
            >
              <div className="relative">
                <AnimatePresence>
                  {(isConfirmFocused || confirmPassword) && (
                    <motion.label
                      key="confirmPasswordLabel"
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 8, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-3 -top-2 text-xs text-gray-600 pointer-events-none"
                      style={{ zIndex: 1 }}
                    >
                      <span className="bg-white inline-block leading-none">
                        비밀번호 확인
                      </span>
                    </motion.label>
                  )}
                </AnimatePresence>

                <motion.input
                  type={isConfirmVisible ? "text" : "password"}
                  placeholder={
                    isConfirmFocused || confirmPassword ? "" : "비밀번호 확인"
                  }
                  className={`w-full px-3 py-3 pr-10 rounded border focus:outline-none focus:ring text-sm bg-white ${confirmPasswordInputClass()}`}
                  value={confirmPassword}
                  onFocus={() => setIsConfirmFocused(true)}
                  onBlur={handleConfirmBlur}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setIsConfirmVisible(!isConfirmVisible)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                >
                  {isConfirmVisible ? "숨기기" : "보이기"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* (C-1) '인증하기' 버튼 */}
        {!showVerificationInput && (
          <button
            className="mt-4 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded 
                       disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={handleAuthClick}
            disabled={!isEmailValid || !isAllRulesPassed || !hasMatch}
          >
            인증하기
          </button>
        )}

        {/* (C-2) 인증번호 입력 섹션 & '인증번호 확인' 버튼 */}
        <AnimatePresence>
          {showVerificationInput && (
            <motion.div
              key="verifySection"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
              style={{ overflow: "visible" }}
            >


              <div className="relative mb-3">
                <AnimatePresence>
                  {(isVerificationFocused || verificationCode) && (
                    <motion.label
                      key="verificationLabel"
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 8, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                        className="absolute left-3 -top-1.5 text-xs text-gray-600 pointer-events-none"
                      style={{ zIndex: 1 }}
                    >
                      <span className="bg-white inline-block leading-none">
                        인증번호 6자리
                      </span>
                    </motion.label>
                  )}
                </AnimatePresence>
  
                <motion.input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder={
                    isVerificationFocused || verificationCode ? "" : "인증번호 6자리"
                  }
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring text-sm ${verificationInputClass()}`}
                  onFocus={() => setIsVerificationFocused(true)}
                  onBlur={handleVerificationBlur}
                />

                <button
                  type="button"
                  onClick={handleResendCode}
                  className="
                    absolute right-2 top-1/2 -translate-y-1/2 
                    text-blue-600 text-sm 
                    hover:underline
                  "
                >
                  재발송
                </button>
              </div>


              <button
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded 
                           disabled:bg-gray-300 disabled:cursor-not-allowed"
                onClick={handleVerifyCode}
                disabled={!verificationCode}
              >
                인증번호 확인
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 구분선 */}
        <div className="my-4 flex items-center">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-400 text-xs">또는</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* 소셜 로그인 버튼 그룹 */}
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

        {/* 하단부: 이미 회원이라면 로그인 유도 */}
        <p className="text-center text-xs text-gray-500 mt-4">
          이미 회원이신가요?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            로그인하기
          </Link>
        </p>
      </div>
    </div>
  );
}

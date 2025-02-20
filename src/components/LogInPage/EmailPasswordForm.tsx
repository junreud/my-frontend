"use client";

import React from "react";
import Link from "next/link";

interface EmailPasswordFormProps {
  email: string;
  onEmailChange: (value: string) => void;
  emailStatus: "idle" | "validating" | "valid" | "invalid";
  emailError: string;
  onCheckEmailDuplicate: () => void;

  password: string;
  isPasswordValid: boolean;
  onPasswordChange: (value: string) => void;
}

/** 이메일 포맷 유효성 검사 함수 */
function validateEmailFormat(email: string): boolean {
  return /^\S+@\S+\.\S+$/.test(email);
}

export default function EmailPasswordForm({
  email,
  onEmailChange,
  emailStatus,
  emailError,
  onCheckEmailDuplicate,

  password,
  isPasswordValid,
  onPasswordChange,
}: EmailPasswordFormProps) {
  // 별도의 함수로 이메일 포맷을 검사할 수 있습니다.
  const isEmailFormatValid = validateEmailFormat(email);

  return (
    <div>
      {/* 이메일 입력 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이메일
        </label>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            onBlur={onCheckEmailDuplicate}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
            className={`
              w-full px-3 py-1 rounded-md focus:outline-none focus:ring
              text-sm pr-10 bg-white
              ${
                emailStatus === "invalid"
                  ? "border border-red-500 focus:ring-red-200"
                  : emailStatus === "valid"
                  ? "border border-green-500 focus:ring-green-200"
                  : "border border-gray-300 focus:ring-blue-200"
              }
            `}
            placeholder="you@example.com"
          />
          <div className="absolute inset-y-0 right-2 flex items-center">
            {emailStatus === "validating" && (
              <svg
                className="w-5 h-5 text-gray-400 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            )}
            {emailStatus === "valid" && (
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414L9 14.414l-3.707-3.707a1 1 0 011.414-1.414L9 11.586l6.293-6.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
        {/* 만약 이메일 포맷이 올바르지 않다면 별도의 에러 메시지를 추가할 수도 있습니다. */}
        {!isEmailFormatValid && email && (
          <div className="text-sm text-red-500 mt-1">
            올바른 이메일 형식을 입력해주세요.
          </div>
        )}
        {emailStatus === "invalid" && (
          <div className="text-sm text-red-500 mt-1">
            {emailError}
            <div className="mt-1">
              이미 가입하셨나요?{" "}
              <Link href="/login" className="text-blue-600 hover:underline mr-2">
                로그인하기
              </Link>
              |
              <Link
                href="/password-reset"
                className="text-blue-600 hover:underline ml-2"
              >
                비밀번호 변경하기
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 비밀번호 입력 */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          비밀번호
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          className={`
            w-full px-3 py-1 rounded-md focus:outline-none focus:ring text-sm bg-white
            ${
              password
                ? isPasswordValid
                  ? "border border-green-500 focus:ring-green-200"
                  : "border border-red-500 focus:ring-red-200"
                : "border border-gray-300 focus:ring-blue-200"
            }
          `}
          placeholder="영문, 숫자, 특수문자 포함 8자 이상"
        />
        {password && !isPasswordValid && (
          <p className="text-sm text-red-500 mt-1">
            비밀번호가 보안 규칙에 맞지 않습니다. 영문, 숫자, 특수문자 포함 8자 이상으로 입력해주세요.
          </p>
        )}
        {password && isPasswordValid && (
          <p className="text-sm text-green-500 mt-1">안전한 비밀번호입니다.</p>
        )}
      </div>
    </div>
  );
}

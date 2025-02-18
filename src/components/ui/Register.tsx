"use client"; // Next.js 13(app 디렉토리) 사용 시 필요

import React from "react";

export default function SignUpPage() {
  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center relative">
      {/* 상단 우측 '로그인' 링크 (원하시는 경우) */}
      <div data-cursor="text" className="absolute top-4 right-4 text-xs">
        Already have an account?
        <a href="/login" className="text-blue-600 hover:underline ml-1">
          Sign in →
        </a>
      </div>

      {/* 회원가입 박스(카드) */}
      <div className="w-full max-w-[320px] border border-gray-200 rounded-md p-3 shadow-sm">
        {/* 상단 타이틀 */}
        <h1 className="text-lg font-semibold mb-2">Sign up to GitHub</h1>

        {/* 회원가입 폼 */}
        <form>
          {/* Email */}
          <div className="mb-4">
            <label data-cursor="text" className="block text-xs font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-2 py-1 border border-gray-300
                         rounded-md focus:outline-none focus:ring
                         focus:ring-blue-200 text-sm bg-white"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label data-cursor="text" className="block text-xs font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-2 py-1 border border-gray-300
                         rounded-md focus:outline-none focus:ring
                         focus:ring-blue-200 text-sm bg-white"
            />
            <p data-cursor="text" className="text-xs text-gray-500 mt-1">
              Password should be at least 15 characters OR at least 8
              characters including a number and a lowercase letter.
            </p>
          </div>

          {/* Username */}
          <div className="mb-4">
            <label data-cursor="text" className="block text-xs font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Username"
              className="w-full px-2 py-1 border border-gray-300
                         rounded-md focus:outline-none focus:ring
                         focus:ring-blue-200 text-sm bg-white"
            />
            <p data-cursor="text" className="text-xs text-gray-500 mt-1">
              Username may only contain alphanumeric characters or single
              hyphens, and cannot begin or end with a hyphen.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700
                       text-white font-medium py-1 px-3 rounded-md text-sm my-2"
          >
            Continue
          </button>
        </form>

        {/* 이용 약관 안내 문구 */}
        <p data-cursor="text" className="text-xs text-gray-500 mt-3">
          By creating an account, you agree to the{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Terms of Service
          </a>
          . For more information about GitHub’s privacy practices, see the{" "}
          <a href="#" className="text-blue-600 hover:underline">
            GitHub Privacy Statement
          </a>
          . We&apos;ll occasionally send you account-related emails.
        </p>
      </div>
    </div>
  );
}

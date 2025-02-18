"use client";

import React from "react";
import Link from "next/link"; // Next.js의 라우팅을 위해 next/link 사용
// 만약 "lucide-react"의 아이콘 Link가 필요하다면 별도의 이름으로 import하세요. 
// import { Link as LinkIcon } from "lucide-react";

const LogInBox: React.FC = () => {
  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center">
      {/* 로그인 박스(카드) */}
      <div className="w-full max-w-[280px] border border-gray-200 rounded-md p-3 shadow-sm">
        {/* 상단 타이틀(또는 로고) */}
        <h1 data-cursor="text" className="text-ml font-semibold mb-2 text-center">
          로그인하기
        </h1>

        {/* 로그인 폼 */}
        <form>
          <div className="mb-4">
            <label data-cursor="text" className="block text-xs font-medium text-gray-700 mb-1">
              이메일 주소
            </label>
            <input
              type="text"
              placeholder="Email"
              className="w-full px-2 py-1 border border-gray-300
                         rounded-md focus:outline-none focus:ring
                         focus:ring-blue-200 text-sm bg-white"
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <label data-cursor="text" className="block text-xs font-medium text-gray-700">
                비밀번호
              </label>
              <a href="#" className="text-xs text-blue-600 hover:underline">
                비밀번호를 잊으셨나요?
              </a>
            </div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-2 py-1 border border-gray-300
                         rounded-md focus:outline-none focus:ring
                         focus:ring-blue-200 text-sm mt-1 bg-white"
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

        {/* 다른 로그인 방법 버튼 */}
        <button
          className="w-full bg-white border border-gray-300
                     hover:bg-gray-50 text-black font-medium
                     py-1 px-3 rounded-md text-sm"
        >
          소셜미디어 계정으로 로그인하기
        </button>

        {/* 회원가입 안내 */}
        <p className="text-center text-xs text-gray-500 mt-2">
          처음이신가요?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            계정 만들기
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LogInBox;

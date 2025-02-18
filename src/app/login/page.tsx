"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 일반 로그인
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        // 로그인 성공 후 이동
        router.push("/dashboard");
      } else {
        // 실패 처리
        alert("로그인 실패");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 구글 로그인
  const handleGoogleLogin = () => {
    // 서버 API (GET /api/auth/google)로 바로 이동
    window.location.href = "/api/auth/google";
  };

  // 애플 로그인
  const handleAppleLogin = () => {
    window.location.href = "/api/auth/apple";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-80">
        <h1 className="text-2xl mb-6">로그인</h1>

        <button
          onClick={handleGoogleLogin}
          className="w-full mb-2 bg-red-500 text-white py-2 rounded"
        >
          Google로 계속
        </button>
        <button
          onClick={handleAppleLogin}
          className="w-full mb-4 bg-black text-white py-2 rounded"
        >
          Apple로 계속
        </button>

        <form onSubmit={handleLogin}>
          <div className="mb-2">
            <label className="block mb-1 text-sm">이메일</label>
            <input
              type="email"
              className="w-full border px-3 py-2 rounded"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-sm">비밀번호</label>
            <input
              type="password"
              className="w-full border px-3 py-2 rounded"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}

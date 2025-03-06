// /app/login/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// 이미 만들어둔 컴포넌트들(헤더, 로그인 폼 UI 등)
import LogInHeader from "@/components/LogInPage/LogInHeader";
import LogInBox from "@/components/LogInPage/LogInBox";

export default function LoginPage() {
  const router = useRouter();
  const [checkDone, setCheckDone] = useState(false);

  useEffect(() => {
    // (1) 페이지 접속 시 LocalStorage에서 액세스 토큰 확인
    const token = localStorage.getItem("accessToken");
    if (token) {
      // 토큰이 있다면 → 로그인된 상태라 가정하고 /dashboard로 이동
      router.replace("/dashboard");
    } else {
      // 토큰이 없으면 → 로그인 폼 보여줌
      setCheckDone(true);
    }
  }, [router]);

  // (2) 로그인 처리 (LogInBox에서 이 함수를 props로 받아 호출할 수도 있음)
  const handleLocalLogin = async (email: string, password: string) => {
    try {
      // /api/login 엔드포인트(백엔드)로 POST
      // withCredentials: true를 해야, 백엔드에서 설정한 HttpOnly 쿠키를 수신할 수 있음
      const res = await axios.post(
        "http://localhost:4000/auth/login",
        { email, password },
        { withCredentials: true }
      );
      
      // 응답에서 accessToken만 JSON으로 받는다고 가정
      const { accessToken } = res.data;
      // (3) 액세스 토큰을 localStorage에 저장
      localStorage.setItem("accessToken", accessToken);
      
      // (4) 대시보드 페이지로 이동
      router.push("/dashboard");
    } catch (err) {
      console.error("로그인 실패:", err);
      alert("로그인에 실패했습니다. 아이디/비번 확인해주세요.");
    }
  };

  // (5) 아직 토큰 확인 중이면 로딩 표시
  if (!checkDone) {
    return <div className="p-4">확인중...</div>;
  }

  // (6) 토큰이 없어서 로그인 폼 표시
  // LogInBox 컴포넌트 안에서 이메일/비번 입력받고 handleLocalLogin 호출 가능
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <LogInHeader />
      <main>
        <LogInBox onLogin={handleLocalLogin} />
      </main>
    </div>
  );
}

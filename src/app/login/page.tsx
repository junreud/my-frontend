// /app/login/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";

import LogInHeader from "@/components/LogInPage/LogInHeader";
import LogInBox from "@/components/LogInPage/LogInBox";
import Notification from "@/components/ui/Notification";

export default function LoginPage() {
  const router = useRouter();
  const [checkDone, setCheckDone] = useState(false);

  // Notification 토글
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifType, setNotifType] = useState<"success" | "error" | "warning" | "info">("info");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifDescription, setNotifDescription] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      router.replace("/dashboard");
      setCheckDone(true);
    } else {
      setCheckDone(true);
    }
  }, [router]);

  const handleLocalLogin = async (email: string, password: string) => {
    try {
      const res = await apiClient.post("/auth/login", { email, password });
      const { accessToken } = res.data;
      localStorage.setItem("accessToken", accessToken);

      // 성공 시 → success 알림
      setNotifType("success");
      setNotifTitle("로그인 성공");
      setNotifDescription("대시보드로 이동합니다.");
      setNotifOpen(true);

      // 잠시 후 이동(바로 이동해도 되지만, 효과 보이게 잠깐 지연시키고 싶다면 setTimeout)
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);

    } catch (err) {
      console.error("로그인 실패:", err);

      // Notification 띄우기 (type = error)
      setNotifType("error");
      setNotifTitle("로그인 실패");
      setNotifDescription("아이디/비번을 확인해주세요.");
      setNotifOpen(true);
    }
  };

  if (!checkDone) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-solid border-gray-300 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <LogInHeader />
      <main>
        <LogInBox onLogin={handleLocalLogin} />
      </main>

      <Notification
        isOpen={notifOpen}
        type={notifType}
        title={notifTitle}
        description={notifDescription}
        onClose={() => setNotifOpen(false)}
      />
    </div>
  );
}

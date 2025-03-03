import React, { Suspense } from "react";
import PasswordResetClient from "@/components/ui/PasswordResetClient";

// 이 페이지 자체는 서버 컴포넌트
export default function Page() {
  return (
    <div>
      <h1 className="text-center my-4">비밀번호 재설정 페이지 (서버 컴포넌트)</h1>

      {/* 클라이언트 컴포넌트 부분을 Suspense로 감쌈 */}
      <Suspense fallback={<div>로딩 중...</div>}>
        <PasswordResetClient />
      </Suspense>
    </div>
  );
}

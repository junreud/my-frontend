"use client";

import React from "react";
import ReCAPTCHA from "react-google-recaptcha";

// 컴포넌트가 받을 props 정의
interface RecaptchaBoxProps {
  sitekey: string;                       // 구글 reCAPTCHA 사이트 키
  onChange: (token: string | null) => void; // 토큰 변경 시 실행할 함수
}

export default function RecaptchaBox({ sitekey, onChange }: RecaptchaBoxProps) {
  return (
    <div className="border border-gray-200 p-4 rounded-md mb-4">
      {/* 구글 reCAPTCHA 영역 */}
      <ReCAPTCHA sitekey={sitekey} onChange={onChange} />

      <p className="text-xs text-gray-500 mb-2 mt-2">
        이 퍼즐을 풀어서 귀하가 인간이라는 것을 알 수 있게 해주십시오
      </p>
      <button
        type="button"
        className="border border-gray-300 text-sm px-3 py-1 rounded-md hover:bg-gray-100"
      >
        확인
      </button>
    </div>
  );
}

"use client";

import React, { useRef, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";

interface RecaptchaBoxProps {
  sitekey: string;
  onChange: (token: string | null) => void;
}

export default function RecaptchaBox({ sitekey, onChange }: RecaptchaBoxProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // 컴포넌트가 마운트되면 자동 실행
  useEffect(() => {
    if (recaptchaRef.current) {
      // invisible 모드이므로, 직접 execute() 호출
      recaptchaRef.current.execute();
    }
  }, []);

  return (
    <ReCAPTCHA
      ref={recaptchaRef}
      sitekey={sitekey}
      onChange={onChange}   // 토큰이 발급되면 호출
      size="invisible"      // v3와 유사하게 "보이지 않는" 형태
    />
  );
}

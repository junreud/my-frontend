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
      try {
        recaptchaRef.current.execute();
      } catch (error) {
        console.error("RecaptchaBox execute error:", error);
      }
    }
  }, []);

  useEffect(() => {
    const handler = (e: PromiseRejectionEvent) => {
      if (e.reason == null) {
        e.preventDefault();
        console.warn("RecaptchaBox suppressed null unhandled rejection");
      }
    };
    window.addEventListener('unhandledrejection', handler);
    return () => window.removeEventListener('unhandledrejection', handler);
  }, []);

  return (
    <ReCAPTCHA
      ref={recaptchaRef}
      sitekey={sitekey}
      onChange={onChange}   // 토큰이 발급되면 호출
      size="invisible"      // v3와 유사하게 "보이지 않는" 형태
      onErrored={() => console.warn("RecaptchaBox failed to load")}
      onExpired={() => onChange(null)}
    />
  );
}

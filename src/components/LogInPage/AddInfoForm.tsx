// components/LogInPage/AddInfoForm.tsx

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SERVICE_TERM_TEXT } from "@/app/terms/serviceTerm";
import { PRIVACY_TERM_TEXT } from "@/app/terms/privacyTerm";
import { MARKETING_TERM_TEXT } from "@/app/terms/marketingTerm";
import { useSearchParams } from "next/navigation";

/** 
 * 휴대전화 포맷팅 (010-1234-5678)
 */
function formatPhoneNumber(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length > 11) {
    digits = digits.slice(0, 11);
  }
  if (digits.length < 4) return digits;
  if (digits.length < 8) {
    return digits.slice(0, 3) + "-" + digits.slice(3);
  }
  return digits.slice(0, 3) + "-" + digits.slice(3, 7) + "-" + digits.slice(7);
}

export default function AddInfoForm() {
  // ---------------------------
  // (A) 쿼리 파라미터
  // ---------------------------
  const searchParams = useSearchParams();
  const rawProvider = searchParams.get("provider");
  const paramProvider: "local" | "kakao" | "google" =
    rawProvider === "kakao" || rawProvider === "google" ? rawProvider : "local";

  // ---------------------------
  // [1] 상태
  // ---------------------------
  const [email, setEmail] = useState("");
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);

  const [name, setName] = useState("");
  const [isFocusedName, setIsFocusedName] = useState(false);

  const [birthday8, setBirthday8] = useState("");
  const [isFocusedBirth, setIsFocusedBirth] = useState(false);

  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isFocusedPhone, setIsFocusedPhone] = useState(false);

  // **비밀번호 필드는 제거** (이미 /verify 단계에서 처리)

  // ---------------------------
  // useEffect: email 쿼리 파라미터
  // ---------------------------
  useEffect(() => {
    const paramEmail = searchParams.get("email");
    if (paramEmail) {
      setEmail(paramEmail);
      setIsFocusedEmail(true);
    }
  }, [searchParams]);

  // ---------------------------
  // [2] 약관 체크
  // ---------------------------
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeServiceTerm, setAgreeServiceTerm] = useState(false);
  const [agreePrivacyTerm, setAgreePrivacyTerm] = useState(false);
  const [agreeMarketingTerm, setAgreeMarketingTerm] = useState(false);

  const handleAgreeAll = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreeServiceTerm(checked);
    setAgreePrivacyTerm(checked);
    setAgreeMarketingTerm(checked);
  };

  useEffect(() => {
    if (agreeServiceTerm && agreePrivacyTerm && agreeMarketingTerm) {
      setAgreeAll(true);
    } else {
      setAgreeAll(false);
    }
  }, [agreeServiceTerm, agreePrivacyTerm, agreeMarketingTerm]);

  // ---------------------------
  // [3] 휴대전화 입력
  // ---------------------------
  const handlePhoneChange = (value: string) => {
    setPhoneError("");
    const formatted = formatPhoneNumber(value);
    setPhone(formatted);
    const digits = formatted.replace(/\D/g, "");
    if (digits.length < 10) {
      setPhoneError("휴대전화 번호가 올바르지 않습니다.");
    }
  };

  // ---------------------------
  // 4) 플로팅 라벨 blur 처리
  // ---------------------------
  const handleBlurEmail = () => {
    if (!email) setIsFocusedEmail(false);
  };
  const handleBlurName = () => {
    if (!name) setIsFocusedName(false);
  };
  const handleBlurBirth = () => {
    if (!birthday8) setIsFocusedBirth(false);
  };
  const handleBlurPhone = () => {
    if (!phone) setIsFocusedPhone(false);
  };

  // ---------------------------
  // 5) 약관 모달
  // ---------------------------
  const [showTermModal, setShowTermModal] = useState(false);
  const [termContent, setTermContent] = useState("");

  const openTermModal = (content: string) => {
    setTermContent(content);
    setShowTermModal(true);
  };
  const closeTermModal = () => {
    setTermContent("");
    setShowTermModal(false);
  };

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeTermModal();
      }
    }
    if (showTermModal) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [showTermModal]);

  // ---------------------------
  // [payload] 인터페이스
  // ---------------------------
  interface AddInfoPayload {
    email: string;
    name: string;
    birthday8: string;
    phone: string;
    provider: "local" | "kakao" | "google";
    agreeMarketingTerm: boolean;
  }

  // ---------------------------
  // (6) 가입(추가정보) 버튼
  // ---------------------------
  const onSubmit = async () => {
    // (A) 기본 유효성
    if (!email || !name || !birthday8 || !phone) {
      alert("필수 입력값(이메일, 이름, 생년월일, 휴대전화)을 확인해주세요.");
      return;
    }
    if (!agreeServiceTerm || !agreePrivacyTerm) {
      alert("필수 약관에 동의해주세요.");
      return;
    }

    // (B) payload
    const payload: AddInfoPayload = {
      email,
      name,
      birthday8,
      phone,
      provider: paramProvider, // "local" | "kakao" | "google"
      agreeMarketingTerm,
    };

    console.log("제출 payload:", payload);

    try {
      // (C) /auth/addinfo 요청
      const response = await fetch("http://localhost:4000/auth/addinfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include", // 쿠키(RefreshToken) 전달/수신
      });

      // (D) 에러 처리
      if (!response.ok) {
        const errData = await response.json();
        alert("추가정보 등록 실패: " + errData.message);
        return;
      }

      // (E) 정상 응답
      const data = await response.json();
      alert(`추가정보 등록 완료! => ${data.message}`);

      // (F) accessToken or redirectUrl 처리
      if (data.accessToken) {
        window.location.href = `http://localhost:3000/oauth-redirect?accessToken=${data.accessToken}`;
      } else if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        // 기본 이동
        // window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error(err);
      alert("서버 오류");
    }
  };

  // ---------------------------
  // 7) UI 렌더링
  // ---------------------------
  const baseInputClass =
    "w-full px-3 py-3 rounded border focus:outline-none focus:ring text-sm bg-white";

  return (
    <div className="min-h-screen flex flex-col items-center pt-24 pb-24 bg-white">
      <div className="max-w-md w-full mx-auto p-8 bg-white">
        <h1 className="text-xl font-bold mb-6 text-center mb-8">마무리 가입하기</h1>

        {/* (1) 이메일 (readOnly) */}
        <div className="mb-4 relative">
          <AnimatePresence>
            {(isFocusedEmail || email) && (
              <motion.label
                key="emailLabel"
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1 pointer-events-none"
                style={{ zIndex: 1 }}
              >
                이메일
              </motion.label>
            )}
          </AnimatePresence>

          <motion.input
            layout
            type="email"
            readOnly
            placeholder={isFocusedEmail || email ? "" : "이메일"}
            className={`${baseInputClass} border-gray-300 bg-gray-100 text-gray-500`}
            value={email}
            onFocus={() => setIsFocusedEmail(true)}
            onBlur={handleBlurEmail}
          />
        </div>

        {/* (2) 이름 */}
        <div className="mb-4 relative">
          <AnimatePresence>
            {(isFocusedName || name) && (
              <motion.label
                key="nameLabel"
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1 pointer-events-none"
                style={{ zIndex: 1 }}
              >
                이름
              </motion.label>
            )}
          </AnimatePresence>

          <motion.input
            layout
            type="text"
            placeholder={isFocusedName || name ? "" : "이름"}
            className={`${baseInputClass} border-gray-300 focus:ring-blue-200`}
            value={name}
            onFocus={() => setIsFocusedName(true)}
            onBlur={handleBlurName}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* (3) 생년월일(8자리) */}
        <div className="mb-4 relative">
          <AnimatePresence>
            {(isFocusedBirth || birthday8) && (
              <motion.label
                key="birthLabel"
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1 pointer-events-none"
                style={{ zIndex: 1 }}
              >
                생년월일(8자리)
              </motion.label>
            )}
          </AnimatePresence>

          <motion.input
            layout
            type="text"
            maxLength={8}
            placeholder={isFocusedBirth || birthday8 ? "" : "YYYYMMDD"}
            className={`${baseInputClass} border-gray-300 focus:ring-blue-200`}
            value={birthday8}
            onFocus={() => setIsFocusedBirth(true)}
            onBlur={handleBlurBirth}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
              setBirthday8(digits);
            }}
          />
        </div>

        {/* (4) 휴대전화 */}
        <div className="mb-4 relative">
          <AnimatePresence>
            {(isFocusedPhone || phone) && (
              <motion.label
                key="phoneLabel"
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1 pointer-events-none"
                style={{ zIndex: 1 }}
              >
                휴대전화
              </motion.label>
            )}
          </AnimatePresence>

          <motion.input
            layout
            type="tel"
            placeholder={isFocusedPhone || phone ? "" : "휴대전화"}
            className={`${baseInputClass} ${
              phoneError
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-200"
            }`}
            value={phone}
            onFocus={() => setIsFocusedPhone(true)}
            onBlur={handleBlurPhone}
            onChange={(e) => handlePhoneChange(e.target.value)}
          />
          {phoneError && (
            <p className="text-red-500 text-sm mt-1">{phoneError}</p>
          )}
        </div>

        {/* (5) 약관 */}
        <div className="mb-4 border rounded p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center font-bold text-black">
              <input
                type="checkbox"
                className="mr-2"
                checked={agreeAll}
                onChange={(e) => handleAgreeAll(e.target.checked)}
              />
              모든 약관에 전체 동의
            </label>
          </div>

          {/* 서비스 약관 (필수) */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <input
                type="checkbox"
                className="mr-2"
                checked={agreeServiceTerm}
                onChange={(e) => setAgreeServiceTerm(e.target.checked)}
              />
              <span className="text-sm font-medium">
                서비스 이용약관 <span className="font-bold">(필수)</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => openTermModal(SERVICE_TERM_TEXT)}
              className="text-gray-700 font-bold text-lg px-2"
            >
              ▶
            </button>
          </div>

          {/* 개인정보 처리방침 (필수) */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <input
                type="checkbox"
                className="mr-2"
                checked={agreePrivacyTerm}
                onChange={(e) => setAgreePrivacyTerm(e.target.checked)}
              />
              <span className="text-sm font-medium">
                개인정보 처리방침 <span className="font-bold">(필수)</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => openTermModal(PRIVACY_TERM_TEXT)}
              className="text-gray-700 font-bold text-lg px-2"
            >
              ▶
            </button>
          </div>

          {/* 마케팅 (선택) */}
          <div className="flex items-center justify-between">
            <div>
              <input
                type="checkbox"
                className="mr-2"
                checked={agreeMarketingTerm}
                onChange={(e) => setAgreeMarketingTerm(e.target.checked)}
              />
              <span className="text-sm font-medium">
                마케팅 및 광고성 정보 수신 동의 (선택)
              </span>
            </div>
            <button
              type="button"
              onClick={() => openTermModal(MARKETING_TERM_TEXT)}
              className="text-gray-700 font-bold text-lg px-2"
            >
              ▶
            </button>
          </div>
        </div>

        <button
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded"
          onClick={onSubmit}
        >
          가입하기
        </button>
      </div>

      {/* 모달 */}
      <AnimatePresence>
        {showTermModal && (
          <motion.div
            key="termModal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeTermModal();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="bg-white max-w-md w-[90%] max-h-[80%] p-4 rounded shadow-lg overflow-auto relative"
            >
              <button
                onClick={closeTermModal}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 font-semibold"
              >
                닫기
              </button>
              <div className="whitespace-pre-wrap text-sm mt-6">
                {termContent}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

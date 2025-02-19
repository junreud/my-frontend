"use client";

import React, { RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** 
 * 입력된 전화번호 문자열에서 숫자 이외를 제거하고,
 * 3-4-4 형태(최대 11자리)로 하이픈(-)을 삽입.
 */
function formatPhoneNumber(raw: string): string {
  let digits = raw.replace(/\D/g, ""); // 숫자만 추출
  if (digits.length > 11) {
    digits = digits.slice(0, 11); // 최대 11자리까지만
  }

  if (digits.length < 4) {
    // 예: "0", "01", "010"
    return digits;
  } else if (digits.length < 8) {
    // 예: "0101", "0102" ... => 3자리 - 나머지
    return digits.slice(0, 3) + "-" + digits.slice(3);
  } else {
    // 8자리 이상 => 3-4-나머지(최대 4)
    return (
      digits.slice(0, 3) +
      "-" +
      digits.slice(3, 7) +
      "-" +
      digits.slice(7)
    );
  }
}

interface PhoneVerificationFormProps {
  phone: string;
  phoneStatus: "idle" | "sending" | "sent" | "verified" | "error";
  phoneError: string;

  verificationCode: string;
  verificationError: string;

  onPhoneChange: (value: string) => void;
  onSendVerificationCode: () => void;
  onVerificationCodeChange: (value: string) => void;
  onVerifyCode: () => void;

  verificationCodeInputRef: RefObject<HTMLInputElement | null>;
}

export default function PhoneVerificationForm({
  phone,
  phoneStatus,
  phoneError,

  verificationCode,
  verificationError,

  onPhoneChange,
  onSendVerificationCode,
  onVerificationCodeChange,
  onVerifyCode,

  verificationCodeInputRef,
}: PhoneVerificationFormProps) {


  /** 사용자가 입력할 때마다 포매팅 후 부모로 전달 */
  const handleChangePhoneInput = (rawValue: string) => {
    const formatted = formatPhoneNumber(rawValue);
    onPhoneChange(formatted);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        휴대전화 번호
      </label>
      <div className="relative">
        <input
          type="tel"
          value={phone}
          onChange={(e) => handleChangePhoneInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSendVerificationCode();
            }
          }}
          className={`
            w-full px-3 py-1 rounded-md focus:outline-none focus:ring text-sm
            ${
              phoneStatus === "verified"
                ? "border border-green-500 focus:ring-green-200"
                : phoneError
                ? "border border-red-500 focus:ring-red-200"
                : "border border-gray-300 focus:ring-blue-200"
            }
          `}
          placeholder="010-1234-5678"
        />
        {(phoneStatus === "idle" || phoneStatus === "error") && (
          <button
            type="button"
            onClick={onSendVerificationCode}
            className="absolute top-1/2 right-2 flex items-center text-blue-600 hover:underline text-sm -translate-y-1/2"
          >
            인증번호 받기
          </button>
        )}
        {phoneStatus === "sending" && (
          <div className="absolute inset-y-0 right-2 flex items-center">
            <svg
              className="w-5 h-5 text-gray-400 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          </div>
        )}
        {(phoneStatus === "sent" || phoneStatus === "verified") && (
          <div className="absolute inset-y-0 right-2 flex items-center">
            {phoneStatus === "verified" ? (
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414L9 14.414l-3.707-3.707a1 1 0 011.414-1.414L9 11.586l6.293-6.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <span className="text-green-500 text-sm">전송 완료</span>
            )}
          </div>
        )}
      </div>
      {phoneError && <div className="text-sm text-red-500 mt-1">{phoneError}</div>}

      {/* 인증번호 입력폼 (전화번호 전송 후에만 노출) */}
      <AnimatePresence mode="wait">
  {(phoneStatus === "sent" || phoneStatus === "verified") && (
    <motion.div
      key="phoneVerification"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="mt-3"
    >
      <label className="block text-sm font-medium text-gray-700 mb-1">
        인증번호 입력
      </label>

      <div className="relative">
        <input
          ref={verificationCodeInputRef} // 전송 후 자동 포커스
          type="text"
          value={verificationCode}
          onChange={(e) => onVerificationCodeChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onVerifyCode();
            }
          }}
          className={`
            w-full px-3 py-1 rounded-md focus:outline-none focus:ring text-sm 
            ${
              phoneStatus === "verified"
                ? "border border-green-500 focus:ring-green-200"
                : verificationError
                ? "border border-red-500 focus:ring-red-200"
                : "border border-gray-300 focus:ring-blue-200"
            }
          `}
          placeholder="인증번호"
        />

        {     /* 인증하기 버튼 vs 초록색 체크 아이콘 교체 표시 */}
              <AnimatePresence mode="wait">
                {phoneStatus === "verified" ? (
                  <motion.div
                    key="check-icon"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-y-0 right-2 flex items-center text-green-500"
                  >
                    {/* 간단히 SVG 체크아이콘 or FontAwesome 아이콘 등 */}
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414L9 14.414l-3.707-3.707a1 1 0 011.414-1.414L9 11.586l6.293-6.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.div>
                ) : (
                  <motion.button
                    key="verify-button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    type="button"
                    onClick={onVerifyCode}
                    className="absolute inset-y-0 right-2 flex items-center text-blue-600 hover:underline text-sm"
                  >
                    인증하기
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* 인증번호 에러 */}
            {verificationError && (
              <div className="text-sm text-red-500 mt-1">{verificationError}</div>
            )}

            {/* 인증 성공 메시지 */}
            {phoneStatus === "verified" && (
              <div className="text-sm text-green-500 mt-1">
                휴대전화 인증 완료
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

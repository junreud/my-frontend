"use client";

import React, { useEffect, useRef } from "react";

interface PersonalInfoFormProps {
  name: string;
  onNameChange: (value: string) => void;

  ssnFront: string;        // 앞 6자리
  ssnBackFirst: string;    // 뒷 1자리
  onSsnFrontChange: (value: string) => void;
  onSsnBackFirstChange: (value: string) => void;
}

export default function PersonalInfoForm({
  name,
  onNameChange,

  ssnFront,
  ssnBackFirst,
  onSsnFrontChange,
  onSsnBackFirstChange,
}: PersonalInfoFormProps) {
  const ssnBackInputRef = useRef<HTMLInputElement>(null);

  // 앞자리 6자리 입력 완료 시 뒷자리 input 포커스
  useEffect(() => {
    if (ssnFront.length === 6) {
      ssnBackInputRef.current?.focus();
    }
  }, [ssnFront]);

  // ────────── 자릿수별 Border 색상 계산 ──────────
  // 앞 6자리
  let frontBorderClass = "border-gray-300 focus:ring-blue-200";
  if (ssnFront.length > 0 && ssnFront.length < 6) {
    frontBorderClass = "border-red-500 focus:ring-red-200";
  } else if (ssnFront.length === 6) {
    frontBorderClass = "border-green-500 focus:ring-green-200";
  }

  // 뒷 1자리
  let backBorderClass = "border-gray-300 focus:ring-blue-200";
  if (ssnBackFirst.length > 0 && ssnBackFirst.length < 1) {
    // 사실상 length < 1이면 0이므로... 
    // 여기선 "입력 중" 상태가 없지만, 포괄적 로직 예시
    backBorderClass = "border-red-500 focus:ring-red-200";
  } else if (ssnBackFirst.length === 1) {
    backBorderClass = "border-green-500 focus:ring-green-200";
  }

  return (
    <div className="mt-4">
      <hr className="my-4" />
      <h3 className="text-md font-semibold mb-3">개인신상 정보</h3>

      {/* 이름 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이름
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className={`
            w-full px-3 py-1 rounded-md focus:outline-none focus:ring text-sm
            ${
              !name
                ? "border border-gray-300 focus:ring-blue-200"
                : "border border-green-500 focus:ring-green-200"
            }
          `}
          placeholder="홍길동"
          required
        />
      </div>

      {/* 주민등록번호 */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          주민등록번호
        </label>
        <div className="flex items-center gap-2">
          {/* 앞 6자리 */}
          <input
            type="text"
            value={ssnFront}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 6) onSsnFrontChange(val);
            }}
            maxLength={6}
            className={`
              w-24 px-3 py-1 rounded-md focus:outline-none focus:ring text-sm
              ${frontBorderClass} 
            `}
            placeholder="앞6자리"
            required
          />

          <span className="text-xl font-bold">-</span>

          {/* 뒷 1자리 */}
          <input
            type="text"
            value={ssnBackFirst}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 1) onSsnBackFirstChange(val);
            }}
            maxLength={1}
            ref={ssnBackInputRef}
            className={`
              w-8 px-2 py-1 rounded-md focus:outline-none focus:ring text-sm
              ${backBorderClass}
            `}
            placeholder=""
            required
          />

          <span className="text-sm text-gray-400">******</span>
        </div>
      </div>
    </div>
  );
}

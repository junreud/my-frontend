"use client";

import React, { useEffect, useRef, useState } from "react";

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

  // Blur 여부(한 번이라도 포커스 벗어났는지)를 추적
  const [frontTouched, setFrontTouched] = useState(false);
  const [backTouched, setBackTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);

  // 앞자리 6자리 입력 완료하면 자동 포커스 이동
  useEffect(() => {
    if (ssnFront.length === 6) {
      ssnBackInputRef.current?.focus();
    }
  }, [ssnFront]);

  // ============ 이름 테두리 클래스 ============
  // 1) 기본 (아직 Blur 안 됨): 회색 + focus 시 파랑
  let nameBorderClass = "border border-gray-300 focus:ring-blue-200";

  // 2) 만약 Blur가 발생했다면 => 글자수 체크
  if (nameTouched) {
    if (name.trim().length >= 2) {
      // 2글자 이상 => 초록
      nameBorderClass = "border border-green-500 focus:ring-green-200";
    } else {
      // 아니면 빨강
      nameBorderClass = "border border-red-500 focus:ring-red-200";
    }
  }

  // ============ 주민번호 앞자리 테두리 클래스 ============
  let frontBorderClass = "border border-gray-300 focus:ring-blue-200";
  if (frontTouched) {
    if (ssnFront.length === 6) {
      frontBorderClass = "border border-green-500 focus:ring-green-200";
    } else {
      frontBorderClass = "border border-red-500 focus:ring-red-200";
    }
  }

  // ============ 주민번호 뒷자리 테두리 클래스 ============
  let backBorderClass = "border border-gray-300 focus:ring-blue-200";
  if (backTouched) {
    if (ssnBackFirst.length === 1) {
      backBorderClass = "border border-green-500 focus:ring-green-200";
    } else {
      backBorderClass = "border border-red-500 focus:ring-red-200";
    }
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
          onBlur={() => setNameTouched(true)} // Blur 시 nameTouched = true
          className={`
            w-full px-3 py-1 rounded-md focus:outline-none focus:ring text-sm
            ${nameBorderClass}
          `}
          placeholder="홍길동"
        />
      </div>

      {/* 주민등록번호 */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          주민등록번호
        </label>

        <div className="flex items-center gap-2">
          {/* 주민번호 앞 6자리 */}
          <input
            type="text"
            value={ssnFront}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 6) onSsnFrontChange(val);
            }}
            onBlur={() => setFrontTouched(true)} // Blur 시 frontTouched = true
            maxLength={6}
            className={`
              w-24 px-3 py-1 rounded-md
              focus:outline-none focus:ring text-sm
              ${frontBorderClass}
            `}
            placeholder="앞6자리"
          />

          <span className="text-xl font-bold">-</span>

          {/* 주민번호 뒷 1자리 */}
          <input
            type="text"
            value={ssnBackFirst}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 1) onSsnBackFirstChange(val);
            }}
            onBlur={() => setBackTouched(true)} // Blur 시 backTouched = true
            maxLength={1}
            ref={ssnBackInputRef}
            className={`
              w-8 px-2 py-1 rounded-md
              focus:outline-none focus:ring text-sm
              ${backBorderClass}
            `}
            placeholder=""
          />

          <span className="text-sm text-gray-400">******</span>
        </div>
      </div>
    </div>
  );
}

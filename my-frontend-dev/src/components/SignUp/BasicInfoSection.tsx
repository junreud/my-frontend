import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BasicInfoSectionProps {
  isEmailValid: boolean;
  emailError: string;
  password: string;
  passwordError: string;
  confirmPassword: string;

  // 아래는 원래 쓰시던 props들 (생년월일만 수정)
  phone: string;
  handlePhoneChange: (val: string) => void;
  phoneError: string;
  operator: string;
  setOperator: (val: string) => void;
  name: string;
  setName: (val: string) => void;
  gender: "MALE" | "FEMALE" | "";
  setGender: (val: "MALE" | "FEMALE" | "") => void;
  foreigner: boolean;
  setForeigner: (val: boolean) => void;
}

export default function BasicInfoSection({
  isEmailValid,
  emailError,
  password,
  passwordError,
  confirmPassword,
  phone,
  handlePhoneChange,
  phoneError,
  operator,
  setOperator,
  name,
  setName,
  gender,
  setGender,
  foreigner,
  setForeigner,
}: BasicInfoSectionProps) {
  // -----------------------
  // 1) 이름 인풋 border 헬퍼
  // -----------------------
  const nameInputClass = () =>
    name.length > 0
      ? "border-green-500 focus:ring-green-200"
      : "border-gray-300 focus:ring-blue-200";

  // -----------------------
  // 2) 휴대전화 인풋 border
  // -----------------------
  const phoneInputClass = () => {
    if (phoneError) {
      return "border-red-500 focus:ring-red-200";
    }
    if (phone.replace(/\D/g, "").length >= 10) {
      return "border-green-500 focus:ring-green-200";
    }
    return "border-gray-300 focus:ring-blue-200";
  };

  // -----------------------
  // 3) 통신사 셀렉트 border
  // -----------------------
  const operatorInputClass = () =>
    operator
      ? "border-green-500 focus:ring-green-200"
      : "border-gray-300 focus:ring-blue-200";

  // -----------------------
  // 4) 버튼 스타일 (성별/내외국인 공용)
  // -----------------------
  const baseButtonClass = `h-9 px-3 border rounded text-sm focus:outline-none focus:ring bg-white`;

  const genderButtonClass = (type: "MALE" | "FEMALE") => {
    const isActive = gender === type;
    return isActive
      ? `${baseButtonClass} border-green-500 text-green-600`
      : `${baseButtonClass} border-gray-300 text-gray-700 hover:bg-gray-100`;
  };

  const foreignerButtonClass = (isForeign: boolean) => {
    const isActive = foreigner === isForeign;
    return isActive
      ? `${baseButtonClass} border-green-500 text-green-600`
      : `${baseButtonClass} border-gray-300 text-gray-700 hover:bg-gray-100`;
  };

  // -----------------------
  // 5) "생년월일"을 연/월/일로 쪼개서 입력
  // -----------------------
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");

  // 포커스 자동 이동을 위해 ref 사용
  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);

  // "생년월일" 라벨이 인풋 내부에 있다가, 
  // 포커스나 값이 있을 때 위로 떠오르는(플로팅) 효과를 주기 위한 state
  const [isBirthdayFocused, setIsBirthdayFocused] = useState(false);

  // 생년월일 인풋들(연/월/일)이 전부 비어있으면 라벨이 다시 안쪽으로 내려감
  const handleBirthdayBlur = () => {
    // 세 칸 다 비어있으면 라벨 초기 상태로
    if (!birthYear && !birthMonth && !birthDay) {
      setIsBirthdayFocused(false);
    }
  };

  // border 헬퍼: 여기서는 간단하게 한 가지 스타일만 예시
  const birthdayInputClass = () => {
    const totalLength =
      birthYear.replace(/\D/g, "").length +
      birthMonth.replace(/\D/g, "").length +
      birthDay.replace(/\D/g, "").length;
    return totalLength === 8 // 예: 4+2+2 = 8자리
      ? "border-green-500 focus:ring-green-200"
      : "border-gray-300 focus:ring-blue-200";
  };

  return (
    <AnimatePresence>
      {isEmailValid &&
        !emailError &&
        password &&
        !passwordError &&
        confirmPassword &&
        confirmPassword === password && (
          <motion.div
            key="basicInfo"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-4 overflow-hidden"
          >
            <hr className="my-4" />
            <h2 className="font-medium mb-2">기본 정보</h2>

            {/* 이름 */}
            <label className="block mb-1 font-medium">이름</label>
            <input
              type="text"
              placeholder="홍길동"
              className={`w-full px-3 py-1 rounded border focus:outline-none focus:ring text-sm mb-2 bg-white ${nameInputClass()}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* ===========================
                생년월일 (연/월/일 분리 + 플로팅 라벨)
               =========================== */}
            <div className="mb-2">
              <div className="relative">
                {/* AnimatePresence로 라벨의 등장/퇴장 애니메이션 제어 */}
                <AnimatePresence>
                  {(isBirthdayFocused ||
                    birthYear ||
                    birthMonth ||
                    birthDay) && (
                    <motion.label
                      key="birthdayLabel"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-3 top-0 text-sm text-gray-600 pointer-events-none"
                    >
                      생년월일
                    </motion.label>
                  )}
                </AnimatePresence>

                {/* 연도 입력 */}
                <motion.input
                  layout
                  type="text"
                  placeholder={
                    // 포커스 전/값 없을 때만 "연도" 같은 내부 안내문구
                    !isBirthdayFocused && !birthYear ? "연도" : ""
                  }
                  className={`inline-block w-[100px] px-3 py-2 mr-1 rounded border focus:outline-none focus:ring text-sm bg-white ${birthdayInputClass()}`}
                  value={birthYear}
                  onFocus={() => setIsBirthdayFocused(true)}
                  onBlur={handleBirthdayBlur}
                  maxLength={4}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setBirthYear(val);
                    // 4자리 되면 월 입력칸으로 포커스 자동 이동
                    if (val.length === 4) {
                      monthRef.current?.focus();
                    }
                  }}
                />

                {/* 월 입력 */}
                <motion.input
                  layout
                  type="text"
                  ref={monthRef}
                  placeholder={
                    !isBirthdayFocused && !birthMonth ? "월" : ""
                  }
                  className={`inline-block w-[70px] px-3 py-2 mr-1 rounded border focus:outline-none focus:ring text-sm bg-white ${birthdayInputClass()}`}
                  value={birthMonth}
                  onFocus={() => setIsBirthdayFocused(true)}
                  onBlur={handleBirthdayBlur}
                  maxLength={2}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
                    setBirthMonth(val);
                    // 2자리 되면 일 입력칸으로 이동
                    if (val.length === 2) {
                      dayRef.current?.focus();
                    }
                  }}
                />

                {/* 일 입력 */}
                <motion.input
                  layout
                  type="text"
                  ref={dayRef}
                  placeholder={
                    !isBirthdayFocused && !birthDay ? "일" : ""
                  }
                  className={`inline-block w-[70px] px-3 py-2 rounded border focus:outline-none focus:ring text-sm bg-white ${birthdayInputClass()}`}
                  value={birthDay}
                  onFocus={() => setIsBirthdayFocused(true)}
                  onBlur={handleBirthdayBlur}
                  maxLength={2}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
                    setBirthDay(val);
                  }}
                />
              </div>
            </div>

            {/* 휴대전화 */}
            <label className="block mb-1 font-medium">휴대전화</label>
            <input
              type="tel"
              placeholder="010-1234-5678"
              className={`w-full px-3 py-1 rounded border focus:outline-none focus:ring text-sm mb-2 bg-white ${phoneInputClass()}`}
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
            />
            {phoneError && (
              <p className="text-red-500 text-sm mt-1">{phoneError}</p>
            )}

            {/* 통신사 */}
            <label className="block mb-1 font-medium">통신사</label>
            <select
              className={`w-full px-3 py-1 border rounded focus:outline-none focus:ring text-sm mb-2 bg-white ${operatorInputClass()}`}
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
            >
              <option value="">-- 통신사 선택 --</option>
              <option value="SKT">SKT</option>
              <option value="SKT_MVNO">SKT 알뜰폰</option>
              <option value="KT">KT</option>
              <option value="KT_MVNO">KT 알뜰폰</option>
              <option value="LGU+">LG U+</option>
              <option value="LGU+_MVNO">LG U+ 알뜰폰</option>
            </select>

            {/* 성별 / 내외국인 */}
            <div className="flex items-start gap-4 mt-4 mb-2">
              {/* 성별 */}
              <div className="flex-1">
                <label className="block mb-1 font-medium">성별</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={genderButtonClass("MALE")}
                    onClick={() => setGender("MALE")}
                  >
                    남자
                  </button>
                  <button
                    type="button"
                    className={genderButtonClass("FEMALE")}
                    onClick={() => setGender("FEMALE")}
                  >
                    여자
                  </button>
                </div>
              </div>

              {/* 내/외국인 */}
              <div className="flex-1">
                <label className="block mb-1 font-medium">내/외국인</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={foreignerButtonClass(false)}
                    onClick={() => setForeigner(false)}
                  >
                    내국인
                  </button>
                  <button
                    type="button"
                    className={foreignerButtonClass(true)}
                    onClick={() => setForeigner(true)}
                  >
                    외국인
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
    </AnimatePresence>
  );
}

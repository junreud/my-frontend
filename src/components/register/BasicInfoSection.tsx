import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BasicInfoSectionProps {
  isEmailValid: boolean;
  emailError: string;
  password: string;
  passwordError: string;
  confirmPassword: string;

  name: string;
  setName: (val: string) => void;
  birthday6: string;
  setBirthday6: (val: string) => void;
  phone: string;
  handlePhoneChange: (val: string) => void;
  phoneError: string;
  operator: string;
  setOperator: (val: string) => void;
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
  name,
  setName,
  birthday6,
  setBirthday6,
  phone,
  handlePhoneChange,
  phoneError,
  operator,
  setOperator,
  gender,
  setGender,
  foreigner,
  setForeigner,
}: BasicInfoSectionProps) {
  // input border helpers
  const nameInputClass = () =>
    name.length > 0
      ? "border-green-500 focus:ring-green-200"
      : "border-gray-300 focus:ring-blue-200";

  const birthdayInputClass = () =>
    birthday6.length === 6
      ? "border-green-500 focus:ring-green-200"
      : "border-gray-300 focus:ring-blue-200";

  const phoneInputClass = () => {
    if (phoneError) {
      return "border-red-500 focus:ring-red-200";
    }
    if (phone.replace(/\D/g, "").length >= 10) {
      return "border-green-500 focus:ring-green-200";
    }
    return "border-gray-300 focus:ring-blue-200";
  };

  const operatorInputClass = () =>
    operator
      ? "border-green-500 focus:ring-green-200"
      : "border-gray-300 focus:ring-blue-200";

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

  // 부모에서 조건부 렌더링 (이메일/비번이 유효할 때) 수행을 권장
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

            {/* 생년월일 */}
            <label className="block mb-1 font-medium">생년월일(6자리)</label>
            <input
              type="text"
              placeholder="YYMMDD"
              maxLength={6}
              className={`w-full px-3 py-1 rounded border focus:outline-none focus:ring text-sm mb-2 bg-white ${birthdayInputClass()}`}
              value={birthday6}
              onChange={(e) => setBirthday6(e.target.value.replace(/\D/g, ""))}
            />

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

              {/* 내외국인 */}
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

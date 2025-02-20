"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** 
 * 휴대전화 포맷팅 (01012345678 -> 010-1234-5678)
 */
function formatPhoneNumber(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length > 11) {
    digits = digits.slice(0, 11);
  }

  if (digits.length < 4) {
    return digits;
  } else if (digits.length < 8) {
    return digits.slice(0, 3) + "-" + digits.slice(3);
  } else {
    return (
      digits.slice(0, 3) +
      "-" +
      digits.slice(3, 7) +
      "-" +
      digits.slice(7)
    );
  }
}

/**
 * 가짜 API: 이메일 중복 체크 (실제로는 백엔드 호출)
 * 중복이면 false, 사용 가능이면 true
 */
async function checkEmailAvailability(email: string): Promise<boolean> {
  // 실제 구현: await fetch("/api/users/check-email?email=" + email)
  // 여기서는 "test@duplicate.com"만 중복 처리
  return email !== "test@duplicate.com";
}

export default function IdentityVerificationForm() {
  // === [1단계: 이메일 / 비밀번호] ===
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // === [2단계: 이름 / 생년월일 / 통신사 / 성별 / 내외국인] ===
  const [name, setName] = useState("");
  const [birthday6, setBirthday6] = useState(""); // YYMMDD 형식
  const [carrier, setCarrier] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "">("");
  const [foreigner, setForeigner] = useState(false);

  // === [3단계: 휴대전화 인증] ===
  const [phone, setPhone] = useState("");
  const [phoneStatus, setPhoneStatus] = useState<"idle" | "sending" | "sent" | "verified" | "error">("idle");
  const [phoneError, setPhoneError] = useState("");

  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const verificationCodeInputRef = useRef<HTMLInputElement | null>(null);

  // === [4단계: 약관 동의] ===
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreePersonalInfo, setAgreePersonalInfo] = useState(false);
  const [agreeUniqueID, setAgreeUniqueID] = useState(false);
  const [agreeTelecom, setAgreeTelecom] = useState(false);
  const [agreeCertService, setAgreeCertService] = useState(false);
  const [agreeNaverPrivacy, setAgreeNaverPrivacy] = useState(false);

  // (약관) 전체동의 체크 시 나머지 모두 true
  useEffect(() => {
    if (
      agreePersonalInfo &&
      agreeUniqueID &&
      agreeTelecom &&
      agreeCertService &&
      agreeNaverPrivacy
    ) {
      setAgreeAll(true);
    } else {
      setAgreeAll(false);
    }
  }, [agreePersonalInfo, agreeUniqueID, agreeTelecom, agreeCertService, agreeNaverPrivacy]);

  const handleAgreeAllChange = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreePersonalInfo(checked);
    setAgreeUniqueID(checked);
    setAgreeTelecom(checked);
    setAgreeCertService(checked);
    setAgreeNaverPrivacy(checked);
  };

  // === 이메일 유효성 검사 ===
  const validateEmail = async (value: string) => {
    setEmail(value);
    setEmailError("");
    setIsEmailValid(false);

    // 단순 이메일 형식 체크
    const regex = /\S+@\S+\.\S+/;
    if (!regex.test(value)) {
      setEmailError("이메일 형식이 올바르지 않습니다.");
      return;
    }

    // 중복 체크 (가짜)
    const available = await checkEmailAvailability(value);
    if (!available) {
      setEmailError("이미 가입된 이메일입니다.");
      return;
    }

    setIsEmailValid(true);
  };

  // === 비밀번호 검사 ===
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError("");
    // 예: 6자 이상
    if (value.length < 6) {
      setPasswordError("비밀번호는 최소 6자 이상이어야 합니다.");
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (password && value && password !== value) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordError("");
    }
  };

  // === 휴대전화 인증: 번호 전송 ===
  const onSendVerificationCode = () => {
    setPhoneError("");
    if (!phone) {
      setPhoneError("휴대전화 번호를 입력해 주세요.");
      return;
    }
    const onlyDigits = phone.replace(/\D/g, "");
    if (onlyDigits.length < 10) {
      setPhoneError("휴대전화 번호가 올바르지 않습니다.");
      return;
    }

    setPhoneStatus("sending");
    setTimeout(() => {
      setPhoneStatus("sent");
      if (verificationCodeInputRef.current) {
        verificationCodeInputRef.current.focus();
      }
    }, 800);
  };

  // === 휴대전화 인증: 코드 검증 ===
  const onVerifyCode = () => {
    setVerificationError("");
    if (!verificationCode) {
      setVerificationError("인증번호를 입력해주세요.");
      return;
    }
    // 123456 이면 성공 처리
    if (verificationCode === "123456") {
      setPhoneStatus("verified");
    } else {
      setVerificationError("인증번호가 일치하지 않습니다.");
    }
  };

  // === 최종 버튼 활성화 조건 ===
  const isFormValid = (): boolean => {
    if (!isEmailValid || emailError) return false;            // 이메일
    if (passwordError || !password || !confirmPassword) return false;  
    if (!name || !birthday6 || birthday6.length < 6) return false;     
    if (!carrier) return false;
    if (!gender) return false;
    if (phoneStatus !== "verified") return false;
    if (!agreePersonalInfo || !agreeUniqueID || !agreeTelecom || !agreeCertService || !agreeNaverPrivacy) {
      return false;
    }
    return true;
  };

  // === 최종 Submit ===
  const handleSubmit = () => {
    if (!isFormValid()) return;
    alert("모든 검증이 완료되어 인증요청이 가능합니다!");
  };

  // === 인풋 배경 흰색 & 유효하면 초록 테두리, 에러면 빨간 테두리 ===
  // 각 필드별로 "valid" 판단 로직을 간단히 구성 (샘플)
  const emailInputClass = () => {
    if (email && isEmailValid && !emailError) {
      return "border-green-500 focus:ring-green-200";
    }
    if (emailError) {
      return "border-red-500 focus:ring-red-200";
    }
    return "border-gray-300 focus:ring-blue-200";
  };

  const passwordInputClass = (field: "main" | "confirm") => {
    // "main": 첫 번째 비밀번호 입력
    if (field === "main") {
      if (password.length >= 6 && !passwordError) {
        return "border-green-500 focus:ring-green-200";
      } else if (passwordError) {
        return "border-red-500 focus:ring-red-200";
      }
      return "border-gray-300 focus:ring-blue-200";
    } else {
      // confirm
      if (confirmPassword && confirmPassword === password && !passwordError) {
        return "border-green-500 focus:ring-green-200";
      } else if (passwordError) {
        return "border-red-500 focus:ring-red-200";
      }
      return "border-gray-300 focus:ring-blue-200";
    }
  };

  const nameInputClass = () => {
    if (name.length > 0) return "border-green-500 focus:ring-green-200";
    return "border-gray-300 focus:ring-blue-200";
  };

  const birthdayInputClass = () => {
    if (birthday6.length === 6) return "border-green-500 focus:ring-green-200";
    return "border-gray-300 focus:ring-blue-200";
  };

  const carrierInputClass = () => {
    if (carrier) return "border-green-500 focus:ring-green-200";
    return "border-gray-300 focus:ring-blue-200";
  };

  // 성별/내외국인은 "버튼 스타일" 사용하므로, 추가로 active 상태에 따라 테두리 색 변경
  const genderButtonClass = (type: "MALE" | "FEMALE") => {
    const isActive = gender === type;
    return isActive
      ? "px-4 py-1 border border-green-500 text-green-600 rounded cursor-pointer bg-white"
      : "px-4 py-1 border border-gray-300 text-gray-700 rounded cursor-pointer bg-white hover:bg-gray-50";
  };

  const foreignerButtonClass = (isForeign: boolean) => {
    const isActive = foreigner === isForeign;
    return isActive
      ? "px-4 py-1 border border-green-500 text-green-600 rounded cursor-pointer bg-white"
      : "px-4 py-1 border border-gray-300 text-gray-700 rounded cursor-pointer bg-white hover:bg-gray-50";
  };

  const phoneInputClass = () => {
    if (phoneStatus === "verified") {
      return "border-green-500 focus:ring-green-200";
    } else if (phoneError) {
      return "border-red-500 focus:ring-red-200";
    }
    return "border-gray-300 focus:ring-blue-200";
  };

  const verificationInputClass = () => {
    if (phoneStatus === "verified") {
      return "border-green-500 focus:ring-green-200";
    } else if (verificationError) {
      return "border-red-500 focus:ring-red-200";
    }
    return "border-gray-300 focus:ring-blue-200";
  };

  return (
    <div className="max-w-2xl mx-auto p-4 border border-gray-300 rounded-lg bg-white">
      <h1 className="text-xl font-bold mb-4">본인인증 가입폼 (예시)</h1>

      {/* (1) 이메일 입력 */}
      <div className="mb-3">
        <label className="block mb-1 font-medium">이메일</label>
        <input
          type="email"
          value={email}
          placeholder="example@email.com"
          className={`w-full px-3 py-1 rounded focus:outline-none border border-gray-300 focus:ring text-sm bg-white ${emailInputClass()}`}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={(e) => validateEmail(e.target.value)}
        />
        {emailError && (
          <p className="text-red-500 text-sm mt-1">{emailError}</p>
        )}
      </div>

      {/* (2) 비밀번호 */}
      <div className="mb-3">
        <label className="block mb-1 font-medium">비밀번호</label>
        <input
          type="password"
          value={password}
          placeholder="비밀번호(6자 이상)"
          className={`w-full px-3 py-1 rounded focus:outline-none border border-gray-300 focus:ring text-sm bg-white ${passwordInputClass("main")}`}
          onChange={(e) => handlePasswordChange(e.target.value)}
        />
        {passwordError && password.length < 6 && (
          <p className="text-red-500 text-sm mt-1">비밀번호는 최소 6자 이상이어야 합니다.</p>
        )}
      </div>

      {/* (2-1) 비밀번호 확인 */}
      <div className="mb-3">
        <label className="block mb-1 font-medium">비밀번호 확인</label>
        <input
          type="password"
          value={confirmPassword}
          className={`w-full px-3 py-1 rounded focus:outline-none border border-gray-300 focus:ring text-sm bg-white ${passwordInputClass("confirm")}`}
          onChange={(e) => handleConfirmPasswordChange(e.target.value)}
        />
        {passwordError && password.length >= 6 && confirmPassword && confirmPassword !== password && (
          <p className="text-red-500 text-sm mt-1">비밀번호가 일치하지 않습니다.</p>
        )}
      </div>

      {/* (3) 이름 / 생년월일 / 통신사 / 성별 / 내외국인: step2 통과 후 노출 */}
      {(() => {
        const step2Available =
          isEmailValid &&
          !emailError &&
          password.length >= 6 &&
          !passwordError &&
          confirmPassword === password;
        return step2Available;
      })() && (
        <AnimatePresence mode="wait">
          <motion.div
            key="step2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <hr className="my-4" />
            <h2 className="font-medium mb-2">기본 정보</h2>

            {/* 이름 */}
            <label className="block mb-1 font-medium">이름</label>
            <input
              type="text"
              placeholder="홍길동"
              className={`w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring text-sm mb-2 bg-white ${nameInputClass()}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* 생년월일(6자리) */}
            <label className="block mb-1 font-medium">생년월일(6자리)</label>
            <input
              type="text"
              placeholder="YYMMDD"
              className={`w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring text-sm mb-2 bg-white ${birthdayInputClass()}`}
              value={birthday6}
              maxLength={6}
              onChange={(e) => setBirthday6(e.target.value.replace(/\D/g, ""))}
            />

            {/* 통신사 선택 */}
            <label className="block mb-1 font-medium">통신사</label>
            <select
              className={`w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring text-sm mb-2 bg-white ${carrierInputClass()}`}
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
            >
              <option value="">-- 통신사 선택 --</option>
              <option value="SKT">SKT</option>
              <option value="SKT_MVNO">SKT 알뜰폰</option>
              <option value="KT">KT</option>
              <option value="KT_MVNO">KT 알뜰폰</option>
              <option value="LGU+">LG U+</option>
              <option value="LGU+_MVNO">LG U+ 알뜰폰</option>
            </select>

            {/* 성별 */}
            <label className="block mb-1 font-medium">성별</label>
            <div className="flex gap-2 mb-2">
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

            {/* 내국인 / 외국인 */}
            <label className="block mb-1 font-medium">내국인 / 외국인</label>
            <div className="flex gap-2 mb-2">
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
          </motion.div>
        </AnimatePresence>
      )}

      {/* (4) 휴대전화 인증: step3Available 후 노출 */}
      {(() => {
        const step3Available =
          isEmailValid &&
          !emailError &&
          password.length >= 6 &&
          !passwordError &&
          confirmPassword === password &&
          name &&
          birthday6.length === 6 &&
          carrier &&
          gender;
        return step3Available;
      })() && (
        <AnimatePresence mode="wait">
          <motion.div
            key="step3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <hr className="my-4" />
            <h2 className="font-medium mb-2">휴대전화 인증</h2>

            {/* 휴대전화 */}
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">휴대전화 번호</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    setPhone(formatted);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onSendVerificationCode();
                    }
                  }}
                  className={`w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring text-sm bg-white ${phoneInputClass()}`}
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
              {phoneError && (
                <div className="text-sm text-red-500 mt-1">{phoneError}</div>
              )}
            </div>

            {/* 인증번호 입력폼 */}
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
                  <label className="block text-sm font-medium mb-1">
                    인증번호 입력
                  </label>

                  <div className="relative">
                    <input
                      ref={verificationCodeInputRef}
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          onVerifyCode();
                        }
                      }}
                      className={`w-full px-3 py-1 rounded-md border-gray-300 focus:outline-none focus:ring text-sm bg-white ${verificationInputClass()}`}
                      placeholder="인증번호"
                    />

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

                  {verificationError && (
                    <div className="text-sm text-red-500 mt-1">
                      {verificationError}
                    </div>
                  )}
                  {phoneStatus === "verified" && (
                    <div className="text-sm text-green-500 mt-1">
                      휴대전화 인증 완료
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      )}

      {/* (5) 약관 동의: 휴대폰 인증 완료 후 노출 */}
      {(() => {
        const step4Available =
          isEmailValid &&
          !emailError &&
          password.length >= 6 &&
          !passwordError &&
          confirmPassword === password &&
          name &&
          birthday6.length === 6 &&
          carrier &&
          gender &&
          phoneStatus === "verified";
        return step4Available;
      })() && (
        <AnimatePresence mode="wait">
          <motion.div
            key="step4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 bg-white"
          >
            <hr className="my-4" />
            <h2 className="font-medium mb-2">인증 약관 동의</h2>

            <label className="flex items-center mb-2 font-semibold text-blue-600">
              <input
                type="checkbox"
                className="mr-2"
                checked={agreeAll}
                onChange={(e) => handleAgreeAllChange(e.target.checked)}
              />
              [필수] 인증 약관 전체동의
            </label>

            <div className="pl-4 space-y-1 text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={agreePersonalInfo}
                  onChange={(e) => setAgreePersonalInfo(e.target.checked)}
                />
                개인정보 이용
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={agreeUniqueID}
                  onChange={(e) => setAgreeUniqueID(e.target.checked)}
                />
                고유식별정보 처리
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={agreeTelecom}
                  onChange={(e) => setAgreeTelecom(e.target.checked)}
                />
                통신사 이용약관
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={agreeCertService}
                  onChange={(e) => setAgreeCertService(e.target.checked)}
                />
                인증사 이용약관
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={agreeNaverPrivacy}
                  onChange={(e) => setAgreeNaverPrivacy(e.target.checked)}
                />
                네이버 개인정보수집
              </label>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* (6) 최종 버튼 */}
      {(() => {
        const step4Available =
          isEmailValid &&
          !emailError &&
          password.length >= 6 &&
          !passwordError &&
          confirmPassword === password &&
          name &&
          birthday6.length === 6 &&
          carrier &&
          gender &&
          phoneStatus === "verified";
        if (!step4Available) return null;

        const allAgreed =
          agreePersonalInfo &&
          agreeUniqueID &&
          agreeTelecom &&
          agreeCertService &&
          agreeNaverPrivacy;
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="final-button"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!allAgreed || !isFormValid()}
                className={`px-4 py-2 rounded font-bold mt-2 
                  ${
                    allAgreed && isFormValid()
                      ? "bg-blue-600 text-white cursor-pointer"
                      : "bg-gray-400 text-gray-700 cursor-not-allowed"
                  }`}
              >
                인증요청
              </button>
            </motion.div>
          </AnimatePresence>
        );
      })()}
    </div>
  );
}

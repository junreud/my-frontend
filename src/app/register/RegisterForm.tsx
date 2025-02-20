"use client";

import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// 하위 섹션 컴포넌트 임포트
import EmailPasswordForm from "@/components/LogInPage/EmailPasswordForm";
import PhoneVerificationForm from "@/components/LogInPage/PhoneVerificationForm";
import PersonalInfoForm from "@/components/LogInPage/PersonalInfoForm";
import MarketingPlatformSelector from "@/components/LogInPage/MarketingPlatformSelector";

// 가짜 중복 검사 함수
async function fakeCheckEmailDuplicate(email: string) {
    return new Promise<{ isDuplicate: boolean }>((resolve) => {
      setTimeout(() => {
        resolve({ isDuplicate: email === "test@example.com" });
      }, 1000);
    });
  }
  
  // 비밀번호 유효성 검사
  function validatePassword(password: string): boolean {
    const regex = /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }
  
  export default function RegisterForm() {
    // 이메일
    const [email, setEmail] = useState("");
    const [emailStatus, setEmailStatus] = useState<
      "idle" | "validating" | "valid" | "invalid"
    >("idle");
    const [emailError, setEmailError] = useState("");
  
    // 비밀번호
    const [password, setPassword] = useState("");
    const [isPasswordValid, setIsPasswordValid] = useState(false);
  
    // 휴대전화
    const [phone, setPhone] = useState("");
    const [phoneStatus, setPhoneStatus] = useState<
      "idle" | "sending" | "sent" | "verified" | "error"
    >("idle");
    const [phoneError, setPhoneError] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    // 인증번호 에러 별도 관리
    const [verificationError, setVerificationError] = useState("");
  
    // 개인신상
    const [name, setName] = useState("");
    const [ssnFront, setSsnFront] = useState("");
    const [ssnBackFirst, setSsnBackFirst] = useState("");
  
    // 마케팅 플랫폼
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  
    // 인증번호 입력창 포커스 Ref
    const verificationCodeInputRef = useRef<HTMLInputElement | null>(null);
  
    // 이메일 중복 검사 용
    const abortControllerRef = useRef<AbortController | null>(null);
  
    // 이메일 형식 체크
    const isEmailFormatValid = /^\S+@\S+\.\S+$/.test(email);
  
    // ───────────── 이메일 ─────────────
    const handleEmailChange = (value: string) => {
      setEmail(value);
      setEmailStatus("idle");
      setEmailError("");
    };
  
    const checkEmailDuplicateHandler = async () => {
      if (!email || !isEmailFormatValid) return;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      try {
        setEmailStatus("validating");
        setEmailError("");
        const { isDuplicate } = await fakeCheckEmailDuplicate(email);
        if (isDuplicate) {
          setEmailStatus("invalid");
          setEmailError("이미 존재하는 이메일입니다.");
        } else {
          setEmailStatus("valid");
        }
      } catch (err) {
        console.error(err);
        setEmailStatus("idle");
      } finally {
        abortControllerRef.current = null;
      }
    };
  
    // ───────────── 비밀번호 ─────────────
    const handlePasswordChange = (value: string) => {
      setPassword(value);
      setIsPasswordValid(validatePassword(value));
    };
  
    // ───────────── 휴대전화 인증 ─────────────
    const handlePhoneChange = (value: string) => {
      setPhone(value);
      setPhoneStatus("idle");
      setPhoneError("");
    };
  
    const sendVerificationCode = async () => {
        const rawDigits = phone.replace(/\D/g, "");

        // 한국 휴대폰은 보통 10 or 11자리
        if (rawDigits.length < 10 || rawDigits.length > 11) {
            setPhoneError("유효한 전화번호를 입력하세요.");
            return;
        }
        
        setPhoneStatus("sending");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setPhoneStatus("sent");
  
      // 가짜 API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPhoneStatus("sent");
  
      // 인증번호 전송 후 자동 포커스
      setTimeout(() => {
        verificationCodeInputRef.current?.focus();
      }, 100);
    };
  
    const handleVerificationCodeChange = (value: string) => {
      setVerificationCode(value);
      setVerificationError("");
    };
  
    const verifyCode = async () => {
      if (verificationCode === "123456") {
        setPhoneStatus("verified");
        setPhoneError("");
        setVerificationError("");
      } else {
        setVerificationError("인증번호가 일치하지 않습니다.");
      }
    };
  
    // ───────────── 개인신상 ─────────────
    const handleNameChange = (value: string) => {
      setName(value);
    };
  
    const handleSsnFrontChange = (value: string) => {
      setSsnFront(value);
    };
  
    const handleSsnBackFirstChange = (value: string) => {
      setSsnBackFirst(value);
    };
  
    // ───────────── 플랫폼 선택 ─────────────
    const handleTogglePlatform = (platformId: string) => {
      setSelectedPlatforms((prev) => {
        if (prev.includes(platformId)) {
          return prev.filter((id) => id !== platformId);
        }
        return [...prev, platformId];
      });
    };
  
    // ───────────── 최종 가입 ─────────────
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
  
      // 여기서는 모든 필드가 맞아야만 가입 가능
      const isAllValid =
        emailStatus === "valid" &&
        isPasswordValid &&
        phoneStatus === "verified" &&
        name &&
        ssnFront.length === 6 &&
        ssnBackFirst.length === 1 &&
        selectedPlatforms.length > 0;
  
      if (!isAllValid) {
        alert("아직 입력이 완료되지 않았습니다!");
        return;
      }
  
      alert("회원가입 성공!");
    };
  
    // 회원가입 버튼 활성화 조건
    const isSignUpEnabled =
      emailStatus === "valid" &&
      isPasswordValid &&
      phoneStatus === "verified" &&
      name &&
      ssnFront.length === 6 &&
      ssnBackFirst.length === 1 &&
      selectedPlatforms.length > 0;
  
    // 마케팅플랫폼 섹션 노출 조건
    // "주민번호 뒷자리까지 전부 입력이 끝나야 나타난다" -> name, ssnFront, ssnBackFirst가 모두 완료돼야 함
    const isPersonalInfoComplete =
      !!name && ssnFront.length === 6 && ssnBackFirst.length === 1;
  
    // 섹션 애니메이션
    const slideVariant = {
      initial: { opacity: 0, y: -8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
      transition: { duration: 0.3 },
    };
  
    return (
        <div>
          <h2 className="text-lg font-semibold mb-2">회원가입</h2>
  
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이메일 & 비밀번호 섹션 */}
            {/* <EmailPasswordForm
              email={email}
              onEmailChange={handleEmailChange}
              emailStatus={emailStatus}
              emailError={emailError}
              onCheckEmailDuplicate={checkEmailDuplicateHandler}
              password={password}
              isPasswordValid={isPasswordValid}
              onPasswordChange={handlePasswordChange}
            /> */}
  
            {/* 휴대전화 & 인증번호 섹션 */}
            <PhoneVerificationForm
              phone={phone}
              phoneStatus={phoneStatus}
              phoneError={phoneError}
              verificationCode={verificationCode}
              verificationError={verificationError}
              onPhoneChange={handlePhoneChange}
              onSendVerificationCode={sendVerificationCode}
              onVerificationCodeChange={handleVerificationCodeChange}
              onVerifyCode={verifyCode}
              verificationCodeInputRef={verificationCodeInputRef}
            />
  
            {/* 휴대전화 인증 완료 후 => 개인신상 정보 (항상 노출) */}
            <AnimatePresence mode="wait">
              {phoneStatus === "verified" && (
                <motion.div key="personal-info" {...slideVariant}>
                  <PersonalInfoForm
                    name={name}
                    onNameChange={handleNameChange}
                    ssnFront={ssnFront}
                    ssnBackFirst={ssnBackFirst}
                    onSsnFrontChange={handleSsnFrontChange}
                    onSsnBackFirstChange={handleSsnBackFirstChange}
                  />
  
                  {/* 주민번호 뒷자리까지 완료된 경우에만 => 마케팅플랫폼 섹션 노출 */}
                  {isPersonalInfoComplete && (
                    <motion.div key="marketing" {...slideVariant}>
                      <MarketingPlatformSelector
                        selectedPlatforms={selectedPlatforms}
                        onTogglePlatform={handleTogglePlatform}
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
  
            {/* 회원가입 버튼: 처음엔 비활성(회색), 모든 조건 만족 시 활성화(녹색) */}
            <button
              type="submit"
              disabled={!isSignUpEnabled}
              className={`w-full py-2 px-4 rounded-md text-sm  mt-6 font-medium ${
                isSignUpEnabled
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              회원가입
            </button>
          </form>
        </div>
    );
  }
"use client";

import React, { useState, useRef, useEffect } from "react";
import EmailInputSection from "./EmailInputSection";
import PasswordInputSection from "./PasswordInputSection";
import BasicInfoSection from "./BasicInfoSection";
import TermsAgreeSection from "./TermsAgreeSection";
import VerificationSection from "./VerificationSection";
import TermsDialogGroup from "./TermsDialogGroup";

import { checkEmailAvailability as apiCheckEmailAvailability } from "@/services/api";

// --------- 타입 정의 (예시) -----------
export type DialogOpenType =
  | "serviceTerm"
  | "privacyTerm"
  | "authTerm"
  | "thirdPartyTerm"
  | "marketingTerm"
  | null;

// --------- 유틸 함수 (휴대폰번호, 생년월일 포맷 등) -----------
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

function convertBirthday6ToYYYYMMDD(birthday6: string): string {
  if (birthday6.length !== 6) {
    return "";
  }
  const yy = parseInt(birthday6.slice(0, 2), 10);
  const prefix = yy <= 22 ? "20" : "19";
  return prefix + birthday6; // "YYMMDD" -> "19YYMMDD" or "20YYMMDD"
}

export default function IdentityVerificationForm() {
  // -------------------------------------------------
  // (1) 상태 (State)
  // -------------------------------------------------
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [name, setName] = useState("");
  const [birthday6, setBirthday6] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [operator, setOperator] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "">("");
  const [foreigner, setForeigner] = useState(false);

  // 약관
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeServiceTerm, setAgreeServiceTerm] = useState(false);
  const [agreePrivacyTerm, setAgreePrivacyTerm] = useState(false);
  const [agreeAuthTerm, setAgreeAuthTerm] = useState(false);
  const [agreeThirdPartyTerm, setAgreeThirdPartyTerm] = useState(false);
  const [agreeMarketingTerm, setAgreeMarketingTerm] = useState(false);

  const [dialogOpen, setDialogOpen] = useState<DialogOpenType>(null);

  // SMS 인증
  const [hasSentCode, setHasSentCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const verificationCodeInputRef = useRef<HTMLInputElement>(null!);


  // -------------------------------------------------
  // (2) 이메일 중복확인
  // -------------------------------------------------
  const validateEmail = async (value: string) => {
    setEmail(value);
    setEmailError("");
    setIsEmailValid(false);

    const regex = /\S+@\S+\.\S+/;
    if (!regex.test(value)) {
      setEmailError("이메일 형식이 올바르지 않습니다.");
      return;
    }

    const available = await apiCheckEmailAvailability(value);
    if (!available) {
      setEmailError("이미 가입된 이메일입니다.");
      return;
    }
    setIsEmailValid(true);
  };

  // -------------------------------------------------
  // (3) 비밀번호 체크
  // -------------------------------------------------
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+|}{":;'?/>.<,]).{8,}$/;

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError("");
    if (!passwordRegex.test(value)) {
      setPasswordError("영문+숫자+특수문자를 포함해 8자 이상이어야 합니다.");
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (password && value && password !== value) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      if (passwordError === "비밀번호가 일치하지 않습니다.") {
        setPasswordError("");
      }
    }
  };

  // -------------------------------------------------
  // (4) 휴대전화
  // -------------------------------------------------
  const handlePhoneChange = (value: string) => {
    setPhoneError("");
    const formatted = formatPhoneNumber(value);
    setPhone(formatted);
    const digits = formatted.replace(/\D/g, "");
    if (digits.length < 10) {
      setPhoneError("휴대전화 번호가 올바르지 않습니다.");
    }
  };

  // -------------------------------------------------
  // (5) 약관 전체 동의
  // -------------------------------------------------
  useEffect(() => {
    if (
      agreeServiceTerm &&
      agreePrivacyTerm &&
      agreeAuthTerm &&
      agreeThirdPartyTerm
    ) {
      setAgreeAll(true);
    } else {
      setAgreeAll(false);
    }
  }, [agreeServiceTerm, agreePrivacyTerm, agreeAuthTerm, agreeThirdPartyTerm]);

  const handleAgreeAllChange = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreeServiceTerm(checked);
    setAgreePrivacyTerm(checked);
    setAgreeAuthTerm(checked);
    setAgreeThirdPartyTerm(checked);
    setAgreeMarketingTerm(checked);
  };

  // -------------------------------------------------
  // (6) 전체 필드 유효성
  // -------------------------------------------------
  const allFieldsValid = () => {
    if (!isEmailValid || emailError) return false;
    if (!password || passwordError) return false;
    if (!confirmPassword || confirmPassword !== password) return false;
    if (!name) return false;
    if (!birthday6 || birthday6.length < 6) return false;
    if (!phone || phoneError) return false;
    if (!operator) return false;
    if (!gender) return false;
    // 필수 약관
    if (
      !agreeServiceTerm ||
      !agreePrivacyTerm ||
      !agreeAuthTerm ||
      !agreeThirdPartyTerm
    ) {
      return false;
    }
    return true;
  };

  // -------------------------------------------------
  // (7) SMS 인증 재전송
  // -------------------------------------------------
  const resendSMSCode = async () => {
    try {
      const birth = convertBirthday6ToYYYYMMDD(birthday6);
      const response = await fetch("http://localhost:4000/auth/send-sms-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ""),
          name,
          birth,
          operator,
          gender,
          foreigner,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert("재전송 실패: " + (errorData.message || "서버 오류"));
        return;
      }

      alert("인증번호를 다시 보냈습니다.");
      setVerificationError("");
      setVerificationCode("");
      setTimeout(() => {
        verificationCodeInputRef.current?.focus();
      }, 300);
    } catch (err) {
      console.error(err);
      alert("서버 오류");
    }
  };

  // -------------------------------------------------
  // (8) "인증하기" 또는 "가입하기" 클릭
  // -------------------------------------------------
  const onClickFinalButton = async () => {
    if (!hasSentCode) {
      // 아직 인증번호 전송 전 => 인증번호 요청
      try {
        const birth = convertBirthday6ToYYYYMMDD(birthday6);
        const response = await fetch("http://localhost:4000/auth/send-sms-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: phone.replace(/\D/g, ""),
            name,
            birth,
            operator,
            gender,
            foreigner,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          alert("인증번호 발송 실패: " + (errorData.message || "서버 오류"));
          return;
        }
        setHasSentCode(true);
        setVerificationError("");

        setTimeout(() => {
          verificationCodeInputRef.current?.focus();
        }, 300);
      } catch (err) {
        console.error(err);
        alert("서버 오류");
      }
    } else {
      // 인증번호 이미 전송됨 -> "가입하기"
      if (!verificationCode) {
        setVerificationError("인증번호를 입력해주세요.");
        return;
      }

      try {
        // 백엔드에서 "인증번호 검증 + 가입"을 한 번에 처리하는 라우트 (예: /auth/verify-and-signup)
        const response = await fetch("http://localhost:4000/auth/verify-and-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // 회원 정보
            email,
            password,
            name,
            birthday6,
            phone: phone.replace(/\D/g, ""),
            operator,
            gender,
            foreigner,
            agreeMarketingTerm,
            // 인증번호
            verificationCode,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.message === "INVALID_CODE") {
            setVerificationError("인증번호가 일치하지 않습니다.");
            return;
          }
          alert("가입 실패: " + (errorData.message || "서버 오류"));
          return;
        }

        const data = await response.json();
        alert("가입이 완료되었습니다! userId = " + data.user.id);

        // 가입 완료 후 페이지 이동 등
        // router.push("/somewhere");
      } catch (err) {
        console.error(err);
        alert("서버 오류");
      }
    }
  };

  // -------------------------------------------------
  // (9) 렌더링
  // -------------------------------------------------
  return (
    <div className="max-w-md mx-auto p-8 border border-gray-300 rounded-lg bg-white">
      <h1 className="text-xl font-bold mb-4 p-4">본인인증 가입폼 (예시)</h1>

      {/* (1) 이메일 */}
      <EmailInputSection
        email={email}
        setEmail={setEmail}
        emailError={emailError}
        validateEmail={validateEmail}
        isEmailValid={isEmailValid}
      />

      {/* (2) 비밀번호 */}
      <PasswordInputSection
        password={password}
        setPassword={handlePasswordChange}
        passwordError={passwordError}
        confirmPassword={confirmPassword}
        setConfirmPassword={handleConfirmPasswordChange}
      />

      {/* (3) 기본정보 */}
      <BasicInfoSection
        isEmailValid={isEmailValid}
        emailError={emailError}
        password={password}
        passwordError={passwordError}
        confirmPassword={confirmPassword}
        name={name}
        setName={setName}
        birthday6={birthday6}
        setBirthday6={setBirthday6}
        phone={phone}
        handlePhoneChange={handlePhoneChange}
        phoneError={phoneError}
        operator={operator}
        setOperator={setOperator}
        gender={gender}
        setGender={setGender}
        foreigner={foreigner}
        setForeigner={setForeigner}
      />

      {/* (4) 약관 */}
      <TermsAgreeSection
        isEmailValid={isEmailValid}
        emailError={emailError}
        password={password}
        passwordError={passwordError}
        confirmPassword={confirmPassword}
        agreeAll={agreeAll}
        handleAgreeAllChange={handleAgreeAllChange}
        agreeServiceTerm={agreeServiceTerm}
        setAgreeServiceTerm={setAgreeServiceTerm}
        agreePrivacyTerm={agreePrivacyTerm}
        setAgreePrivacyTerm={setAgreePrivacyTerm}
        agreeAuthTerm={agreeAuthTerm}
        setAgreeAuthTerm={setAgreeAuthTerm}
        agreeThirdPartyTerm={agreeThirdPartyTerm}
        setAgreeThirdPartyTerm={setAgreeThirdPartyTerm}
        agreeMarketingTerm={agreeMarketingTerm}
        setAgreeMarketingTerm={setAgreeMarketingTerm}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
      />

      {/* (5) 인증/가입 섹션 */}
      <VerificationSection
        allFieldsValid={allFieldsValid}
        hasSentCode={hasSentCode}
        onClickFinalButton={onClickFinalButton}
        verificationCode={verificationCode}
        setVerificationCode={setVerificationCode}
        verificationError={verificationError}
        setVerificationError={setVerificationError}
        verificationCodeInputRef={verificationCodeInputRef}
        // 새로 추가: 재전송
        onResendCode={resendSMSCode}
      />

      {/* (6) 약관 모달 */}
      <TermsDialogGroup dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} />
    </div>
  );
}

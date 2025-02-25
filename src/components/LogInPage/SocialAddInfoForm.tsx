"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 

/** 
 * 휴대전화 포맷팅 (01012345678 -> 010-1234-5678)
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

export default function SocialAddInfoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // (1) 이메일 (readOnly) - URL 파라미터로 받아옴
  const [email, setEmail] = useState("");
  // (2) 이름
  const [name, setName] = useState("");
  // (3) 생년월일(6자리)
  const [birthday6, setBirthday6] = useState("");
  // (4) 휴대전화
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  // (5) 통신사
  const [carrier, setCarrier] = useState("");
  // (6) 성별 / 내외국인
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "">("");
  const [foreigner, setForeigner] = useState(false);

  // (7) 약관 체크
  const [agreePersonalInfo, setAgreePersonalInfo] = useState(false);
  const [agreeUniqueID, setAgreeUniqueID] = useState(false);
  const [agreeTelecom, setAgreeTelecom] = useState(false);
  const [agreeCertService, setAgreeCertService] = useState(false);
  const [agreeNaverPrivacy, setAgreeNaverPrivacy] = useState(false);
  const [agreeAll, setAgreeAll] = useState(false);

  // ----------- 파라미터로 이메일 가져오기 -----------
  useEffect(() => {
    // 소셜 로그인 콜백에서 "?email=xxx"로 넘어왔다고 가정
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [searchParams]);

  // ----------- 약관 전체 동의 -----------
  const handleAgreeAllChange = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreePersonalInfo(checked);
    setAgreeUniqueID(checked);
    setAgreeTelecom(checked);
    setAgreeCertService(checked);
    setAgreeNaverPrivacy(checked);
  };

  // ----------- 휴대전화 입력 시 포맷팅 -----------
  const handlePhoneChange = (value: string) => {
    setPhoneError("");
    const formatted = formatPhoneNumber(value);
    setPhone(formatted);
    const digits = formatted.replace(/\D/g, "");
    if (digits.length < 10) {
      setPhoneError("휴대전화 번호가 올바르지 않습니다.");
    }
  };

  // ----------- 유효성 검사 -----------
  const allFieldsValid = () => {
    if (!email) return false; // 소셜에서 받은 이메일
    if (!name) return false;
    if (!birthday6 || birthday6.length < 6) return false;
    if (!phone || phoneError) return false;
    if (!carrier) return false;
    if (!gender) return false;
    if (
      !agreePersonalInfo ||
      !agreeUniqueID ||
      !agreeTelecom ||
      !agreeCertService ||
      !agreeNaverPrivacy
    ) {
      return false;
    }
    return true;
  };

  // ----------- 가입(추가정보 등록) 버튼 클릭 -----------
  const onClickSubmit = async () => {
    if (!allFieldsValid()) {
      alert("필수 항목을 모두 올바르게 입력해 주세요.");
      return;
    }

    try {
      // (1) 서버로 POST
      const response = await fetch("http://localhost:4000/auth/social-addinfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          birthday6,
          phone,
          carrier,
          gender,
          foreigner,
          agreePersonalInfo,
          agreeUniqueID,
          agreeTelecom,
          agreeCertService,
          agreeNaverPrivacy,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(
          "추가정보 등록 실패: " + (errorData.message || "서버 오류가 발생했습니다.")
        );
        return;
      }

      const data = await response.json();
      alert("가입(추가정보 등록)이 완료되었습니다!");

      // (2) 필요한 경우, 토큰이 응답에 포함되어 있다면 로컬스토리지에 저장
      // localStorage.setItem("accessToken", data.accessToken);
      // localStorage.setItem("refreshToken", data.refreshToken);

      // (3) 가입 완료 후 이동할 페이지 (예: 대시보드)
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("서버오류");
    }
  };

  // ----------- CSS 유틸 -----------
  const baseInputClass =
    "w-full px-3 py-1 rounded border focus:outline-none focus:ring text-sm bg-white";
  const phoneInputClass = phoneError
    ? "border-red-500 focus:ring-red-200"
    : "border-gray-300 focus:ring-blue-200";

  // ----------- JSX 렌더링 -----------
  return (
    <div className="max-w-md mx-auto p-8 border border-gray-300 rounded-lg bg-white">
      <h1 className="text-xl font-bold mb-4 p-4">소셜 회원가입 추가정보</h1>

      {/* 이메일 (readOnly) */}
      <div className="mb-3">
        <label className="block mb-1 font-medium">이메일 (수정 불가)</label>
        <input
          type="email"
          value={email}
          readOnly
          className={`${baseInputClass} border-gray-300 focus:ring-blue-200 bg-gray-100 text-gray-500`}
        />
      </div>

      {/* 이름 */}
      <div className="mb-3">
        <label className="block mb-1 font-medium">이름</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${baseInputClass} border-gray-300 focus:ring-blue-200`}
          placeholder="홍길동"
        />
      </div>

      {/* 생년월일(6자리) */}
      <div className="mb-3">
        <label className="block mb-1 font-medium">생년월일(6자리)</label>
        <input
          type="text"
          maxLength={6}
          value={birthday6}
          onChange={(e) => setBirthday6(e.target.value.replace(/\D/g, ""))}
          className={`${baseInputClass} border-gray-300 focus:ring-blue-200`}
          placeholder="YYMMDD"
        />
      </div>

      {/* 휴대전화 */}
      <div className="mb-3">
        <label className="block mb-1 font-medium">휴대전화</label>
        <input
          type="tel"
          placeholder="010-1234-5678"
          className={`${baseInputClass} ${phoneInputClass}`}
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
        />
        {phoneError && (
          <p className="text-red-500 text-sm mt-1">{phoneError}</p>
        )}
      </div>

      {/* 통신사 */}
      <div className="mb-3">
        <label className="block mb-1 font-medium">통신사</label>
        <select
          className={`${baseInputClass} border-gray-300 focus:ring-blue-200`}
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
      </div>

      {/* 성별 / 내외국인 */}
      <div className="mb-3">
        <label className="block mb-1 font-medium">성별</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setGender("MALE")}
            className={`px-3 py-1 border rounded ${
              gender === "MALE"
                ? "border-green-500 text-green-600"
                : "border-gray-300 text-gray-700"
            }`}
          >
            남자
          </button>
          <button
            type="button"
            onClick={() => setGender("FEMALE")}
            className={`px-3 py-1 border rounded ${
              gender === "FEMALE"
                ? "border-green-500 text-green-600"
                : "border-gray-300 text-gray-700"
            }`}
          >
            여자
          </button>
        </div>
      </div>

      <div className="mb-3">
        <label className="block mb-1 font-medium">내외국인</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setForeigner(false)}
            className={`px-3 py-1 border rounded ${
              foreigner === false
                ? "border-green-500 text-green-600"
                : "border-gray-300 text-gray-700"
            }`}
          >
            내국인
          </button>
          <button
            type="button"
            onClick={() => setForeigner(true)}
            className={`px-3 py-1 border rounded ${
              foreigner === true
                ? "border-green-500 text-green-600"
                : "border-gray-300 text-gray-700"
            }`}
          >
            외국인
          </button>
        </div>
      </div>

      {/* 약관 동의 */}
      <div className="mb-3 border p-3 bg-gray-50 rounded">
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            className="mr-2"
            checked={agreeAll}
            onChange={(e) => handleAgreeAllChange(e.target.checked)}
          />
          <span className="font-bold">전체 동의</span>
        </div>
        <div className="pl-4 space-y-1 text-sm">
          <div>
            <input
              type="checkbox"
              className="mr-2"
              checked={agreePersonalInfo}
              onChange={(e) => setAgreePersonalInfo(e.target.checked)}
            />
            개인정보 이용
          </div>
          <div>
            <input
              type="checkbox"
              className="mr-2"
              checked={agreeUniqueID}
              onChange={(e) => setAgreeUniqueID(e.target.checked)}
            />
            고유식별정보 처리
          </div>
          <div>
            <input
              type="checkbox"
              className="mr-2"
              checked={agreeTelecom}
              onChange={(e) => setAgreeTelecom(e.target.checked)}
            />
            통신사 이용약관
          </div>
          <div>
            <input
              type="checkbox"
              className="mr-2"
              checked={agreeCertService}
              onChange={(e) => setAgreeCertService(e.target.checked)}
            />
            인증사 이용약관
          </div>
          <div>
            <input
              type="checkbox"
              className="mr-2"
              checked={agreeNaverPrivacy}
              onChange={(e) => setAgreeNaverPrivacy(e.target.checked)}
            />
            네이버 개인정보수집
          </div>
        </div>
      </div>

      {/* 가입하기 버튼 */}
      <button
        type="button"
        onClick={onClickSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded"
      >
        가입하기
      </button>
    </div>
  );
}

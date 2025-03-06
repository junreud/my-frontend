"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

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

  // -----------------------------
  // [1] 기존 회원정보 상태들
  // -----------------------------
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [birthday6, setBirthday6] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [carrier, setCarrier] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "">("");
  const [foreigner, setForeigner] = useState(false);

  // (추가) 소셜 로그인 타입 (kakao, google 등)
  const [provider, setProvider] = useState("");

  // -----------------------------
  // [2] 약관 동의 상태
  //     (4개 필수 + 1개 선택 + 전체동의)
  // -----------------------------
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeServiceTerm, setAgreeServiceTerm] = useState(false);      // (필수)
  const [agreePrivacyTerm, setAgreePrivacyTerm] = useState(false);      // (필수)
  const [agreeAuthTerm, setAgreeAuthTerm] = useState(false);            // (필수)
  const [agreeThirdPartyTerm, setAgreeThirdPartyTerm] = useState(false); // (필수)
  const [agreeMarketingTerm, setAgreeMarketingTerm] = useState(false);  // (선택)

  // 약관 세부내용 펼치기/접기
  const [showTermsDetail, setShowTermsDetail] = useState(false);

  // -----------------------------
  // [3] url 파라미터에서 email, provider 받기 (수정됨)
  // -----------------------------
  useEffect(() => {
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }

    // provider도 URL 쿼리에서 가져오기
    const providerFromUrl = searchParams.get("provider");
    if (providerFromUrl) {
      setProvider(providerFromUrl);
    }
  }, [searchParams]);

  // -----------------------------
  // [4] 휴대전화 입력 시 포맷팅
  // -----------------------------
  const handlePhoneChange = (value: string) => {
    setPhoneError("");
    const formatted = formatPhoneNumber(value);
    setPhone(formatted);
    const digits = formatted.replace(/\D/g, "");
    if (digits.length < 10) {
      setPhoneError("휴대전화 번호가 올바르지 않습니다.");
    }
  };

  // -----------------------------
  // [5] 전체동의 체크 로직
  // -----------------------------
  const handleAgreeAllChange = (checked: boolean) => {
    setAgreeAll(checked);

    // 필수항목 전부 체크
    setAgreeServiceTerm(checked);
    setAgreePrivacyTerm(checked);
    setAgreeAuthTerm(checked);
    setAgreeThirdPartyTerm(checked);

    // 선택항목(마케팅 동의)
    setAgreeMarketingTerm(checked);
  };

  // 필수항목이 하나라도 false면 전체동의 = false
  // (각각의 체크 이벤트마다 호출)
  useEffect(() => {
    if (
      agreeServiceTerm &&
      agreePrivacyTerm &&
      agreeAuthTerm &&
      agreeThirdPartyTerm &&
      agreeMarketingTerm
    ) {
      setAgreeAll(true);
    } else if (
      agreeServiceTerm &&
      agreePrivacyTerm &&
      agreeAuthTerm &&
      agreeThirdPartyTerm &&
      !agreeMarketingTerm
    ) {
      // 선택항목만 빼고 모두 true일 수도...
      // 여기선 마케팅까지 체크해야 전체동의로 간주
      setAgreeAll(false);
    } else {
      setAgreeAll(false);
    }
  }, [agreeServiceTerm, agreePrivacyTerm, agreeAuthTerm, agreeThirdPartyTerm, agreeMarketingTerm]);

  // -----------------------------
  // [6] 유효성 검사
  // -----------------------------
  const allFieldsValid = () => {
    if (!email) return false;
    if (!name) return false;
    if (!birthday6 || birthday6.length < 6) return false;
    if (!phone || phoneError) return false;
    if (!carrier) return false;
    if (!gender) return false;

    // (필수) 약관들 체크 여부 확인
    if (!agreeServiceTerm) return false;
    if (!agreePrivacyTerm) return false;
    if (!agreeAuthTerm) return false;
    if (!agreeThirdPartyTerm) return false;

    // (선택) 마케팅 동의는 여기서 필수 아님
    return true;
  };

  // -----------------------------
  // [7] 가입(추가정보 등록) 버튼 클릭
  // -----------------------------
  const onClickSubmit = async () => {
    if (!allFieldsValid()) {
      alert("필수 항목과 필수 약관들을 모두 확인해 주세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/auth/social-addinfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // (추가) provider 값도 전송
          provider,
          email,
          name,
          birthday6,
          phone,
          carrier,
          gender,
          foreigner,

          // 실제 백엔드에는 마케팅 동의만 전송
          agreeMarketingTerm,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert("추가정보 등록 실패: " + (errorData.message || "서버 오류"));
        return;
      }
      await response.json();
      alert("가입(추가정보 등록)이 완료되었습니다!");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("서버 오류");
    }
  };

  // -----------------------------
  // [8] CSS 유틸
  // -----------------------------
  const baseInputClass =
    "w-full px-3 py-1 rounded border focus:outline-none focus:ring text-sm bg-white ";
  const phoneInputClass = phoneError
    ? "border-red-500 focus:ring-red-200"
    : "border-gray-300 focus:ring-blue-200";

  // -----------------------------
  // [9] 렌더링
  // -----------------------------
  return (
    <div className="min-h-screen flex flex-col items-center pt-24 pb-24 bg-white">
      <div className="max-w-md w-full mx-auto p-8 border border-gray-300 rounded-lg bg-white">
        <h1 className="text-xl font-bold mb-4 p-4 text-center">추가정보 입력</h1>


        {/* 이메일 (readOnly) */}
        <div className="mb-3">
          <label className="block mb-1 font-medium">이메일</label>
          <input
            type="email"
            value={email}
            readOnly
            className={`${baseInputClass} border-gray-300 bg-gray-100 text-gray-500`}
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

        {/* ---------------------------------------------------
            [약관 영역] : 4개 필수 + 1개 선택 + 전체동의
        --------------------------------------------------- */}
        <div className="mb-3 border rounded p-3 bg-gray-50">
          {/* 전체동의 + 펼치기/접기 토글 */}
          <div className="flex items-center justify-between mb-1">
            <label className="flex items-center font-bold text-black">
              <input
                type="checkbox"
                className="mr-2"
                checked={agreeAll}
                onChange={(e) => handleAgreeAllChange(e.target.checked)}
              />
              모든 약관에 전체 동의합니다.
            </label>
            <button
              type="button"
              onClick={() => setShowTermsDetail(!showTermsDetail)}
              className="text-gray-700 font-bold text-lg px-2"
              title={showTermsDetail ? "약관 숨기기" : "약관 펼치기"}
            >
              <span
                className={`inline-block transform transition-transform duration-300 ${
                  showTermsDetail ? "rotate-90" : ""
                }`}
              >
                ▶
              </span>
            </button>
          </div>

          {/* 펼치기 / 접기 내용 */}
          <AnimatePresence>
            {showTermsDetail && (
              <motion.div
                key="terms-detail"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                {/* (1) 서비스 이용약관 (필수) */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={agreeServiceTerm}
                      onChange={(e) => setAgreeServiceTerm(e.target.checked)}
                    />
                    <span className="font-medium">
                      서비스 이용약관 <span className="text-red-500">(필수)</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("서비스 이용약관 전문 보기")}
                    className="text-gray-700 font-bold text-lg px-2"
                  >
                    ▶
                  </button>
                </div>

                {/* (2) 개인정보 처리방침 (필수) */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={agreePrivacyTerm}
                      onChange={(e) => setAgreePrivacyTerm(e.target.checked)}
                    />
                    <span className="font-medium">
                      개인정보 처리방침 <span className="text-red-500">(필수)</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("개인정보 처리방침 전문 보기")}
                    className="text-gray-700 font-bold text-lg px-2"
                  >
                    ▶
                  </button>
                </div>

                {/* (3) 본인인증 관련 동의 (필수) */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={agreeAuthTerm}
                      onChange={(e) => setAgreeAuthTerm(e.target.checked)}
                    />
                    <span className="font-medium">
                      본인인증 관련 동의 <span className="text-red-500">(필수)</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("본인인증 동의 전문 보기")}
                    className="text-gray-700 font-bold text-lg px-2"
                  >
                    ▶
                  </button>
                </div>

                {/* (4) 제3자 제공 동의 (필수) */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={agreeThirdPartyTerm}
                      onChange={(e) => setAgreeThirdPartyTerm(e.target.checked)}
                    />
                    <span className="font-medium">
                      개인정보 제3자 제공 <span className="text-red-500">(필수)</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("제3자 제공 동의 전문 보기")}
                    className="text-gray-700 font-bold text-lg px-2"
                  >
                    ▶
                  </button>
                </div>

                {/* (5) 마케팅 및 광고성 정보 수신 동의 (선택) */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={agreeMarketingTerm}
                      onChange={(e) => setAgreeMarketingTerm(e.target.checked)}
                    />
                    <span className="font-medium">
                      마케팅 및 광고성 정보 수신 동의 (선택)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("마케팅 정보 동의 전문 보기")}
                    className="text-gray-700 font-bold text-lg px-2"
                  >
                    ▶
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
    </div>
  );
}

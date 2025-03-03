import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DialogOpenType } from "./types";

interface TermsAgreeSectionProps {
  isEmailValid: boolean;
  emailError: string;
  password: string;
  passwordError: string;
  confirmPassword: string;

  agreeAll: boolean;
  handleAgreeAllChange: (checked: boolean) => void;
  agreeServiceTerm: boolean;
  setAgreeServiceTerm: (val: boolean) => void;
  agreePrivacyTerm: boolean;
  setAgreePrivacyTerm: (val: boolean) => void;
  agreeAuthTerm: boolean;
  setAgreeAuthTerm: (val: boolean) => void;
  agreeThirdPartyTerm: boolean;
  setAgreeThirdPartyTerm: (val: boolean) => void;
  agreeMarketingTerm: boolean;
  setAgreeMarketingTerm: (val: boolean) => void;

  dialogOpen: DialogOpenType;
  setDialogOpen: (val: DialogOpenType) => void;
}

export default function TermsAgreeSection({
  isEmailValid,
  emailError,
  password,
  passwordError,
  confirmPassword,
  agreeAll,
  handleAgreeAllChange,
  agreeServiceTerm,
  setAgreeServiceTerm,
  agreePrivacyTerm,
  setAgreePrivacyTerm,
  agreeAuthTerm,
  setAgreeAuthTerm,
  agreeThirdPartyTerm,
  setAgreeThirdPartyTerm,
  agreeMarketingTerm,
  setAgreeMarketingTerm,
  setDialogOpen,
}: TermsAgreeSectionProps) {
  // 접고/펼치기
  const [showTermsDetail, setShowTermsDetail] = useState(false);

  return (
    <AnimatePresence>
      {isEmailValid &&
        !emailError &&
        password &&
        !passwordError &&
        confirmPassword &&
        confirmPassword === password && (
          <motion.div
            key="termsSection"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.7 }}
            className="overflow-hidden"
          >
            <hr className="my-4" />
            <div className="mb-2 border rounded p-3 bg-gray-50">
              {/* 전체동의 + 토글 버튼 한 줄 배치 */}
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

                {/* 삼각형 버튼 (짙은 회색) */}
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
                    {/* (1) 서비스 이용약관 */}
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
                        onClick={() => setDialogOpen("serviceTerm")}
                        className="text-gray-700 font-bold text-lg px-2"
                        title="전문 보기"
                      >
                        ▶
                      </button>
                    </div>

                    {/* (2) 개인정보 처리방침 */}
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
                        onClick={() => setDialogOpen("privacyTerm")}
                        className="text-gray-700 font-bold text-lg px-2"
                        title="전문 보기"
                      >
                        ▶
                      </button>
                    </div>

                    {/* (3) 본인인증 관련 동의 */}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={agreeAuthTerm}
                          onChange={(e) => setAgreeAuthTerm(e.target.checked)}
                        />
                        <span className="font-medium">
                          본인인증 관련 동의{" "}
                          <span className="text-red-500">(필수)</span>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDialogOpen("authTerm")}
                        className="text-gray-700 font-bold text-lg px-2"
                        title="전문 보기"
                      >
                        ▶
                      </button>
                    </div>

                    {/* (4) 제3자 제공 동의 */}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={agreeThirdPartyTerm}
                          onChange={(e) =>
                            setAgreeThirdPartyTerm(e.target.checked)
                          }
                        />
                        <span className="font-medium">
                          개인정보 제3자 제공 <span className="text-red-500">(필수)</span>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDialogOpen("thirdPartyTerm")}
                        className="text-gray-700 font-bold text-lg px-2"
                        title="전문 보기"
                      >
                        ▶
                      </button>
                    </div>

                    {/* (5) 마케팅 정보 수신 동의 (선택) */}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={agreeMarketingTerm}
                          onChange={(e) =>
                            setAgreeMarketingTerm(e.target.checked)
                          }
                        />
                        <span className="font-medium">
                          마케팅 및 광고성 정보 수신 동의 (선택)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDialogOpen("marketingTerm")}
                        className="text-gray-700 font-bold text-lg px-2"
                        title="전문 보기"
                      >
                        ▶
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
    </AnimatePresence>
  );
}

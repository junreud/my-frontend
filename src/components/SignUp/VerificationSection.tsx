import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VerificationSectionProps {
  allFieldsValid: () => boolean;
  hasSentCode: boolean;
  onClickFinalButton: () => Promise<void>;
  verificationCode: string;
  setVerificationCode: (val: string) => void;
  verificationError: string;
  setVerificationError: (val: string) => void;
  verificationCodeInputRef: React.RefObject<HTMLInputElement>;
  // 재전송 버튼을 누르면 실행할 함수 (부모에서 구현)
  onResendCode?: () => Promise<void>; 
}

export default function VerificationSection({
  allFieldsValid,
  hasSentCode,
  onClickFinalButton,
  verificationCode,
  setVerificationCode,
  verificationError,
  setVerificationError,
  verificationCodeInputRef,
  onResendCode, // 새로 추가
}: VerificationSectionProps) {
  return (
    <AnimatePresence>
      {allFieldsValid() && (
        <motion.div
          key="final-area"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.7 }}
          className="overflow-hidden mt-4"
        >
          {/* 인증번호 입력창 (인증번호를 보낸 후에만 표시) */}
          <AnimatePresence>
            {hasSentCode && (
              <motion.div
                key="verificationInput"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.7 }}
                className="mb-4"
              >
                <label className="block text-sm font-medium mb-1">
                  인증번호 입력
                </label>

                {/* 인증번호 + 재전송 버튼을 수평으로 배치 */}
                <div className="flex items-center gap-2">
                  <input
                    ref={verificationCodeInputRef}
                    type="text"
                    value={verificationCode}
                    onChange={(e) => {
                      setVerificationCode(e.target.value);
                      setVerificationError("");
                    }}
                    className={`w-full px-3 py-1 rounded border focus:outline-none focus:ring text-sm bg-white ${
                      verificationError?.includes("일치하지 않습니다")
                        ? "border-red-500 focus:ring-red-200"
                        : verificationCode.length > 0
                        ? "border-green-500 focus:ring-green-200"
                        : "border-gray-300 focus:ring-blue-200"
                    }`}
                    placeholder="인증번호 6자리"
                  />

                  {/* 재전송하기 버튼 */}
                  {onResendCode && (
                    <button
                      type="button"
                      onClick={onResendCode}
                      className="text-blue-600 underline text-sm"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      재전송하기
                    </button>
                  )}
                </div>

                {/* 인증번호 검증 에러 메시지 */}
                {verificationError && (
                  <p className="text-red-500 text-sm mt-1">
                    {verificationError}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 인증하기/가입하기 버튼 */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onClickFinalButton}
              className="px-4 py-2 rounded font-bold bg-blue-600 text-white hover:bg-blue-700"
            >
              {hasSentCode ? "가입하기" : "인증하기"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

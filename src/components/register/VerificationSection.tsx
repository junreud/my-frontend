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
          {/* 인증번호 입력창 (보낼 후) */}
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

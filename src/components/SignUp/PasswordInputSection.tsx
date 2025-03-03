import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PasswordInputSectionProps {
  password: string;
  setPassword: (value: string) => void;
  passwordError: string;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
}

export default function PasswordInputSection({
  password,
  setPassword,
  passwordError,
  confirmPassword,
  setConfirmPassword,
}: PasswordInputSectionProps) {
  // 비번/확인 입력창에 대한 테두리 색상 로직
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+|}{":;'?/>.<,]).{8,}$/;

  const passwordInputClass = () => {
    if (password && !passwordError && passwordRegex.test(password)) {
      return "border-green-500 focus:ring-green-200";
    }
    if (passwordError && !password.includes("일치하지 않습니다")) {
      return "border-red-500 focus:ring-red-200";
    }
    return "border-gray-300 focus:ring-blue-200";
  };

  const confirmPasswordInputClass = () => {
    if (confirmPassword && confirmPassword === password && !passwordError) {
      return "border-green-500 focus:ring-green-200";
    } else if (passwordError === "비밀번호가 일치하지 않습니다.") {
      return "border-red-500 focus:ring-red-200";
    }
    return "border-gray-300 focus:ring-blue-200";
  };

  return (
    <>
      <div className="mb-3">
        <label className="block mb-1 font-medium">비밀번호</label>
        <input
          type="password"
          value={password}
          placeholder="영문+숫자+특수문자 / 8자 이상"
          className={`w-full px-3 py-1 border rounded focus:outline-none focus:ring text-sm bg-white ${passwordInputClass()}`}
          onChange={(e) => setPassword(e.target.value)}
        />
        {passwordError && !password.includes("일치하지 않습니다") && (
          <p className="text-red-500 text-sm mt-1">{passwordError}</p>
        )}
      </div>

      <AnimatePresence>
        {password.length > 0 && (
          <motion.div
            key="confirmPassword"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-3 overflow-hidden"
          >
            <label className="block mb-1 font-medium">비밀번호 확인</label>
            <input
              type="password"
              value={confirmPassword}
              className={`w-full px-3 py-1 border rounded focus:outline-none focus:ring text-sm bg-white ${confirmPasswordInputClass()}`}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {passwordError === "비밀번호가 일치하지 않습니다." && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

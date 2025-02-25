import React from "react";


interface EmailInputSectionProps {
  email: string;
  setEmail: (value: string) => void;
  emailError: string;
  validateEmail: (value: string) => Promise<void>;
  isEmailValid: boolean;
}

export default function EmailInputSection({
  email,
  setEmail,
  emailError,
  validateEmail,
  isEmailValid,
}: EmailInputSectionProps) {
  // 테두리 색상 유틸
  const emailInputClass = () => {
    if (email && isEmailValid && !emailError) {
      return "border-green-500 focus:ring-green-200";
    }
    if (emailError) {
      return "border-red-500 focus:ring-red-200";
    }
    return "border-gray-300 focus:ring-blue-200";
  };

  return (
    <div className="mb-3">
      <label className="block mb-1 font-medium">이메일</label>
      <input
        type="email"
        value={email}
        placeholder="example@email.com"
        className={`w-full px-3 py-1 rounded border focus:outline-none focus:ring text-sm bg-white ${emailInputClass()}`}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={(e) => validateEmail(e.target.value)}
      />
      {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
    </div>
  );
}

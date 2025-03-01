// src/services/api.ts

/**
 * 공통 베이스 URL
 * 실제 프로덕션/개발 환경에 맞춰 바꿔야 합니다.
 */
const BASE_URL = "http://localhost:4000";

/**
 * (1) 이메일 중복 체크
 * @param email 이메일 문자열
 * @returns 중복 아님 = true, 중복임 = false
 */
export async function checkEmailAvailability(email: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/auth/check-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      console.error("checkEmailAvailability Error:", response.status);
      return false;
    }

    // 백엔드 응답 예: { available: true/false }
    const data = await response.json();
    return data.available;
  } catch (err) {
    console.error("checkEmailAvailability Exception:", err);
    return false;
  }
}

/**
 * (2) SMS 인증 코드 전송
 * @param phone "01012345678" 처럼 숫자만
 * @returns 성공이면 { ok: true, message?: string }, 실패면 { ok: false, message: string }
 */
export async function sendSmsCode(phone: string): Promise<{
  ok: boolean;
  message?: string;
}> {
  try {
    const response = await fetch(`${BASE_URL}/auth/send-sms-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { ok: false, message: errorData.message || "서버 오류" };
    }

    return { ok: true };
  } catch (err) {
    console.error("sendSmsCode Error:", err);
    return { ok: false, message: "네트워크 오류" };
  }
}

/**
 * (3) 회원가입
 * @param payload 회원가입에 필요한 필드들
 *  - 예: { email, password, name, phone, carrier, gender, ... }
 * @returns 성공 시 { ok: true, user?: any }, 실패 시 { ok: false, message }
 */
interface SignupPayload {
  email: string;
  password?: string;
  name: string;
  birthday6?: string;
  phone?: string;
  carrier?: string;
  gender?: string;
  foreigner?: boolean;
  // 약관
  agreeServiceTerm?: boolean;
  agreePrivacyTerm?: boolean;
  agreeAuthTerm?: boolean;
  agreeThirdPartyTerm?: boolean;
  agreeMarketingTerm?: boolean;

  // 인증번호
  verificationCode?: string;
  // etc...
}

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  carrier: string;
}
export async function signup(payload: SignupPayload): Promise<{
  ok: boolean;
  user?: User;
  message?: string;
}> {
  try {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { ok: false, message: errorData.message || "가입 실패" };
    }

    const data = await response.json();
    // data = { message, user: { id, email, ... } }
    return { ok: true, user: data.user };
  } catch (err) {
    console.error("signup Error:", err);
    return { ok: false, message: "네트워크 오류" };
  }
}

/**
 * (4) 로그인
 * @param email
 * @param password
 * @returns 성공 시 { ok: true, token?: string, user?: any }, 실패 시 { ok: false, message }
 */
export async function login(
  email: string,
  password: string
): Promise<{ ok: boolean; token?: string; user?: User; message?: string }> {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { ok: false, message: errorData.message || "로그인 실패" };
    }

    const data = await response.json();
    // data = { token, user, message? }
    return { ok: true, token: data.token, user: data.user };
  } catch (err) {
    console.error("login Error:", err);
    return { ok: false, message: "네트워크 오류" };
  }
}

// lib/jwt.ts (예시)
import jwt from 'jsonwebtoken'

const SECRET = process.env.ACCESS_TOKEN_SECRET || 'secret'; // 실제 키 사용

export function verifyJwt(token: string) {
  return jwt.verify(token, SECRET) as { userId: number, role: string, iat: number, exp: number };
}

// src/context/AuthContext.tsx
'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { fetchCurrentUser } from '@/lib/auth'

interface UserProfile {
  name: string
  email: string
  avatar: string
}

interface AuthContextProps {
  user: UserProfile | null
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    // 컴포넌트 마운트 시, 서버에서 사용자 정보를 한 번 가져옴
    fetchCurrentUser()
      .then((res) => {
        setUser(res)
      })
      .catch((err) => {
        console.error(err)
        // 에러 처리 로직 (ex. user = null)
        setUser(null)
      })
  }, [])

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  )
}

// Context 사용을 위한 커스텀 훅
export function useAuth() {
  return useContext(AuthContext)
}

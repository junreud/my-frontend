"use client"

import { useRouter } from "next/navigation" // App Router에서는 next/navigation
import { useEffect, useState } from "react"
import apiClient from "@/lib/apiClient"

/**
 * /dashboard 로 접근했을 때 토큰을 검사한 뒤,
 * 없으면 /login,
 * url_registration이 0이면 /welcomepage,
 * 그 외에는 /dashboard/home 으로 이동.
 */
export default function DashboardPage() {
  const router = useRouter()
  const [checkDone, setCheckDone] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      // 토큰이 없으면 /login 이동
      router.replace("/login")
      return
    }

    // 토큰이 있다면 백엔드로 me 요청
    apiClient
      .get("/api/user/me")
      .then((res) => {
        const { url_registration } = res.data
        if (url_registration === 0) {
          // 가입 완료 전이면 /welcomepage
          router.replace("/welcomepage")
        } else {
          // 정상 사용자면 /dashboard/home
          router.replace("/dashboard/home")
        }
      })
      .catch((err) => {
        console.error(err)
        // 에러 시(토큰 만료 등) 로그인 페이지
        router.replace("/login")
      })
      .finally(() => {
        setCheckDone(true)
      })
  }, [router])

  // 아직 검사 중(로딩)일 때 보여줄 스피너
  if (!checkDone) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-solid border-gray-300 border-t-transparent"></div>
      </div>
    )
  }

  // 토큰 검증이 끝나면 즉시 리다이렉트되므로, 실제로는 잠깐만 노출되거나 거의 노출 안 될 수 있음
  return (
    <div className="text-center pt-20">
      <p>Redirecting...</p>
    </div>
  )
}

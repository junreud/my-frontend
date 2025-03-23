"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useUser } from "@/hooks/useUser" // useUser 훅 import

// 아래는 원래 home/page.tsx에서 불러오던 컴포넌트들
import { AnimatedNumber } from "@/components/animations/AnimatedNumber"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import RankReviewChart from "@/components/dashboard/charts"

/**
 * /dashboard로 접근했을 때:
 * 1) 토큰 확인
 *   - 없으면 /login
 * 2) 토큰 유효 & url_registration === 0 → /welcomepage
 * 3) 나머지(정상 사용자)면 "대시보드 UI" 렌더
 */

export default function DashboardPage() {
  const router = useRouter()
  
  // useUser 훅으로 데이터 및 상태 관리
  const { data: user, isLoading, error: userError } = useUser()

  // 사용자 접근 권한: "정상적으로 대시보드 렌더해도 되는가?"
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // (A) 먼저 토큰 확인
    const token = localStorage.getItem("accessToken")
    if (!token) {
      // 토큰이 없으면 => 로그인 페이지로
      router.replace("/login")
      return
    }

    // (B) 백엔드 데이터 확인 (useUser 훅 결과 활용)
    if (!isLoading && user) {
      if (user.url_registration === 0) {
        // 가입 완료 전이면 /welcomepage
        router.replace("/welcomepage")
      } else {
        // 정상 사용자
        setIsAuthorized(true)
      }
    }
  }, [router, user, isLoading])

  // (C) 아직 서버 응답 대기 중이면 로딩 스피너
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-solid border-gray-300 border-t-transparent" />
      </div>
    )
  }

  // (D) 통신 완료 후, 에러가 있다면 에러 메시지 표시
  if (userError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-red-500">
        <div>
          <p className="mb-4">오류가 발생했습니다.</p>
          <p>{(userError as Error).message || "서버 연결 실패"}</p>
          {/* 필요 시, "재시도" 버튼 등 추가 */}
        </div>
      </div>
    )
  }

  // (E) 검증은 끝났지만 isAuthorized가 false 이면?
  // => 이미 useEffect에서 router.replace 했을 것이므로, 여기서는 잠깐 null
  //    (혹은 "리다이렉트중" 메시지)
  if (!isAuthorized) {
    return null
  }

  // -------------------------
  // (이하: 원래 home/page.tsx 내용)
  // -------------------------
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {/* 카드 1: Today’s Money */}
        <Card>
          <CardHeader>
            <CardTitle>Today’s Money</CardTitle>
            <CardDescription>+55% than last week</CardDescription>
          </CardHeader>
          <CardContent className="text-4xl font-bold text-green-600">
            <AnimatedNumber to={53} duration={2} />k
          </CardContent>
        </Card>

        {/* 카드 2: Today’s Users */}
        <Card>
          <CardHeader>
            <CardTitle>Today’s Users</CardTitle>
            <CardDescription>+3% than last month</CardDescription>
          </CardHeader>
          <CardContent className="text-4xl font-bold text-blue-600">
            <AnimatedNumber to={2300} duration={2} />
          </CardContent>
        </Card>

        {/* 카드 3: New Clients */}
        <Card>
          <CardHeader>
            <CardTitle>New Clients</CardTitle>
            <CardDescription>-2% than yesterday</CardDescription>
          </CardHeader>
          <CardContent className="text-4xl font-bold text-orange-600">
            <AnimatedNumber to={3462} duration={2} />
          </CardContent>
        </Card>
      </div>

      {/* 아래쪽: 그래프 + 키워드 테이블 영역 */}
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        {/* 그래프 */}
        <RankReviewChart />

        {/* 키워드 순위 테이블 */}
        <Card className="rounded-xl p-4">
          <h2 className="mb-2 text-lg font-semibold">내 키워드 현재 순위</h2>
          <div className="rounded bg-white p-2 shadow">
            <table className="w-full table-auto text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2">키워드</th>
                  <th className="p-2">현재순위</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">A키워드</td>
                  <td className="p-2">3위</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">B키워드</td>
                  <td className="p-2">5위</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">C키워드</td>
                  <td className="p-2">10위</td>
                </tr>
                <tr>
                  <td className="p-2">D키워드</td>
                  <td className="p-2">12위</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  )
}

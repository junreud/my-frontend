"use client"



import { AnimatedNumber } from "@/components/animations/AnimatedNumber"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import RankReviewChart from '@/components/dashboard/charts'
export default function DashboardHome() {



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
      <div className="relative w-full overflow-x-hidden">
            </div>
      {/* 아래쪽: 그래프 + 키워드 테이블 영역 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 그래프 */}
        <RankReviewChart />


        {/* 키워드 순위 테이블 */}
        <div className="rounded-xl bg-gray-100 p-4">
          <h2 className="mb-2 text-lg font-semibold">키워드별 노출 순위</h2>
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
        </div>
      </div>
    </>
  )
}
"use client"


import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"  // shadcn/ui 탭 컴포넌트
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card } from "../ui/card"

export default function RankReviewChart() {
  // (A) 2주간 “순위” 데이터 (예시)
  // day: 날짜, rank: 오늘 순위 (1 ~ 300)
  const rankData = [
    { day: "3/1", rank: 150 },
    { day: "3/2", rank: 140 },
    { day: "3/3", rank: 120 },
    { day: "3/4", rank: 105 },
    { day: "3/5", rank: 90 },
    { day: "3/6", rank: 100 },
    { day: "3/7", rank: 80 },
    { day: "3/8", rank: 75 },
    { day: "3/9", rank: 65 },
    { day: "3/10", rank: 60 },
    { day: "3/11", rank: 58 },
    { day: "3/12", rank: 55 },
    { day: "3/13", rank: 51 },
    { day: "3/14", rank: 49 },
  ]

  // (B) 2주간 “리뷰 수” 데이터 (예시)
  // day: 날짜, receiptReview: 영수증리뷰 수, blogReview: 블로그리뷰 수
  const reviewData = [
    { day: "3/1", receiptReview: 2, blogReview: 1 },
    { day: "3/2", receiptReview: 3, blogReview: 2 },
    { day: "3/3", receiptReview: 3, blogReview: 2 },
    { day: "3/4", receiptReview: 5, blogReview: 3 },
    { day: "3/5", receiptReview: 6, blogReview: 3 },
    { day: "3/6", receiptReview: 7, blogReview: 4 },
    { day: "3/7", receiptReview: 7, blogReview: 6 },
    { day: "3/8", receiptReview: 9, blogReview: 7 },
    { day: "3/9", receiptReview: 10, blogReview: 7 },
    { day: "3/10", receiptReview: 12, blogReview: 8 },
    { day: "3/11", receiptReview: 12, blogReview: 8 },
    { day: "3/12", receiptReview: 13, blogReview: 9 },
    { day: "3/13", receiptReview: 15, blogReview: 10 },
    { day: "3/14", receiptReview: 16, blogReview: 12 },
  ]

  return (
  <Card className="p-4">      
    <h2 className="mb-2 text-lg font-semibold">메인 키워드 순위변동 그래프</h2>
      <Tabs defaultValue="rank">
        <TabsList className="mb-4">
          <TabsTrigger value="rank">순위</TabsTrigger>
          <TabsTrigger value="review">리뷰</TabsTrigger>
        </TabsList>

        {/* (1) 순위 탭 */}
        <TabsContent value="rank">
          <div className="h-64 w-full bg-white rounded  flex items-center justify-center">
            {/* ResponsiveContainer: 반응형 차트 */}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rankData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                {/*
                  1위(상단) ~ 300위(하단)을 표시하기 위해 domain={[300, 1]} + reversed
                */}
                <YAxis domain={[300, 1]} reversed />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rank"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* (2) 리뷰 탭 */}
        <TabsContent value="review">
          <div className="h-64 w-full bg-white rounded shadow flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reviewData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                {/*
                  리뷰 개수: 0개 ~ 최대(데이터의 최대값)에 맞춰 자동으로 표시
                  domain은 자동으로 설정하려면 domain={["auto", "auto"]} 사용 가능
                */}
                <YAxis domain={[0, "auto"]} />
                <Tooltip />
                <Legend />
                {/* 영수증 리뷰 라인 */}
                <Line
                  type="monotone"
                  dataKey="receiptReview"
                  name="영수증 리뷰"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                {/* 블로그 리뷰 라인 */}
                <Line
                  type="monotone"
                  dataKey="blogReview"
                  name="블로그 리뷰"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

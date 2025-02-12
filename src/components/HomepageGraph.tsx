"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import {
  LineChart,
  CartesianGrid,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// 만약 실제로 "ChartContainer", "ChartTooltip", "ChartTooltipContent" 등을
// 내부에서 <ResponsiveContainer>로 감싸고 있다면, 아래 import와 구조를 맞춰주셔야 합니다.
import {
  ChartConfig,
  ChartContainer,        // 사용자 정의 차트 래퍼?
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// -------------------------------------------
// 1) 12월 1일부터 31일까지 데이터 예시
//    Y값이 1 ~ 300 사이
// -------------------------------------------
const chartData = [
  { month: "12.01", 순위: 186, mobile: 80 },
  { month: "12.02", 순위: 166, mobile: 80 },
  { month: "12.03", 순위: 146, mobile: 80 },
  { month: "12.04", 순위: 116, mobile: 80 },
  { month: "12.05", 순위: 86, mobile: 80 },
  { month: "12.06", 순위: 83, mobile: 80 },
  { month: "12.07", 순위: 86, mobile: 80 },
  { month: "12.08", 순위: 76, mobile: 80 },
  { month: "12.09", 순위: 72, mobile: 80 },
  { month: "12.10", 순위: 66, mobile: 80 },
  { month: "12.11", 순위: 62, mobile: 80 },
  { month: "12.12", 순위: 56, mobile: 80 },
  { month: "12.13", 순위: 46, mobile: 80 },
  { month: "12.14", 순위: 36, mobile: 80 },
  { month: "12.15", 순위: 31, mobile: 80 },
  { month: "12.16", 순위: 186, mobile: 80 },
  { month: "12.17", 순위: 186, mobile: 80 },
  { month: "12.18", 순위: 186, mobile: 80 },
  { month: "12.19", 순위: 186, mobile: 80 },
  { month: "12.20", 순위: 186, mobile: 80 },
  { month: "12.21", 순위: 186, mobile: 80 },
  { month: "12.22", 순위: 186, mobile: 80 },
  { month: "12.23", 순위: 186, mobile: 80 },
  { month: "12.24", 순위: 186, mobile: 80 },
  { month: "12.25", 순위: 186, mobile: 80 },
  { month: "12.26", 순위: 186, mobile: 80 },
  { month: "12.27", 순위: 186, mobile: 80 },
  { month: "12.28", 순위: 186, mobile: 80 },
  { month: "12.29", 순위: 186, mobile: 80 },
  { month: "12.30", 순위: 186, mobile: 80 },
  { month: "12.31", 순위: 186, mobile: 80 },
];

// -------------------------------------------
// 2) 차트 색상 구성 (shadcn-ui 예시)
// -------------------------------------------
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

// -------------------------------------------
// 3) 화면 크기에 따라 "데스크톱 / 모바일" 판별
//    - 단순히 768px 기준으로 예시
// -------------------------------------------
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };
    mediaQuery.addEventListener("change", handler);

    return () => {
      mediaQuery.removeEventListener("change", handler);
    };
  }, []);

  return isDesktop;
}

// -------------------------------------------
// 4) 최종 컴포넌트
// -------------------------------------------
export function Component() {
  const isDesktop = useIsDesktop();

  // PC에서는 X축의 모든 tick(31개) 표시 (interval={0})
  // 모바일(태블릿)에서는 tick 겹침 방지를 위해
  // interval={"preserveEnd"} (또는 "auto")로 설정
  const xAxisInterval = isDesktop ? 0 : "preserveEnd";

  return (
    <Card className="w-{1000px}">
      <CardHeader>
        <CardTitle>부평 헬스장</CardTitle>
        <CardDescription>2024-12-01 ~ 2024-12-31</CardDescription>
      </CardHeader>

      <CardContent className = "w-{1000px} h-{1000px}">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              // 차트 내부 마진
              margin={{ left: 2, right: 12 }}
            >
              {/* 가로선만 표시 (vertical={false}) */}
              <CartesianGrid vertical={false} strokeDasharray="3 3" />

              {/* X축: 날짜 (1~31일) */}
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={2}
                tick={{
                    angle: -30,
                    textAnchor: "end"
                }}
                // PC: interval={0} => 모두 표시
                // 모바일: interval={"preserveEnd"} => 일부 생략
                interval={xAxisInterval}
              />

              {/* Y축: 1(위) ~ 300(아래) 역방향 */}
              <YAxis
                domain={[1, 300]}
                reversed={true}
                tickLine={true}
                axisLine={true}
                tickMargin={12}
              />

              {/* 기본 툴팁(Recharts) -> 만약 shadcn-ui의 ChartTooltip 쓰면 아래처럼 */}
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />

              {/* 실제 라인 */}
              <Line
                dataKey="순위"
                type="monotone"
                stroke="var(--color-desktop)"
                strokeWidth={2}
                dot={{
                  fill: "var(--color-desktop)",
                }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for December (1~31)
        </div>
      </CardFooter>
    </Card>
  );
}

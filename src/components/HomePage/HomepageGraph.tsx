"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  CartesianGrid,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// -------------------------------------------------
// 1) 데이터 타입 및 실제 차트 데이터
// -------------------------------------------------
interface ChartItem {
  month: string; // X축 라벨
  순위: number;
  mobile: number;
}

const chartData: ChartItem[] = [
  { month: "12.04", 순위: 71, mobile: 80 },
  { month: "12.05", 순위: 71, mobile: 80 },
  { month: "12.06", 순위: 73, mobile: 80 },
  // ... (나머지는 동일)
  { month: "12.31", 순위: 3, mobile: 80 },
];

// -------------------------------------------------
// 2) ChartConfig 예시 (shadcn-ui)
// -------------------------------------------------
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

// -------------------------------------------------
// 3) 화면 크기에 따라 "PC/모바일" 구분
// -------------------------------------------------
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

// -------------------------------------------------
// 4) 커스텀 Tick 컴포넌트
// -------------------------------------------------
interface CustomAxisTickProps {
  x?: number;
  y?: number;
  payload?: {
    value: string;
  };
}

function CustomAxisTick({ x = 0, y = 0, payload }: CustomAxisTickProps) {
  if (!payload) return null;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <text
        transform="rotate(-30)"
        textAnchor="end"
        fill="#666"
        fontSize={12}
        dy={8}
      >
        {payload.value}
      </text>
    </g>
  );
}

// -------------------------------------------------
// 5) 최종 컴포넌트
// -------------------------------------------------
export function Component() {
  const isDesktop = useIsDesktop();
  // PC에서는 모든 라벨 표시 (interval={0}), 모바일은 "preserveEnd"
  const xAxisInterval = isDesktop ? 0 : "preserveEnd";

  return (
    <Card>
      <CardHeader>
        <CardTitle>부평 헬스장</CardTitle>
        <CardDescription>2024-12-01 ~ 2024-12-31</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ left: 2, right: 12 }}
            >
              {/* 세로선 제거, 가로선만 */}
              <CartesianGrid vertical={false} strokeDasharray="3 3" />

              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={1}
                interval={xAxisInterval}
                tick={<CustomAxisTick />} // 회전 라벨
              />
              {/* "순위"가 낮을수록 상단이므로 reversed=true */}
              <YAxis
                domain={[0, "dataMax"]}
                reversed
                tickLine
                axisLine
                tickMargin={10}
              />

              {/* shadcn-ui Tooltips 예시 */}
              <ChartTooltip
                cursor
                content={<ChartTooltipContent hideLabel />}
              />

              {/* 실제 라인 (순위) */}
              <Line
                dataKey="순위"
                type="monotone"
                stroke="var(--color-desktop)"
                strokeWidth={3}
                dot={{ fill: "var(--color-desktop)" }}
                activeDot={{ r: 1 }}
              />

              {/* 필요하다면 mobile 라인 추가도 가능
              <Line
                dataKey="mobile"
                type="monotone"
                stroke="var(--color-mobile)"
                strokeWidth={3}
                dot={{ fill: "var(--color-mobile)" }}
                activeDot={{ r: 1 }}
              /> 
              */}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      {/* 
      <CardFooter>...필요시</CardFooter>
      */}
    </Card>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
} from "recharts";

// shadcn/ui 예시 - 실제 프로젝트에 맞춰 import 경로/이름 수정
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

// -----------------------------
// 1) 예시 데이터 (DB에서 가져올 형식을 가정)
// -----------------------------
interface ChartDataItem {
  date: string;    // x축 (예: 12.01, 12.02 등)
  desktop: number; // 첫 번째 라인
  mobile: number;  // 두 번째 라인
}

// -----------------------------
// 2) 라인(Series) 설정 타입
// -----------------------------
interface LineSeries {
  dataKey: keyof ChartDataItem; // "desktop" | "mobile" 등
  label: string;                // Tooltip/Legend 등에 쓰일 라벨
  stroke: string;               // 선 색상
}

// -----------------------------
// 3) Prop: data, lines, title 등
// -----------------------------
interface ChartTwoLinesProps {
  title?: string;            // 카드 타이틀
  description?: string;      // 카드 설명
  data: ChartDataItem[];     // 실제 차트 데이터
  lines: LineSeries[];       // 몇 개의 라인을 그릴지 설정
}
interface CustomAxisTickProps {
  x?: number;
  y?: number;
  payload?: {
    value: string;  // 여기서 'value'를 문자열로 가정
    index?: number;
  };
}
// -----------------------------
// 4) 화면 크기에 따라 tick 표시 갯수 조정 (예시)
// -----------------------------
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);

    const handler = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };
    mq.addEventListener("change", handler);

    return () => {
      mq.removeEventListener("change", handler);
    };
  }, []);

  return isDesktop;
}

// -----------------------------
// 5) 커스텀 Tick 컴포넌트
// -----------------------------
// 2) 커스텀 Tick 컴포넌트
function CustomAxisTick({
  x = 0,
  y = 0,
  payload,
}: CustomAxisTickProps) {
  if (!payload) return null;

  return (
    <g transform={`translate(${x},${y})`}>
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

// -----------------------------
// 6) 최종 컴포넌트
// -----------------------------
export function ChartTwoLines({
  title = "부평 헬스장",
  description = "2024-12-01 ~ 2024-12-31",
  data,
  lines,
}: ChartTwoLinesProps) {
  const isDesktop = useIsDesktop();
  // 데스크톱이면 X축 모든 라벨 표시( interval={0} ),
  // 모바일이면 라벨 일부만( "preserveEnd" )
  const xAxisInterval = isDesktop ? 0 : "preserveEnd";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={{} as ChartConfig /* 필요시 설정 */}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ left: 2, right: 12 }} // 원하는 값 조정
            >
              {/* 배경 그리드, 가로선만 표시 */}
              <CartesianGrid vertical={false} strokeDasharray="3 3" />

              {/* XAxis에서 dataKey="date" 사용 + 커스텀 Tick */}
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={1}
                tick={<CustomAxisTick />}
                interval={xAxisInterval}
              />

              {/* Y축 설정: 순위가 낮을수록 높은 값 -> reversed 옵션 예시 */}
              <YAxis
                domain={[0, "dataMax"]}
                reversed
                tickLine
                axisLine
                tickMargin={10}
              />

              {/* Tooltip (shadcn 예시) */}
              <ChartTooltip
                cursor
                content={<ChartTooltipContent hideLabel />}
              />

              {/* 여러 라인을 동적으로 렌더링 */}
              {lines.map((line) => (
                <Line
                  key={line.dataKey.toString()}
                  dataKey={line.dataKey}
                  stroke={line.stroke}
                  strokeWidth={3}
                  dot={{ fill: line.stroke }}
                  activeDot={{ r: 4 }}
                  type="monotone"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

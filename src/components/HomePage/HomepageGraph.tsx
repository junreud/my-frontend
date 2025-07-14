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

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// -------------------------------------------------
// 1) 데이터 타입
// -------------------------------------------------
interface ChartItem {
  month: string; // X축 라벨
  순위: number;
  mobile: number;
}

interface BusinessData {
  placeId: string;
  businessName: string;
  keyword: string;
  rankings: ChartItem[];
}

// 실제 데이터가 없을 때 사용할 기본 차트 데이터
const defaultChartData: ChartItem[] = [
  { month: "12.04", 순위: 71, mobile: 80 },
  { month: "12.05", 순위: 71, mobile: 80 },
  { month: "12.06", 순위: 73, mobile: 80 },
  { month: "12.07", 순위: 68, mobile: 80 },
  { month: "12.08", 순위: 65, mobile: 80 },
  { month: "12.09", 순위: 62, mobile: 80 },
  { month: "12.10", 순위: 58, mobile: 80 },
  { month: "12.11", 순위: 55, mobile: 80 },
  { month: "12.12", 순위: 52, mobile: 80 },
  { month: "12.13", 순위: 48, mobile: 80 },
  { month: "12.14", 순위: 45, mobile: 80 },
  { month: "12.15", 순위: 42, mobile: 80 },
  { month: "12.16", 순위: 38, mobile: 80 },
  { month: "12.17", 순위: 35, mobile: 80 },
  { month: "12.18", 순위: 32, mobile: 80 },
  { month: "12.19", 순위: 28, mobile: 80 },
  { month: "12.20", 순위: 25, mobile: 80 },
  { month: "12.21", 순위: 22, mobile: 80 },
  { month: "12.22", 순위: 18, mobile: 80 },
  { month: "12.23", 순위: 15, mobile: 80 },
  { month: "12.24", 순위: 12, mobile: 80 },
  { month: "12.25", 순위: 8, mobile: 80 },
  { month: "12.26", 순위: 5, mobile: 80 },
  { month: "12.27", 순위: 4, mobile: 80 },
  { month: "12.28", 순위: 3, mobile: 80 },
  { month: "12.29", 순위: 2, mobile: 80 },
  { month: "12.30", 순위: 1, mobile: 80 },
  { month: "12.31", 순위: 1, mobile: 80 },
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
// 3) 랜덤 업체/키워드 데이터 생성 및 API 연동 로직
// -------------------------------------------------
async function getRandomBusinessData(): Promise<BusinessData> {
  try {
    console.log('[HomepageGraph] API 호출 시작');
    // 실제 API 호출을 통해 5위 이내 업체의 키워드 데이터를 가져오기
    const response = await fetch('/api/keyword/top-rankings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[HomepageGraph] API 응답 상태:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('[HomepageGraph] API 데이터:', data);
      if (data && data.length > 0) {
        // 랜덤으로 하나의 업체/키워드 조합 선택
        const randomItem = data[Math.floor(Math.random() * data.length)];
        console.log('[HomepageGraph] 선택된 랜덤 업체:', randomItem);
        return {
          placeId: randomItem.placeId,
          businessName: randomItem.businessName,
          keyword: randomItem.keyword,
          rankings: randomItem.rankings || []
        };
      }
    }
  } catch (error) {
    console.error('[HomepageGraph] Error fetching random business data:', error);
  }

  // API 호출 실패 시 기본 데이터 반환
  console.log('[HomepageGraph] API 실패, mock 데이터 사용');
  return generateMockBusinessData();
}

function generateMockBusinessData(): BusinessData {
  const mockBusinesses = [
    { name: "부평 헬스장", keyword: "부평 헬스장" },
    { name: "송도 카페", keyword: "송도 카페" },
    { name: "인천 피트니스", keyword: "인천 피트니스" },
    { name: "연수구 맛집", keyword: "연수구 맛집" },
    { name: "구월동 병원", keyword: "구월동 병원" }
  ];

  const randomBusiness = mockBusinesses[Math.floor(Math.random() * mockBusinesses.length)];
  
  // 랜덤하게 순위가 개선되는 차트 데이터 생성
  const rankings: ChartItem[] = [];
  let currentRank = Math.floor(Math.random() * 80) + 20; // 20-100 사이에서 시작
  
  for (let i = 4; i <= 31; i++) {
    // 점진적으로 순위 개선 (약간의 변동성 포함)
    const variation = Math.floor(Math.random() * 6) - 3; // -3 ~ +3
    currentRank = Math.max(1, Math.min(100, currentRank - 2 + variation));
    
    rankings.push({
      month: `12.${i.toString().padStart(2, '0')}`,
      순위: currentRank,
      mobile: 80
    });
  }

  return {
    placeId: `mock-${Math.random().toString(36).substr(2, 9)}`,
    businessName: randomBusiness.name,
    keyword: randomBusiness.keyword,
    rankings
  };
}

// -------------------------------------------------
// 4) 화면 크기에 따라 "PC/모바일" 구분
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
// 5) 커스텀 Tick 컴포넌트
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
// 6) 최종 컴포넌트
// -------------------------------------------------
export function Component() {
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDesktop = useIsDesktop();

  // 컴포넌트 마운트 시 랜덤 데이터 로드
  useEffect(() => {
    console.log('[HomepageGraph] 컴포넌트 마운트됨');
    loadRandomData();
  }, []);

  const loadRandomData = async () => {
    try {
      console.log('[HomepageGraph] 데이터 로딩 시작');
      setIsLoading(true);
      setError(null);
      
      // API 호출 시도
      let data: BusinessData;
      try {
        console.log('[HomepageGraph] API 호출 시작');
        data = await getRandomBusinessData();
        console.log('[HomepageGraph] API 호출 성공:', data);
      } catch (apiError) {
        console.warn('[HomepageGraph] API 호출 실패, mock 데이터 사용:', apiError);
        data = generateMockBusinessData();
        console.log('[HomepageGraph] Mock 데이터 생성:', data);
      }
      
      setBusinessData(data);
    } catch (err) {
      console.error('[HomepageGraph] 전체 프로세스 에러:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      // 최종 폴백으로 mock 데이터 제공
      const fallbackData = generateMockBusinessData();
      console.log('[HomepageGraph] 최종 폴백 데이터 사용:', fallbackData);
      setBusinessData(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  // PC에서는 모든 라벨 표시 (interval={0}), 모바일은 "preserveEnd"
  const xAxisInterval = isDesktop ? 0 : "preserveEnd";

  console.log('[HomepageGraph] 렌더링 상태:', { isLoading, error, hasData: !!businessData });

  if (isLoading) {
    console.log('[HomepageGraph] 로딩 중...');
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error && !businessData) {
    console.log('[HomepageGraph] 에러 상태:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">오류</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={loadRandomData} variant="outline">
            다시 시도
          </Button>
        </CardContent>
      </Card>
    );
  }

  const chartData = businessData?.rankings || defaultChartData;
  console.log('[HomepageGraph] 차트 데이터:', chartData);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{businessData?.businessName || "실제 업체 사례"}</CardTitle>
            <CardDescription>
              키워드: {businessData?.keyword || "키워드 예시"} | 2024-12-01 ~ 2024-12-31
            </CardDescription>
          </div>
          <Button 
            onClick={loadRandomData} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            다른 사례 보기
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ left: 2, right: 12, top: 20, bottom: 5 }}
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
                domain={[1, 100]}
                reversed
                tickLine
                axisLine
                tickMargin={10}
                type="number"
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
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ fill: "#2563eb", r: 4 }}
                activeDot={{ r: 6, fill: "#1d4ed8" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

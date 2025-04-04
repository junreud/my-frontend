"use client"

import React, { useMemo } from 'react';
import {
  Tabs, TabsList, TabsTrigger, TabsContent
} from "@/components/ui/tabs";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Card } from "../ui/card";
import { useKeywordRankingDetails } from "@/hooks/useKeywordRankingDetails";
import { useBusinessSwitcher } from "@/hooks/useBusinessSwitcher";
import { Box, Skeleton } from '@mui/material';
import { KeywordHistoricalData } from '@/types';

// Define types for the tooltip formatter
type FormatterValue = string | number | readonly (string | number)[];
type FormatterName = string;

export default function DashboardChart() {
  const { activeBusiness } = useBusinessSwitcher();
  const { data: keywordData } = useKeywordRankingDetails({
    placeId: activeBusiness?.place_id,
    keyword: activeBusiness?.main_keyword
  });

  const processedData: KeywordHistoricalData[] = useMemo(() => {
    console.log("원본 차트 데이터:", keywordData?.chartData);
    console.log("활성 업체 ID:", activeBusiness?.place_id);

    if (!keywordData?.chartData || keywordData.chartData.length === 0) {
      console.log("차트 데이터가 없거나 비어 있습니다");
      return [];
    }

    let myBusinessData = keywordData.chartData;

    if (activeBusiness?.place_id) {
      console.log("업체 ID 타입:", typeof activeBusiness.place_id);
      console.log("첫 데이터의 ID 타입:", typeof myBusinessData[0]?.place_id);

      const filtered = myBusinessData.filter(item => 
        String(item.place_id) === String(activeBusiness.place_id)
      );

      console.log(`필터링 결과: ${filtered.length}건`);

      if (filtered.length > 0) {
        myBusinessData = filtered;
      } else {
        console.log("일치하는 업체가 없어 전체 데이터 사용");
      }
    }

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const filteredData = myBusinessData
      .filter(item => {
        try {
          const itemDate = new Date(item.date);
          return !isNaN(itemDate.getTime()) && itemDate >= twoWeeksAgo;
        } catch  {
          console.error("날짜 변환 오류:", item.date);
          return false;
        }
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log(`날짜 필터링 후: ${filteredData.length}건`);

    return filteredData.length > 0 ? filteredData : myBusinessData;
  }, [keywordData?.chartData, activeBusiness?.place_id]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

if (!processedData.length) {
  return (
    <Card className="p-4 flex flex-col justify-center items-center" style={{ minHeight: 300 }}>
      <h2 className="mb-2 text-lg font-semibold">메인 키워드 순위변동 그래프</h2>
      <div className="flex items-center justify-center w-full h-64">
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          height: '80%',
          width: '100%',
          justifyContent: 'center'
        }}>
          <Skeleton variant="rounded" width="15%" height="40%" sx={{ mx: 0.5, borderRadius: '8px' }} />
          <Skeleton variant="rounded" width="15%" height="60%" sx={{ mx: 0.5, borderRadius: '8px' }} />
          <Skeleton variant="rounded" width="15%" height="80%" sx={{ mx: 0.5, borderRadius: '8px' }} />
          <Skeleton variant="rounded" width="15%" height="50%" sx={{ mx: 0.5, borderRadius: '8px' }} />
          <Skeleton variant="rounded" width="15%" height="70%" sx={{ mx: 0.5, borderRadius: '8px' }} />
        </Box>
      </div>
    </Card>
  );
}

  return (
    <Card className="p-4 flex flex-col justify-center items-center" style={{ minHeight: 300 }}>
    <h2 className="mb-2 text-lg font-semibold">메인 키워드 순위변동 그래프</h2>
    <div className="flex items-center justify-center w-full h-64">
      <Tabs defaultValue="rank" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="rank">순위</TabsTrigger>
          <TabsTrigger value="review">리뷰</TabsTrigger>
        </TabsList>

        <TabsContent value="rank" className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={processedData} 
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} />
              <YAxis domain={[1, Math.max(...processedData.map(d => d.ranking), 10)]} reversed />
              <Tooltip 
                formatter={(value: FormatterValue) => [`${value}위`, '순위']}
                labelFormatter={(label: string) => {
                  const date = new Date(label);
                  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="ranking"
                name="순위"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>
        <TabsContent value="review" className="h-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                data={processedData} 
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis domain={[0, 'auto']} />
                <Tooltip 
                    formatter={(value: FormatterValue, name: FormatterName) => [
                    value, 
                    name === 'blog_review_count' ? '블로그 리뷰' : '영수증 리뷰'
                    ]}
                    labelFormatter={(label: string) => {
                    const date = new Date(label);
                    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
                    }}
                />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="blog_review_count"
                    name="블로그 리뷰" 
                    stroke="#1e88e5"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                />
                <Line
                    type="monotone"
                    dataKey="receipt_review_count"
                    name="영수증 리뷰"
                    stroke="#4caf50"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                />
                </LineChart>
            </ResponsiveContainer>
            </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend
} from "recharts";
import { useBusinessSwitcher } from "@/hooks/useBusinessSwitcher";

interface ChartDataItem {
  date: string;
  ranking: number;
  savedCount: number;
  blog_review_count: number;
  receipt_review_count: number;
}

interface KeywordAccordionContentProps {
  keyword: string;
}

export const KeywordAccordionContent: React.FC<KeywordAccordionContentProps> = ({ keyword }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const { activeBusiness } = useBusinessSwitcher();

  useEffect(() => {
    // Simulate data loading
    const loadData = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 500));
      
      // Generate mock data for the chart
      const today = new Date();
      const mockData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - (29 - i));
        
        // Create more realistic rank progression data
        const baseRanking = Math.floor(Math.random() * 5) + 5; // Base rank between 5-10
        const dailyVariation = Math.floor(Math.random() * 3) - 1; // Daily change between -1 and +1
        const ranking = Math.max(1, baseRanking + dailyVariation * i % 5);
        
        return {
          date: date.toISOString().split('T')[0],
          ranking: ranking,
          savedCount: Math.floor(Math.random() * 50) + 20,
          blog_review_count: Math.floor(Math.random() * 30) + 10,
          receipt_review_count: Math.floor(Math.random() * 15) + 5,
        };
      });
      
      setChartData(mockData);
      setLoading(false);
    };
    
    loadData();
  }, [keyword, activeBusiness?.place_id]);

  // 차트용 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (loading) {
    return (
      <div className="h-[250px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">데이터 로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 순위 그래프 */}
      <div>
        <h4 className="text-sm font-medium ml-4 mb-2 text-gray-700">순위 변화</h4>
        <div className="h-[250px] bg-white p-2 rounded-md">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                stroke="#666"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[1, 20]} 
                reversed 
                stroke="#666"
                tick={{ fontSize: 10 }}
                tickCount={7}
                label={{ value: '순위', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number | string) => [`${value}위`, '순위']}
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
                activeDot={{ r: 5 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
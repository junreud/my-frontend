import React, { useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend
} from "recharts";
import { KeywordRankingChartProps } from '@/types';

const KeywordRankingChart: React.FC<KeywordRankingChartProps> = ({ chartData, activeBusiness }) => {
  // 데이터 디버깅 로그 추가
  console.log('[Debug] KeywordRankingChart 입력 데이터:', {
    chartDataLength: chartData?.length || 0,
    sampleItem: chartData && chartData.length > 0 ? chartData[0] : null,
    activeBusiness
  });

  // 날짜별로 데이터 처리 (중복 제거)
  const processedData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];

    let myBusinessData = [];
    if (activeBusiness?.place_id) {
      const activeId = String(activeBusiness.place_id);

      myBusinessData = chartData.filter(item => 
        String(item.place_id) === activeId
      );

      if (myBusinessData.length === 0) {
        myBusinessData = chartData;
      }
    } else {
      myBusinessData = chartData;
    }

    const dateMap = new Map();
    myBusinessData.forEach(item => {
      const dateOnly = item.date?.split('T')[0] || item.date;
      if (dateOnly) {
        dateMap.set(dateOnly, item);
      }
    });

    const uniqueData = Array.from(dateMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const filteredData = uniqueData.filter(item => 
      new Date(item.date) >= thirtyDaysAgo
    );

    // 처리된 데이터 디버깅
    console.log('[Debug] KeywordRankingChart 처리된 데이터:', { 
      filteredDataLength: filteredData.length,
      sampleItem: filteredData.length > 0 ? filteredData[0] : null
    });

    return filteredData;
  }, [chartData, activeBusiness]);
  
  // 현재 순위를 기준으로 Y축 범위 계산
  const rankingYAxisDomain = useMemo(() => {
    if (!processedData || processedData.length === 0) return [1, 10];
  
    const ranks = processedData.map((d) => d.ranking);
    const maxRank = Math.max(...ranks, 10);
    // 상단 1등 고정, domain은 [1, 최고 순위]
    return [1, maxRank];
  }, [processedData]);
  
  // 차트용 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Utility function to calculate optimal Y-axis domain
  const calculateOptimalYAxisDomain = (values: number[]) => {
    if (!values.length) return [0, 10];
    
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;

    const yMin = 0; // Start from 0
    let yMax;

    if (range === 0) {
      yMax = maxValue === 0 ? 10 : maxValue * 1.5;
    } else if (maxValue < 10) {
      yMax = 10;
    } else if (range < maxValue * 0.1) {
      yMax = maxValue + (maxValue * 0.2);
    } else {
      yMax = maxValue + Math.ceil(range * 0.2);
    }

    return [yMin, Math.ceil(yMax)];
  };

  // Review graph Y-axis domain - 필드명 수정 (blogReviews -> blog_review_count)
  const reviewYAxisDomain = useMemo(() => {
    if (!processedData || processedData.length === 0) return [0, 10];

    const blogReviews = processedData.map(item => item.blogReviews || item.blog_review_count || 0);
    const receiptReviews = processedData.map(item => item.receiptReviews || item.receipt_review_count || 0);

    return calculateOptimalYAxisDomain([...blogReviews, ...receiptReviews]);
  }, [processedData]);

  // Saved count graph Y-axis domain - 필드명 수정 (saved -> savedCount)
  const savedYAxisDomain = useMemo(() => {
    if (!processedData || processedData.length === 0) return [0, 10];

    const savedCounts = processedData.map(item => item.saved || item.savedCount || 0);
    return calculateOptimalYAxisDomain(savedCounts);
  }, [processedData]);

  return (
    <div className="space-y-6">
      {/* 1. 순위 그래프 */}
      <div>
        <h4 className="text-sm font-medium ml-4 mb-2 text-gray-700">순위 변화</h4>
        <div className="h-[250px] bg-white p-2 rounded-md">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={processedData}
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
                domain={rankingYAxisDomain} 
                reversed 
                stroke="#666"
                tick={{ fontSize: 10 }}
                tickCount={7}
                label={{ value: '순위', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number | string | number) => [`${value}위`, '순위']}
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
      
      {/* 2. 리뷰 그래프 - dataKey 수정 */}
      <div>
        <h4 className="text-sm font-medium ml-4 mb-2 text-gray-700">리뷰 수 변화</h4>
        <div className="h-[250px] bg-white p-2 rounded-md">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={processedData}
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
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
                domain={reviewYAxisDomain}
                stroke="#666"
                tick={{ fontSize: 10 }}
                tickCount={5}
                label={{ value: '개수', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number | string, name: string | number) => [
                  value, 
                  name === 'blogReviews' || name === 'blog_review_count' ? '블로그 리뷰' : '영수증 리뷰'
                ]}
                labelFormatter={(label: string) => {
                  const date = new Date(label);
                  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={(d) => d.blogReviews || d.blog_review_count || 0}
                name="블로그 리뷰"
                stroke="#1e88e5"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey={(d) => d.receiptReviews || d.receipt_review_count || 0}
                name="영수증 리뷰"
                stroke="#4caf50"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* 3. 저장 수 그래프 - dataKey 수정 */}
      <div>
        <h4 className="text-sm font-medium ml-4 mb-2 text-gray-700">저장 수 변화</h4>
        <div className="h-[250px] bg-white p-2 rounded-md">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={processedData}
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
                domain={savedYAxisDomain}
                stroke="#666"
                tick={{ fontSize: 10 }}
                tickCount={5}
                label={{ value: '저장 수', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number | string | number) => [value, '저장 수']}
                labelFormatter={(label: string) => {
                  const date = new Date(label);
                  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={(d) => d.saved || d.savedCount || 0}
                name="저장 수"
                stroke="#ff9800"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default KeywordRankingChart;
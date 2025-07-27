import React, { useMemo } from 'react';
// Define chart data item type - now compatible with KeywordHistoricalData
export interface ChartDataItem { // Exporting ChartDataItem
  date: string;
  date_key: string; // Required field for compatibility with KeywordHistoricalData
  place_id?: string | number | null; // Allow null for compatibility
  ranking?: number | null;
  hasCrawlInfo?: boolean;
  hasBasicCrawl?: boolean;
  blogReviews?: number | null;
  receiptReviews?: number | null;
  blog_review_count?: number | null;
  receipt_review_count?: number | null;
  savedCount?: number | null;
  saved?: number | null;
  saved_count?: number | null;
  // Add keyword field if it's used by the chart and provided by transformToChartData
  keyword?: string; 
  // Add interpolated and outOfRank if these are actual data properties used for dot rendering
  interpolated?: boolean;
  outOfRank?: boolean;
  interpolatedSaved?: boolean;
  isRestaurant?: boolean; // 키워드의 레스토랑 여부
}
import { Business } from '@/types/index';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend
} from "recharts";

export interface KeywordRankingChartProps { // Exporting KeywordRankingChartProps
  chartData: ChartDataItem[] | null;
  activeBusiness: Business | null; 
  isRestaurantKeyword?: boolean; // Add restaurant flag to always show saved count chart
}

const KeywordRankingChart: React.FC<KeywordRankingChartProps> = ({ chartData, activeBusiness, isRestaurantKeyword }) => { // Removed isRestaurantKeyword from destructuring
  // 데이터 디버깅 로그 추가 - 더 자세한 로깅으로 개선
  console.log('[Debug] KeywordRankingChart 입력 데이터:', {
    chartDataLength: chartData?.length || 0,
    sampleItem: chartData && chartData.length > 0 ? chartData[0] : null,
    activeBusiness,
    // isRestaurantKeyword removed from log
    availableSavedFields: chartData && chartData.length > 0 ? 
      Object.keys(chartData[0]).filter(key => 
        key.toLowerCase().includes('save') || key.toLowerCase().includes('count')
      ) : []
  });

  // 저장 수 값이 있는지 확인하는 로직 추가
  const hasSavedCountData = useMemo(() => {
    if (!chartData || chartData.length === 0) return false;
    
    // 배열 내 아이템 중 하나라도 저장 수 값이 있는지 확인
    return chartData.some(item => {
      const savedValue = item.savedCount ?? item.saved ?? item.saved_count ?? null;
      return savedValue !== null && savedValue !== undefined && savedValue > 0;
    });
  }, [chartData]);

  // Modify show logic: show saved count chart if hasSavedCountData or isRestaurantKeyword or if data indicates restaurant keyword
  const shouldShowSavedCount = useMemo(() => {
    // 차트 데이터에서 isRestaurant 정보 확인
    const dataIndicatesRestaurant = chartData && chartData.length > 0 && chartData[0].isRestaurant;
    return Boolean(isRestaurantKeyword) || Boolean(dataIndicatesRestaurant) || hasSavedCountData;
  }, [isRestaurantKeyword, hasSavedCountData, chartData]);

  // 조건이 모두 맞는지 확인하는 로그 추가
  console.log('[Debug] 저장 수 차트 표시 조건:', { 
    hasSavedCountData, 
    isRestaurantKeyword, 
    dataIndicatesRestaurant: chartData && chartData.length > 0 && chartData[0].isRestaurant,
    shouldShowSavedCount 
  });

  // 날짜별로 데이터 처리 (중복 제거)
  const processedData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];

    // Derive recentDates from actual chartData dates, up to latest 30 entries
    const uniqueDates = Array.from(new Set(chartData.map(item => item.date))).sort();
    // If fewer than 30 days of data, include all; else take last 30
    const recentDates = uniqueDates.length <= 30
      ? uniqueDates
      : uniqueDates.slice(uniqueDates.length - 30);

    // Map existing chartData by date
    const chartMap = new Map<string, ChartDataItem>();
    chartData.forEach(item => chartMap.set(item.date, item));
    // Create dataArr for each date
    const dataArr: ChartDataItem[] = recentDates.map(date => {
      const rec = chartMap.get(date);
      if (rec) {
        return { ...rec, date, date_key: rec.date_key || date, hasBasicCrawl: rec.ranking !== null };
      } else {
        // no record this date
        return {
          date,
          date_key: date, // Include required date_key field
          ranking: null,
          blog_review_count: null, // Corrected key
          receipt_review_count: null, // Corrected key
          savedCount: null,
          // Remove blogReviews and receiptReviews if they were here
          saved: null,
          saved_count: null,
          place_id: activeBusiness?.place_id || '',
          hasBasicCrawl: false
        };
      }
    });

    // Find indices where basic crawl exists (actual ranking data)
    const anchorIdxs = dataArr
      .map((d, idx) => d.hasBasicCrawl ? idx : -1)
      .filter(idx => idx >= 0);

    if (anchorIdxs.length > 0) {
      const firstIdx = anchorIdxs[0];
      // Fill before first anchor
      for (let i = 0; i < firstIdx; i++) {
        dataArr[i].ranking = dataArr[firstIdx].ranking;
      }
      // Interpolate between anchors
      for (let j = 0; j < anchorIdxs.length - 1; j++) {
        const start = anchorIdxs[j];
        const end = anchorIdxs[j+1];
        const v1 = dataArr[start].ranking!;
        const v2 = dataArr[end].ranking!;
        for (let k = start + 1; k < end; k++) {
          const ratio = (k - start) / (end - start);
          dataArr[k].ranking = Math.round(v1 + (v2 - v1) * ratio);
          dataArr[k].interpolated = true; // 추정 데이터임을 표시
        }
      }
      // Fill after last anchor
      const lastIdx = anchorIdxs[anchorIdxs.length - 1];
      for (let i = lastIdx + 1; i < dataArr.length; i++) {
        dataArr[i].ranking = dataArr[lastIdx].ranking;
      }
     // Forward-fill detail fields
      const detailKeys = ['blog_review_count','receipt_review_count','savedCount','saved','saved_count'] as const; // Corrected keys
      for (let i = 1; i < dataArr.length; i++) {
        detailKeys.forEach((key) => {
          if (dataArr[i][key] == null) {
            dataArr[i][key] = dataArr[i - 1][key];
          }
        });
      }
    }

    // Add normalized saved count and apply domain filters
    return dataArr.map(item => {
      const normSaved = Number(item.savedCount ?? item.saved ?? item.saved_count ?? 0);
      // clamp ranking to 1~300
      const rankingVal = item.ranking != null && item.ranking >= 1 && item.ranking <= 300 ? item.ranking : null;
      // clamp reviews to 0~2000
      const blogRev = item.blog_review_count != null && item.blog_review_count <= 2000 ? item.blog_review_count : null;
      const receiptRev = item.receipt_review_count != null && item.receipt_review_count <= 2000 ? item.receipt_review_count : null;
      // clamp saved to 0~100000
      const savedVal = normSaved <= 100000 ? normSaved : null;
      return {
        ...item,
        date_key: item.date_key || item.date, // Ensure date_key is always present
        ranking: rankingVal,
        blog_review_count: blogRev,
        receipt_review_count: receiptRev,
        savedCount: savedVal,
        saved: savedVal,
        saved_count: savedVal,
        savedCountNormalized: savedVal ?? 0
      };
    });
  }, [chartData, activeBusiness?.place_id]);
  
  // 현재 순위를 기준으로 Y축 범위 계산
  const rankingYAxisDomain = useMemo(() => {
    if (!processedData || processedData.length === 0) return [1, 10];
    // extract valid ranks
    const validRanks = processedData
      .map(d => d.ranking)
      .filter((r): r is number => typeof r === 'number');
    if (validRanks.length === 0) return [1, 10];
    const minRank = Math.min(...validRanks);
    const maxRank = Math.max(...validRanks);
    const range = maxRank - minRank;
    // determine bottom limit: extend at least 9 positions or 20% of range
    let bottomLimit: number;
    if (range <= 9) {
      bottomLimit = minRank + 9;
    } else {
      bottomLimit = minRank + Math.ceil(range * 0.2);
    }
    // ensure domain covers actual max rank, top fixed at 1
    const yMax = Math.max(bottomLimit, maxRank);
    return [1, yMax];
  }, [processedData]);
  
  // 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // X축 날짜 간격을 계산하는 함수
  const generateTickValues = (data: ChartDataItem[]): string[] => {
    if (!data || data.length === 0) return [];
    
    // 최소 5개, 최대 10개의 눈금을 표시하도록 설정
    const maxTicks = 8;
    const dataLength = data.length;
    
    // 데이터가 적으면 모든 날짜 표시
    if (dataLength <= maxTicks) {
      return data.map(item => item.date);
    }
    
    // 적절한 간격 계산 (균등하게 분포)
    const step = Math.ceil(dataLength / maxTicks);
    
    // 균등하게 분포된 날짜 선택
    const ticks = [];
    
    // 첫 날짜는 항상 포함
    ticks.push(data[0].date);
    
    // 중간 날짜들은 계산된 간격으로 선택
    for (let i = step; i < dataLength - 1; i += step) {
      // 중복된 월이 연속으로 표시되지 않도록 필터링
      const currentDate = new Date(data[i].date);
      const prevDate = new Date(ticks[ticks.length - 1]);
      
      // 같은 월이면서 가까운 날짜인 경우 스킵
      if (currentDate.getMonth() === prevDate.getMonth() && 
          Math.abs(currentDate.getDate() - prevDate.getDate()) < 5) {
        continue;
      }
      
      ticks.push(data[i].date);
    }
    
    // 마지막 날짜는 항상 포함
    const lastDate = data[dataLength - 1].date;
    if (ticks[ticks.length - 1] !== lastDate) {
      ticks.push(lastDate);
    }
    
    return ticks;
  };

  // Review graph Y-axis domain - 필드명 수정 (blogReviews -> blog_review_count)
  const reviewYAxisDomain = useMemo(() => {
    if (!processedData || processedData.length === 0) return [0, 10];
    // collect all review values
    const values = processedData.map(item => item.blog_review_count ?? 0).concat( // Ensure correct key
      processedData.map(item => item.receipt_review_count ?? 0) // Ensure correct key
    );
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal;
    const buffer = range > 0 ? Math.ceil(range * 0.1) : Math.ceil(maxVal * 0.1) || 10;
    const yMin = Math.max(0, minVal - buffer);
    const yMax = maxVal + buffer;
    return [yMin, yMax];
  }, [processedData]);

  // Saved count graph Y-axis domain - 자동 스케일링 알고리즘 개선
  const savedYAxisDomain = useMemo(() => {
    if (!processedData || processedData.length === 0) return [0, 10];
    const values = processedData.map(item => item.savedCount ?? item.saved ?? item.saved_count ?? 0);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal;
    // buffer: 10% of range, or 2% of maxVal if no variation
    const buffer = range > 0 ? Math.ceil(range * 0.1) : Math.ceil(maxVal * 0.02);
    const yMin = Math.max(0, minVal - buffer);
    const yMax = maxVal + buffer;
    return [yMin, yMax];
  }, [processedData]);

  return (
    <div className="space-y-6">
      {/* 1. 순위 그래프 */}
      <div>
        <h4 className="text-sm font-medium ml-4 mb-2 text-gray-700">순위 변화</h4>
        <div className="h-[320px] bg-white p-2 rounded-md">
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
                ticks={generateTickValues(processedData)}
              />
              <YAxis  
                domain={rankingYAxisDomain}  // 동적 범위: 순위 변화에 따라 조정됨
                reversed 
                stroke="#666"
                tick={{ fontSize: 10 }}
                tickCount={7}
                label={{ value: '순위', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />              <Tooltip
                formatter={(value: number | string, name: string, props: { payload?: ChartDataItem }) => {
                  if (name === '순위') {
                    const suffix = props?.payload?.interpolated ? ' (추정)' : '';
                    return [`${value}위${suffix}`, '순위'];
                  }
                  return [`${value}위`, '순위'];
                }}
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
                connectNulls={false}
                isAnimationActive={false}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.interpolated) {
                    // 추정 데이터는 빈 원으로 표시
                    return (
                      <svg key={`${payload.date}-rank-interp`} x={cx - 4} y={cy - 4} width={8} height={8}>
                        <circle cx={4} cy={4} r={4} stroke="#8884d8" strokeWidth={2} fill="white" />
                      </svg>
                    );
                  }
                  // 실제 데이터는 채워진 원으로 표시
                  return (
                    <svg key={`${payload.date}-rank-actual`} x={cx - 4} y={cy - 4} width={8} height={8} fill="#8884d8">
                      <circle cx={4} cy={4} r={4} />
                    </svg>
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* 차트 설명 추가 */}
        <div className="mt-2 text-xs text-gray-600 px-4 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span>실제 데이터</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full border-2 border-blue-600 bg-white"></div>
            <span>추정 데이터</span>
          </div>
        </div>
      </div>
      
      {/* 2. 리뷰 그래프 - dataKey 수정 */}
      <div>
        <h4 className="text-sm font-medium ml-4 mb-2 text-gray-700">리뷰 수 변화</h4>
        <div className="h-[320px] bg-white p-2 rounded-md">
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
                ticks={generateTickValues(processedData)}
              />
              <YAxis 
                domain={reviewYAxisDomain}  // 동적 범위: 리뷰 수 변화에 따라 조정됨
                stroke="#666"
                tick={{ fontSize: 10 }}
                tickCount={5}
                label={{ value: '개수', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number | string, name: string | number) => [
                  value, 
                  name === 'blog_review_count' ? '블로그 리뷰' : 
                  name === 'receipt_review_count' ? '영수증 리뷰' : name
                ]}
                labelFormatter={(label: string) => {
                  const date = new Date(label);
                  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  return (
                    <svg key={`${payload.date}-blog-dot`} x={cx - 4} y={cy - 4} width={8} height={8} fill="#1e88e5">
                      <circle cx={4} cy={4} r={4} />
                    </svg>
                  );
                }}
                dataKey="blog_review_count"
                name="블로그 리뷰"
                stroke="#1e88e5"
                strokeWidth={2}
                connectNulls={true}
                isAnimationActive={false}  // disable animation for faster rendering
              />
              <Line
                type="monotone"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  return (
                    <svg key={`${payload.date}-receipt-dot`} x={cx - 4} y={cy - 4} width={8} height={8} fill="#4caf50">
                      <circle cx={4} cy={4} r={4} />
                    </svg>
                  );
                }}
                dataKey="receipt_review_count"
                name="영수증 리뷰"
                stroke="#4caf50"
                strokeWidth={2}
                connectNulls={true}
                isAnimationActive={false}  // disable animation for faster rendering
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* 3. 저장 수 그래프 - show if shouldShowSavedCount */}
      {shouldShowSavedCount && (
        <div>
          <h4 className="text-sm font-medium ml-4 mb-2 text-gray-700">저장 수 변화</h4>
          <div className="h-[320px] bg-white p-2 rounded-md">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={processedData}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" tickFormatter={formatDate} stroke="#666" tick={{ fontSize: 10 }} ticks={generateTickValues(processedData)}/>
                <YAxis domain={savedYAxisDomain} stroke="#666" tick={{ fontSize: 10 }} tickCount={5} label={{ value: '저장 수', angle: -90, position: 'insideLeft', fontSize: 12 }}/>
                <Tooltip formatter={(value) => [value, '저장 수']} labelFormatter={(label) => {
                  const date = new Date(label);
                  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
                }}/>
                <Legend />
                <Line
                  type="monotone"
                  dataKey="savedCount"
                  connectNulls={true}
                  name="저장 수"
                  stroke="#ff9800"
                  strokeWidth={2}
                  isAnimationActive={false}  // disable animation for faster rendering
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    // Add keys for each dot to avoid React warnings
                    if (payload.interpolatedSaved) {
                      return (
                        <svg key={`${payload.date}-saved-interp`} x={cx - 4} y={cy - 4} width={8} height={8} fill="#999">
                          <circle cx={4} cy={4} r={4} />
                        </svg>
                      );
                    }
                    return (
                      <svg key={`${payload.date}-saved`} x={cx - 4} y={cy - 4} width={8} height={8} fill="#ff9800">
                        <circle cx={4} cy={4} r={4} />
                      </svg>
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default KeywordRankingChart;
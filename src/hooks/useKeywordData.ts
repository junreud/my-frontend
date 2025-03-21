import { useState, useEffect } from 'react';

// API base URL 정의
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// 타입 정의
interface KeywordDataParams {
  placeId?: string | number;
  keyword?: string;
  filter?: string | null;
  recordId?: string | number | null;
  historical?: boolean;
}

interface KeywordResponse {
  id: number;
  name: string;
}

export interface KeywordResultItem {
  id?: number;
  placeid?: string;
  place_id?: string;
  place_name?: string;
  name?: string;
  ranking: number;
  category?: string;
  businessType?: string;
  framework?: string;
  receipt_review_count?: number;
  receiptReviews?: number;
  blog_review_count?: number;
  blogReviews?: number;
  savedCount?: number;
  created_at?: string;
}

// 키워드 데이터를 가져오는 Hook
export function useKeywordData(params: KeywordDataParams) {
  const [data, setData] = useState<KeywordResultItem[]>([]);
  const [historicalData, setHistoricalData] = useState<KeywordResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!params.placeId || !params.keyword) {
        setData([]);
        setHistoricalData([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 인증 토큰 가져오기
        const token = localStorage.getItem('auth_token') || '';
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        // 1. 키워드 ID 얻기
        const keywordResponse = await fetch(`${API_BASE_URL}/keywords?name=${encodeURIComponent(params.keyword)}`, {
          headers
        });
        
        if (!keywordResponse.ok) {
          if (keywordResponse.status === 401) {
            throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
          }
          throw new Error(`키워드 검색 실패: ${keywordResponse.status}`);
        }
        
        const keywordData: KeywordResponse = await keywordResponse.json();
        if (!keywordData.id) {
          throw new Error('키워드 정보를 찾을 수 없습니다.');
        }
        
        const keywordId = keywordData.id;
        
        // 2. 현재 키워드 결과 가져오기
        let url = `${API_BASE_URL}/keyword-results?placeId=${params.placeId}&keywordId=${keywordId}`;
        
        if (params.filter) {
          url += `&category=${encodeURIComponent(params.filter)}`;
        }
        
        if (params.recordId) {
          url += `&recordId=${params.recordId}`;
        }
        
        const resultResponse = await fetch(url, { headers });
        if (!resultResponse.ok) {
          throw new Error(`결과 가져오기 실패: ${resultResponse.status}`);
        }
        
        const results = await resultResponse.json();
        setData(results);

        // 3. 히스토리컬 데이터 가져오기 (params.historical이 true인 경우)
        if (params.historical) {
          // 30일 전 날짜 계산
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const fromDate = thirtyDaysAgo.toISOString().split('T')[0];
          const toDate = new Date().toISOString().split('T')[0];
          
          const historicalUrl = `${url}&historical=true&fromDate=${fromDate}&toDate=${toDate}`;
          
          const historicalResponse = await fetch(historicalUrl, { headers });
          if (!historicalResponse.ok) {
            throw new Error(`히스토리컬 데이터 가져오기 실패: ${historicalResponse.status}`);
          }
          
          const historicalResults = await historicalResponse.json();
          setHistoricalData(historicalResults);
        }
      } catch (err: any) {
        setError(err);
        console.error("키워드 데이터 조회 중 오류:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.placeId, params.keyword, params.filter, params.recordId, params.historical]);

  // 차트용 데이터 포맷 변환
  const getChartData = () => {
    // 날짜별로 데이터 그룹화
    const groupedByDate = historicalData.reduce<Record<string, KeywordResultItem>>((acc, item) => {
      if (item.created_at) {
        const date = new Date(item.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = item;
        }
      }
      return acc;
    }, {});
    
    // 차트용 배열로 변환
    return Object.entries(groupedByDate).map(([date, data]) => ({
      date,
      ranking: data.ranking || 0,
      // 차트 표시용으로 순위를 역전시킴 (낮은 순위가 더 높은 값으로 표시되도록)
      uv: 300 - (data.ranking || 0)
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const chartData = getChartData();

  return { data, historicalData, chartData, loading, error };
}

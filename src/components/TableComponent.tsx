import React, { useState, useEffect } from 'react';
import { useBusinessSwitcher } from '@/hooks/useBusinessSwitcher'; 
import './TableComponent.css';

// API base URL should be defined here
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Define interfaces for the data structures
interface KeywordDataParams {
  placeId: string | number;
  keyword: string;
  filter?: string | null;
  recordId?: string | number | null;
  historical?: boolean;
}

interface KeywordResponse {
  id: number;
  name: string;
}

interface KeywordResultItem {
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

interface UserKeyword {
  id: number;
  name: string;
  // Add other properties as needed
}

interface TableComponentProps {
  title: string;
  selectedKeyword: string;
}

// Chart data format
interface ChartDataItem {
  date: string;
  ranking: number;
}

// Move the chart data formatting function to module scope
export const getChartData = (historicalData: KeywordResultItem[]): ChartDataItem[] => {
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
    ranking: data.ranking || 0
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// 키워드 데이터 조회 함수 - 백엔드 keyword_crawl_results 테이블에서 데이터 가져옴
export const fetchKeywordData = async ({ placeId, keyword, filter = null, recordId = null, historical = false }: KeywordDataParams): Promise<KeywordResultItem[]> => {
  try {
    // 인증 토큰 가져오기
    const token = localStorage.getItem('auth_token') || '';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 1. 먼저 키워드 ID 얻기
    const keywordResponse = await fetch(`${API_BASE_URL}/keywords?name=${encodeURIComponent(keyword)}`, {
      headers
    });
    if (!keywordResponse.ok) {
      throw new Error(`키워드 검색 실패: ${keywordResponse.status}`);
    }
    
    const keywordData: KeywordResponse = await keywordResponse.json();
    if (!keywordData.id) {
      throw new Error('키워드 정보를 찾을 수 없습니다.');
    }
    
    const keywordId = keywordData.id;
    
    // 2. 키워드 크롤 결과 가져오기
    let url = `${API_BASE_URL}/keyword-results?placeId=${placeId}&keywordId=${keywordId}`;
    
    if (filter) {
      url += `&category=${encodeURIComponent(filter)}`;
    }
    
    if (recordId) {
      url += `&recordId=${recordId}`;
    }

    // 3. 날짜 범위 정보 추가 (historical 데이터 요청 시)
    if (historical) {
      // 30일 전 날짜 계산
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const fromDate = thirtyDaysAgo.toISOString().split('T')[0];
      const toDate = new Date().toISOString().split('T')[0];
      
      url += `&historical=true&fromDate=${fromDate}&toDate=${toDate}`;
    }
    
    const resultResponse = await fetch(url, { headers });
    if (!resultResponse.ok) {
      throw new Error(`결과 가져오기 실패: ${resultResponse.status}`);
    }
    
    return await resultResponse.json();
  } catch (error) {
    console.error("키워드 데이터 조회 중 오류:", error);
    throw error;
  }
};

// 사용자별 업체 키워드 목록 가져오기
export const fetchUserKeywords = async (userId: string | number, placeId: string | number): Promise<UserKeyword[]> => {
  try {
    // 인증 토큰 가져오기
    const token = localStorage.getItem('auth_token') || '';
    
    const url = `${API_BASE_URL}/user-keywords?userId=${userId}&placeId=${placeId}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`사용자 키워드 가져오기 실패: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("사용자 키워드 조회 중 오류:", error);
    throw error;
  }
};

const TableComponent: React.FC<TableComponentProps> = ({ title, selectedKeyword }) => {
  const [data, setData] = useState<KeywordResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [visibleItems, setVisibleItems] = useState<number>(100);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [historicalData, setHistoricalData] = useState<KeywordResultItem[]>([]);
  const [userKeywords, setUserKeywords] = useState<UserKeyword[]>([]);
  
  // 비즈니스 스위처에서 선택된 업체 정보 가져오기
  let activeBusiness: any = null;
  let user: any = null;
  try {
    const { activeBusiness: business, user: currentUser } = useBusinessSwitcher();
    activeBusiness = business;
    user = currentUser;
  } catch (error) {
    console.log("BusinessSwitcher context not available:", error);
  }

  // 유저의 키워드 목록 가져오기
  useEffect(() => {
    async function loadUserKeywords() {
      if (!user?.id || !activeBusiness?.place_id) return;
      
      try {
        const keywords = await fetchUserKeywords(user.id, activeBusiness.place_id);
        setUserKeywords(keywords);
      } catch (error) {
        console.error('Error loading user keywords:', error);
      }
    }
    
    loadUserKeywords();
  }, [user?.id, activeBusiness?.place_id]);

  useEffect(() => {
    loadData();
  }, [selectedKeyword, activeBusiness]);

  const loadData = async (): Promise<void> => {
    if (!selectedKeyword || !activeBusiness?.place_id) {
      setData([]);
      setHistoricalData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 백엔드에서 현재 데이터 가져오기
      const results = await fetchKeywordData({
        placeId: activeBusiness.place_id,
        keyword: selectedKeyword
      });
      
      setData(results);
      setHasMore(results.length > visibleItems);
      
      // 히스토리컬 데이터 가져오기 (30일간)
      const historicalResults = await fetchKeywordData({
        placeId: activeBusiness.place_id,
        keyword: selectedKeyword,
        historical: true
      });
      
      setHistoricalData(historicalResults);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = (): void => {
    setVisibleItems(prev => prev + 100);
    if (visibleItems + 100 >= data.length) {
      setHasMore(false);
    }
  };

  // Historical data for charts
  const chartData = getChartData(historicalData);

  return (
    <div className="table-component">
      {!selectedKeyword || !activeBusiness ? (
        <div className="select-message">업체와 키워드를 모두 선택해주세요.</div>
      ) : loading ? (
        <div className="loading">데이터를 불러오는 중...</div>
      ) : (
        <>
          <div className="table-container">
            <table className="table table-xs">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>업체명</th>
                  <th>업종</th>
                  <th>영수증리뷰</th>
                  <th>블로그리뷰</th>
                  <th>저장수</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.slice(0, visibleItems).map((item) => (
                    <tr key={item.placeid || item.id || Math.random()} className="hover:bg-base-300">
                      <th>{item.ranking}</th>
                      <td>{item.place_name || item.name}</td>
                      <td>{item.category || item.businessType || item.framework}</td>
                      <td>{item.receipt_review_count || item.receiptReviews}</td>
                      <td>{item.blog_review_count || item.blogReviews}</td>
                      <td>{item.savedCount || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500 bg-gray-50">
                      <div className="flex flex-col items-center justify-center h-40">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-10 w-10 mb-2 text-gray-400" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={1.5} 
                            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                          />
                        </svg>
                        <p>데이터가 없습니다</p>
                        <p className="text-xs mt-1">선택한 키워드에 대한 결과를 찾을 수 없습니다</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {hasMore && (
            <div className="load-more-container">
              <button 
                className="load-more-button"
                onClick={loadMore}
              >
                더 보기 (+100)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TableComponent;

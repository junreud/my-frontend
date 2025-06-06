'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import DashboardChart from "@/components/Dashboard/DashboardChart";
import { ClientAnimatedNumber } from "@/components/animations/ClientAnimatedNumber";
import apiClient from "@/lib/apiClient";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { KeywordHistoricalData } from "@/types";
import { useUser } from '@/hooks/useUser';
import { useUserBusinesses } from '@/hooks/useUserBusinesses';

// CSR 컴포넌트로 변경
export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 사용자 정보 가져오기
  const { data: user, isLoading: isLoadingUser, isError: userError } = useUser();
  const userId = user?.id;

  // 비즈니스 정보 가져오기
  const { businesses: userBusinesses, isLoading: isLoadingBusinesses } = useUserBusinesses(userId ? String(userId) : undefined);
  
  // 선택된 비즈니스 상태 관리
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);


  // 컴포넌트 마운트 시 첫 번째 비즈니스 선택
  useEffect(() => {
    if (userBusinesses && userBusinesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(userBusinesses[0].place_id);
      
      // 로컬 스토리지에 저장
      try {
        localStorage.setItem('activeBusiness', JSON.stringify(userBusinesses[0]));
      } catch (error) {
        console.error("Failed to save active business to localStorage:", error);
      }
    }
  }, [userBusinesses, selectedBusinessId]);


  // 컴포넌트 레이아웃 쉬프트 방지를 위한 상태
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isStabilizing, setIsStabilizing] = useState(false);
  
  // 사용자 정보 쿼리 무효화 추가
  useEffect(() => {
    // 대시보드 페이지가 마운트되거나 포커스될 때 사용자 쿼리를 무효화하여 최신 상태로 유지
    queryClient.invalidateQueries({ queryKey: ['user'] });
  }, [queryClient]); // queryClient는 일반적으로 안정적이므로 마운트 시 실행

  // 페이지 전환 즉시 반응하도록 로딩 상태 추가
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  useEffect(() => {
    // 컴포넌트 마운트 시 페이지 로드 완료 표시
    setIsPageLoaded(true);
    
    // 네비게이션 이벤트에 대한 핸들러
    const handleNavigation = () => {
      setIsPageLoaded(false); // 페이지 전환 시 로딩 상태로 변경
    };
    
    // 다른 경로로 이동 시 표시할 이벤트 리스너 등록
    const links = document.querySelectorAll('a[href^="/"]');
    links.forEach(link => {
      link.addEventListener('click', handleNavigation);
    });
    
    return () => {
      links.forEach(link => {
        link.removeEventListener('click', handleNavigation);
      });
    };
  }, []);

  // 비즈니스 ID 변경 감지 및 높이 안정화
  useEffect(() => {
    if (contentRef.current && !isStabilizing) {
      // 현재 높이 저장
      setContentHeight(contentRef.current.offsetHeight);
      setIsStabilizing(true);
      
      // 데이터 로딩 후 안정화 해제를 위한 타이머
      const timer = setTimeout(() => {
        setIsStabilizing(false);
      }, 800); // 충분한 시간을 주어 데이터 로딩이 완료되도록 함
      
      return () => clearTimeout(timer);
    }
  }, [selectedBusinessId, isStabilizing]);

  // 메인 키워드 상태 가져오기
  const { data: mainKeywordStatus, isLoading: isKeywordLoading } = useQuery({
    queryKey: ['mainKeywordStatus', selectedBusinessId],
    enabled: !!selectedBusinessId,
    queryFn: async () => {
      try {
        // place_id를 쿼리 파라미터로 전달
        const response = await apiClient.get(`/keyword/main-status?place_id=${selectedBusinessId}`);
        console.log('메인 키워드 응답:', response.data);
        return response.data?.data || null;
      } catch (error) {
        console.error('Main keyword status fetch failed:', error);
        return null;
      }
    }
  });

  // 일일 통계 가져오기
  const { data: dailyStats = { 
    todayUsers: { count: 0, description: '데이터 로딩 중...' }, 
    newClients: { count: 0, description: '데이터 로딩 중...' } 
  }, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dailyStats', selectedBusinessId],
    enabled: !!selectedBusinessId,
    queryFn: async () => {
      try {
        const response = await apiClient.get('/stats/daily-summary');
        if (!response.data) {
          return {
            todayUsers: { count: 0, description: '데이터 로딩 실패' },
            newClients: { count: 0, description: '데이터 로딩 실패' }
          };
        }
        return {
          todayUsers: response.data.todayUsers || { count: 0, description: '데이터 없음' },
          newClients: response.data.newClients || { count: 0, description: '데이터 없음' }
        };
      } catch (error) {
        console.error('Daily stats fetch failed:', error);
        return {
          todayUsers: { count: 0, description: '데이터 로딩 실패' },
          newClients: { count: 0, description: '데이터 로딩 실패' }
        };
      }
    }
  });

  // 키워드 랭킹 가져오기
  const { data: keywordRankings = {}, isLoading: isRankingsLoading } = useQuery({
    queryKey: ['keywordRankings', userId, selectedBusinessId],
    enabled: !!userId && !!selectedBusinessId,
    queryFn: async () => {
      try {
        const placeId = selectedBusinessId;
        if (!userId || !placeId) return {};
        
        // 사용자의 모든 업체와 연결된 키워드 데이터를 가져옵니다
        // 백엔드 경로 수정: /api/keyword-rankings-by-business -> /keyword/keyword-rankings-by-business
        const response = await apiClient.get(
          `/keyword/keyword-rankings-by-business?userId=${userId}`
        );
        
        // 업체별로 그룹화된 키워드 데이터
        // { [place_id]: { place_name: string, keywords: Array<{ keyword: string, ranking: number | null }> } }
        return response.data?.data || {};
      } catch (error) {
        console.error('Keyword rankings fetch failed:', error);
        return {};
      }
    }
  });

  // 차트 데이터 가져오기
  const { data: chartData = null, isLoading: isChartLoading } = useQuery({
    queryKey: ['chartData', userId, mainKeywordStatus?.keyword, selectedBusinessId],
    enabled: !!userId && !!mainKeywordStatus?.keyword && !!selectedBusinessId,
    queryFn: async () => {
      try {
        const mainKeyword = mainKeywordStatus?.keyword;
        if (!mainKeyword) {
          console.warn("Main keyword is undefined, cannot fetch chart data.");
          return null;
        }
        
        const placeId = selectedBusinessId;
        if (!userId || !placeId) return null;
        
        const query = `?userId=${userId}&placeId=${placeId}&keyword=${encodeURIComponent(mainKeyword)}`;
        const response = await apiClient.get(`/api/keyword-ranking-details${query}`);
        return (response.data?.data as KeywordHistoricalData[]) || null;
      } catch (error) {
        console.error('Chart data fetch failed:', error);
        return null;
      }
    }
  });

  // 로딩 상태 통합
  const isLoading = isLoadingUser || isLoadingBusinesses || isKeywordLoading || isStatsLoading || isRankingsLoading || isChartLoading;
  
  // 최종 로딩 완료 후 높이 안정화 해제
  useEffect(() => {
    if (!isLoading && isStabilizing) {
      const timer = setTimeout(() => {
        setIsStabilizing(false);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, isStabilizing]);

  // 인증 상태 확인 및 리다이렉션
  useEffect(() => {
    if (userError) {
      console.log("User data fetch failed, redirecting to login.");
      router.push("/login");
    }
  }, [userError, router]);

  // 사용자 정보가 없으면 로딩 화면 표시
  if (!user) {
    return <div className="p-10 text-center">로딩 중...</div>;
  }

  return (
    <>
      <div 
        ref={contentRef}
        className={`transition-all duration-300 ease-in-out ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={isStabilizing && contentHeight ? { minHeight: `${contentHeight}px` } : {}}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {/* 카드 1: Main Keyword Status */}
          <Card>
            <CardHeader>
              <CardTitle>Main Keyword</CardTitle>
              <CardDescription>
                {isKeywordLoading ? (
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div>
                ) : mainKeywordStatus ? (
                  `${mainKeywordStatus.diff > 0 ? '+' : ''}${mainKeywordStatus.diff}위 변동`
                ) : '데이터 없음'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-4xl font-bold text-indigo-600">
              {isKeywordLoading ? (
                <div className="h-10 bg-gray-200 animate-pulse rounded w-20"></div>
              ) : mainKeywordStatus ? (
                `${mainKeywordStatus.currentRank}위`
              ) : 'N/A'}
              {mainKeywordStatus && (
                <div className="text-sm text-gray-500 mt-1">{mainKeywordStatus.keyword}</div>
              )}
            </CardContent>
          </Card>

          {/* 카드 2: Today's Users */}
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Users</CardTitle>
              <CardDescription>
                {isStatsLoading ? (
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-36"></div>
                ) : dailyStats.todayUsers.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-4xl font-bold text-blue-600">
              {isStatsLoading ? (
                <div className="h-10 bg-gray-200 animate-pulse rounded w-16"></div>
              ) : (
                <ClientAnimatedNumber to={dailyStats.todayUsers.count} duration={1.5} />
              )}
            </CardContent>
          </Card>

          {/* 카드 3: New Clients */}
          <Card>
            <CardHeader>
              <CardTitle>New Clients</CardTitle>
              <CardDescription>
                {isStatsLoading ? (
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div>
                ) : dailyStats.newClients.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-4xl font-bold text-orange-600">
              {isStatsLoading ? (
                <div className="h-10 bg-gray-200 animate-pulse rounded w-16"></div>
              ) : (
                <ClientAnimatedNumber to={dailyStats.newClients.count} duration={1.5} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* 아래쪽: 그래프 + 키워드 테이블 영역 */}
        <div className="grid gap-4 md:grid-cols-2 mt-4">
          {/* 그래프 */}
          <div className="h-full min-h-[300px]">
            {isChartLoading ? (
              <div className="bg-white p-4 rounded-xl h-full">
                <div className="h-6 bg-gray-200 animate-pulse rounded w-40 mb-4"></div>
                <div className="h-[250px] bg-gray-100 animate-pulse rounded w-full"></div>
              </div>
            ) : (
              <DashboardChart initialData={chartData} />
            )}
          </div>

          {/* 키워드 순위 테이블 */}
          <Card className="rounded-xl p-4">
            <h2 className="mb-2 text-lg font-semibold text-center">내 키워드 현재 순위</h2>
            <div className="w-full max-w-3xl mx-auto px-4 py-2 overflow-y-auto max-h-[400px]">
              {isRankingsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, idx) => (
                    <div key={`skeleton-group-${idx}`}>
                      <div className="h-5 bg-gray-200 animate-pulse rounded w-32 mb-2"></div>
                      <table className="w-full table-auto text-left text-sm mb-4">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="p-2 font-medium text-gray-600">키워드</th>
                            <th className="p-2 font-medium text-gray-600">현재순위</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: 3 }).map((_, idx) => (
                            <tr key={`skeleton-row-${idx}`} className="border-b">
                              <td className="p-2">
                                <div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div>
                              </td>
                              <td className="p-2">
                                <div className="h-4 bg-gray-200 animate-pulse rounded w-12"></div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ) : keywordRankings && Object.keys(keywordRankings).length > 0 ? (
                <div className="space-y-6">
                  {(Object.entries(keywordRankings) as [string, { place_name: string; keywords: { keyword: string; ranking: number | null }[] }][]).map(([placeId, data]) => (
                    <div key={placeId} className="mb-4">
                      <h3 className="font-medium text-gray-800 mb-2 pb-1 border-b">
                        {data.place_name}
                      </h3>
                      <table className="w-full table-auto text-left text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="p-2 font-medium text-gray-600">키워드</th>
                            <th className="p-2 font-medium text-gray-600">현재순위</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.keywords && data.keywords.length > 0 ? (
                            data.keywords.map((keyword: { keyword: string; ranking: number | null; }) => (
                              <tr key={`${placeId}-${keyword.keyword}`} className="hover:bg-gray-50 border-b">
                                <td className="p-2">{keyword.keyword}</td>
                                <td className="p-2">
                                  {keyword.ranking !== null 
                                    ? <span className="font-semibold">{keyword.ranking}위</span> 
                                    : <span className="text-gray-400">-</span>}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={2} className="p-2 text-center text-gray-500">
                                등록된 키워드가 없습니다.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  등록된 키워드가 없거나 순위 데이터를 가져오지 못했습니다.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

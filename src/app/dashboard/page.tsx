'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardChart from "@/components/Dashboard/DashboardChart";
import apiClient from "@/lib/apiClient";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import { useBusinessContext } from '@/app/dashboard/BusinessContext';
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  Target,
  BarChart3,
  Calendar
} from 'lucide-react';

// CSR 컴포넌트로 변경
export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeBusiness, isLoading: isLoadingBusinesses } = useBusinessContext();

  // 사용자 정보 가져오기
  const { data: user, isLoading: isLoadingUser, isError: userError } = useUser();
  const userId = user?.id;

  // selectedBusinessId를 activeBusiness에서 가져오기
  const selectedBusinessId = activeBusiness?.place_id || null;

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

  // SEO 점수 가져오기
  const { data: seoScore, isLoading: isLoadingSEO } = useQuery({
    queryKey: ['seoScore', selectedBusinessId],
    enabled: !!selectedBusinessId,
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/api/seo/result/${selectedBusinessId}`);
        if (response.data?.data?.hasResult === false) {
          return null; // SEO 분석 결과가 없음
        }
        return response.data?.data?.overallScore || null;
      } catch (error) {
        console.error('SEO score fetch failed:', error);
        return null;
      }
    }
  });

  // 리뷰 데이터 가져오기 (새로운 대시보드 전용 API 사용)
  const { data: reviewData, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['dashboardReviewStatus', selectedBusinessId],
    enabled: !!selectedBusinessId,
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/api/reviews/dashboard-status/${selectedBusinessId}`);
        return response.data?.data || null;
      } catch (error) {
        console.error('Dashboard review status fetch failed:', error);
        return null;
      }
    }
  });

  // 작업 현황 가져오기
  const { data: workStatus, isLoading: isLoadingWork } = useQuery({
    queryKey: ['workStatus', userId],
    enabled: !!userId,
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/api/work-history/user/${userId}`);
        const workHistories = response.data?.data || [];
        
        // 진행 중인 작업과 예정된 작업 계산
        const now = new Date();
        const inProgress = workHistories.filter((work: { 
          start_date: string; 
          end_date: string; 
        }) => {
          const startDate = new Date(work.start_date);
          const endDate = new Date(work.end_date);
          return startDate <= now && now <= endDate;
        }).length;
        
        const upcoming = workHistories.filter((work: { 
          start_date: string; 
        }) => {
          const startDate = new Date(work.start_date);
          return startDate > now;
        }).length;
        
        return { inProgress, upcoming, total: workHistories.length };
      } catch (error) {
        console.error('Work status fetch failed:', error);
        return { inProgress: 0, upcoming: 0, total: 0 };
      }
    }
  });
  const { data: mainKeywordStatus, isLoading: isKeywordLoading } = useQuery({
    queryKey: ['mainKeywordStatus', selectedBusinessId],
    enabled: !!selectedBusinessId,
    queryFn: async () => {
      try {
        console.log('[DEBUG] 메인 키워드 요청 - placeId:', selectedBusinessId);
        // place_id를 쿼리 파라미터로 전달
        const response = await apiClient.get(`/keyword/main-status?place_id=${selectedBusinessId}`);
        console.log('[DEBUG] 메인 키워드 응답:', response.data);
        const data = response.data?.data || null;
        console.log('[DEBUG] 메인 키워드 처리된 데이터:', data);
        return data;
      } catch (error) {
        console.error('Main keyword status fetch failed:', error);
        return null;
      }
    }
  });

  // 업체의 모든 키워드 목록 가져오기 (콤보박스용)
  const { data: availableKeywords = [] } = useQuery({
    queryKey: ['availableKeywords', selectedBusinessId],
    enabled: !!selectedBusinessId,
    queryFn: async () => {
      try {
        console.log('[DEBUG] availableKeywords 요청 - placeId:', selectedBusinessId);
        const response = await apiClient.get(`/keyword/keyword-rankings-by-business?placeId=${selectedBusinessId}`);
        console.log('[DEBUG] availableKeywords 원본 응답:', response.data);
        const data = response.data?.data || {};
        console.log('[DEBUG] availableKeywords 처리된 데이터:', data);
        const keywords = data.keywords || [];
        console.log('[DEBUG] availableKeywords 최종 키워드 배열:', keywords);
        return keywords;
      } catch (error) {
        console.error('Available keywords fetch failed:', error);
        return [];
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
        
        // 선택된 업체의 키워드 데이터를 가져옵니다
        const response = await apiClient.get(
          `/keyword/keyword-rankings-by-business?placeId=${placeId}`
        );
        
        // 선택된 업체의 키워드 데이터를 적절한 형태로 변환
        const data = response.data?.data || {};
        return {
          [placeId]: {
            place_name: activeBusiness?.place_name || '',
            keywords: data.keywords || []
          }
        };
      } catch (error) {
        console.error('Keyword rankings fetch failed:', error);
        return {};
      }
    }
  });

  // 차트 데이터 가져오기 (새로운 간단한 API 사용)
  const { data: chartData = null, isLoading: isChartLoading } = useQuery({
    queryKey: ['mainKeywordChartData', userId, selectedBusinessId],
    enabled: !!userId && !!selectedBusinessId,
    queryFn: async () => {
      try {
        if (!userId || !selectedBusinessId) return null;
        
        console.log('메인 키워드 차트 데이터 요청:', { userId, placeId: selectedBusinessId });
        const query = `?userId=${userId}&placeId=${selectedBusinessId}`;
        const response = await apiClient.get(`/api/main-keyword-chart-data${query}`);
        console.log('차트 API 응답:', response.data);
        
        const chartResult = response.data?.data || [];
        console.log('최종 차트 데이터:', chartResult);
        return chartResult.length > 0 ? chartResult : null;
      } catch (error) {
        console.error('Chart data fetch failed:', error);
        return null;
      }
    }
  });  // 로딩 상태 통합 및 메시지 개선
  const isLoading = isLoadingUser || isLoadingBusinesses || isKeywordLoading || isRankingsLoading || isChartLoading;

  // 로딩 메시지 결정
  const getLoadingMessage = () => {
    if (isLoadingUser) return '사용자 정보를 불러오는 중...';
    if (isLoadingBusinesses) return '업체 정보를 불러오는 중...';
    if (isKeywordLoading) return '키워드 정보를 불러오는 중...';
    if (isLoadingReviews) return '리뷰 현황을 불러오는 중...';
    if (isLoadingSEO) return 'SEO 점수를 불러오는 중...';
    if (isLoadingWork) return '작업 현황을 불러오는 중...';
    if (isRankingsLoading) return '키워드 순위를 불러오는 중...';
    if (isChartLoading) return '메인 키워드 차트 데이터를 불러오는 중...';
    return '데이터를 불러오는 중...';
  };
  
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
  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-900 mb-2">
            {getLoadingMessage()}
          </div>
          <div className="text-sm text-gray-500">
            잠시만 기다려주세요
          </div>
        </div>
      </div>
    );
  }

  // 메인 키워드 변경 함수
  const updateMainKeyword = async (newKeywordId: string) => {
    try {
      console.log('메인 키워드 변경:', { selectedBusinessId, newKeywordId });
      
      await apiClient.patch(`/keyword/main-keyword/${selectedBusinessId}`, {
        keywordId: parseInt(newKeywordId, 10) // 숫자로 변환
      });
      
      // 쿼리 무효화하여 UI 업데이트
      queryClient.invalidateQueries({ queryKey: ['mainKeywordStatus', selectedBusinessId] });
      queryClient.invalidateQueries({ queryKey: ['mainKeywordChartData', userId, selectedBusinessId] });
      
      console.log('메인 키워드 변경 완료');
    } catch (error) {
      console.error('Failed to update main keyword:', error);
      alert('메인 키워드 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div 
        ref={contentRef}
        className={`transition-all duration-300 ease-in-out ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={isStabilizing && contentHeight ? { minHeight: `${contentHeight}px` } : {}}
      >
        {/* 페이지 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
            <p className="text-gray-600 mt-1">
              {activeBusiness ? `${activeBusiness.place_name}의 현황을 확인하세요` : '업체를 선택해주세요'}
            </p>
          </div>
        </div>

        {/* 상단 메트릭 카드들 */}
        <div className="grid gap-6 md:grid-cols-5 mb-8">
          {/* 메인 키워드 순위 */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
                메인 키워드 순위
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 순위 표시 */}
              <div className="text-center">
                {isKeywordLoading ? (
                  <div className="h-12 bg-gray-200 animate-pulse rounded-lg"></div>
                ) : mainKeywordStatus?.currentRank ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {mainKeywordStatus.currentRank}
                    </span>
                    <span className="text-lg font-medium text-gray-500">위</span>
                    {mainKeywordStatus?.diff !== undefined && mainKeywordStatus.diff !== 0 && (
                      <div className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        mainKeywordStatus.diff < 0 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {mainKeywordStatus.diff < 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(mainKeywordStatus.diff)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-4xl font-bold text-gray-300">-<span className="text-lg">위</span></div>
                )}
              </div>
              
              {/* 키워드 선택 */}
              <div className="space-y-3">
                <Select 
                  value={mainKeywordStatus?.keywordId?.toString() || ''} 
                  onValueChange={(value) => {
                    console.log('[DEBUG] 콤보박스 선택됨:', { value, availableKeywords, mainKeywordStatus });
                    updateMainKeyword(value);
                  }}
                >
                  <SelectTrigger className="w-full bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors h-11 rounded-lg">
                    <SelectValue placeholder="키워드를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {availableKeywords.length > 0 ? availableKeywords.map((keyword: { keyword_id: number; keyword: string; currentRank?: number; last_search_volume?: number }) => (
                      <SelectItem key={keyword.keyword_id} value={keyword.keyword_id.toString()}>
                        <div className="flex items-center justify-between w-full min-w-0">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{keyword.keyword}</div>
                            {keyword.last_search_volume && keyword.last_search_volume > 0 && (
                              <div className="text-xs text-gray-500">
                                월 {keyword.last_search_volume.toLocaleString()}회
                              </div>
                            )}
                          </div>
                          {keyword.currentRank && (
                            <span className="ml-2 bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs font-medium">
                              {keyword.currentRank}위
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    )) : (
                      <SelectItem value="no-keywords" disabled>
                        키워드가 없습니다
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>

                {/* 현재 선택된 키워드 상세 - 컴팩트한 디자인 */}
                {mainKeywordStatus?.keyword && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm truncate">
                          {mainKeywordStatus.keyword}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-blue-600 font-bold text-sm">
                            {mainKeywordStatus.currentRank ? `${mainKeywordStatus.currentRank}위` : '-'}
                          </span>
                          {mainKeywordStatus.searchVolume && mainKeywordStatus.searchVolume > 0 && (
                            <span className="text-xs text-gray-600">
                              월 {mainKeywordStatus.searchVolume.toLocaleString()}회
                            </span>
                          )}
                          {mainKeywordStatus?.diff !== undefined && mainKeywordStatus.diff !== 0 && (
                            <span className={`text-xs ${mainKeywordStatus.diff < 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {mainKeywordStatus.diff < 0 ? '↗' : '↘'} {Math.abs(mainKeywordStatus.diff)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO 전체 점수 */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                SEO 점수
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                {isLoadingSEO ? (
                  <div className="h-12 bg-gray-200 animate-pulse rounded-lg"></div>
                ) : seoScore ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {seoScore}
                    </span>
                    <span className="text-lg font-medium text-gray-500">/100</span>
                  </div>
                ) : (
                  <div className="text-lg font-medium text-gray-400">분석 필요</div>
                )}
              </div>
              
              <div className="space-y-2">
                {seoScore ? (
                  <Progress value={seoScore} className="h-2" />
                ) : (
                  <div className="h-2 bg-gray-100 rounded-full"></div>
                )}
                
                <div className="flex justify-center">
                  {seoScore && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      seoScore >= 80 
                        ? 'bg-green-100 text-green-700' 
                        : seoScore >= 60 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {seoScore >= 80 ? '우수' : seoScore >= 60 ? '보통' : '개선 필요'}
                    </span>
                  )}
                </div>
                
                <div className="text-center text-xs text-gray-500">
                  {seoScore ? 'SEO 최적화 점수' : 'SEO 분석을 실행해주세요'}
                </div>
                
                {/* SEO 분석 버튼 */}
                {!seoScore && (
                  <button
                    onClick={() => router.push('/dashboard/seo-optimization')}
                    className="w-full mt-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium py-2 px-4 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    SEO 분석 하러가기
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 블로그 리뷰 현황 */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Star className="h-4 w-4 text-white" />
                </div>
                블로그 리뷰
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                {isLoadingReviews ? (
                  <div className="h-12 bg-gray-200 animate-pulse rounded-lg"></div>
                ) : reviewData ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {reviewData.blogReviews?.count || 0}
                    </span>
                    <span className="text-lg font-medium text-gray-500">개</span>
                  </div>
                ) : (
                  <div className="text-4xl font-bold text-gray-300">-<span className="text-lg">개</span></div>
                )}
              </div>

              {reviewData && (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                      (reviewData.blogReviews?.recent2Weeks || 0) === 0
                        ? 'bg-red-100 text-red-700' 
                        : (reviewData.blogReviews?.recent2Weeks || 0) >= 3
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {(reviewData.blogReviews?.recent2Weeks || 0) === 0 ? (
                        <>
                          <AlertCircle className="h-3 w-3" />
                          주의
                        </>
                      ) : (reviewData.blogReviews?.recent2Weeks || 0) >= 3 ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          우수
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" />
                          보통
                        </>
                      )}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">최근 2주</span>
                      <span className="font-medium text-gray-900">
                        {reviewData.blogReviews?.recent2Weeks || 0}개
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">지난 달</span>
                      <span className="font-medium text-gray-900">
                        {reviewData.blogReviews?.recentMonth || 0}개
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 영수증 리뷰 현황 */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Star className="h-4 w-4 text-white" />
                </div>
                영수증 리뷰
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                {isLoadingReviews ? (
                  <div className="h-12 bg-gray-200 animate-pulse rounded-lg"></div>
                ) : reviewData ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {reviewData.receiptReviews?.count || 0}
                    </span>
                    <span className="text-lg font-medium text-gray-500">개</span>
                  </div>
                ) : (
                  <div className="text-4xl font-bold text-gray-300">-<span className="text-lg">개</span></div>
                )}
              </div>

              {reviewData && (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                      (reviewData.receiptReviews?.recent2Weeks || 0) === 0
                        ? 'bg-red-100 text-red-700' 
                        : (reviewData.receiptReviews?.recent2Weeks || 0) >= 5
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {(reviewData.receiptReviews?.recent2Weeks || 0) === 0 ? (
                        <>
                          <AlertCircle className="h-3 w-3" />
                          주의
                        </>
                      ) : (reviewData.receiptReviews?.recent2Weeks || 0) >= 5 ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          우수
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" />
                          보통
                        </>
                      )}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">최근 2주</span>
                      <span className="font-medium text-gray-900">
                        {reviewData.receiptReviews?.recent2Weeks || 0}개
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">지난 달</span>
                      <span className="font-medium text-gray-900">
                        {reviewData.receiptReviews?.recentMonth || 0}개
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 작업 현황 */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                작업 현황
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                {isLoadingWork ? (
                  <div className="h-12 bg-gray-200 animate-pulse rounded-lg"></div>
                ) : workStatus ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {workStatus.inProgress}
                    </span>
                    <span className="text-lg font-medium text-gray-500">개</span>
                  </div>
                ) : (
                  <div className="text-4xl font-bold text-gray-300">0<span className="text-lg">개</span></div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    (workStatus?.inProgress || 0) > 0 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {(workStatus?.inProgress || 0) > 0 ? (
                      <>
                        <Clock className="h-3 w-3" />
                        진행중
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        대기중
                      </>
                    )}
                  </span>
                </div>
                
                {workStatus && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">예정된 작업</span>
                      <span className="font-medium text-gray-900">
                        {workStatus.upcoming}개
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 하단 차트 및 키워드 테이블 */}
        <div className="grid gap-8 md:grid-cols-2 mt-8">
          {/* 2주간 순위 변화 그래프 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                2주간 순위 변화
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isChartLoading ? (
                  <div className="bg-white p-4 rounded-xl h-full">
                    <div className="h-6 bg-gray-200 animate-pulse rounded w-40 mb-4"></div>
                    <div className="h-[250px] bg-gray-100 animate-pulse rounded w-full"></div>
                  </div>
                ) : chartData && Array.isArray(chartData) && chartData.length > 0 ? (
                  <DashboardChart initialData={chartData} />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">차트 데이터가 없습니다</p>
                      <p className="text-gray-400 text-xs mt-1">
                        키워드 순위 데이터가 수집되면 표시됩니다
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 키워드 순위 테이블 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                등록된 키워드 순위
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-y-auto max-h-[300px]">
                {isRankingsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div key={`skeleton-${idx}`} className="flex justify-between items-center py-2">
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div>
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-12"></div>
                      </div>
                    ))}
                  </div>
                ) : keywordRankings && Object.keys(keywordRankings).length > 0 ? (
                  <div className="space-y-4">
                    {activeBusiness?.place_id && keywordRankings[activeBusiness.place_id] ? (
                      <div>
                        <div className="space-y-2">
                          {keywordRankings[activeBusiness.place_id].keywords.map((keyword: { keyword: string; ranking: number | null }) => (
                            <div key={keyword.keyword} className="flex justify-between items-center py-2 border-b">
                              <span className="text-sm font-medium">{keyword.keyword}</span>
                              <div className="flex items-center gap-2">
                                {keyword.ranking !== null ? (
                                  <>
                                    <span className="text-sm font-bold">{keyword.ranking}위</span>
                                    {keyword.ranking <= 3 ? (
                                      <TrendingUp className="h-4 w-4 text-green-500" />
                                    ) : keyword.ranking <= 10 ? (
                                      <TrendingUp className="h-4 w-4 text-yellow-500" />
                                    ) : (
                                      <TrendingDown className="h-4 w-4 text-red-500" />
                                    )}
                                  </>
                                ) : (
                                  <span className="text-sm text-gray-400">-</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        선택된 업체의 키워드가 없습니다.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    등록된 키워드가 없습니다.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

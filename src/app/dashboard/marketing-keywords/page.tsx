"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useUser } from "@/hooks/useUser"; 
import { useUserBusinesses } from "@/hooks/useUserBusinesses";
import { useUserKeywords } from "@/hooks/useUserKeywords";
import { useKeywordRankingDetails } from "@/hooks/useKeywordRankingDetails";
import { useAddKeyword } from "@/hooks/useAddKeyword";
import { useKeywordHistory } from '@/hooks/useKeywordHistory';

import KeywordRankingChart, { ChartDataItem } from "./KeywordRankingChart";
import KeywordRankingTable from "./KeywordRankingTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Combobox } from "@/components/ui/combobox";
// import LoadingSpinner from "@/components/ui/LoadingSpinner"; 
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { DateRangeSlider } from "@/components/ui/date-range-slider"; // Import the new slider
import { UserKeyword, KeywordRankingDetail, KeywordHistoricalData, KeywordRankingData } from "@/types";
import { toast } from "sonner";
import { transformToChartData } from "@/utils/dataTransformers";

export default function MarketingKeywordsPage() {
  const { data: user, isLoading: isLoadingUser, isError: isErrorUser } = useUser(); 
  const userId = user?.id;
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [newKeyword, setNewKeyword] = useState("");
  const [selectedKeywordForChart, setSelectedKeywordForChart] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("chart");
  // const [showFullChart, setShowFullChart] = useState(false); // Removed
  const [timeRangeValue, setTimeRangeValue] = useState(30); // 기본값 30일
  const [expandedKeywordIndex, setExpandedKeywordIndex] = useState<number | null>(null);

  const { businesses: userBusinesses, isLoading: isLoadingBusinesses, isError: isErrorBusinesses } = useUserBusinesses(userId ? String(userId) : undefined); // Convert userId to string

  useEffect(() => {
    console.log('userBusinesses:', userBusinesses); // 디버깅: userBusinesses 데이터 확인
    if (userBusinesses && userBusinesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(String(userBusinesses[0].place_id));
    }
  }, [userBusinesses, selectedBusinessId]);

  // 디버깅: 사용자 및 키워드 데이터 로그
  const { 
    keywords: userKeywordsData, 
    loading: isLoadingKeywords, 
    error: errorLoadingKeywords, 
    refetch: refetchKeywords 
  } = useUserKeywords(userId, selectedBusinessId ?? undefined);

  const userKeywords: UserKeyword[] = useMemo(() => userKeywordsData || [], [userKeywordsData]);

  // 뷰가 열린 키워드에 대해 on-demand 히스토리 로딩
  const activeKeyword = expandedKeywordIndex !== null ? userKeywords[expandedKeywordIndex] : null;
  const { data: historyData, isLoading: loadingHistory } = useKeywordHistory(
    selectedBusinessId,
    activeKeyword?.keywordId ?? null,
    30
  );

  // Log processed userKeywords
  useEffect(() => {
    if (selectedBusinessId && userKeywords.length > 0) {
      console.log('[Debug] Processed userKeywords for UI:', userKeywords);
      userKeywords.forEach((kw, idx) => {
        console.log(`[Debug] Keyword ${idx}:`, kw.keyword, `id=${kw.id}, keywordId=${kw.keywordId}`);
      });
    } else if (selectedBusinessId) {
      console.log('[Debug] Processed userKeywords is empty or not yet loaded for selected business.');
    }
  }, [userKeywords, selectedBusinessId]);

  // 디버깅: activeKeyword 확인
  useEffect(() => {
    console.log('[DEBUG] Current activeKeyword:', activeKeyword);
    if (activeKeyword) {
      console.log('[DEBUG] activeKeyword.keywordId (being sent to useKeywordHistory):', activeKeyword.keywordId);
      console.log('[DEBUG] activeKeyword.id (user_place_keywords table ID):', activeKeyword.id);
    }
  }, [activeKeyword]);

  const {
    data: allKeywordsRankingData,
    isLoading: isLoadingRankings,
    isError: isErrorRankingsFlag,
    error: errorRankings,
    refetch: refetchRankings,
  } = useKeywordRankingDetails({
    userId: userId ?? undefined,
    activeBusinessId: selectedBusinessId ?? undefined,
  });
  
  const keywordRankingsMap = useMemo(() => {
    const map = new Map<string, { details: KeywordRankingDetail[]; historical: ChartDataItem[] }>();
    if (allKeywordsRankingData?.rankingDetails) {
      const detailsByKeyword: { [key: string]: KeywordRankingDetail[] } = {};
      for (const detail of allKeywordsRankingData.rankingDetails) {
        if (detail.keyword) {
          if (!detailsByKeyword[detail.keyword]) {
            detailsByKeyword[detail.keyword] = [];
          }
          detailsByKeyword[detail.keyword].push(detail);
        }
      }
      for (const keyword in detailsByKeyword) {
        const sortedDetails = [...detailsByKeyword[keyword]].sort((a,b) => new Date(a.date_key).getTime() - new Date(b.date_key).getTime());
        map.set(keyword, {
          details: sortedDetails,
          historical: transformToChartData(sortedDetails) as ChartDataItem[] 
        });
      }
    }
    return map;
  }, [allKeywordsRankingData]);

  const numericSelectedBusinessId = useMemo(() => {
    if (!selectedBusinessId) return null;
    const numId = parseInt(selectedBusinessId, 10);
    return isNaN(numId) ? null : numId;
  }, [selectedBusinessId]);

  const addKeywordMutation = useAddKeyword(
    userId!, 
    numericSelectedBusinessId!
  );

  // Get selected business object
  const selectedBusiness = useMemo(() => {
    if (!selectedBusinessId || !userBusinesses) return null;
    return userBusinesses.find(business => business.place_id === selectedBusinessId) || null;
  }, [selectedBusinessId, userBusinesses]);
  
  // const changeKeywordMutation = useChangeKeyword(
  //   userId!, 
  //   numericSelectedBusinessId!
  // );

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) {
      toast.error("키워드를 입력해주세요.");
      return;
    }
    if (!userId || numericSelectedBusinessId === null) {
      toast.error("업체 정보가 유효하지 않습니다.");
      return;
    }
    try {
      await addKeywordMutation.addKeyword(newKeyword.trim());
      setNewKeyword("");
      refetchKeywords();
      refetchRankings();
    } catch (error) {
      console.error("Error adding keyword:", error);
    }
  };

  const businessOptions = useMemo(() => {
    if (!userBusinesses) return [];
    const options = userBusinesses.map((business) => {
      const displayName = 'display_name' in business 
        ? (business as { display_name: string }).display_name 
        : business.place_name || "내 업체";
      return {
        value: business.place_id || "", // Handle undefined place_id
        label: displayName,
      };
    });
    console.log('businessOptions:', options); // 디버깅: businessOptions 배열 확인
    return options;
  }, [userBusinesses]);

  const preparedKeywordOptions = useMemo(() => {
    // 1. 먼저 모든 키워드 옵션 생성
    const options = userKeywords.map((uk) => { 
      const keyword = uk.keyword || "N/A";
      const rankingData = keywordRankingsMap.get(keyword);
      // Use historical chart data to determine current ranking
      const currentRanking = rankingData?.historical && rankingData.historical.length > 0
        ? rankingData.historical[rankingData.historical.length - 1].ranking
        : null;
      
      // 순위 정보 표시 형식 개선
      let rankingDisplay;
      if (currentRanking !== null) {
        rankingDisplay = `${currentRanking}위`;
      } else {
        rankingDisplay = "순위 정보 없음";
      }
      
      return {
        value: keyword,
        label: `${keyword} (현재 ${rankingDisplay})`,
        hasRanking: currentRanking !== null,
        ranking: currentRanking
      };
    });
    
    // 2. 순위 정보가 있는 것 먼저, 그 다음 알파벳 순으로 정렬
    return options.sort((a, b) => {
      // 순위 정보 있는 것을 먼저
      if (a.hasRanking && !b.hasRanking) return -1;
      if (!a.hasRanking && b.hasRanking) return 1;
      
      // 둘 다 순위 정보가 있으면 순위 순서대로
      if (a.hasRanking && b.hasRanking) {
        if (a.ranking !== null && b.ranking !== null) {
          return a.ranking! - b.ranking!;
        }
      }
      
      // 그 외에는 키워드 알파벳순
      return a.value.localeCompare(b.value);
    });
  }, [userKeywords, keywordRankingsMap]);

  const tableKeywordData: KeywordRankingData | null = useMemo(() => {
    if (!allKeywordsRankingData) return null;
    return {
      rankingDetails: allKeywordsRankingData.rankingDetails || [],
      rankingList: allKeywordsRankingData.rankingList || [],
      chartData: allKeywordsRankingData.chartData as KeywordHistoricalData[] | undefined,
      metadata: {
        totalCount: allKeywordsRankingData.rankingDetails?.length || 0,
        currentPage: 1,
        lastUpdated: new Date().toISOString(),
      }
    };
  }, [allKeywordsRankingData]);

  // Only pass data for the currently selected keyword into the table
  const filteredTableKeywordData = useMemo(() => {
    if (!tableKeywordData || !selectedKeywordForChart) return null;
    return {
      rankingDetails: tableKeywordData.rankingDetails.filter(d => d.keyword === selectedKeywordForChart),
      rankingList: [],
      chartData: undefined,
      metadata: tableKeywordData.metadata
    };
  }, [tableKeywordData, selectedKeywordForChart]);


  // 디버깅: 로딩 상태 확인
  console.log('Debug Loading States:', {
    isLoadingUser,
    isLoadingBusinesses,
    userId,
    userBusinesses
  });

  // 로딩 상태 처리
  if (isLoadingUser || isLoadingBusinesses || (userId && !userBusinesses && !isErrorBusinesses)) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <Skeleton className="h-8 w-1/4 mb-8" />
        <Skeleton className="h-10 w-full sm:w-96 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // 디버깅: 오류 상태 확인
  console.log('Debug Error States:', {
    isErrorUser,
    isErrorBusinesses,
    userId,
    user,
    userBusinesses
  });

  // 더 세밀한 오류 처리
  if (!userId) {
    return (
      <div className="text-center mt-20 p-4 max-w-md mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">로그인이 필요합니다</h2>
          <p className="text-yellow-700 mb-4">마케팅 키워드 기능을 사용하려면 로그인이 필요합니다.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  if (isErrorUser) {
    return (
      <div className="text-center mt-20 p-4 max-w-md mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">사용자 정보 오류</h2>
          <p className="text-red-700 mb-4">사용자 정보를 불러올 수 없습니다. 네트워크 연결을 확인하거나 다시 로그인해주세요.</p>
          <div className="space-x-2">
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              새로고침
            </button>
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              다시 로그인
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isErrorBusinesses) {
    return (
      <div className="text-center mt-20 p-4 max-w-md mx-auto">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-orange-800 mb-2">업체 정보 오류</h2>
          <p className="text-orange-700 mb-4">업체 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }
  
  if (userBusinesses && userBusinesses.length === 0 && userId) {
    return <div className="text-center mt-20 p-4">등록된 업체가 없습니다. 업체를 먼저 등록해주세요.</div>;
  }

  // Get display name for the selected business
  const selectedBusinessDisplayName = selectedBusiness && 'display_name' in selectedBusiness 
    ? (selectedBusiness as { display_name: string }).display_name 
    : selectedBusiness?.place_name || "";

  const toggleAccordionByIndex = (index: number) => {
    setExpandedKeywordIndex(expandedKeywordIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">마케팅 키워드 관리</h1>

      {/* Flex container for Business Selection and Add Keyword */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Business Selection Section */}
        <div className="flex-1 p-6 bg-white shadow rounded-lg">
          <label htmlFor="business-select" className="block text-sm font-medium text-gray-700 mb-2">
            업체 선택
          </label>
          {businessOptions.length > 0 ? (
            <Combobox
              options={businessOptions.map((opt: { value: string; label: string }) => opt.label || "내 업체").filter((label, index, self) => self.indexOf(label) === index)} // Remove duplicates
              value={selectedBusinessDisplayName} // Use the display name as the value
              onChange={(selectedDisplayName) => { 
                console.log('Selected display name:', selectedDisplayName);
                const selectedOpt = businessOptions.find((opt: { value: string; label: string }) => opt.label === selectedDisplayName);
                console.log('Found business option:', selectedOpt);
                if (selectedOpt) {
                  setSelectedBusinessId(selectedOpt.value);
                  setSelectedKeywordForChart(null); 
                  setActiveTab("chart");
                  setExpandedKeywordIndex(null); // Reset accordion on business change
                }
              }}
              placeholder="업체를 선택하세요..."
              className="w-full border-2 focus-within:border-blue-500" // Adjusted width to full
            />
          ) : (
            <div className="p-2 text-gray-500 border rounded">
              업체 데이터를 불러오는 중이거나 사용 가능한 업체가 없습니다.
            </div>
          )}
        </div>

        {/* Add New Keyword Section - Conditionally rendered */}
        {selectedBusinessId && (
          <div className="flex-1 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">새 키워드 추가</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="새로운 키워드를 입력하세요 (예: 강남역 맛집)"
                className="flex-grow"
                disabled={addKeywordMutation.isAdding}
              />
              <Button 
                onClick={handleAddKeyword} 
                disabled={addKeywordMutation.isAdding || !newKeyword.trim() || numericSelectedBusinessId === null}
                className="w-full sm:w-auto"
              >
                {addKeywordMutation.isAdding ? <Skeleton className="h-5 w-5" /> : "키워드 추가"}
              </Button>
            </div>
            {addKeywordMutation.error && (
              <p className="text-red-500 text-sm mt-2">
                {(addKeywordMutation.error as Error)?.message || "키워드 추가에 실패했습니다."}
              </p>
            )}
          </div>
        )}
      </div>

      {selectedBusinessId && (
        <>
          {isLoadingKeywords && (
            <div className="my-8 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-2/3" />
            </div>
          )}
          {errorLoadingKeywords && <p className="text-red-500 my-4 p-4 bg-red-50 rounded-md">키워드 목록을 불러오는데 실패했습니다: {(errorLoadingKeywords as Error).message}</p>}
          
          {!isLoadingKeywords && !errorLoadingKeywords && userKeywords.length === 0 && (
            <div className="text-center text-gray-500 py-8 my-4 bg-white shadow rounded-lg">
              <p className="text-lg">등록된 키워드가 없습니다.</p>
              <p className="text-sm">위에서 키워드를 추가해주세요.</p>
            </div>
          )}

          {userKeywords.length > 0 && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="grid w-full grid-cols-2 gap-2"> {/* Removed bg-slate-100, p-1.5, and rounded-lg */}
                <TabsTrigger 
                  value="chart" 
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                    ${activeTab === "chart" 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:bg-slate-200/60 hover:text-slate-700"
                    }`}
                >
                  차트 정보
                </TabsTrigger>
                <TabsTrigger 
                  value="table" 
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                    ${activeTab === "table" 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:bg-slate-200/60 hover:text-slate-700"
                    }`}
                >
                  표 정보
                </TabsTrigger>
              </TabsList>
              <TabsContent value="chart" className="mt-6 bg-white shadow-lg rounded-xl p-6">
                {!isLoadingRankings && userKeywords.length > 0 && (
                  <div className="space-y-3">
                    {userKeywords.map((keyword, index) => {
                      const isExpanded = expandedKeywordIndex === index;
                      
                      // Compute current ranking for header from historical data
                      const rankingDataForHeader = keywordRankingsMap.get(keyword.keyword || "");
                      const currentRankingForHeader = rankingDataForHeader?.historical && rankingDataForHeader.historical.length > 0
                        ? rankingDataForHeader.historical[rankingDataForHeader.historical.length - 1].ranking
                        : null;

                      return (
                         <div key={`${keyword.id}-${index}`} className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                          <button
                            onClick={() => toggleAccordionByIndex(index)}
                            className="w-full flex justify-between items-center p-4 text-left hover:bg-slate-50 transition-colors"
                          >
                            <h3 className="text-md font-semibold text-slate-800">
                              {keyword.keyword || "키워드 없음"} 
                              <span className="text-sm font-normal text-slate-500 ml-2">
                                (현재 {currentRankingForHeader !== null ? `${currentRankingForHeader}위` : '순위 정보 없음'})
                              </span>
                            </h3>
                          </button>

                          {isExpanded && (
                            <div className="p-4 border-t border-slate-200 bg-slate-50/70">

                              {loadingHistory ? (
                                 <div className="text-center py-8">로딩 중...</div>
                              ) : historyData && historyData.length > 0 ? (
                                 <KeywordRankingChart
                                   chartData={historyData}
                                   activeBusiness={selectedBusiness}
                                 />
                              ) : (
                                 <div className="text-center text-slate-500 py-8">
                                   <p className="text-lg">데이터 없음</p>
                                   <p className="text-sm">해당 키워드에 대한 차트 데이터가 없습니다.</p>
                                 </div>
                               )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {!isLoadingRankings && userKeywords.length === 0 && (
                  <div className="text-center text-gray-500 py-12">
                    <p className="text-lg">키워드가 없습니다.</p>
                    <p className="text-sm">위에서 키워드를 추가하면 순위 변동 그래프를 볼 수 있습니다.</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="table" className="mt-6 bg-white shadow-lg rounded-xl p-6"> {/* Added card styling and mt-4 */}
                {/* Removed inner div, content directly inside TabsContent */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                  <Combobox
                    options={preparedKeywordOptions.map(opt => opt.label)}
                    value={
                      selectedKeywordForChart
                        ? preparedKeywordOptions.find(opt => opt.value === selectedKeywordForChart)?.label || ""
                        : ""
                    }
                    onChange={(selectedLabel) => {
                      const selectedOpt = preparedKeywordOptions.find(opt => opt.label === selectedLabel);
                      setSelectedKeywordForChart(selectedOpt ? selectedOpt.value : null);
                    }}
                    placeholder="키워드를 선택하세요..."
                    className="w-full sm:w-96 border-2 focus-within:border-blue-500"
                  />
                </div>
                
                {isLoadingRankings && (
                  <div className="py-8 space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-3/4" />
                  </div>
                )}
                {isErrorRankingsFlag && <p className="text-red-500 text-center py-8">키워드 순위 정보를 가져오는데 실패했습니다: {(errorRankings as Error)?.message || "알 수 없는 오류"}</p>}
                {!isLoadingRankings && !isErrorRankingsFlag && filteredTableKeywordData && selectedKeywordForChart && (
                   <>
                     <div className="mb-4">
                       <DateRangeSlider 
                         label="시간 비교 (Time Machine)" 
                         defaultValue={[timeRangeValue]} 
                         max={30}
                         min={0}
                         step={1}
                         onValueChange={(values: number[]) => setTimeRangeValue(values[0])}
                         valueSuffix="일 전과 비교"
                       />
                     </div>
                     <KeywordRankingTable
                       isLoading={isLoadingKeywords || isLoadingRankings}
                       keywordData={filteredTableKeywordData}
                       activeBusiness={selectedBusiness}
                       selectedKeyword={selectedKeywordForChart || ""} 
                       historicalData={filteredTableKeywordData?.chartData || []}
                       rangeValue={timeRangeValue}
                       isError={isErrorRankingsFlag || errorLoadingKeywords instanceof Error}
                     />
                   </>
                )}
                {!isLoadingRankings && !isErrorRankingsFlag && (!filteredTableKeywordData || !selectedKeywordForChart) && (
                   <div className="text-center text-gray-500 py-12">
                      <p className="text-lg">키워드를 선택하세요</p>
                      <p className="text-sm">위에서 키워드를 선택하면 순위 테이블을 확인할 수 있습니다.</p>
                   </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );
}
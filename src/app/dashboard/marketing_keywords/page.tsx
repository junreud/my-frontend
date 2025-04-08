"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useKeywordRankingDetails } from "@/hooks/useKeywordRankingDetails";
import { useUserKeywords } from "@/hooks/useUserKeywords";
import { useBusinessSwitcher } from "@/hooks/useBusinessSwitcher";
import { useAddKeyword } from '@/hooks/useAddKeyword';
import { useChangeKeyword } from '@/hooks/useChangeKeyword';
import { useKeywordStatusPolling } from '@/hooks/useKeywordStatusPolling';
import { createLogger } from "@/lib/logger";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
// shadcn/ui components
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// Components
import KeywordRankingChart from "./KeywordRankingChart";
import KeywordRankingTable from "./KeywordRankingTable";
import { UserKeyword, KeywordHistoricalData, KeywordRankData, KeywordRankingDetail } from "@/types";

const logger = createLogger("MarketingKeywordsPage");

// 키워드 세부 정보 인터페이스
interface KeywordDetail {
  id: string | number;
  keyword_id: string | number;
  keyword: string;
  ranking: number | null;
  place_id: string; // number에서 string으로 변경
  place_name: string;
  category: string;
  savedCount: number | null;
  blog_review_count: number | null;
  receipt_review_count: number | null;
  keywordList: string[] | null;
  date_key: string;
}
interface KeywordRankingData {
  rankingDetails: KeywordRankingDetail[];
  chartData: KeywordHistoricalData[];
  rankingList: KeywordRankData[];
}
// 차트 데이터 포인트 인터페이스
interface ChartDataPoint {
  date: string;
  place_id: string | number | null;  // number 타입과 string 타입 모두 허용
  ranking: number | null;
  savedCount: number;
  blog_review_count: number;
  receipt_review_count: number;
  keywordItems: string[];
  saved: number;
  blogReviews: number;
  receiptReviews: number;
  // Add these properties to make it compatible with KeywordHistoricalData
  uv: number;
  date_key: string;
}

// 키워드 데이터 그룹 인터페이스
interface KeywordDataGroup {
  rankingDetails: KeywordDetail[];
  chartData: ChartDataPoint[];
  rankingList: KeywordRankData[];
}

// 키워드 맵 인터페이스
interface KeywordRankingsMap {
  [keyword: string]: KeywordDataGroup;
}

// Move formatChartData function outside of useMemo to prevent recreation on each render
function formatChartDataForKeywordMap(details: KeywordDetail[], activePlaceId?: string | null): ChartDataPoint[] {
  if (!details || details.length === 0) return [];
  
  const dateGroups: Record<string, KeywordDetail[]> = {};
  details.forEach(item => {
    if (!dateGroups[item.date_key]) {
      dateGroups[item.date_key] = [];
    }
    dateGroups[item.date_key].push(item);
  });

  const result = Object.keys(dateGroups)
    .sort()
    .map(date => {
      const items = dateGroups[date];
      const activePlaceItem = activePlaceId ? items.find(
        item => String(item.place_id) === String(activePlaceId)
      ) : null;
      
      return {
        date,
        date_key: date,
        uv: activePlaceItem?.ranking ?? 0,
        place_id: activePlaceItem?.place_id || null,
        ranking: activePlaceItem?.ranking || null,
        savedCount: activePlaceItem?.savedCount || 0,
        blog_review_count: activePlaceItem?.blog_review_count || 0,
        receipt_review_count: activePlaceItem?.receipt_review_count || 0,
        keywordItems: activePlaceItem?.keywordList || [],
        saved: activePlaceItem?.savedCount || 0,
        blogReviews: activePlaceItem?.blog_review_count || 0,
        receiptReviews: activePlaceItem?.receipt_review_count || 0,
      };
    });
  
  // Remove debug log that may contribute to render loops
  // console.log('[Debug] formatChartData 결과:', {
  //  itemCount: result.length,
  //  sampleItem: result.length > 0 ? result[0] : null
  // });
  
  return result;
}

export default function Page(): JSX.Element {
  const [openAccordionItem, setOpenAccordionItem] = useState<string | undefined>(undefined);
  const [rangeValue, setRangeValue] = useState<number>(0);
  const [maxRangeValue, setMaxRangeValue] = useState<number>(59); // Default to 59 (60 days)
  const [isRangePressed, setIsRangePressed] = useState<boolean>(false);
  const [selectedKeyword, setSelectedKeyword] = useState<string>("");
  const [historicalData, setHistoricalData] = useState<KeywordHistoricalData | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isChangeDialogOpen, setIsChangeDialogOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [editKeyword, setEditKeyword] = useState("");
  const [editKeywordId, setEditKeywordId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChangeMode, setIsChangeMode] = useState(false);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [pollingKeyword, setPollingKeyword] = useState<string | null>(null);
  const [updatingKeywords, setUpdatingKeywords] = useState<string[]>([]);

  const { activeBusiness, user } = useBusinessSwitcher();

  const { addKeyword, isAdding } = useAddKeyword(
    user?.id ?? 0, 
    Number(activeBusiness?.place_id ?? 0)
  );
  
  const { changeKeyword, isChanging } = useChangeKeyword(
    user?.id ?? 0, 
    Number(activeBusiness?.place_id ?? 0)
  );

  const { data: userData } = useUser();
  const queryClient = useQueryClient();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isKeywordsUpdating, setIsKeywordsUpdating] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedAccordionKeyword, setSelectedAccordionKeyword] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [crawlingStatus, setCrawlingStatus] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [crawlingTimeAgo, setCrawlingTimeAgo] = useState<string | null>(null);

  // 유저 키워드 가져오기
  const { 
    keywords: userKeywordObjects, 
    loading: keywordsLoading,
    error: keywordsError
  } = useUserKeywords(user?.id, activeBusiness?.place_id);

  const userKeywords = useMemo<string[]>(() => 
    (userKeywordObjects || [])
      .filter((k) => k !== null && k !== undefined && k.keyword !== undefined)
      .map((k) => k.keyword as string), 
    [userKeywordObjects]
  );

  const { 
    data: allKeywordRankingsData,
    isLoading: allKeywordsLoading,
    isError: allKeywordsError
} = useKeywordRankingDetails({
    activeBusinessId: activeBusiness?.place_id,
    userId: user?.id,
});
  const getKeywordLimit = (role?: string): number => {
    switch (role) {
      case "admin":
        return 999;
      case "plus":
        return 10;
      case "user":
      default:
        return 3;
    }
  };

  const keywordLimit = getKeywordLimit(userData?.role);
  const canAddKeywords = userKeywords.length < keywordLimit;
  
  // Updated refreshKeywordData function with better UX
  const refreshKeywordData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 쿼리 무효화
      await queryClient.invalidateQueries({
        queryKey: ['keywordRankingDetails', activeBusiness?.place_id, user?.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ['userKeywords', user?.id, activeBusiness?.place_id],
      });
  
      console.log('Keyword data refreshed successfully');
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("데이터 업데이트 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  }, [
    queryClient,
    activeBusiness?.place_id,
    user?.id,
  ]);
  
  // 별도의 useEffect로 폴링 키워드 관리
  useEffect(() => {
    if (!pollingKeyword && (isKeywordsUpdating || updatingKeywords.length > 0)) {
      setIsKeywordsUpdating(false);
      setUpdatingKeywords([]);
    }
  }, [pollingKeyword]);
  
  // handlePollingComplete를 리팩토링
  const handlePollingComplete = useCallback(() => {
    // 폴링 완료시 처리 수정
    const doRefresh = async () => {
      try {
        await refreshKeywordData();
      } finally {
        // 데이터 갱신 완료 여부와 상관없이 폴링 상태 초기화
        setPollingKeyword(null);
      }
    };
    
    // 비동기 작업 실행
    doRefresh();
  }, [refreshKeywordData]);
  
  // 수정된 useKeywordStatusPolling 호출
  const { status: keywordStatus } = useKeywordStatusPolling(pollingKeyword, handlePollingComplete);

  const prepareToChangeKeyword = (keywordText: string, keywordId: number) => {
    // Debug log to verify the keywordId being passed
    console.log('Debug prepareToChangeKeyword:', { keywordText, keywordId });
    
    // Set state without closing the combobox
    setEditKeyword(keywordText);
    setEditKeywordId(keywordId);
    
    // Open the dialog but keep combobox open
    setIsChangeDialogOpen(true);
    
    // Important: we DO NOT set isComboboxOpen to false here
    // This keeps the combobox open during the entire process
  };

  // Add this function to handle combobox close
  const handleComboboxOpenChange = (open: boolean) => {
    setIsComboboxOpen(open);
    
    // If closing the combobox, reset the change mode
    if (!open && isChangeMode) {
      setIsChangeMode(false);
    }
  };

  // 키워드별로 데이터 분류 (필터링)
  const keywordRankingsMap = useMemo<KeywordRankingsMap>(() => {
    if (!allKeywordRankingsData?.rankingDetails) return {};
    
    const allDetails: KeywordDetail[] = allKeywordRankingsData.rankingDetails.map(detail => {
      // 타입 호환성을 위해 디테일 객체를 잠시 타입 변환
      const detailAny = detail as unknown as { 
        id?: string | number; 
        keyword_id?: string | number; 
        keyword?: string;
        ranking: number;
        place_id: string;
        place_name?: string;
        category?: string;
        savedCount?: number | null;
        blog_review_count?: number | null;
        receipt_review_count?: number | null;
        keywordList?: string[];
        date_key?: string;
      };
      
      return {
        id: detailAny.id || '',  
        keyword_id: detailAny.keyword_id || '',
        keyword: detailAny.keyword || '',
        ranking: detail.ranking,
        place_id: detail.place_id,
        place_name: detailAny.place_name || '',
        category: detailAny.category || '',
        savedCount: detailAny.savedCount ?? null,
        blog_review_count: detailAny.blog_review_count ?? null,
        receipt_review_count: detailAny.receipt_review_count ?? null,
        keywordList: detailAny.keywordList || [],
        date_key: detailAny.date_key || '',
      };
    });

    const result: KeywordRankingsMap = {};
    const placeId = activeBusiness?.place_id;
    
    userKeywords.forEach(keyword => {
      const keywordDetails = allDetails.filter(detail => detail.keyword === keyword);

      if (keywordDetails.length > 0) {
        const chartData = formatChartDataForKeywordMap(keywordDetails, placeId);

        result[keyword] = {
          rankingDetails: keywordDetails,
          chartData,
          rankingList: allKeywordRankingsData.rankingList || []
        };
      }
    });

    logger.info(`${Object.keys(result).length}개 키워드 데이터 매핑 완료`);
    return result;
  }, [allKeywordRankingsData, userKeywords, activeBusiness?.place_id]); // Add activeBusiness?.place_id as dependency since it's used in formatChartData

  const selectedKeywordData = useMemo<KeywordDataGroup | null>(() => {
    if (!selectedKeyword) return null;
    return keywordRankingsMap[selectedKeyword] || null;
  }, [selectedKeyword, keywordRankingsMap]);

  const getKeywordCurrentRanking = (keyword: string): string | number => {
    if (!activeBusiness?.place_id || !keywordRankingsMap[keyword]) return '?';

    const keywordData = keywordRankingsMap[keyword];
    if (!keywordData || !keywordData.rankingDetails || keywordData.rankingDetails.length === 0) return '?';

    const myBusinessData = keywordData.rankingDetails.filter(
      item => String(item.place_id) === String(activeBusiness.place_id)
    );

    if (myBusinessData.length === 0) return '?';

    const sortedData = [...myBusinessData].sort(
      (a, b) => new Date(b.date_key).getTime() - new Date(a.date_key).getTime()
    );

    return sortedData.length > 0 && sortedData[0].ranking !== null && sortedData[0].ranking !== undefined 
      ? sortedData[0].ranking 
      : '?';
  };

  // 타임머신바의 최대값을 동적으로 설정하는 useEffect
  useEffect(() => {
    if (selectedKeyword && keywordRankingsMap[selectedKeyword]?.chartData) {
      const keywordDataLength = keywordRankingsMap[selectedKeyword].chartData.length;
      const dynamicMaxRange = Math.min(keywordDataLength - 1, 60);
  
      // setMaxRangeValue만 호출하되, 변경이 실제 필요할 때만
      setMaxRangeValue(prev => (prev !== dynamicMaxRange ? dynamicMaxRange : prev));
  
      // rangeValue가 정말 초과될 때만 setRangeValue
      if (rangeValue > dynamicMaxRange) {
        setRangeValue(dynamicMaxRange);
      }
    } else {
      if (maxRangeValue !== 0) setMaxRangeValue(0);
      if (rangeValue !== 0) setRangeValue(0);
      setHistoricalData(null);
    }
  }, [selectedKeyword, keywordRankingsMap, rangeValue, maxRangeValue]);
  
  // Second effect - handle historical data based on the selected range
  useEffect(() => {
    if (!selectedKeyword || !keywordRankingsMap[selectedKeyword]?.chartData) {
      if (historicalData !== null) {
        setHistoricalData(null);
      }
      return;
    }
  
    const keywordDataLength = keywordRankingsMap[selectedKeyword].chartData.length;
    const daysAgo = rangeValue;
    if (daysAgo === 0) {
      if (historicalData !== null) setHistoricalData(null);
      return;
    }
  
    const targetIndex = keywordDataLength - 1 - daysAgo;
    if (targetIndex >= 0) {
      const dataPoint = keywordRankingsMap[selectedKeyword].chartData[targetIndex];
      const newHistoricalData: KeywordHistoricalData = {
        date: dataPoint.date,
        ranking: dataPoint.ranking ?? 0,
        uv: dataPoint.uv,
        place_id: String(dataPoint.place_id || ''),
        date_key: dataPoint.date_key,
        blog_review_count: dataPoint.blog_review_count,
        receipt_review_count: dataPoint.receipt_review_count
      };
  
      // 🔑 변경 전후 동일성 비교
      if (JSON.stringify(historicalData) !== JSON.stringify(newHistoricalData)) {
        setHistoricalData(newHistoricalData);
      }
    } else {
      if (historicalData !== null) setHistoricalData(null);
    }
  }, [selectedKeyword, keywordRankingsMap, rangeValue, historicalData]);
      
  // 업체를 변경할 때 즉각 테이블과 차트가 새로운 업체의 데이터로 자동 리렌더링
  useEffect(() => {
    setSelectedKeyword("");  // 선택된 키워드 초기화
    setRangeValue(0);        // 슬라이더 값 초기화
    setHistoricalData(null); // 차트 및 테이블 데이터 초기화
  }, [activeBusiness?.place_id]);

  useEffect(() => {
    console.log("[Debug] MarketingKeywordsPage:", {
      keywordsLoading,
      keywordsError,
      allKeywordsLoading,
      allKeywordsError,
      userKeywordsCount: userKeywords.length,
      selectedKeyword,
    });
  }, [
    keywordsLoading,
    keywordsError,
    allKeywordsLoading,
    allKeywordsError,
    userKeywords,
    selectedKeyword,
  ]); // 누락된 selectedKeyword 추가

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // 브라우저에서 사용 가능한 메모리 API 사용
      if (typeof window !== 'undefined' && window.performance && (performance as any).memory) {
        console.log('Memory usage:', (performance as any).memory);
      } else {
        console.log('Memory monitoring not available in this browser');
      }
    }
  }, []);
  
  interface ComboboxWithPropsProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    renderOption: (option: string) => React.ReactElement;
    className: string;
    renderActions?: () => React.ReactElement;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    disableOutsideClick?: boolean;
  }

  // Replace interface with a type intersection
  type ComboboxComponentType = React.ComponentType<ComboboxWithPropsProps> & 
    ((props: ComboboxWithPropsProps) => React.ReactElement);

  const ComboboxWithProps: React.FC<ComboboxWithPropsProps> = ({ renderActions, open, onOpenChange, disableOutsideClick, ...props }) => {
    const ComboboxComponent = Combobox as ComboboxComponentType;
    return <ComboboxComponent {...props} renderActions={renderActions} open={open} onOpenChange={onOpenChange} disableOutsideClick={disableOutsideClick} />;
  };

  const prepareKeywordOptions = (): string[] => {
    if (keywordsLoading || allKeywordsLoading) {
      return ["키워드 로딩 중..."];
    }

    if (keywordsError || allKeywordsError) {
      return ["키워드를 불러오는 중 오류가 발생했습니다"];
    }

    if (!activeBusiness) {
      return ["업체를 먼저 선택해주세요", "업체 선택이 필요합니다"];
    }

    if (userKeywords.length === 0) {
      return ["이 업체에 등록된 키워드가 없습니다", "키워드를 추가해주세요"];
    }

    return userKeywords;
  };

  const keywordOptions = prepareKeywordOptions();

  const isMessageOption = (option: string): boolean => {
    return option === "키워드 로딩 중..." || 
           option === "키워드를 불러오는 중 오류가 발생했습니다" || 
           option === "이 업체에 등록된 키워드가 없습니다" ||
           option === "업체를 먼저 선택해주세요" || 
           option === "업체 선택이 필요합니다" ||
           option === "키워드를 추가해주세요";
  };

  // Change the function to use the correct type
  const findKeywordObject = (keywordText: string): UserKeyword | undefined => {
    if (!userKeywordObjects) return undefined;
    
    // Type-safe check for compatibility
    return userKeywordObjects.find((k) => {
      // Make sure k is a UserKeyword and has a keyword property
      return k && 'keyword' in k && k.keyword === keywordText;
    });
  };

  const isKeywordUpdating = (keyword: string) => {
    return updatingKeywords.includes(keyword);
  };
  const formatKeywordDataForTable = (data: KeywordDataGroup | null): KeywordRankingData | null => {
    if (!data) return null;
    
    // null이 없는 rankingDetails 생성
    const safeRankingDetails = data.rankingDetails.map(detail => ({
      ...detail,
      ranking: detail.ranking ?? 0, // null을 0으로 변환
      blog_review_count: detail.blog_review_count ?? 0,
      receipt_review_count: detail.receipt_review_count ?? 0,
      savedCount: detail.savedCount ?? 0,
      keywordList: detail.keywordList ?? []
    })) as unknown as KeywordRankingDetail[]; // 타입 단언
  
    return {
      rankingDetails: safeRankingDetails,
      rankingList: data.rankingList,
      chartData: data.chartData.map(chart => ({
        ...chart,
        ranking: chart.ranking ?? 0 // null을 0으로 변환
      })) as unknown as KeywordHistoricalData[] // 타입 단언
    };
  };
  
  // historicalData 변환
  const formatHistoricalData = (data: KeywordHistoricalData | null): KeywordHistoricalData[] => {
    if (!data) return [];
    
    // null 가능성 제거
    const safeData: KeywordHistoricalData = {
      ...data,
      ranking: data.ranking ?? 0, // null이면 0으로 변환
      blog_review_count: data.blog_review_count ?? 0,
      receipt_review_count: data.receipt_review_count ?? 0
    };
    
    return [safeData];
  };
  
  // KeywordRankingChart를 위한 데이터 변환
  const formatChartData = (data: ChartDataPoint[] | undefined): KeywordHistoricalData[] => {
    if (!data || data.length === 0) return [];
    
    return data.map(point => ({
      date: point.date,
      ranking: point.ranking ?? 0, // null을 0으로 변환
      uv: point.uv,
      place_id: String(point.place_id || ''),
      date_key: point.date_key,
      blog_review_count: point.blog_review_count,
      receipt_review_count: point.receipt_review_count
    }));
  };

  return (
    <div className="p-6 space-y-8 relative">
      {/* Remove the full-screen overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">데이터 로딩 중...</span>
          </div>
        </div>
      )}
      
      <Accordion
        type="single"
        collapsible
        value={openAccordionItem}
        onValueChange={setOpenAccordionItem}
        className="border rounded"
      >
        {userKeywords.map((keyword, index) => {
          const keywordObject = findKeywordObject(keyword);
          const itemValue = `item-${index}`;
          const isUpdating = isKeywordUpdating(keyword);

          return (
            <AccordionItem 
              key={keywordObject?.id || index} 
              value={itemValue}
              className={isUpdating ? 'relative' : ''}
              disabled={isUpdating}
            >
              {isUpdating && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-medium">
                      데이터 수집 중...
                    </span>
                    </div>
                  </div>
                )}
              <AccordionTrigger className="px-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{index + 1}.</span>
                    <span>{keyword}</span>
                  </div>

                  <div className="text-right mr-2">
                    <span>현재 순위: {getKeywordCurrentRanking(keyword)}위</span>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent>
                <KeywordRankingChart 
                  chartData={keywordRankingsMap[keyword]?.chartData ? 
                    formatChartData(keywordRankingsMap[keyword]?.chartData) : []}
                  activeBusiness={activeBusiness} 
                />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-64 mb-4">          
            <ComboboxWithProps
              options={keywordOptions}
              value={selectedKeyword}
              onChange={(value) => {
                if (!isMessageOption(value) && !isKeywordUpdating(value)) {
                  setSelectedKeyword(value);
                  if (!isChangeMode) {
                    setIsComboboxOpen(false);
                  }
                }
              }}
              placeholder={pollingKeyword ? "키워드 업데이트 중..." : "키워드 선택"}
              open={isComboboxOpen}
              onOpenChange={handleComboboxOpenChange}
              className="border p-2 rounded"
              renderOption={(option) => {
                const keywordObj = isMessageOption(option) ? undefined : findKeywordObject(option);
                const showChangeButton =
                  keywordObj && !isMessageOption(option) && isChangeMode && !isKeywordUpdating(option);
                const isUpdating = !isMessageOption(option) && isKeywordUpdating(option);

                return (
                  <div 
                    className={`p-2 flex items-center justify-between w-full ${
                      isMessageOption(option) 
                        ? option.includes('키워드를 추가') || option.includes('업체 선택') 
                          ? 'text-blue-500 font-medium cursor-pointer hover:bg-blue-50' 
                          : 'text-gray-500 italic cursor-default'
                        : isUpdating
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'cursor-pointer hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      if (!isMessageOption(option) && !isUpdating) {
                        if (!showChangeButton) {
                          setIsComboboxOpen(false);
                        }
                      }
                    }}
                  >
                    <span className="flex items-center gap-2">
                      {option}
                      {isUpdating && (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </span>
                    
                    {showChangeButton && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          prepareToChangeKeyword(option, Number(keywordObj.keywordId));
                          return false;
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 ml-auto px-1.5 py-0.5 border rounded"
                        disabled={isUpdating}
                      >
                        변경
                      </button>
                    )}
                  </div>
                );
              }}
              renderActions={() => (
                <div className="p-2 border-t flex flex-col gap-2 mt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      키워드 등록 제한 수: {userKeywords.length}/{keywordLimit}
                    </span>
                    {updatingKeywords.length > 0 && (
                      <span className="text-xs text-blue-500">
                        키워드 수집 중 {keywordStatus && `(상태: ${keywordStatus})`}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-row gap-2 mt-1">
                    {canAddKeywords && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsAddDialogOpen(true);
                          setIsComboboxOpen(false);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="flex-1 text-sm text-blue-600 hover:text-blue-800 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors text-center"
                      >
                        키워드 추가
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsChangeMode(!isChangeMode);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onPointerDown={(e) => {
                        e.preventDefault(); 
                        e.stopPropagation();
                      }}
                      className="flex-1 text-sm text-gray-600 hover:text-gray-800 py-1.5 px-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-center"
                    >
                      {isChangeMode ? "변경 취소" : "키워드 변경"}
                    </button>
                  </div>
                </div>
              )}
            />
          </div>
          
          <div className="w-full max-w-xs relative">
            {isRangePressed && (
              <div
                style={{ left: `${(rangeValue / maxRangeValue) * 100}%`, transform: "translateX(-50%)" }}
                className="absolute -top-8 px-2 py-1 bg-white shadow-sm rounded border"
              >
                {rangeValue === 0 ? '오늘' : `${rangeValue}일 전`}
              </div>
            )}
            <input
              type="range"
              min={0}
              max={maxRangeValue}
              value={rangeValue}
              step={1}
              onChange={(e) => {
                const newValue = Number(e.target.value);
                setRangeValue(newValue);
              }}
              onMouseDown={() => setIsRangePressed(true)}
              onMouseUp={() => setIsRangePressed(false)}
              onTouchStart={() => setIsRangePressed(true)}
              onTouchEnd={() => setIsRangePressed(false)}
              className="range w-full"
            />

            <div className="flex justify-between px-1 mt-0.5 text-xs">
              <span>오늘</span>
              <span>{maxRangeValue}일 전</span>
            </div>
          </div>      
        </div>

        <KeywordRankingTable
          isLoading={allKeywordsLoading || (isKeywordUpdating(selectedKeyword))}
          selectedKeyword={selectedKeyword}
          activeBusiness={activeBusiness}
          isError={allKeywordsError}
          keywordData={formatKeywordDataForTable(selectedKeywordData)}
          historicalData={formatHistoricalData(historicalData)}
          rangeValue={rangeValue}
        />
      </div>

      <Dialog 
        open={isAddDialogOpen} 
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setNewKeyword(''); // Reset state when dialog is closed
          }
        }}
      >
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>키워드 추가</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="검색 키워드를 입력하세요"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
            />
            <p className="mt-2 text-xs text-gray-500">
              키워드 사용량: {userKeywords.length}/{keywordLimit}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button 
              onClick={() => {
                if (!newKeyword.trim()) {
                  toast.error('키워드를 입력해주세요.');
                  return;
                }
                addKeyword(newKeyword);
                setPollingKeyword(newKeyword);
                setIsAddDialogOpen(false); // Close dialog after action
              }}               
              disabled={isAdding || isLoading}
            >
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={isChangeDialogOpen} 
        onOpenChange={(open) => {
          setIsChangeDialogOpen(open);
          if (!open) {
            setEditKeyword(''); // Reset state when dialog is closed
            setEditKeywordId(null);
          }
        }}
      >
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>키워드 변경</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="새 키워드를 입력하세요"
              value={editKeyword}
              onChange={(e) => setEditKeyword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsChangeDialogOpen(false)}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button 
              onClick={() => {
                if (editKeywordId === null || !editKeyword.trim()) {
                  toast.error('변경할 키워드를 입력해주세요.');
                  return;
                }
                changeKeyword({ keywordId: editKeywordId, newKeyword: editKeyword });
                setPollingKeyword(editKeyword);
                setIsChangeDialogOpen(false); // Close dialog after action
              }} 
              disabled={isChanging || isLoading}
            >
              변경
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
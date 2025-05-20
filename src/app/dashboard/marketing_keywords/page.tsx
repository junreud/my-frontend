"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useKeywordRankingDetails } from "@/hooks/useKeywordRankingDetails";
import { useUserKeywords } from "@/hooks/useUserKeywords";
import { useAddKeyword } from '@/hooks/useAddKeyword';
import { useChangeKeyword } from '@/hooks/useChangeKeyword';
import { useKeywordStatusPolling } from '@/hooks/useKeywordStatusPolling';
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient"; // Import apiClient
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
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
// Components
import KeywordRankingChart from "./KeywordRankingChart";
import KeywordRankingTable from "./KeywordRankingTable";
import { 
  UserKeyword, 
  KeywordHistoricalData, 
  KeywordRankData, 
  KeywordRankingDetail,
  KeywordRankingData,
  ChartDataPoint
} from "@/types";
import { useBusinessContext } from "../BusinessContext";

// 키워드 데이터 그룹 인터페이스
interface KeywordDataGroup {
  rankingDetails: KeywordRankingDetail[];
  chartData: ChartDataPoint[];
  rankingList: KeywordRankData[];
  isRestaurant: boolean;
}

// 키워드 맵 인터페이스
interface KeywordRankingsMap {
  [keyword: string]: KeywordDataGroup;
}

// Move formatChartData function outside of useMemo to prevent recreation on each render
function formatChartDataForKeywordMap(details: KeywordRankingDetail[], activePlaceId?: string | null): ChartDataPoint[] {
  if (!details || details.length === 0) return [];
  
  const dateGroups: Record<string, KeywordRankingDetail[]> = {};
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
      
      // combine saved count from various fields
      const savedValue = activePlaceItem?.savedCount ?? activePlaceItem?.saved_count ?? activePlaceItem?.saved ?? null;
      return {
        date,
        date_key: date,
        uv: activePlaceItem?.ranking ?? 0,
        place_id: activePlaceItem?.place_id || '',
        ranking: activePlaceItem?.ranking ?? null,
        savedCount: savedValue,
        blog_review_count: activePlaceItem?.blog_review_count ?? null,
        receipt_review_count: activePlaceItem?.receipt_review_count ?? null,
        keywordItems: activePlaceItem?.keywordList || [],
        saved: savedValue,
        blogReviews: activePlaceItem?.blog_review_count ?? null,
        receiptReviews: activePlaceItem?.receipt_review_count ?? null,
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
  const { activeBusiness, user } = useBusinessContext();
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
    error: keywordsError,
    refetch: refetchUserKeywords  // refetch function for user keywords
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
        queryKey: ['keywordRankingDetails', String(activeBusiness?.place_id), String(user?.id)],
      });
      await queryClient.invalidateQueries({
        queryKey: ['userKeywords', String(user?.id), String(activeBusiness?.place_id)],
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
  }, [pollingKeyword, isKeywordsUpdating, updatingKeywords.length]);
  
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
    
    const allDetails: KeywordRankingDetail[] = allKeywordRankingsData.rankingDetails.map(detail => {
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
        saved_count?: number | null;
        saved?: number | null;
        blog_review_count?: number | null;
        receipt_review_count?: number | null;
        keywordList?: string[];
        date_key?: string;
        isRestaurant?: boolean; // Added isRestaurant field
      };
      
      return {
        date: detailAny.date_key || '',
        id: detailAny.id || '',  
        keyword_id: detailAny.keyword_id || '',
        keyword: detailAny.keyword || '',
        ranking: detail.ranking,
        place_id: detail.place_id,
        place_name: detailAny.place_name || '',
        category: detailAny.category || '',
        savedCount: detailAny.savedCount ?? detailAny.saved_count ?? null,
        saved_count: detailAny.saved_count ?? detailAny.saved ?? null,
        saved: detailAny.saved ?? detailAny.saved_count ?? detailAny.savedCount ?? null,
        blog_review_count: detailAny.blog_review_count ?? null,
        receipt_review_count: detailAny.receipt_review_count ?? null,
        keywordList: detailAny.keywordList || [],
        date_key: detailAny.date_key || '',
        isRestaurant: detailAny.isRestaurant, // Added isRestaurant field
      };
    });

    const result: KeywordRankingsMap = {};
    const placeId = activeBusiness?.place_id;
    
    userKeywords.forEach(keyword => {
      const keywordDetails = allDetails.filter(detail => detail.keyword === keyword);

      if (keywordDetails.length > 0) {
        const chartData = formatChartDataForKeywordMap(keywordDetails, placeId);
        
        // Get the isRestaurant property from the first keyword detail
        const keywordRecord = keywordDetails[0];
        
        // First check if the isRestaurant flag exists in the response
        // If not, fall back to category-based detection
        const isRestaurant = keywordRecord.isRestaurant !== undefined 
          ? Boolean(keywordRecord.isRestaurant)
          : ((keywordRecord.category || '').includes('음식점') || 
             (keywordRecord.category || '').includes('레스토랑'));
        
        result[keyword] = {
          rankingDetails: keywordDetails,
          chartData,
          rankingList: allKeywordRankingsData.rankingList || [],
          isRestaurant,
        };
      }
    });

    // logger.info(`${Object.keys(result).length}개 키워드 데이터 매핑 완료`);
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

  // 타임머신바 최대값 설정 useEffect 수정
  useEffect(() => {
    if (selectedKeyword && keywordRankingsMap[selectedKeyword]?.chartData) {
      const keywordDataLength = keywordRankingsMap[selectedKeyword].chartData.length;
      const dynamicMaxRange = Math.min(keywordDataLength - 1, 60);
  
      if (maxRangeValue !== dynamicMaxRange) {
        setMaxRangeValue(dynamicMaxRange);
      }
  
      if (rangeValue > dynamicMaxRange) {
        setRangeValue(dynamicMaxRange);
      }
    } else {
      if (maxRangeValue !== 0) setMaxRangeValue(0);
      if (rangeValue !== 0) setRangeValue(0);
      if (historicalData !== null) setHistoricalData(null);
    }
  }, [selectedKeyword, keywordRankingsMap, rangeValue, maxRangeValue, historicalData]);
  
  // historicalData 처리 useEffect 수정
  useEffect(() => {
    if (!selectedKeyword || !keywordRankingsMap[selectedKeyword]?.chartData) {
      if (historicalData !== null) setHistoricalData(null);
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
      const newHistoricalData = {
        date: dataPoint.date,
        ranking: dataPoint.ranking ?? 0,
        uv: dataPoint.uv,
        place_id: String(dataPoint.place_id || ''),
        date_key: dataPoint.date_key,
        blog_review_count: dataPoint.blog_review_count,
        receipt_review_count: dataPoint.receipt_review_count,
      };
  
      const isDataDifferent =
        !historicalData ||
        historicalData.date !== newHistoricalData.date ||
        historicalData.ranking !== newHistoricalData.ranking ||
        historicalData.place_id !== newHistoricalData.place_id;
  
      if (isDataDifferent) {
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
    // 비즈니스 변경 시 키워드 데이터 즉시 새로 로드
    refreshKeywordData();
    refetchUserKeywords();    // refetch user keywords for accordion & combobox
  }, [activeBusiness?.place_id, refreshKeywordData, refetchUserKeywords]);

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
  
  // 레인지 슬라이더 onChange 핸들러 최적화
  const handleRangeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setRangeValue(newValue);
  }, []);

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
                  chartData={keywordRankingsMap[keyword]?.chartData.map(d => ({ ...d, place_id: d.place_id ?? '' })) || []}
                  activeBusiness={activeBusiness}
                  isRestaurantKeyword={keywordRankingsMap[keyword]?.isRestaurant || false}  // always show for restaurant businesses
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
              onChange={handleRangeChange}
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
          isRestaurantKeyword={selectedKeywordData?.isRestaurant || false}  // 레스토랑 여부에 따라 저장수 컬럼 표시
        />
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={(open) => { console.log('[Modal Debug] AddDialog onOpenChange:', open); setIsAddDialogOpen(open); }}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>키워드 추가</DialogTitle>
            <DialogClose asChild>
              <button aria-label="Close" className="absolute right-4 top-4">
                <X className="h-4 w-4" />
              </button>
            </DialogClose>
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
                
                // 키워드 추가 시도
                addKeyword(newKeyword, {
                  onError: (error) => {
                    // 에러 처리는 useAddKeyword 훅에서 이미 처리되며, 여기서는 추가 작업 필요 없음
                    
                    // "조건에 맞는 업체가 없음" 에러가 아닌 경우만 폴링 시작
                    if (error instanceof Error && 
                        !error.message.includes("조건에 맞는 업체가 없습니다")) {
                      setPollingKeyword(newKeyword);
                      // 업데이트 중인 키워드 배열에 추가
                      setUpdatingKeywords(prev => [...prev, newKeyword]);
                    }
                  },
                  onSuccess: () => {
                    // 기존 폴링 시작
                    setPollingKeyword(newKeyword);
                    setUpdatingKeywords(prev => [...prev, newKeyword]);
                    // 병렬: Naver API 호출로 검색량 업데이트
                    apiClient.post('/keyword/search-volume', { candidateKeywords: [newKeyword] })
                      .then(() => {
                        // 갱신된 검색량 반영을 위해 키워드 목록 및 순위 갱신
                        queryClient.invalidateQueries({
                          queryKey: ['userKeywords', String(user?.id), String(activeBusiness?.place_id)],
                        });
                        queryClient.invalidateQueries({
                          queryKey: ['keywordRankingDetails', String(activeBusiness?.place_id), String(user?.id)],
                        });
                      })
                      .catch(err => console.error('검색량 업데이트 실패:', err));
                  }
                });
                
                setIsAddDialogOpen(false); // 다이얼로그 닫기
              }}               
              disabled={isAdding || isLoading}
            >
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isChangeDialogOpen} onOpenChange={(open) => { console.log('[Modal Debug] ChangeDialog onOpenChange:', open); setIsChangeDialogOpen(open); }}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>키워드 변경</DialogTitle>
            <DialogClose asChild>
              <button aria-label="Close" className="absolute right-4 top-4">
                <X className="h-4 w-4" />
              </button>
            </DialogClose>
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
                
                // 키워드 변경 시도
                changeKeyword(
                  { keywordId: editKeywordId, newKeyword: editKeyword },
                  {
                    onError: (error) => {
                      // "조건에 맞는 업체가 없음" 에러가 아닌 경우만 폴링 시작
                      if (error instanceof Error && 
                          !error.message.includes("조건에 맞는 업체가 없습니다")) {
                        setPollingKeyword(editKeyword);
                        // 업데이트 중인 키워드 배열에 추가 - 이 부분이 누락되었음
                        setUpdatingKeywords(prev => [...prev, editKeyword]);
                      }
                    },
                    onSuccess: () => {
                      setPollingKeyword(editKeyword);
                      setUpdatingKeywords(prev => [...prev, editKeyword]);
                      // 병렬: Naver API 호출로 검색량 업데이트
                      apiClient.post('/keyword/search-volume', { candidateKeywords: [editKeyword] })
                        .then(() => {
                          queryClient.invalidateQueries({
                            queryKey: ['userKeywords', String(user?.id), String(activeBusiness?.place_id)],
                          });
                          queryClient.invalidateQueries({
                            queryKey: ['keywordRankingDetails', String(activeBusiness?.place_id), String(user?.id)],
                          });
                        })
                        .catch(err => console.error('검색량 업데이트 실패:', err));
                    }
                  }
                );
                
                setIsChangeDialogOpen(false); // 다이얼로그 닫기
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
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useKeywordRankingDetails } from "@/hooks/useKeywordRankingDetails";
import { useUserKeywords } from "@/hooks/useUserKeywords";
import { useBusinessSwitcher } from "@/hooks/useBusinessSwitcher";
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
import apiClient from "@/lib/apiClient";
const logger = createLogger("MarketingKeywordsPage");

// 키워드 세부 정보 인터페이스
interface KeywordDetail {
  id: string;
  keyword_id: number;
  keyword: string;
  ranking: number | null;
  place_id: number;
  place_name: string;
  category: string;
  savedCount: number | null;
  blog_review_count: number | null;
  receipt_review_count: number | null;
  keywordList: string[] | null;
  date_key: string;
}

// 차트 데이터 포인트 인터페이스
interface ChartDataPoint {
  date: string;
  place_id: number | null;
  ranking: number | null;
  savedCount: number;
  blog_review_count: number;
  receipt_review_count: number;
  keywordItems: string[];
  saved: number;
  blogReviews: number;
  receiptReviews: number;
}

// 키워드 데이터 그룹 인터페이스
interface KeywordDataGroup {
  rankingDetails: KeywordDetail[];
  chartData: ChartDataPoint[];
}

// 키워드 맵 인터페이스
interface KeywordRankingsMap {
  [keyword: string]: KeywordDataGroup;
}


// Update this interface to match the actual data structure
interface UserKeyword {
  id: string | number;
  keyword: string | undefined;
  keywordId: number;
  // 필요한 다른 속성 추가
}

export default function Page(): JSX.Element {
  const [openAccordionItem, setOpenAccordionItem] = useState<string | undefined>(undefined);
  const [rangeValue, setRangeValue] = useState<number>(0);
  const [maxRangeValue, setMaxRangeValue] = useState<number>(59); // Default to 59 (60 days)
  const [isRangePressed, setIsRangePressed] = useState<boolean>(false);
  const [selectedKeyword, setSelectedKeyword] = useState<string>("");
  const [historicalData, setHistoricalData] = useState<ChartDataPoint | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isChangeDialogOpen, setIsChangeDialogOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [editKeyword, setEditKeyword] = useState("");
  const [editKeywordId, setEditKeywordId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChangeMode, setIsChangeMode] = useState(false);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [pollingKeyword, setPollingKeyword] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [updatingKeywords, setUpdatingKeywords] = useState<string[]>([]);
  const [changingKeywords, setChangingKeywords] = useState<Record<string, string>>({});

  const { activeBusiness, user } = useBusinessSwitcher();
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
    (userKeywordObjects || []).map((k: UserKeyword) => k.keyword), 
    [userKeywordObjects]
  );

  // 모든 키워드 순위 데이터를 한 번에 가져오기
  const { 
    data: allKeywordRankingsData,
    isLoading: allKeywordsLoading,
    isError: allKeywordsError
  } = useKeywordRankingDetails({
    placeId: activeBusiness?.place_id,
    userId: user?.id
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
  const checkKeywordStatus = useCallback(async (keyword: string) => {
    try {
      const response = await apiClient.get(`/keyword/status?keyword=${encodeURIComponent(keyword)}`);
      
      if (response.data && response.data.success) {
        const { status, timeAgo } = response.data.data;
        
        console.log(`Keyword status check (${pollCount}):`, {
          keyword,
          status,
          timeAgo,
        });
        
        setCrawlingStatus(status);
        setCrawlingTimeAgo(timeAgo);
        
        if (status === "completed") {
          console.log(`Keyword "${keyword}" crawling completed!`);
          await refreshKeywordData(); // refreshKeywordData 호출
          
          const oldKeywords = Object.entries(changingKeywords)
            .filter(([, newKw]) => newKw === keyword)
            .map(([oldKw]) => oldKw);
          
          setUpdatingKeywords(prev => 
            prev.filter(k => k !== keyword && !oldKeywords.includes(k))
          );
          
          setChangingKeywords(prev => {
            const newState = {...prev};
            oldKeywords.forEach(oldKw => {
              delete newState[oldKw];
            });
            return newState;
          });
          
          setPollingKeyword(null);
          setCrawlingStatus(null);
          setCrawlingTimeAgo(null);
          setPollCount(0);
          
          if (updatingKeywords.length <= 1) {
            setIsKeywordsUpdating(false);
          }
          
          toast.success(`"${keyword}" 키워드 데이터 수집이 완료되었습니다.`);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error checking keyword status:", error);
      return false;
    }
  }, [pollCount, updatingKeywords, changingKeywords, refreshKeywordData]); // refreshKeywordData 추가
  // Effect to poll keyword status
  useEffect(() => {
    if (!pollingKeyword) return;
  
    const pollInterval = setInterval(async () => {
      setPollCount((prev) => prev + 1);
  
      const isComplete = await checkKeywordStatus(pollingKeyword);
      if (isComplete) {
        clearInterval(pollInterval);
      }
  
      // Stop polling after 30 attempts (5 minutes)
      if (pollCount >= 30) {
        clearInterval(pollInterval);
        setPollingKeyword(null);
        setCrawlingStatus(null);
        setCrawlingTimeAgo(null);
        setPollCount(0);
        toast.error("키워드 데이터 수집이 완료되지 않았습니다. 나중에 다시 시도해주세요.");
      }
    }, 10000); // Poll every 10 seconds
  
    return () => clearInterval(pollInterval);
  }, [pollingKeyword, pollCount, checkKeywordStatus]); // 누락된 checkKeywordStatus 추가
  
  // Updated refreshKeywordData function with better UX
  const refreshKeywordData = useCallback(async () => {
    try {
      // Invalidate React Query caches for keyword data
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
      // Remove loading states
      setIsLoading(false);
      
      // Keep the updating keywords state if polling is still happening
      if (!pollingKeyword) {
        setIsKeywordsUpdating(false);
        setUpdatingKeywords([]);
      }
    }
  }, [
    queryClient,
    activeBusiness?.place_id,
    user?.id,
    pollingKeyword,
  ]);

  // Updated handleAddKeyword function
  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) {
      toast.error("키워드를 입력해주세요");
      return;
    }

    const addedKeyword = newKeyword.trim();
    
    // First close the dialog
    setIsAddDialogOpen(false);
    
    // Add this keyword to updating list
    setUpdatingKeywords(prev => [...prev, addedKeyword]);
    setIsKeywordsUpdating(true);
    
    try {
      await apiClient.post("/keyword/user-keywords", {
        userId: user?.id,
        placeId: activeBusiness?.place_id,
        keyword: addedKeyword,
      });

      toast.success(`"${addedKeyword}" 키워드가 추가되었습니다. 데이터 수집 중...`);
      
      // Reset form state
      setNewKeyword("");
      
      // Start polling for this keyword's status
      setPollingKeyword(addedKeyword);
      setCrawlingStatus("pending");
      setPollCount(0);
      
      // Refresh data initially to show the new keyword in the list
      await refreshKeywordData();
    } catch (error) {
      console.error("키워드 추가 중 오류 발생:", error);
      toast.error("키워드 추가 중 오류가 발생했습니다");
      
      // Remove from updating list on error
      setUpdatingKeywords(prev => prev.filter(k => k !== addedKeyword));
      if (updatingKeywords.length <= 1) {
        setIsKeywordsUpdating(false);
      }
    }
  };

  // Updated handleChangeKeyword function
  const handleChangeKeyword = async () => {
    if (!editKeyword.trim() || editKeywordId === null) {
      toast.error("키워드를 입력해주세요");
      return;
    }

    const oldKeyword = selectedKeyword;
    const changedKeyword = editKeyword.trim();
    
    // First close the dialog
    setIsChangeDialogOpen(false);
    
    // Reset other UI states immediately
    setEditKeyword("");
    setEditKeywordId(null);
    setIsComboboxOpen(false);
    setIsChangeMode(false);
    
    // Keep track of the keyword that's being changed and what it's changing to
    if (oldKeyword) {
      setChangingKeywords(prev => ({
        ...prev,
        [oldKeyword]: changedKeyword
      }));
      
      // Add the old keyword to updating keywords (because it's the one visible in UI)
      setUpdatingKeywords(prev => 
        prev.includes(oldKeyword) ? prev : [...prev, oldKeyword]
      );
    }
    
    setIsKeywordsUpdating(true);
    
    try {
      await apiClient.post("/keyword/change-user-keyword", {
        userId: user?.id,
        placeId: activeBusiness?.place_id,
        oldKeywordId: editKeywordId,
        newKeyword: changedKeyword,
      });

      toast.success(`"${changedKeyword}" 키워드로 변경되었습니다. 데이터 수집 중...`);
      
      // Start polling for this keyword's status
      setPollingKeyword(changedKeyword);
      setCrawlingStatus("pending");
      setPollCount(0);
      
      // Refresh data initially to show the updated keyword in the list
      await refreshKeywordData();
      
      // Select a different keyword if possible
      if (oldKeyword && userKeywords.length > 1) {
        const alternativeKeyword = userKeywords.find(k => 
          k !== oldKeyword && !updatingKeywords.includes(k)
        );
        if (alternativeKeyword) {
          setSelectedKeyword(alternativeKeyword);
        }
      }
    } catch (error) {
      console.error("키워드 변경 중 오류 발생:", error);
      toast.error("키워드 변경 중 오류가 발생했습니다");
      
      // Remove from tracking on error
      if (oldKeyword) {
        setChangingKeywords(prev => {
          const newState = {...prev};
          delete newState[oldKeyword];
          return newState;
        });
        
        setUpdatingKeywords(prev => prev.filter(k => k !== oldKeyword));
      }
      
      if (updatingKeywords.length <= 1) {
        setIsKeywordsUpdating(false);
      }
    }
  };

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
    
    // Move formatChartData inside useMemo to avoid dependency issues
    function formatChartData(details: KeywordDetail[]): ChartDataPoint[] {
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
          const activePlaceItem = activeBusiness?.place_id ? items.find(
            item => String(item.place_id) === String(activeBusiness.place_id)
          ) : null;
          
          return {
            date,
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
      
      console.log('[Debug] formatChartData 결과:', {
        itemCount: result.length,
        sampleItem: result.length > 0 ? result[0] : null
      });
      
      return result;
    }
  
    const allDetails: KeywordDetail[] = allKeywordRankingsData.rankingDetails.map(detail => ({
      id: detail.id,
      keyword_id: detail.keyword_id,
      keyword: detail.keyword,
      ranking: detail.ranking,
      place_id: detail.place_id,
      place_name: detail.place_name,
      category: detail.category,
      savedCount: detail.savedCount,
      blog_review_count: detail.blog_review_count,
      receipt_review_count: detail.receipt_review_count,
      keywordList: detail.keywordList,
      date_key: detail.date_key,
    }));
  
    const result: KeywordRankingsMap = {};
    userKeywords.forEach(keyword => {
      const keywordDetails = allDetails.filter(detail => detail.keyword === keyword);
  
      if (keywordDetails.length > 0) {
        const chartData = formatChartData(keywordDetails);
  
        result[keyword] = {
          rankingDetails: keywordDetails,
          chartData,
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

  useEffect(() => {
    if (selectedKeywordData?.chartData && selectedKeywordData.chartData.length > 0) {
      const daysAgo = rangeValue;
      if (daysAgo === 0) {
        setHistoricalData(null);
        return;
      }
  
      const dataLength = selectedKeywordData.chartData.length;
      const targetIndex = dataLength - 1 - daysAgo;
      const historicalDataPoint =
        targetIndex >= 0
          ? selectedKeywordData.chartData[targetIndex]
          : selectedKeywordData.chartData[0];
  
      setHistoricalData(historicalDataPoint);
    }
  }, [rangeValue, selectedKeywordData]); // 누락된 selectedKeywordData 추가
  
  useEffect(() => {
    if (openAccordionItem) {
      const index = parseInt(openAccordionItem.replace("item-", ""));
      if (!isNaN(index) && userKeywords[index]) {
        setSelectedAccordionKeyword(userKeywords[index]);
      }
    } else {
      setSelectedAccordionKeyword("");
    }
  }, [openAccordionItem, userKeywords]); // 누락된 userKeywords 추가
  
  // Effect to set default selectedKeyword
  useEffect(() => {
    if (userKeywords.length > 0 && !selectedKeyword) {
      setSelectedKeyword(userKeywords[0]);
    }
  }, [userKeywords, selectedKeyword]); // 누락된 selectedKeyword 추가
  
  // Effect to update document title based on activeBusiness
  useEffect(() => {
    if (activeBusiness?.place_name) {
      document.title = `${activeBusiness.place_name} - 키워드 순위`;
    } else {
      document.title = "키워드 순위";
    }
  }, [activeBusiness]); // 누락된 activeBusiness 추가
  
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
  
  // Effect to calculate maxRangeValue based on selectedKeyword
  useEffect(() => {
    if (selectedKeyword && keywordRankingsMap[selectedKeyword]?.chartData?.length > 0) {
      const chartData = keywordRankingsMap[selectedKeyword].chartData;
      const availableDays = chartData.length - 1; // Days available in data
      const maxDays = Math.min(59, availableDays); // Cap at 59 (60 days including today)

      if (maxDays !== maxRangeValue) {
        setMaxRangeValue(maxDays);
        // If current range value is greater than the new max, reset it
        if (rangeValue > maxDays) {
          setRangeValue(0);
        }
      }
    } else {
      setMaxRangeValue(59); // Default to 59 if no data
    }
  }, [selectedKeyword, keywordRankingsMap, maxRangeValue, rangeValue]); // 누락된 maxRangeValue, rangeValue 추가

  // Effect to auto-refresh data
  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      if (activeBusiness?.place_id && user?.id) {
        queryClient.invalidateQueries({
          queryKey: ["keywordRankingDetails", activeBusiness.place_id, user.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["userKeywords", user.id, activeBusiness.place_id],
        });
        console.log("Auto-refresh executed");
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(autoRefreshInterval);
  }, [activeBusiness?.place_id, user?.id, queryClient]); // 누락된 queryClient 추가

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
    const foundKeyword = (userKeywordObjects || []).find((k: UserKeyword) => k.keyword === keywordText);
    return foundKeyword;
  };

  // Helper function to check if a keyword is being updated (accounting for changes)
  const isKeywordUpdating = (keyword: string) => {
    // Check if the keyword is directly in the updating list
    if (updatingKeywords.includes(keyword)) return true;
    
    // Check if any changing keyword matches this one
    return Object.keys(changingKeywords).includes(keyword);
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
          const isChanging = keyword in changingKeywords;

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
                      {isChanging 
                        ? `"${changingKeywords[keyword]}"(으)로 변경 중...` 
                        : "데이터 수집 중..."}
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
                  chartData={keywordRankingsMap[keyword]?.chartData}
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
                        키워드 수집 중
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
              className="range w-full"
              step={1}
              onMouseDown={() => setIsRangePressed(true)}
              onMouseUp={() => setIsRangePressed(false)}
              onTouchStart={() => setIsRangePressed(true)}
              onTouchEnd={() => setIsRangePressed(false)}
              onChange={(e) => setRangeValue(Number(e.target.value))}
            />

            <div className="flex justify-between px-1 mt-0.5 text-xs">
              <span>오늘</span>
              <span>{maxRangeValue + 1}일</span>
            </div>
          </div>      
        </div>

        <KeywordRankingTable
          isLoading={allKeywordsLoading || (isKeywordUpdating(selectedKeyword))}
          selectedKeyword={selectedKeyword}
          activeBusiness={activeBusiness}
          isError={allKeywordsError}
          keywordData={selectedKeywordData}
          historicalData={historicalData}
          rangeValue={rangeValue}
        />
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
              onClick={handleAddKeyword}
              disabled={isLoading}
            >
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isChangeDialogOpen} onOpenChange={setIsChangeDialogOpen}>
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
              onClick={handleChangeKeyword}
              disabled={isLoading}
            >
              변경
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
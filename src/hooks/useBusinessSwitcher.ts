"use client"
import { useState, useCallback, useRef, useEffect } from "react"
import { useUser } from "./useUser"
import { useUserBusinesses } from "./useUserBusinesses"
import { useBusinessCreation } from "./useBusinessCreation"
import { FinalKeyword, Platform } from "@/types"
import { toast } from "sonner"
import { createLogger } from "@/lib/logger"
import { Business } from "@/types/index";

const logger = createLogger('BusinessSwitcher');

export function useBusinessSwitcher() {
  // 로딩 상태 전후의 레이아웃 쉬프트 방지를 위한 상태
  const [prevHeight, setPrevHeight] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isHeightStabilized, setIsHeightStabilized] = useState(false);

  // 1) 유저 가져오기
  const { data: user, isLoading: userIsLoading } = useUser()

  // 2) 유저 비즈니스 정보
  const {
    businesses,
    activeBusiness,
    setActiveBusiness,
    isLoading: businessesLoading,
    isError: businessesError,
    refetch,
    // Add new properties
    businessLimit,
    canAddMoreBusinesses,
    remainingBusinessCount,
    userRole,
  } = useUserBusinesses(user?.id ? String(user.id) : undefined)

  // 3) 비즈니스 생성 로직
  const {
    currentStep,
    progressPercent,
    normalizedData,
    finalKeywords,
    keywordDialogOpen,
    setKeywordDialogOpen,
    normalizeMutation,
    createBusinessMutation,
    saveKeywordsMutation,
    restoreState,
    resetState,
  } = useBusinessCreation(user?.id ? String(user.id) : undefined)

  // UI 상태 (Sheet, Dialog)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  // keywordDialogOpen과 setKeywordDialogOpen은 useBusinessCreation에서 가져온 것을 사용

  // Form
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [placeUrl, setPlaceUrl] = useState("")

  // BusinessSheet.tsx에서 필요한 상태 추가
  const [placeData, setPlaceData] = useState<{
    place_name: string;
    category?: string;
    platform?: string;
  } | null>(null);

  // 높이 관리 함수
  const measureAndStabilizeHeight = useCallback(() => {
    if (containerRef.current) {
      const height = containerRef.current.offsetHeight;
      setPrevHeight(height);
      setIsHeightStabilized(true);
    }
  }, []);

  // 비즈니스 변경 시 높이 안정화 처리
  const handleBusinessChange = useCallback((business: Business) => {
    // 높이 기록
    measureAndStabilizeHeight();
    
    // 비즈니스 변경
    setActiveBusiness(business);
    
    // 높이 안정화 해제 타이머 설정
    setTimeout(() => {
      setIsHeightStabilized(false);
    }, 500); // 트랜지션이 완료되는 적절한 시간 후에
  }, [measureAndStabilizeHeight, setActiveBusiness]);

  // 로딩 상태 변경 감지
  useEffect(() => {
    const isLoading = userIsLoading || businessesLoading;
    
    if (!isLoading && prevHeight === null) {
      // 초기 로딩 완료 시 높이 측정
      measureAndStabilizeHeight();
    } else if (!isLoading && prevHeight !== null) {
      // 후속 로딩 완료 시, 일정 시간 후 높이 안정화 해제
      const timer = setTimeout(() => {
        setIsHeightStabilized(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [userIsLoading, businessesLoading, prevHeight, measureAndStabilizeHeight]);

  // 새로운 초기화 함수 추가
  const resetBusinessCreation = useCallback(() => {
    // localStorage 초기화
    localStorage.removeItem('business_creation_state');
    
    // 관련 상태 초기화 - resetState 함수 사용
    resetState();
    
    logger.info("비즈니스 생성 상태 초기화 완료");
  }, [resetState]);

  // 편의 함수
  const isDisabled = !selectedPlatform || !placeUrl

  const handleCheckPlace = async () => {
    if (isDisabled) return
    
    logger.info("URL 정규화 시작", { platform: selectedPlatform, url: placeUrl });
    
    try {
      const res = await normalizeMutation.mutateAsync({
        platform: selectedPlatform,
        placeUrl,
      })
      
      if (res && res.success && res.placeInfo) {
        logger.info("URL 정규화 성공", { placeName: res.placeInfo.place_name });
        
        setPlaceData({
          place_name: res.placeInfo.place_name,
          category: res.placeInfo.category,
          platform: res.placeInfo.platform?.platform || String(res.placeInfo.platform || "unknown"),
        });
        
        setDialogOpen(true);
      } else {
        logger.warn("URL 정규화 응답 유효성 검증 실패", res);
        toast.error("업체 정보를 불러올 수 없습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      logger.error("URL 정규화 오류", error);
      toast.error("업체 확인 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  }

  // 전체 진행
  const handleConfirmCreate = async () => {
    // createBusinessMutation이 내부에서 (2)~(6) 단계 처리
    createBusinessMutation.mutate()
  }

  // 키워드 선택 저장 - 타입 오류 수정
  const handleSaveSelectedKeywords = (params: {
    keywords: FinalKeyword[],
    placeId: string | number
  }) => {
    saveKeywordsMutation.mutate(params)
  }

  // 사용자가 새 비즈니스를 추가할 수 있는지 확인하는 함수
  const checkCanAddBusiness = () => {
    if (!canAddMoreBusinesses) {
      if (userRole === 'user') {
        toast.error("무료 계정은 최대 3개의 업체만 등록할 수 있습니다. 플러스 플랜으로 업그레이드하세요.");
      } else if (userRole === 'plus') {
        toast.error("플러스 계정은 최대 10개의 업체만 등록할 수 있습니다.");
      } else {
        toast.error("더 이상 업체를 등록할 수 없습니다.");
      }
      return false;
    }
    return true;
  };

  // Sheet 열기 함수 수정
  const openBusinessSheet = () => {
    if (checkCanAddBusiness()) {
      setSheetOpen(true);
    }
  };

  return {
    // User & Business
    user,
    businesses,
    activeBusiness,
    setActiveBusiness: handleBusinessChange, // 기존 함수 대신 높이 안정화 처리가 포함된 함수 사용
    isLoading: userIsLoading || businessesLoading,
    isError: businessesError,
    refetchBusinesses: refetch,

    // 레이아웃 쉬프트 방지용 prop 추가
    containerRef,
    prevHeight,
    isHeightStabilized,
    
    // Business limit related
    canAddMoreBusinesses,
    businessLimit,
    remainingBusinessCount,
    userRole,
    
    // Open sheet with business limit check
    openBusinessSheet,

    // UI State
    sheetOpen, setSheetOpen,
    dialogOpen, setDialogOpen,
    keywordDialogOpen, setKeywordDialogOpen,  // useBusinessCreation에서 바로 가져온 값

    // Form
    selectedPlatform, setSelectedPlatform,
    placeUrl, setPlaceUrl,
    isDisabled,

    // BusinessSheet.tsx에서 필요한 상태 추가
    placeData,
    setPlaceData,

    // Progress
    currentStep,
    progressPercent,

    // Normalization Data
    normalizedData,

    // Final Keywords - 이미 useBusinessCreation에서 가져온 것을 사용
    finalKeywords,

    // Business creation flow
    handleCheckPlace,
    handleConfirmCreate,
    handleSaveSelectedKeywords,

    // 업체 생성 진행 상태 관리
    restoreState,
    resetState,
    resetBusinessCreation, // 초기화 함수 추가
  }
}
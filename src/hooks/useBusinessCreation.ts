import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/sonner"
import { createLogger } from "@/lib/logger"
import {
  normalizeUrl,
  storePlace,
  chatgptKeywordsHandler,
  combineKeywords,
  checkSearchVolume,
  groupKeywords,
  saveSelectedKeywords,
} from "@/services/keywordServices"
import type {
  Platform,
  ProgressStep,
  NormalizeResponse,
  FinalKeyword,
} from "@/types"

// 로컬 스토리지 키 상수
const STORAGE_KEY = 'business_creation_state'
const logger = createLogger('BusinessCreation');

export function useBusinessCreation(userId?: string) {
  const queryClient = useQueryClient()
  
  // 진행 상태
  const [currentStep, setCurrentStep] = useState<ProgressStep>("idle")
  const [progressPercent, setProgressPercent] = useState(0)

  // 데이터 상태
  const [normalizedData, setNormalizedData] = useState<NormalizeResponse | null>(null)
  const [finalKeywords, setFinalKeywords] = useState<FinalKeyword[]>([])
  
  // 새 상태 추가: 저장된 place_id
  const [savedPlaceId, setSavedPlaceId] = useState<string | number | null>(null)

  // 키워드 다이얼로그 상태
  const [keywordDialogOpen, setKeywordDialogOpen] = useState(false)

  // 추가: 선택된 키워드 상태 관리
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<string[]>([])

  // 진행 상태 업데이트
  const updateProgress = (step: ProgressStep, percent: number) => {
    logger.debug("진행 상태 업데이트", { step, percent });
    setCurrentStep(step)
    setProgressPercent(percent)
  }

  // 상태 복구 함수
  const restoreState = () => {
    try {
      logger.debug("저장된 상태 복구 시도");
      const savedState = localStorage.getItem(STORAGE_KEY)
      if (savedState) {
        const parsed = JSON.parse(savedState)
        
        if (parsed.userId === userId) {
          logger.info("저장된 상태 복구 성공", { 
            step: parsed.currentStep, 
            progress: parsed.progressPercent,
            finalKeywordCount: parsed.finalKeywords?.length || 0,
            selectedKeywordCount: parsed.selectedKeywordIds?.length || 0,
            lastUpdated: parsed.lastUpdated
          });
          
          updateProgress(parsed.currentStep, parsed.progressPercent)
          if (parsed.normalizedData) setNormalizedData(parsed.normalizedData)
          if (parsed.finalKeywords) setFinalKeywords(parsed.finalKeywords)
          if (parsed.savedPlaceId) setSavedPlaceId(parsed.savedPlaceId)
          if (parsed.selectedKeywordIds) setSelectedKeywordIds(parsed.selectedKeywordIds)
          
          // 완료 상태에서 키워드 다이얼로그 자동 열기
          if (parsed.currentStep === "complete" && parsed.finalKeywords?.length > 0) {
            logger.info("완료 상태에서 키워드 다이얼로그 자동 열기");
            setKeywordDialogOpen(true);
          }
        } else {
          logger.debug("저장된 상태의, 사용자 ID가 다름", {
            savedId: parsed.userId,
            currentId: userId
          });
        }
      } else {
        logger.debug("저장된 상태 없음");
      }
    } catch (error) {
      logger.error("상태 복구 중 오류 발생", error);
    }
  }

  // 상태 저장 함수
  const saveState = () => {
    try {
      if (currentStep !== "idle" || finalKeywords.length > 0) {
        logger.debug("현재 상태 저장", { 
          currentStep, 
          progressPercent,
          finalKeywordCount: finalKeywords.length,
          selectedKeywordCount: selectedKeywordIds.length
        });
        
        const stateToSave = {
          userId,
          currentStep,
          progressPercent,
          normalizedData,
          finalKeywords,
          savedPlaceId,
          selectedKeywordIds, // 선택된 키워드 ID 저장
          lastUpdated: new Date().toISOString() // 마지막 업데이트 시간 추가
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
      }
    } catch (error) {
      logger.error("상태 저장 중 오류 발생", error);
    }
  }

  // 상태 초기화 함수
  const resetState = () => {
    logger.info("상태 초기화");
    updateProgress("idle", 0)
    setNormalizedData(null)
    setFinalKeywords([])
    setSavedPlaceId(null)
    setSelectedKeywordIds([]) // 선택된 키워드 ID 초기화
    localStorage.removeItem(STORAGE_KEY)
  }

  // 초기 마운트 시 저장된 상태 복구
  useEffect(() => {
    if (userId) {
      logger.debug("컴포넌트 마운트 - 상태 복구 시도", { userId });
      restoreState()
    }
  }, [userId])

  // 상태 변경 시 저장
  useEffect(() => {
    saveState()
  }, [currentStep, progressPercent, normalizedData, finalKeywords, savedPlaceId, selectedKeywordIds])

  // 1) URL 정규화
  const normalizeMutation = useMutation({
    mutationFn: async ({ platform, placeUrl }: { platform: Platform; placeUrl: string }) => {
      logger.info("URL 정규화 시작", { platform, placeUrl });
      
      updateProgress("normalizing", 10)
      
      try {
        // logTiming 사용하여 API 호출 시간 측정
        return await logger.logTiming("정규화 API 호출", async () => {
          const res = await normalizeUrl(placeUrl, platform, userId || "")
          
          logger.debug("정규화 API 응답 수신", {
            success: res?.success,
            hasPlaceInfo: !!res?.placeInfo
          });
          
          if (res && typeof res === 'object') {
            return res
          } else {
            logger.warn("유효하지 않은 응답 형식", { response: res });
            throw new Error('유효하지 않은 응답 형식입니다.');
          }
        });
      } catch (error) {
        logger.error("URL 정규화 실패", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data?.success) {
        if (data.alreadyRegistered) {
          logger.info("이미 등록된 URL 감지");
          toast.error("이미 등록한 URL입니다.");
          setCurrentStep("idle");
          setProgressPercent(0);
          return;
        }
        
        logger.info("URL 정규화 성공", {
          placeName: data.placeInfo?.place_name,
          platform: data.placeInfo?.platform
        });
        
        setNormalizedData(data);
      } else {
        logger.warn("정규화 응답에 success=false");
      }
      updateProgress("idle", 0)
    },
    onError: (error: unknown) => {
      logger.error("URL 정규화 오류 처리", error);
      const errorMessage = error instanceof Error ? error.message : "URL 정규화 중 오류 발생";
      toast.error(errorMessage);
      updateProgress("idle", 0);
    }
  })

  // 2) 업체 저장 → 3) 키워드 생성 → 4) 키워드 조합 → 5) 검색량 체크 → 6) 키워드 그룹화
  const createBusinessMutation = useMutation({
    mutationFn: async () => {
      // 전체 프로세스 시작 로깅
      logger.group("비즈니스 생성 프로세스", () => {
        if (!normalizedData?.placeInfo || !userId) {
          logger.error("필수 데이터 누락", { 
            hasPlaceInfo: !!normalizedData?.placeInfo,
            hasUserId: !!userId 
          });
          throw new Error("정규화 데이터가 없거나 유저 정보가 없습니다.");
        }
        
        logger.info("비즈니스 생성 시작", { 
          userId,
          placeName: normalizedData.placeInfo.place_name 
        });
      });
      
      // 필수 데이터 확인 (TypeScript 오류 방지)
      if (!normalizedData || !normalizedData.placeInfo || !userId) {
        throw new Error("정규화 데이터가 없거나 유저 정보가 없습니다.");
      }
      
      // place_id 확인 및 저장 - 여러 가능한 위치에서 확인
      const placeId = normalizedData.placeInfo.place_id || 
                     (normalizedData.placeInfo as any).placeId ||
                     normalizedData.placeInfo.id;
      
      if (!placeId) {
        logger.error("place_id를 찾을 수 없습니다", normalizedData.placeInfo);
        throw new Error("업체 ID 정보를 찾을 수 없습니다.");
      }
      
      // 명시적으로 값 로깅 및 저장
      logger.info("place_id를 저장합니다", { placeId });
      
      // place_id를 상태와 로컬 스토리지에 저장
      setSavedPlaceId(placeId);
      localStorage.setItem('current_place_id', String(placeId));
      
      // 세션 스토리지에도 저장하여 페이지 새로고침 시에도 유지
      sessionStorage.setItem('current_place_id', String(placeId));
      
      // 현재 사용자를 위한 고유한 스토리지 키 생성
      if (userId) {
        const userPlaceKey = `place_id_${userId}`;
        localStorage.setItem(userPlaceKey, String(placeId));
      }
      try {
        // ---- (2) 업체 저장 ----
        logger.group("업체 저장 단계", () => {
          updateProgress("storing", 20);
          
          logger.debug("저장할 업체 정보", {
            place_id: placeId,
            place_name: normalizedData.placeInfo.place_name,
            category: normalizedData.placeInfo.category,
            platform: normalizedData.placeInfo.platform
          });
        });
        
        // logTiming 사용하여 업체 저장 시간 측정
        const storeRes = await logger.logTiming("업체 저장 API 호출", async () => {
          return await storePlace(userId, {
            place_id: placeId,
            place_name: normalizedData.placeInfo.place_name,
            category: normalizedData.placeInfo.category,
            platform: normalizedData.placeInfo.platform as Platform, 
          });
        });
        
        if (!storeRes.success) {
          logger.error("업체 저장 실패", storeRes);
          throw new Error("업체 저장 실패");
        }
        
        logger.info("업체 저장 성공", { placeId });
        
        // ---- (3) 키워드 생성 ----
        logger.info("키워드 생성 단계 시작");
        updateProgress("chatgpt", 40);
        
        // logTiming 사용하여 키워드 생성 시간 측정
        const chatgptRes = await logger.logTiming("키워드 생성 API 호출", async () => {
          return await chatgptKeywordsHandler({
            ...normalizedData.placeInfo,
            user_id: userId
          });
        });
        
        if (!chatgptRes.success) {
          logger.error("키워드 생성 실패");
          throw new Error("키워드 생성 실패");
        }
        
        logger.info("키워드 생성 성공", {
          locationKeywordCount: chatgptRes.locationKeywords.length,
          featureKeywordCount: chatgptRes.featureKeywords.length
        });
        
        // ---- (4) 키워드 조합 ----
        logger.info("키워드 조합 단계 시작");
        updateProgress("combining", 55);
        
        // logTiming 사용하여 키워드 조합 시간 측정
        const combineRes = await logger.logTiming("키워드 조합 API 호출", async () => {
          return await combineKeywords(
            chatgptRes.locationKeywords,
            chatgptRes.featureKeywords
          );
        });
        
        if (!combineRes || typeof combineRes !== 'object') {
            logger.error("키워드 조합 응답 형식 오류", { response: combineRes });
            throw new Error("서버 응답 형식이 올바르지 않습니다.");
          }
          
          if (!combineRes.success) {
            logger.error("키워드 조합 실패");
            throw new Error("키워드 조합 실패");
          }
          
          // API 응답 필드 로깅
          logger.debug("키워드 조합 API 응답 구조", {
            hasSuccess: !!combineRes.success,
            hasCombinedKeywords: !!combineRes.combinedKeywords,
            hasCandidateKeywords: !!combineRes.candidateKeywords,
            fields: Object.keys(combineRes)
          });

        // combinedKeywords 또는 candidateKeywords 사용
        const combinedKeywords = combineRes.combinedKeywords || combineRes.candidateKeywords;

        // 키워드 배열 유효성 확인
        if (!Array.isArray(combinedKeywords)) {
        logger.error("키워드 조합 응답 형식 오류", { 
            hasCombinedKeywords: !!combineRes.combinedKeywords,
            hasCandidateKeywords: !!combineRes.candidateKeywords
        });
        throw new Error("키워드 조합 결과 형식이 올바르지 않습니다.");
        }

        // 조합된 키워드가 없는 경우 처리
        if (combinedKeywords.length === 0) {
            logger.warn("조합된 키워드가 없음");
            throw new Error("조합된 키워드가 없습니다. 다시 시도해주세요.");
        }
        
        // 로그 메시지에서 combinedKeywords 변수 사용
        logger.info("키워드 조합 성공", {
            combinedKeywordCount: combinedKeywords.length 
        });
        
        

        // ---- (5) 검색량 확인 ----
        logger.info("검색량 확인 단계 시작");
        updateProgress("checking", 70);

        // 정규화된 URL 확인 (TypeScript 오류 방지)
        const normalizedUrl = normalizedData.normalizedUrl || "";
        if (!normalizedUrl) {
        logger.warn("정규화된 URL이 없음");
        }
        
        // logTiming 사용하여 검색량 확인 시간 측정
        logger.debug("검색량 확인에 사용할 키워드", {
            keywordCount: combinedKeywords.length,
            sampleKeywords: combinedKeywords.slice(0, 5)
        });
        
        // logTiming 사용하여 검색량 확인 시간 측정 (combinedKeywords 변수 사용)
        const checkRes = await logger.logTiming("검색량 확인 API 호출", async () => {
            return await checkSearchVolume(
            normalizedUrl,
            combinedKeywords // combineRes.combinedKeywords 대신 combinedKeywords 사용
            );
        });
        
        // ---- (6) 키워드 그룹화 ----
        logger.info("키워드 그룹화 단계 시작");
        updateProgress("grouping", 85);
        
        // logTiming 사용하여 키워드 그룹화 시간 측정
        const groupRes = await logger.logTiming("키워드 그룹화 API 호출", async () => {
          return await groupKeywords(checkRes.externalDataList);
        });
        
        if (!groupRes.success) {
          logger.error("키워드 그룹화 실패");
          throw new Error("키워드 그룹화 실패");
        }
        
        logger.info("키워드 그룹화 성공", {
          finalKeywordCount: groupRes.finalKeywords.length
        });
        
        // ---- 완료 ----
        logger.info("비즈니스 생성 프로세스 완료", {
          placeId,
          finalKeywordCount: groupRes.finalKeywords.length
        });
        
        updateProgress("complete", 100);
        
        // 이제 키워드 선택 대화상자를 열 상태로 만들기
        setFinalKeywords(groupRes.finalKeywords);
        
        // 키워드 선택 다이얼로그를 열기 위한 상태 설정
        setKeywordDialogOpen(true);
        
        return groupRes;
      } catch (error) {
        // 오류 발생 시 상세 로깅
        logger.error("비즈니스 생성 과정 오류", {
          step: currentStep,
          progress: progressPercent,
          error: error instanceof Error ? error.message : String(error)
        });
        
        throw error;
      }
    },
    onError: (error: unknown) => {
      logger.error("비즈니스 생성 오류 처리", error);
      const errorMessage = error instanceof Error ? error.message : "업체 생성 중 오류 발생";
      toast.error(errorMessage);
      updateProgress("idle", 0);
    },
  })

  // (7) 선택한 키워드 저장
  const saveKeywordsMutation = useMutation({
    mutationFn: async (params: {
      keywords: FinalKeyword[], 
      placeId: string | number
    }) => {
      const { keywords, placeId } = params;
      
      logger.info("키워드 저장 시작", {
        keywordCount: keywords.length,
        placeId
      });
      
      if (!keywords.length) {
        logger.warn("저장할 키워드가 없음");
        return;
      }
      
      if (!userId) {
        logger.error("사용자 ID 없음");
        throw new Error("사용자 정보가 없습니다.");
      }
      
      logger.debug("키워드 저장 요청", {
        keywords: keywords.map(k => k.combinedKeyword),
        userId,
        placeId
      });
      
      // logTiming 사용하여 키워드 저장 시간 측정
      await logger.logTiming("키워드 저장 API 호출", async () => {
        return await saveSelectedKeywords(keywords, userId, placeId);
      });
      
      logger.info("키워드 저장 성공");
      
      // 저장 성공 후 업체 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["userBusinesses", userId] });
    },
    onSuccess: () => {
      logger.info("키워드 저장 완료");
      toast.success("키워드가 저장되었습니다.");
      
      // 진행 상태 초기화
      updateProgress("idle", 0);
      
      // 데이터 상태 초기화
      setNormalizedData(null);
      setFinalKeywords([]); // 최종 키워드 데이터 초기화
      setSavedPlaceId(null); // savedPlaceId도 초기화
      
      // 키워드 다이얼로그 닫기
      setKeywordDialogOpen(false);
      
      // localStorage에서 비즈니스 생성 상태 완전히 삭제
      localStorage.removeItem(STORAGE_KEY);
      
      // 임시 저장 데이터도 삭제
      sessionStorage.removeItem('temp_place_id');
      localStorage.removeItem('current_place_id');
      
      // 관련 임시 데이터도 삭제
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith(STORAGE_KEY) || 
          key.includes('place_id') || 
          key === 'dialogOpen'
        )) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      logger.info("localStorage 상태 데이터 삭제 완료");
    },
    onError: (error: unknown) => {
      logger.error("키워드 저장 실패", error);
      const errorMessage = error instanceof Error ? error.message : "키워드 저장 중 오류 발생";
      toast.error(errorMessage);
    }
  })

  // URL 입력으로 업체 정보 확인
  const handleCheckPlace = (platform: Platform, placeUrl: string) => {
    resetState(); // 기존 상태 초기화
    logger.info("업체 정보 확인 요청", { platform, placeUrl });
    return normalizeMutation.mutateAsync({ platform, placeUrl });
  }

  // 업체 생성 프로세스 실행
  const handleConfirmCreate = () => {
    logger.info("업체 생성 프로세스 시작 요청");
    return createBusinessMutation.mutateAsync();
  }

  // 선택한 키워드 저장
  const handleSaveSelectedKeywords = (params: {
    keywords: FinalKeyword[], 
    placeId: string | number
  }) => {
    logger.info("선택한 키워드 저장 요청", {
      keywordCount: params.keywords.length,
      keywords: params.keywords.map(k => k.combinedKeyword),
      placeId: params.placeId
    });
    
    return saveKeywordsMutation.mutateAsync(params);
  }

  // 키워드 선택 핸들러 추가
  const handleKeywordSelection = (keywordId: string, isSelected: boolean) => {
    logger.debug("키워드 선택 상태 변경", { keywordId, isSelected });
    
    if (isSelected) {
      setSelectedKeywordIds(prev => [...prev, keywordId]);
    } else {
      setSelectedKeywordIds(prev => prev.filter(id => id !== keywordId));
    }
  }

  // 다이얼로그 닫기 핸들러 추가
  const handleKeywordDialogClose = () => {
    logger.info("키워드 다이얼로그 닫기 - 상태 유지");
    setKeywordDialogOpen(false);
  }

  return {
    // 진행 상태
    currentStep,
    progressPercent,
    
    // 결과 데이터
    normalizedData,
    finalKeywords,
    savedPlaceId,
    
    // 키워드 대화상자 상태
    keywordDialogOpen,
    setKeywordDialogOpen,
    
    // 키워드 선택 관리
    selectedKeywordIds,
    handleKeywordSelection,
    handleKeywordDialogClose,
    
    // mutations
    normalizeMutation,
    createBusinessMutation,
    saveKeywordsMutation,
    
    // handlers
    handleCheckPlace,
    handleConfirmCreate,
    handleSaveSelectedKeywords,
    
    // 상태 관리
    restoreState,
    resetState,
  }
}
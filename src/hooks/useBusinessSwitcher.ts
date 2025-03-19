"use client"
import { useState } from "react"
import { useUser } from "./useUser"
import { useUserBusinesses } from "./useUserBusinesses"
import { useBusinessCreation } from "./useBusinessCreation"
import { FinalKeyword, Platform } from "@/types"
import { toast } from "sonner"
export function useBusinessSwitcher() {
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
  } = useUserBusinesses(user?.id ? String(user.id) : undefined) // Convert to string if needed

  // // Add debugging console log to see if businesses data is received correctly
  // console.log("Business data in useBusinessSwitcher:", {
  //   businessesExist: !!businesses,
  //   businessCount: businesses?.length,
  //   firstBusiness: businesses?.[0],
  //   activeBusiness
  // });

  // 3) 비즈니스 생성 로직
  const {
    currentStep,
    progressPercent,
    normalizedData,
    finalKeywords,
    normalizeMutation,
    createBusinessMutation,
    saveKeywordsMutation,
  } = useBusinessCreation(user?.id ? String(user.id) : undefined) // Convert to string if needed

  // UI 상태 (Sheet, Dialog)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [keywordDialogOpen, setKeywordDialogOpen] = useState(false)

  // Form
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("")
  const [placeUrl, setPlaceUrl] = useState("")

  // BusinessSheet.tsx에서 필요한 상태 추가
  const [placeData, setPlaceData] = useState<{
    place_name: string;
    category?: string;
    platform?: string;
  } | null>(null);

  // 편의 함수
  const isDisabled = !selectedPlatform || !placeUrl

  const handleCheckPlace = async () => {
    if (isDisabled) return
    
    try {
      console.log("URL 정규화 시작:", { platform: selectedPlatform, placeUrl });
      
      // URL 정규화 실행
      const res = await normalizeMutation.mutateAsync({
        platform: selectedPlatform,
        placeUrl,
      })
      
      console.log("URL 정규화 응답:", res);
      
      // 응답 확인 및 안전하게 처리
      if (res && res.success && res.placeInfo) {
        console.log("정규화 성공, placeData 설정:", res.placeInfo);
        
        // 정규화 성공 시 placeData 설정
        setPlaceData({
          place_name: res.placeInfo.place_name,
          category: res.placeInfo.category,
          platform: res.placeInfo.platform,
        });
        
        // Dialog 열기
        setDialogOpen(true);
      } else {
        console.error("정규화 응답이 유효하지 않음:", res);
        toast.error("업체 정보를 불러올 수 없습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("URL 정규화 과정에서 오류 발생:", error);
      toast.error("업체 확인 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  }

  // 전체 진행
  const handleConfirmCreate = async () => {
    // createBusinessMutation이 내부에서 (2)~(6) 단계 처리
    createBusinessMutation.mutate()
  }

  // 키워드 선택 저장
  const handleSaveSelectedKeywords = (keywords: FinalKeyword[]) => {
    saveKeywordsMutation.mutate(keywords)
  }

  return {
    // User & Business
    user,
    businesses,
    activeBusiness,
    setActiveBusiness,
    isLoading: userIsLoading || businessesLoading,
    isError: businessesError,
    refetchBusinesses: refetch,

    // UI State
    sheetOpen, setSheetOpen,
    dialogOpen, setDialogOpen,
    keywordDialogOpen, setKeywordDialogOpen,

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

    // Final Keywords
    finalKeywords,

    // Business creation flow
    handleCheckPlace,
    handleConfirmCreate,
    handleSaveSelectedKeywords,

    // Mutation states
    isCreatingBusiness: createBusinessMutation.isPending, // Fix: Use isPending instead of isLoading
    isSavingKeywords: saveKeywordsMutation.isPending, // Fix: Use isPending instead of isLoading
  }
}
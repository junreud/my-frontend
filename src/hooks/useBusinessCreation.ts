// hooks/useBusinessCreation.ts
import { useState } from "react"
import {
  normalizeUrl,
  storePlace,
  generateKeywords,
  combineKeywords,
  checkSearchVolume,
  groupKeywords,
  saveSelectedKeywords,
} from "@/services/keywordServices"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  NormalizeResponse,
  FinalKeyword,
  ProgressStep,
  Platform,
  PlaceInfoWithUser
} from "@/types"

export function useBusinessCreation(userId?: string) {
  const queryClient = useQueryClient()
  
  // 단계별 Progress state
  const [currentStep, setCurrentStep] = useState<ProgressStep>("idle")
  const [progressPercent, setProgressPercent] = useState(0)
  
  // URL 정규화 결과
  const [normalizedData, setNormalizedData] = useState<NormalizeResponse | null>(null)
  const [finalKeywords, setFinalKeywords] = useState<FinalKeyword[]>([])

  // 1) URL 정규화
  const normalizeMutation = useMutation({
    mutationFn: async ({ platform, placeUrl }: { platform: Platform; placeUrl: string }) => {
      setCurrentStep("normalizing")
      setProgressPercent(10)
      try {
        const res = await normalizeUrl(placeUrl, platform)
        
        // 반환값이 존재하고 success 속성이 있는지 확인
        if (res && typeof res === 'object') {
          return res
        } else {
          // 유효한 응답이 아닌 경우 적절한 오류 객체 반환
          throw new Error('유효하지 않은 응답 형식입니다.');
        }
      } catch (error) {
        console.error("URL 정규화 오류:", error)
        throw error; // 오류를 다시 던져서 onError 핸들러가 처리하도록 함
      }
    },
    onSuccess: (data) => {
      if (data?.success) {
        setNormalizedData(data); // 이제 data는 항상 NormalizeResponse 타입
      }
      setCurrentStep("idle")
      setProgressPercent(0)
    },
    onError: (error: Error) => {
      console.error(error)
      toast.error(error.message || "URL 정규화 중 오류 발생")
      setCurrentStep("idle")
      setProgressPercent(0)
    }
  })

  // 2) 업체 저장 → 3) 키워드 생성 → 4) 키워드 조합 → 5) 검색량 체크 → 6) 키워드 그룹화
  const createBusinessMutation = useMutation({
    mutationFn: async () => {
      if (!normalizedData?.placeInfo || !userId) {
        throw new Error("정규화 데이터가 없거나 유저 정보가 없습니다.")
      }

      // ---- (2) 업체 저장 ----
      setCurrentStep("storing")
      setProgressPercent(20)
      console.log("정규화 데이터 확인:", normalizedData.placeInfo);

      const storeRes = await storePlace(userId, {
        place_id: normalizedData.placeInfo.place_id || (normalizedData.placeInfo.placeId as string),
        place_name: normalizedData.placeInfo.place_name,
        category: normalizedData.placeInfo.category,
        platform: normalizedData.placeInfo.platform as Platform, 
      })
      if (!storeRes.success) throw new Error("업체 저장 실패")

      // ---- (3) 키워드 생성 ----
      setCurrentStep("generating")
      setProgressPercent(40)
      const placeInfoWithUser: PlaceInfoWithUser = {
        ...normalizedData.placeInfo,
        userId,
        platform: normalizedData.placeInfo.platform as Platform,
      }
      const genRes = await generateKeywords(placeInfoWithUser)
      if (!genRes.success) throw new Error("키워드 생성 실패")

      // ---- (4) 키워드 조합 ----
      setCurrentStep("combining")
      setProgressPercent(55)
      const combineRes = await combineKeywords(
        genRes.locationKeywords,
        genRes.featureKeywords  
      )
      if (!combineRes.success) throw new Error("키워드 조합 실패")

      // ---- (5) 검색량 체크 ----
      setCurrentStep("checking")
      setProgressPercent(70)
      const volumeRes = await checkSearchVolume(
        normalizedData.normalizedUrl,
        combineRes.candidateKeywords
      )
      if (!volumeRes.success) throw new Error("검색량 조회 실패")

      // ---- (6) 그룹화 ----
      setCurrentStep("grouping")
      setProgressPercent(85)
      const groupRes = await groupKeywords(volumeRes.externalDataList)
      if (!groupRes.success) throw new Error("키워드 그룹화 실패")

      // 최종 키워드 저장
      setFinalKeywords(groupRes.finalKeywords || [])
      setCurrentStep("complete")
      setProgressPercent(100)

      // 캐시 무효화 (목록 다시 불러오기)
      queryClient.invalidateQueries({
        queryKey: ["userBusinesses", userId]
      })

      toast.success("업체 등록이 완료되었습니다.")
    },
    onError: (error: Error) => {
      console.error(error)
      toast.error(error.message || "업체 등록 중 오류 발생")
      setCurrentStep("idle")
      setProgressPercent(0)
    },
  })

  // 7) 선택된 키워드 저장
  const saveKeywordsMutation = useMutation({
    mutationFn: async (keywords: FinalKeyword[]) => {
      if (!keywords.length) return
      await saveSelectedKeywords(keywords)
    },
    onSuccess: () => {
      toast.success("키워드가 저장되었습니다.")
    },
    onError: (error: Error) => {
      console.error(error)
      toast.error("키워드 저장에 실패했습니다.")
    }
  })

  return {
    // State
    currentStep,
    progressPercent,
    normalizedData,
    finalKeywords,
    
    // Mutations
    normalizeMutation, // (1) URL 정규화
    createBusinessMutation, // (2)~(6) 일괄 처리
    saveKeywordsMutation,   // (7) 키워드 저장
  }
}
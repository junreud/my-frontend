// hooks/useBusinessSwitcher.ts

"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient"
import { useUser, type Business } from "@/hooks/useUser"  // user: { role?: string }

// Sonner
import { toast } from "sonner"

type PlaceData = {
  userid: number
  normalizedUrl: string
  placeId: string
  place_name: string
  category: string
  blogReviewTitles?: string[]
  shopIntro?: string
  isNewlyOpened?: boolean
}

// Export FinalKeyword type so it can be imported elsewhere
export interface FinalKeyword {
  combinedKeyword: string;
  details?: { monthlySearchVolume?: number }[];
}

export function useBusinessSwitcher() {
  // 1) user info
  const { data: user, isLoading, isError } = useUser()
  const queryClient = useQueryClient()

  // 2) activeBusiness
  const [activeBusiness, setActiveBusiness] = React.useState<Business | null>(null)

  React.useEffect(() => {
    if (user?.businesses && user.businesses.length > 0) {
      setActiveBusiness(user.businesses[0])
    } else {
      setActiveBusiness(null)
    }
  }, [user])

  // 3) Drawer / Dialog
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  // (A) 2차 다이얼로그 (키워드 선택) 열기/닫기
  const [keywordDialogOpen, setKeywordDialogOpen] = React.useState(false)

  // 4) 폼 state
  const [selectedPlatform, setSelectedPlatform] = React.useState("")
  const [placeUrl, setPlaceUrl] = React.useState("")
  const [placeData, setPlaceData] = React.useState<PlaceData | null>(null)
  const isDisabled = !selectedPlatform || !placeUrl

  // (B) 멀티스텝 진행도; use FinalKeyword[] instead of any[]
  const [progress, setProgress] = React.useState(0)
  const [finalKeywords, setFinalKeywords] = React.useState<FinalKeyword[]>([])
  const [multiStepError, setMultiStepError] = React.useState<string | null>(null)
  const [loadingSteps, setLoadingSteps] = React.useState(false)

  /** 
   * (1) 정규화 + placeData 설정
   *     GET /keyword/normalize?url=...
   */
  async function handleCheckPlace() {
    try {
      const res = await apiClient.post("/keyword/normalize", {
         url: placeUrl, 
         platform: selectedPlatform,
      })
      if (!res.data?.success) {
        toast.error(res.data?.message || "URL 정규화 실패")
        return
      }

      const { normalizedUrl, placeInfo } = res.data
      const {
        userid,
        placeId,
        place_name,
        category,
        blogReviewTitles,
        shopIntro,
        isNewlyOpened,
      } = placeInfo

      setPlaceData({
        userid,
        normalizedUrl,
        placeId,
        place_name,
        category,
        blogReviewTitles,
        shopIntro,
        isNewlyOpened,
      })

      // Dialog 열기
      setDialogOpen(true)

      toast.success("업체를 불러왔습니다..", {
        description: "업체 정보를 불러왔습니다.",
      })
    } catch (err) {
      console.error(err)
      toast.error("업체를 불러오는 과정에서 오류가 발생했습니다.")
    }
  }

  /**
   * (2) Dialog에서 “생성하기”
   *  - store-place → 성공 → Dialog/Sheet 닫기
   *  - 이후 handleProcessAllSteps()
   */
  async function handleConfirmCreate() {
    if (!placeData) {
      toast.error("오류가 발생했습니다. 다시 시도해주세요.")
      return
    }
    try {
      console.log("POST /keyword/store-place =>", {
        user_id: placeData.userid,
        place_id: placeData.placeId,
        place_name: placeData.place_name,
        category: placeData.category,
      })

      const storeRes = await apiClient.post("/keyword/store-place", {
        user_id: placeData.userid,
        place_id: placeData.placeId,
        place_name: placeData.place_name,
        category: placeData.category,
      })
      if (!storeRes.data?.success) {
        toast.error(storeRes.data?.message || "storePlace 실패")
        return
      }

      toast.success("Store-Place 성공!", {
        description: "이어서 나머지 단계를 진행합니다.",
      })

      // Dialog/Sheet 닫기
      setDialogOpen(false)
      setSheetOpen(false)

      // 나머지 단계 실행
      await handleProcessAllSteps() // chatgpt → combine → search-volume → group
    } catch (err) {
      console.error(err)
      toast.error(`생성 실패(store-place): ${(err as Error).message}`)
    }
  }

  /**
   * (3) chatgpt → combine → search-volume → group
   */
  async function handleProcessAllSteps() {
    if (!placeData) {
      toast.error("placeData가 없습니다. 정규화 후 진행해주세요.")
      return
    }
    setLoadingSteps(true)
    setMultiStepError(null)
    setProgress(0)
    setFinalKeywords([])

    try {
      // 1) chatgpt
      setProgress(30)
      const chatRes = await apiClient.post("/keyword/chatgpt", {
        placeInfo: {
          blogReviewTitles: placeData.blogReviewTitles,
          shopIntro: placeData.shopIntro,
          isNewlyOpened: placeData.isNewlyOpened,
        },
        category: placeData.category,
      })
      if (!chatRes.data?.success) throw new Error(chatRes.data?.message || "chatGPT 실패")
      const { locationKeywords, featureKeywords } = chatRes.data

      // 2) combine
      setProgress(50)
      const combineRes = await apiClient.post("/keyword/combine", {
        locationKeywords,
        featureKeywords,
      })
      if (!combineRes.data?.success) throw new Error(combineRes.data?.message || "combine 실패")
      const candidateKeywords = combineRes.data.candidateKeywords

      // 3) search-volume
      setProgress(80)
      const searchRes = await apiClient.post(
        "/keyword/search-volume",
        { candidateKeywords },
        {
          params: {
            // (중요) /keyword/search-volume?normalizedUrl=~
            normalizedUrl: placeData.normalizedUrl,
          },
        }
      )
      if (!searchRes.data?.success) throw new Error(searchRes.data?.message || "searchVolume 실패")
      const { externalDataList } = searchRes.data

      // 4) group
      setProgress(90)
      const groupRes = await apiClient.post("/keyword/group", {
        externalDataList,
      })
      if (!groupRes.data?.success) throw new Error(groupRes.data?.message || "group 실패")

      const { finalKeywords: fKeywords } = groupRes.data
      setFinalKeywords(fKeywords)

      setProgress(100)
      console.log("나머지 단계 완료, finalKeywords=", fKeywords)
      toast.success("키워드 생성이 완료되었습니다.")

      // 모든 작업이 끝나면, 필요 시 키워드 선택 다이얼로그 열기
      setKeywordDialogOpen(true)

    } catch (err) {
      console.error(err)
      const msg = (err as Error).message
      setMultiStepError(msg)
      toast.error(`단계 처리 중 오류가 발생했습니다: ${msg}`)
    } finally {
      setLoadingSteps(false)
    }
  }

/** 
 * (4) 키워드 선택 후 저장 
 *  - (A) 2개 이상 묶인 키워드들만 골라서 #6 /keyword/save-grouped 호출
 *  - (B) 모든 키워드를 #7 /keyword/save-selected 호출
 */
async function handleSaveSelectedKeywords(fKeywords: FinalKeyword[]) {
  try {
    // (A) 2개 이상 쉼표로 묶인 키워드 그룹만 골라 /keyword/save-grouped 호출
    const multiKeywordGroups = fKeywords.filter((item) => {
      // "," 기준으로 split해서 2개 이상이면 그룹화된 키워드라고 판단
      const splitted = item.combinedKeyword
        .split(",")
        .map((kw) => kw.trim())
        .filter((kw) => kw.length > 0)
      return splitted.length >= 2
    })

    // 그룹화된 것이 하나라도 있으면 /keyword/save-grouped 호출
    if (multiKeywordGroups.length > 0) {
      const groupedRes = await apiClient.post("/keyword/save-grouped", {
        finalKeywords: multiKeywordGroups,
      })
      if (!groupedRes.data?.success) {
        toast.error(groupedRes.data?.message || "그룹화 키워드 저장 실패")
        return
      }
    }

    // (B) “실제 user_place_keywords 테이블에 저장” → 그룹화된 키워드는 첫 번째 키워드만
    const processedKeywords = fKeywords.map((item) => {
      const splitted = item.combinedKeyword
        .split(",")
        .map((kw) => kw.trim())
        .filter((kw) => kw.length > 0)
      
      if (splitted.length > 1) {
        // 그룹화된 경우 => 첫 번째 키워드만 사용
        return {
          ...item,
          combinedKeyword: splitted[0], // 첫 번째 하나만
        }
      } else {
        // 원래 1개짜리인 경우는 그대로/me
        return item
      }
    })

    const saveSelectedRes = await apiClient.post("/keyword/save-selected", {
      finalKeywords: processedKeywords,
      platform: selectedPlatform,
    })
    if (!saveSelectedRes.data?.success) {
      toast.error(saveSelectedRes.data?.message || "키워드 저장 실패")
      return
    }

    toast.success("키워드 저장이 완료되었습니다.")
    // (선택) user 정보 갱신
    await queryClient.refetchQueries({
      queryKey: ["user"],
      exact: true,
    })

    // 2차 다이얼로그(키워드 선택) 닫기
    setKeywordDialogOpen(false)
  } catch (err) {
    console.error(err)
    toast.error("키워드 저장 중 오류가 발생했습니다.")
  }
}
  return {
    user,            // User | undefined
    isLoading,
    isError,
    activeBusiness,
    setActiveBusiness,

    // Drawer
    sheetOpen,
    setSheetOpen,

    // 1차 Dialog
    dialogOpen,
    setDialogOpen,

    // 2차 Dialog
    keywordDialogOpen,
    setKeywordDialogOpen,

    // 폼
    selectedPlatform,
    setSelectedPlatform,
    placeUrl,
    setPlaceUrl,
    placeData,
    setPlaceData,
    isDisabled,

    // 멀티스텝 진행
    progress,
    finalKeywords,
    setFinalKeywords,
    multiStepError,
    loadingSteps,

    // 메서드
    handleCheckPlace,
    handleConfirmCreate,
    handleProcessAllSteps,
    handleSaveSelectedKeywords,
  }
}

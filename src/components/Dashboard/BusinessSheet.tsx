// components/dashboard/BusinessSheet.tsx
"use client"

import * as React from "react"
import Image from "next/image"
import { toast } from "sonner" // toast 임포트 추가
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
// (추가) shadcn/ui의 체크박스
import { Checkbox } from "@/components/ui/checkbox"
import { useBusinessSwitcher } from "@/hooks/useBusinessSwitcher"
import type { FinalKeyword, ApiError } from "@/types"  // Add ApiError import

export function BusinessSheet({
  open,
  onOpenChange, // 하단 슬라이드 시트 열기/닫기
}: {
  open: boolean
  onOpenChange: (val: boolean) => void
}) {
  const {
    selectedPlatform,
    setSelectedPlatform,
    placeUrl,
    setPlaceUrl,
    dialogOpen,
    setDialogOpen,
    placeData,
    normalizedData, // 추가: normalizedData를 가져옵니다
    setPlaceData,
    handleConfirmCreate,
    handleCheckPlace,
    isDisabled,

    // (C) 새로 추가되는 부분 (가정)
    user,
    finalKeywords,
    keywordDialogOpen,
    setKeywordDialogOpen,
    handleSaveSelectedKeywords,
  } = useBusinessSwitcher()

  // (A) 1차 “생성하기” 버튼 로딩 상태
  const [isChecking, setIsChecking] = React.useState(false)
  // (B) 2차 Dialog “생성하기” 버튼 로딩 상태
  const [isConfirming, setIsConfirming] = React.useState(false)

  // (C) 키워드 선택 Dialog에서의 체크 상태
  const [selectedKeywords, setSelectedKeywords] = React.useState<string[]>([])

  // user가 일반 'user'이면 최대 3개 제한, 그 외(role이 admin 등)면 제한X
  const isUserRole = user?.role === "user"
  const maxSelection = isUserRole ? 3 : 9999

  // 플랫폼 목록
  const platforms = [
    { id: "naver", label: "네이버", logo: "/images/platform/naver24.svg" },
  ]

  // (A) 1차 생성하기
  async function onCheckPlace() {
    try {
      setIsChecking(true)
      await handleCheckPlace()
    } catch (err) {
      console.error(err)
    } finally {
      setIsChecking(false)
    }
  }

// (B) 2차 Dialog "생성하기"
async function onConfirmCreate() {
  // 일단 첫 번째 Dialog 닫기
  setDialogOpen(false)
  try {
    setIsConfirming(true)
    console.log("Starting business creation process...");
    
    // store-place + etc
    await handleConfirmCreate()
    
    // 시트 닫기
    onOpenChange(false)
  } catch (err: unknown) {
    const error = err as ApiError;
    console.error("Business creation error:", error);
    
    // 오류 메시지 추출 및 표시
    let errorMessage = "업체 생성 과정에서 오류가 발생했습니다.";
    if (error.response && error.response.data) {
      errorMessage = error.response.data.message || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
  } finally {
    setIsConfirming(false)
  }
}

  // 체크박스 토글
  function toggleKeyword(k: string) {
    if (selectedKeywords.includes(k)) {
      // 이미 포함 → 해제
      setSelectedKeywords((prev) => prev.filter((item) => item !== k))
    } else {
      // 새로 체크
      if (isUserRole && selectedKeywords.length >= maxSelection) {
        // 일반 user이고 이미 3개면 더 이상 추가 불가
        return
      }
      setSelectedKeywords((prev) => [...prev, k])
    }
  }

  // 2차 다이얼로그(키워드 선택) 열릴 때 체크 상태 초기화
  React.useEffect(() => {
    if (keywordDialogOpen) {
      setSelectedKeywords([])
    }
  }, [keywordDialogOpen])

  // 최종 선택하
  async function onSubmitKeywords() {
    if (!selectedKeywords.length) {
      alert("최소 1개 이상 키워드를 선택해주세요.")
      return
    }
    // 서버 저장 로직
    await handleSaveSelectedKeywords(
      selectedKeywords.map((k) => ({
        combinedKeyword: k,
        details: [],
      }))
    )
    // 성공 시 닫음 (handleSaveSelectedKeywords 안에서 닫아도 됨)
    setKeywordDialogOpen(false)
  }

  // dialogOpen 닫힐 때 폼 초기화
  React.useEffect(() => {
    if (!dialogOpen) {
      setSelectedPlatform("")
      setPlaceUrl("")
      setPlaceData(null)
    }
  }, [dialogOpen, setSelectedPlatform, setPlaceUrl, setPlaceData])

  React.useEffect(() => {
    // whenever the dialog opens, close the sheet
    if (dialogOpen) {
      onOpenChange(false)
    }
  }, [dialogOpen, onOpenChange])

  // URL이 너무 길면 ...으로 표시 (수정) - 타입 안전성 개선
  const truncatedUrl =
    normalizedData?.normalizedUrl ? 
      normalizedData.normalizedUrl.length > 30
        ? normalizedData.normalizedUrl.slice(0, 30) + "..."
        : normalizedData.normalizedUrl
      : "";

  return (
    <>
      {/* ============ (1) Sheet ============ */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="
            p-4
            rounded-t-lg
            border-t
            border-border
            max-h-[80%]
            overflow-y-auto
            text-center
            max-w-sm
            w-full
            mx-auto
          "
        >
          <SheetHeader>
            <SheetTitle>업체 추가하기</SheetTitle>
            <SheetDescription className="mb-2 block text-sm font-medium text-center">
              플랫폼을 선택하세요
            </SheetDescription>
          </SheetHeader>

          {/* (1) 플랫폼 선택 */}
          <div className="flex gap-3 mt-4 justify-center">
            {platforms.map((plat) => {
              const isActive = plat.id === selectedPlatform
              return (
                <button
                  key={plat.id}
                  onClick={() => setSelectedPlatform(plat.id)}
                  className={`
                    relative flex items-center justify-center
                    w-14 h-14 p-2
                    border rounded-md
                    transition
                    ${
                      isActive
                        ? "bg-accent border-accent-foreground"
                        : "border-border bg-background"
                    }
                  `}
                >
                  <Image
                    src={plat.logo}
                    alt={plat.label}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                  {isActive && (
                    <span className="absolute inset-0 ring-2 ring-offset-2 ring-accent-foreground rounded-md" />
                  )}
                </button>
              )
            })}
          </div>

          {/* (2) URL 입력 */}
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium">
              업체 URL
            </label>
            <Input
              value={placeUrl}
              onChange={(e) => setPlaceUrl(e.target.value)}
              placeholder="업체 링크 URL을 입력해 주세요"
            />
          </div>

          {/* (3) 하단 버튼 */}
          <SheetFooter className="mt-6 flex justify-end gap-2">
            <Button
              disabled={isDisabled || isChecking}
              onClick={onCheckPlace}
            >
              {isChecking ? (
                <span className="loading loading-dots loading-md"></span>
              ) : (
                "생성하기"
              )}
            </Button>
            <SheetClose asChild>
              <Button variant="ghost">닫기</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ============ (2) 첫 번째 Dialog(확인) ============ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent 
          className="max-w-sm bg-white text-foreground"     
          onPointerDownOutside={(event) => {
            event.preventDefault()
          }}
          onInteractOutside={(event) => {
            event.preventDefault()
          }}
          onEscapeKeyDown={(event) => {
            event.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-red-600">주의</DialogTitle>
            <DialogDescription>
              무료로 등록할 수 있는 업체는 한 번 뿐입니다.
            </DialogDescription>
          </DialogHeader>
          {placeData && (
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center">
                <div className="w-20 text-right mr-2">
                  <strong>업체명:</strong>
                </div>
                <Badge className="bg-whiteㅕ text-black">
                  {placeData.place_name}
                </Badge>
              </div>
              <div className="flex items-center">
                <div className="w-20 text-right mr-2">
                  <strong>카테고리:</strong>
                </div>
                <Badge className="bg-white text-black">
                  {placeData.category}
                </Badge>
              </div>
              <div className="flex items-center">
                <div className="w-20 text-right mr-2">
                  <strong>URL:</strong>
                </div>
                <Badge className="bg-white text-black">
                  <a
                    href={normalizedData?.normalizedUrl} // 수정: normalizedData에서 URL 가져오기
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {truncatedUrl}
                  </a>
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button onClick={onConfirmCreate} disabled={isConfirming}>
              {isConfirming ? (
                <span className="loading loading-dots loading-md"></span>
              ) : (
                "생성하기"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ (3) 두 번째 Dialog(키워드 선택) ============ */}
      <Dialog
        open={keywordDialogOpen}
        onOpenChange={setKeywordDialogOpen}
      >
        <DialogContent
          // 좀 더 크게
          className="
            max-w-2xl bg-white text-foreground transition-all
            data-[state=open]:animate-in
            data-[state=open]:fade-in-90
            data-[state=open]:slide-in-from-bottom-10
            data-[state=closed]:animate-out
            data-[state=closed]:fade-out-90
            data-[state=closed]:slide-out-to-bottom-10
          "
          onPointerDownOutside={(event) => {
            event.preventDefault()
          }}
          onInteractOutside={(event) => {
            event.preventDefault()
          }}
          onEscapeKeyDown={(event) => {
            event.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>최종 키워드 선택</DialogTitle>
            <DialogDescription>
              {isUserRole
                ? "최대 3개까지 선택할 수 있습니다."
                : "원하는 만큼 선택할 수 있습니다."}
            </DialogDescription>
          </DialogHeader>

        {/* 키워드 리스트 */}
        <div className="mt-4 space-y-3 max-h-[50vh] overflow-auto px-1">
          {finalKeywords && finalKeywords.length > 0 ? (
            finalKeywords.map((item: FinalKeyword, idx: number) => {
              const kw = item.combinedKeyword;
              const isChecked = selectedKeywords.includes(kw);
              const disabled =
                !isChecked &&
                isUserRole &&
                selectedKeywords.length >= maxSelection;
              
              // (2) 블록 사용 시 "return" 명시
              // (3) 최종 결과가 number이 되도록 변환
              const totalVolume = item.details?.reduce((acc, curr) => {
                return acc + (curr.monthlySearchVolume ?? 0)
              }, 0) ?? 0

              return (
                // (1) div 대신 label로 감싸기
                <label
                  key={idx}
                  // htmlFor, onClick 제거 (불필요)
                  className={`
                    flex items-center gap-2 border-b py-2
                    ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
                    leading-none
                  `}
                >
                  <Checkbox
                    // id는 옵션(접근성 위해 써도 무방)
                    checked={isChecked}
                    onCheckedChange={() => {
                      if (!disabled) {
                        toggleKeyword(kw)
                      }
                    }}
                    disabled={disabled}
                  />
                  <span className="font-semibold">{kw}</span>
                  {item.details && (
                    <span className="ml-2 text-xs text-gray-500">
                      (총 {totalVolume} 검색량)
                    </span>
                  )}
                </label>
              );
            })
          ) : (
            <p className="text-sm text-gray-500">
              아직 생성된 키워드가 없습니다.
            </p>
          )}
        </div>


          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button onClick={onSubmitKeywords}>
              선택하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

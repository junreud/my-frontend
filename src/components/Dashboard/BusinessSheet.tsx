import * as React from "react"
import Image from "next/image"
import { toast } from "sonner"
import { createLogger } from "@/lib/logger"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetClose,
  SheetHeader,
  SheetTitle,
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
import { Checkbox } from "@/components/ui/checkbox"
import { useBusinessSwitcher } from "@/hooks/useBusinessSwitcher"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FinalKeyword, ApiError, ProgressStep, NormalizeResponse, Platform } from "@/types"

const logger = createLogger('BusinessSheet');

// Define types for data from useBusinessSwitcher
interface PlaceData {
  place_name: string;
  category?: string;
  place_id?: string | number;
  platform?: Platform;
  [key: string]: unknown;
}

interface BusinessSwitcherState {
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;
  placeUrl: string;
  setPlaceUrl: (url: string) => void;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  placeData: PlaceData | null;
  normalizedData: NormalizeResponse | null;
  setPlaceData: React.Dispatch<React.SetStateAction<PlaceData | null>>;
  handleConfirmCreate: () => Promise<unknown>;
  handleCheckPlace: () => Promise<unknown>;
  isDisabled: boolean;
  user: { role?: string } | null;
  finalKeywords: FinalKeyword[];
  setFinalKeywords: React.Dispatch<React.SetStateAction<FinalKeyword[]>>;
  keywordDialogOpen: boolean;
  setKeywordDialogOpen: (open: boolean) => void;
  handleSaveSelectedKeywords: (params: { keywords: FinalKeyword[], placeId: string | number }) => Promise<void>;
  savedPlaceId: string | number | null;
  currentStep: ProgressStep;
  progressPercent: number;
  resetBusinessCreation: () => void;
}

// 진행 단계별 표시 텍스트 및 아이콘
const stepInfo: Record<ProgressStep, { label: string, icon: React.ReactNode, color: string }> = {
  idle: { 
    label: "준비", 
    icon: <Clock className="h-4 w-4" />,
    color: "text-gray-500"
  },
  normalizing: { 
    label: "URL 정규화", 
    icon: <Clock className="h-4 w-4" />,
    color: "text-blue-500"
  },
  storing: { 
    label: "업체 등록", 
    icon: <Clock className="h-4 w-4" />,
    color: "text-blue-600"
  },
  chatgpt: { 
    label: "키워드 생성", 
    icon: <Clock className="h-4 w-4" />,
    color: "text-indigo-500"
  },
  combining: { 
    label: "키워드 조합", 
    icon: <Clock className="h-4 w-4" />,
    color: "text-purple-500"
  },
  checking: { 
    label: "검색량 확인", 
    icon: <Clock className="h-4 w-4" />,
    color: "text-violet-500"
  },
  grouping: { 
    label: "키워드 그룹화", 
    icon: <Clock className="h-4 w-4" />,
    color: "text-rose-500"
  },
  complete: { 
    label: "완료", 
    icon: <Clock className="h-4 w-4" />,
    color: "text-green-500"
  },
}

export function BusinessSheet({
  open,
  onOpenChange,
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
    normalizedData,
    setPlaceData,
    handleConfirmCreate,
    handleCheckPlace,
    isDisabled,

    user,
    finalKeywords,
    handleSaveSelectedKeywords,
    savedPlaceId,
    
    // 진행 상태 정보
    currentStep,
    progressPercent,
    resetBusinessCreation, // 초기화 함수 추가
  } = useBusinessSwitcher() as BusinessSwitcherState;

  // 통합 다이얼로그를 위한 상태
  const [dialogStep, setDialogStep] = React.useState<'confirm' | 'processing' | 'selection'>('confirm')
  const [isChecking, setIsChecking] = React.useState(false)
  const [isConfirming, setIsConfirming] = React.useState(false)
  const [selectedKeywords, setSelectedKeywords] = React.useState<string[]>([])
  
  // 다이얼로그 스타일 - 단계별로 크기 변경을 위한 설정
  const dialogSizeClass = React.useMemo(() => {
    switch(dialogStep) {
      case 'confirm':
        return "max-w-sm";
      case 'processing':
        return "max-w-lg"; // 더 넓게 변경
      case 'selection':
        return "max-w-2xl";
      default:
        return "max-w-sm";
    }
  }, [dialogStep]);

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
      // 초기화 함수 사용
      resetBusinessCreation();
      
      // 내부 상태 초기화
      setSelectedKeywords([]);
      
      setIsChecking(true)
      logger.info("업체 확인 시작");
      await handleCheckPlace()
    } catch (err) {
      logger.error("업체 확인 중 오류", err)
    } finally {
      setIsChecking(false)
    }
  }

  // 로컬 스토리지에서 dialogOpen 상태를 복구
  React.useEffect(() => {
    const savedDialogOpen = localStorage.getItem('dialogOpen')
    if (savedDialogOpen) {
      setDialogOpen(savedDialogOpen === 'true')
    }
  }, [setDialogOpen])

  // dialogOpen 상태가 변경될 때 로컬 스토리지에 저장
  React.useEffect(() => {
    localStorage.setItem('dialogOpen', dialogOpen.toString())
    
    // Dialog가 열리면 초기 단계로 설정
    if (dialogOpen) {
      setDialogStep('confirm');
    }
  }, [dialogOpen])

  // 2차 Dialog "생성하기" - 프로세스 시작
  async function onConfirmCreate() {
    try {
      setIsConfirming(true)
      logger.info("업체 생성 프로세스 시작");
      
      // 다이얼로그를 닫지 않고, 처리 중 단계로 즉시 전환
      setDialogStep('processing');
      
      // 백그라운드에서 비즈니스 생성 프로세스 실행
      await handleConfirmCreate();
      
      // 생성이 완료되면 키워드 선택 단계로 전환
      setDialogStep('selection');
    } catch (err: unknown) {
      const error = err as ApiError;
      logger.error("업체 생성 오류", error);
      
      let errorMessage = "업체 생성 과정에서 오류가 발생했습니다.";
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // 오류 발생 시 다이얼로그 닫기
      setDialogOpen(false);
    } finally {
      setIsConfirming(false);
      onOpenChange(false); // Sheet는 닫음
    }
  }

  // currentStep이 변경될 때마다 progress UI 업데이트 확인
  React.useEffect(() => {
    if (currentStep !== "idle" && dialogStep === 'processing') {
      // 강제로 UI 업데이트 트리거
      setDialogStep(prev => {
        if (prev === 'processing') return 'processing'; // 같은 값을 설정해도 리렌더링 발생
        return prev;
      });
    }
  }, [currentStep, progressPercent, dialogStep]);

  // 체크박스 토글
  function toggleKeyword(k: string) {
    if (selectedKeywords.includes(k)) {
      setSelectedKeywords((prev) => prev.filter((item) => item !== k))
    } else {
      if (isUserRole && selectedKeywords.length >= maxSelection) {
        return
      }
      setSelectedKeywords((prev) => [...prev, k])
    }
  }

  // 키워드 선택 단계로 전환될 때 체크 상태 초기화
  React.useEffect(() => {
    if (dialogStep === 'selection') {
      logger.info("키워드 선택 단계로 전환됨", { 
        keywordCount: finalKeywords?.length || 0
      });
      setSelectedKeywords([]);
    }
  }, [dialogStep, finalKeywords]);

  // currentStep이 complete가 되면 selection 단계로 전환
  React.useEffect(() => {
    if (currentStep === "complete" && dialogStep === 'processing') {
      setDialogStep('selection');
    }
  }, [currentStep, dialogStep]);

  // 최종 선택하기
  async function onSubmitKeywords() {
    if (!selectedKeywords.length) {
      toast.warning("최소 1개 이상 키워드를 선택해주세요.")
      return
    }
    
    const placeIdToUse = savedPlaceId || 
      sessionStorage.getItem('temp_place_id') ||
      localStorage.getItem('current_place_id') ||
      (normalizedData?.placeInfo?.place_id) ||
      (placeData?.place_id);

    if (!placeIdToUse) {
      toast.error("업체 정보를 찾을 수 없습니다.")
      logger.error("업체 ID를 찾을 수 없음");
      return
    }

    try {
      // 서버 저장 로직
      await handleSaveSelectedKeywords({
        keywords: selectedKeywords.map((k) => ({
          combinedKeyword: k,
          details: [],
        })),
        placeId: placeIdToUse
      });
      
      // 다이얼로그 닫기 및 임시 저장 삭제
      setDialogOpen(false);
      sessionStorage.removeItem('temp_place_id');
      
      toast.success("키워드가 성공적으로 저장되었습니다.");
    } catch (error) {
      logger.error("키워드 저장 중 오류 발생", error);
      toast.error("키워드 저장 중 오류가 발생했습니다.");
    }
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
    if (dialogOpen) {
      onOpenChange(false)
    }
  }, [dialogOpen, onOpenChange])

  // URL 표시
  const truncatedUrl = normalizedData?.normalizedUrl ? 
    (normalizedData.normalizedUrl.length > 30
      ? normalizedData.normalizedUrl.slice(0, 30) + "..."
      : normalizedData.normalizedUrl)
    : "";
    
  // 현재 단계에 대한 정보
  const currentStepInfo = stepInfo[currentStep];

  return (
    <>
      {/* 하단 슬라이드 시트 */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="p-4 rounded-t-lg border-t border-border max-h-[80%] overflow-y-auto text-center max-w-sm w-full mx-auto"
        >
          <SheetHeader>
            <SheetTitle>업체 추가하기</SheetTitle>
          </SheetHeader>
          
          {/* 플랫폼 선택 */}
          <div className="flex gap-3 mt-4 justify-center">
            {platforms.map((plat) => {
              const isActive = plat.id === selectedPlatform
              return (
                <button
                  key={plat.id}
                  onClick={() => setSelectedPlatform(plat.id)}
                  className={`
                    relative flex items-center justify-center
                    w-14 h-14 p-2 border rounded-md transition
                    ${isActive
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

          {/* URL 입력 */}
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

          {/* 하단 버튼 */}
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

      {/* 통합 다이얼로그 */}
      <Dialog 
        open={dialogOpen} 
        onOpenChange={(open) => {
          // 처리 중이면 닫기 방지
          if (dialogStep === 'processing') {
            return;
          }
          if (!open) return;
          setDialogOpen(open);
        }}
      >
        <DialogContent 
          className={cn(
            "bg-white text-foreground transition-all duration-500 ease-in-out",
            dialogSizeClass
          )}
          onPointerDownOutside={(event) => {
            // 처리 중 또는 선택 중에는 닫기 방지
            if (dialogStep !== 'confirm') {
              event.preventDefault();
            }
          }}
          onInteractOutside={(event) => {
            if (dialogStep !== 'confirm') {
              event.preventDefault();
            }
          }}
          onEscapeKeyDown={(event) => {
            if (dialogStep !== 'confirm') {
              event.preventDefault();
            }
          }}
        >
          {/* 1단계: 확인 */}
          {dialogStep === 'confirm' && (
            <>
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
                    <Badge className="bg-white text-black">
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
                        href={normalizedData?.normalizedUrl}
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
                {dialogStep === 'confirm' && (
                  <>
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
                  </>
                )}
              </DialogFooter>
            </>
          )}

          {/* 2단계: 처리 중 */}
          {dialogStep === 'processing' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-blue-600">처리 중</DialogTitle>
                <DialogDescription>
                  업체 정보를 처리 중입니다. 완료될 때까지 잠시 기다려주세요.
                </DialogDescription>
              </DialogHeader>
              
              {/* 프로그레스 바 UI 개선 */}
              <div className="mt-6 mb-6 px-3">
                <div className="mb-2 text-sm flex items-center justify-between">
                  <span className={cn("flex items-center gap-1.5", currentStepInfo.color)}>
                    {currentStepInfo.icon}
                    <strong>{currentStepInfo.label}</strong>
                  </span>
                  <span className="text-xs font-semibold">{progressPercent}%</span>
                </div>
                
                {/* 더 큰 프로그레스 바 */}
                <div className="relative w-full h-5 bg-gray-100 rounded-full overflow-hidden">
                  {/* 프로그레스 바 채우기 */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 ease-in-out"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                  
                  {/* 반짝이는 효과 */}
                  <div 
                    className="absolute top-0 left-0 w-full h-full overflow-hidden"
                    style={{ 
                      background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)`,
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s infinite linear',
                    }}
                  ></div>
                </div>
              </div>
              
              {/* 처리 단계 간략 설명 */}
              <div className="my-4 p-4 bg-blue-50 rounded-md text-sm">
                <h4 className="font-medium mb-3 text-blue-700">진행 중인 단계:</h4>
                <ul className="space-y-2.5 text-blue-600">
                  <li className={cn("flex items-center gap-2", currentStep === "storing" || currentStep === "chatgpt" || currentStep === "combining" || currentStep === "checking" || currentStep === "grouping" || currentStep === "complete" ? "text-green-600" : "")}>
                    {currentStep === "storing" || currentStep === "chatgpt" || currentStep === "combining" || currentStep === "checking" || currentStep === "grouping" || currentStep === "complete" ? "✓" : "○"} 업체 정보 저장
                  </li>
                  <li className={cn("flex items-center gap-2", currentStep === "chatgpt" || currentStep === "combining" || currentStep === "checking" || currentStep === "grouping" || currentStep === "complete" ? "text-green-600" : "")}>
                    {currentStep === "chatgpt" || currentStep === "combining" || currentStep === "checking" || currentStep === "grouping" || currentStep === "complete" ? "✓" : "○"} AI 키워드 생성
                  </li>
                  <li className={cn("flex items-center gap-2", currentStep === "combining" || currentStep === "checking" || currentStep === "grouping" || currentStep === "complete" ? "text-green-600" : "")}>
                    {currentStep === "combining" || currentStep === "checking" || currentStep === "grouping" || currentStep === "complete" ? "✓" : "○"} 키워드 조합
                  </li>
                  <li className={cn("flex items-center gap-2", currentStep === "checking" || currentStep === "grouping" || currentStep === "complete" ? "text-green-600" : "")}>
                    {currentStep === "checking" || currentStep === "grouping" || currentStep === "complete" ? "✓" : "○"} 검색량 확인
                  </li>
                  <li className={cn("flex items-center gap-2", currentStep === "grouping" || currentStep === "complete" ? "text-green-600" : "")}>
                    {currentStep === "grouping" || currentStep === "complete" ? "✓" : "○"} 키워드 그룹화
                  </li>
                  <li className={cn("flex items-center gap-2", currentStep === "complete" ? "text-green-600" : "")}>
                    {currentStep === "complete" ? "✓" : "○"} 완료
                  </li>
                </ul>
              </div>
              
              <p className="text-center text-sm text-gray-500 mt-4">
                처리 중에는 창을 닫지 마세요.
              </p>
              
              {/* 애니메이션 스타일 */}
              <style jsx global>{`
                @keyframes shimmer {
                  0% { background-position: 200% 0 }
                  100% { background-position: -200% 0 }
                }
              `}</style>
            </>
          )}

          {/* 3단계: 키워드 선택 */}
          {dialogStep === 'selection' && (
            <>
              <DialogHeader>
                <DialogTitle>최종 키워드 선택</DialogTitle>
                <DialogDescription>
                  {isUserRole
                    ? "최대 3개까지 선택할 수 있습니다."
                    : "원하는 만큼 선택할 수 있습니다."}
                  {finalKeywords?.length ? ` (총 ${finalKeywords.length}개 키워드)` : ''}
                </DialogDescription>
              </DialogHeader>

              {/* 키워드 리스트 */}
              <div className="mt-4 space-y-3 max-h-[50vh] overflow-auto px-1">
                {finalKeywords && finalKeywords.length > 0 ? (
                  finalKeywords.map((item: FinalKeyword, idx: number) => {
                    const kw = item.combinedKeyword;
                    const isChecked = selectedKeywords.includes(kw);
                    const disabled = !isChecked && isUserRole && selectedKeywords.length >= maxSelection;
                    
                    const totalVolume = item.details?.reduce((acc, curr) => {
                      return acc + (curr.monthlySearchVolume ?? 0)
                    }, 0) ?? 0

                    return (
                      <label
                        key={idx}
                        className={`
                          flex items-center gap-2 border-b py-2
                          ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
                          leading-none
                        `}
                      >
                        <Checkbox
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
                  <p className="text-sm text-gray-500 text-center py-6">
                    생성된 키워드를 불러오는 중...
                  </p>
                )}
              </div>

              <DialogFooter className="mt-4">
                <Button 
                  onClick={onSubmitKeywords}
                  disabled={selectedKeywords.length === 0}
                >
                  선택하기
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
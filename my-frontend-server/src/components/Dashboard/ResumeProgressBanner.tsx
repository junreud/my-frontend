import { AlertCircle, RefreshCw, RotateCcw, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ProgressBar } from "@/components/ui/progress-bar"
import { ProgressStep } from "@/types"
import { cn } from "@/lib/utils"

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

interface ResumeProgressBannerProps {
  currentStep: ProgressStep
  progressPercent: number
  onResume: () => void
  onReset: () => void
  lastUpdated?: Date // 선택적으로 마지막 업데이트 시간을 표시
}

export function ResumeProgressBanner({
  currentStep,
  progressPercent,
  onResume,
  onReset,
  lastUpdated,
}: ResumeProgressBannerProps) {
  // idle 또는 complete 상태면 표시하지 않음
  if (currentStep === "idle" || currentStep === "complete") {
    return null
  }

  // 경과 시간 계산 (마지막 업데이트가 있는 경우)
  const getElapsedTime = () => {
    if (!lastUpdated) return null;
    
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    
    return "오래 전";
  };

  const elapsedTime = getElapsedTime();
  const currentStepInfo = stepInfo[currentStep];

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50/80 backdrop-blur-sm transition-all duration-300 shadow-sm">
      <AlertCircle className="h-4 w-4 text-amber-500" />
      <AlertTitle className="text-amber-800 flex items-center gap-1.5">
        진행 중인 작업이 있습니다
        {elapsedTime && (
          <span className="text-xs font-normal text-amber-600">({elapsedTime})</span>
        )}
      </AlertTitle>
      <AlertDescription className="text-amber-700">
        <div className="mt-2 mb-3">
          <div className="mb-1.5 text-sm flex items-center gap-1.5">
            <span className={cn("flex items-center gap-1", currentStepInfo.color)}>
              {currentStepInfo.icon}
              <strong>{currentStepInfo.label}</strong>
            </span>
            <span className="text-xs">({progressPercent}%)</span>
          </div>
          <div className="relative">
            <ProgressBar 
              value={progressPercent} 
              className="h-2.5 bg-amber-100 rounded-full" 
            />
            <div 
              className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-full"
              style={{ 
                background: `linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(255,255,255,0.3) 50%, rgba(0,0,0,0) 100%)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite',
              }}
            />
          </div>
          <style jsx global>{`
            @keyframes shimmer {
              0% { background-position: 200% 0 }
              100% { background-position: -200% 0 }
            }
          `}</style>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onResume}
            className="bg-amber-100 border-amber-300 hover:bg-amber-200 text-amber-900 flex-1 min-w-[120px] sm:flex-none"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            이어서 하기
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onReset}
            className="text-amber-700 hover:bg-amber-100 hover:text-amber-900 flex-1 min-w-[120px] sm:flex-none"
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            처음부터 하기
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

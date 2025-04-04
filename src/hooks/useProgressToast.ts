import { useState, useCallback, useRef } from 'react'
import { toast } from "@/components/ui/sonner"
import { ProgressStep } from "@/types"

// 단계별 정보 설정
const STEP_INFO: Record<ProgressStep, { label: string, color: string, progress: number }> = {
  idle: { label: "준비", color: "text-gray-500", progress: 0 },
  normalizing: { label: "URL 정규화", color: "text-blue-500", progress: 10 },
  storing: { label: "업체 등록", color: "text-blue-600", progress: 20 },
  chatgpt: { label: "키워드 생성", color: "text-indigo-500", progress: 40 },
  combining: { label: "키워드 조합", color: "text-purple-500", progress: 55 },
  checking: { label: "검색량 확인", color: "text-violet-500", progress: 70 },
  grouping: { label: "키워드 그룹화", color: "text-rose-500", progress: 85 },
  complete: { label: "완료", color: "text-green-500", progress: 100 },
}

export function useProgressToast(options?: {
  autoCloseDelay?: number,
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center",
  toastId?: string
}) {
  const [step, setStep] = useState<ProgressStep>("idle")
  const [progress, setProgress] = useState(0)
  const toastIdRef = useRef<string | null>(null)
  
  const autoCloseDelay = options?.autoCloseDelay || 3000
  const position = options?.position || "bottom-right"
  
  // 토스트 초기화
  const resetProgress = useCallback(() => {
    if (toastIdRef.current) {
      // 이미 있는 토스트는 자동으로 닫힐 것임
      toastIdRef.current = null
    }
    setStep("idle")
    setProgress(0)
  }, [])
  
  // 새로운 토스트 표시 함수
  const showToast = useCallback((newStep: ProgressStep, customProgress?: number) => {
    const stepInfo = STEP_INFO[newStep]
    const progressValue = customProgress ?? stepInfo.progress
    
    setStep(newStep)
    setProgress(progressValue)
    
    // complete 상태일 때는 완료 토스트로 표시
    if (newStep === "complete") {
      if (toastIdRef.current) {
        toast.completeProgress(toastIdRef.current, stepInfo.label)
      } else {
        // 이전 토스트가 없는 경우 새로 생성
        toastIdRef.current = toast.progress({
          message: stepInfo.label,
          initialProgress: 100,
          color: stepInfo.color,
          position: position
        })
      }
      
      // 자동 초기화
      setTimeout(resetProgress, autoCloseDelay)
    } else {
      // 이미 토스트가 있으면 업데이트, 없으면 새로 생성
      if (toastIdRef.current) {
        toast.updateProgress(toastIdRef.current, progressValue)
      } else {
        toastIdRef.current = toast.progress({
          message: stepInfo.label,
          initialProgress: progressValue,
          color: stepInfo.color,
          position: position
        })
      }
    }
  }, [autoCloseDelay, resetProgress, position])
  
  // 진행 상태 업데이트 함수
  const updateProgress = useCallback((newStep: ProgressStep, newProgress: number) => {
    setStep(newStep)
    setProgress(newProgress)
    
    if (toastIdRef.current) {
      toast.updateProgress(toastIdRef.current, newProgress)
    }
  }, [])
  
  // 편의 함수들
  const showNormalizing = useCallback(() => showToast("normalizing"), [showToast])
  const showStoring = useCallback(() => showToast("storing"), [showToast])
  const showChatgpt = useCallback(() => showToast("chatgpt"), [showToast])
  const showCombining = useCallback(() => showToast("combining"), [showToast])
  const showChecking = useCallback(() => showToast("checking"), [showToast])
  const showGrouping = useCallback(() => showToast("grouping"), [showToast])
  const showComplete = useCallback(() => showToast("complete"), [showToast])
  
  return {
    step,
    progress,
    updateProgress,
    resetProgress,
    showNormalizing,
    showStoring,
    showChatgpt,
    showCombining,
    showChecking,
    showGrouping,
    showComplete,
  }
}
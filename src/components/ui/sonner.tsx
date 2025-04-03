"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, toast as sonnerToast } from "sonner"
import { ProgressBar } from "@/components/ui/progress-bar"
import { useEffect } from "react"

type ToasterProps = React.ComponentProps<typeof Sonner>

// 진행 중인 토스트 ID를 저장하는 객체
const activeProgressToasts: Record<string, {
  message: string,
  position?: string
}> = {};

// 커스텀 애니메이션 스타일 추가
const customStyles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

// 기존 토스트 스타일을 유지하면서 프로그레스 바만 추가
const ProgressContent = ({
  id,
  message,
  progress,
}: {
  id: string,
  message: string,
  progress: number
}) => (
  <div className="w-full">
    <div className="mb-2">{message}</div>
    <div className="relative overflow-hidden rounded-full bg-muted">
      <ProgressBar 
        value={progress} 
        className="h-1.5 transition-all duration-300 ease-out" 
      />
      <div 
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
        style={{
          width: '100%',
          animation: 'shimmer 2s infinite',
          transform: `translateX(${progress - 100}%)`,
          transition: 'transform 300ms ease-out'
        }}
      />
    </div>
  </div>
);

// toast 객체 확장
const toast = {
  ...sonnerToast,
  
  // progress 메서드 추가
  progress: (options: { 
    message: string, 
    position?: string, 
    duration?: number,
    initialProgress?: number 
  } | string): string => {
    const id = Math.random().toString(36).substring(2, 9);
    
    // string만 전달된 경우 객체로 변환
    const config = typeof options === 'string' 
      ? { message: options } 
      : options;
    
    const initialProgress = config.initialProgress || 0;
    
    // 활성 토스트 목록에 추가
    activeProgressToasts[id] = { 
      message: config.message,
      position: config.position
    };
    
    // 기존 sonner 스타일의 토스트로 표시 (함수 형태로 수정)
    sonnerToast.custom(
      () => (
        <div aria-describedby={`toast-description-${id}`}>
          <span id={`toast-description-${id}`} className="sr-only">
            진행 상태 알림: {config.message}
          </span>
          <ProgressContent 
            id={id} 
            message={config.message} 
            progress={initialProgress} 
          />
        </div>
      ),
      { 
        id,
        duration: config.duration || 100000, // 자동으로 닫히지 않게 긴 시간 설정
        position: config.position as any
      }
    );
    
    return id;
  },
  
  // 진행 상태를 업데이트하는 메서드 추가
  updateProgress: (id: string, progress: number): void => {
    if (activeProgressToasts[id]) {
      sonnerToast.custom(
        () => (
          <div aria-describedby={`toast-description-${id}`}>
            <span id={`toast-description-${id}`} className="sr-only">
              진행 상태 알림: {activeProgressToasts[id].message}
            </span>
            <ProgressContent 
              id={id} 
              message={activeProgressToasts[id].message} 
              progress={progress} 
            />
          </div>
        ),
        { 
          id,
          duration: 100000,
          position: activeProgressToasts[id].position as any
        }
      );
    }
  },
  
  // 진행 완료를 표시하는 메서드 추가
  completeProgress: (id: string, message?: string): void => {
    if (activeProgressToasts[id]) {
      sonnerToast.success(
        () => (
          <div aria-describedby={`toast-description-${id}`}>
            <span id={`toast-description-${id}`} className="sr-only">
              완료 알림: {message || "완료되었습니다"}
            </span>
            <ProgressContent 
              id={id} 
              message={message || "완료되었습니다"} 
              progress={100} 
            />
          </div>
        ),
        { 
          id,
          duration: 3000,
          position: activeProgressToasts[id].position as any
        }
      );
      
      delete activeProgressToasts[id];
    }
  }
};

// 기존 Toaster 컴포넌트
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  // 커스텀 애니메이션 스타일 추가
  useEffect(() => {
    if (!document.getElementById('progress-toast-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'progress-toast-styles';
      styleEl.innerHTML = customStyles;
      document.head.appendChild(styleEl);
    }
    
    return () => {
      const styleEl = document.getElementById('progress-toast-styles');
      if (styleEl) styleEl.remove();
    };
  }, []);

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position={props.position || "bottom-right"}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
        // Add global accessibility attributes
        descriptionAs: "div",
        closeButtonAriaLabel: "닫기",
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
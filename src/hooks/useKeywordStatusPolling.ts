// hooks/useKeywordStatusPolling.ts
import { useEffect, useState, useRef } from "react";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";

export const useKeywordStatusPolling = (
    keyword: string | null, 
    onCompleted: () => void,
    intervalMs: number = 10000,
    maxRetries: number = 30,
  ) => {
    const [status, setStatus] = useState<string | null>(null);
    const pollCount = useRef(0);
    const onCompletedRef = useRef(onCompleted);
    
    // onCompleted 콜백을 ref로 업데이트
    useEffect(() => {
      onCompletedRef.current = onCompleted;
    }, [onCompleted]);
  
    useEffect(() => {
      if (!keyword) return;
      
      pollCount.current = 0; // 새 키워드가 설정되면 카운트 리셋
      
      const interval = setInterval(async () => {
        try {
          const response = await apiClient.get(`/keyword/status?keyword=${encodeURIComponent(keyword)}`);
          const currentStatus = response.data?.data?.status;
  
          if (currentStatus === "completed") {
            setStatus("completed");
            toast.success(`"${keyword}" 데이터 수집이 완료되었습니다.`);
            clearInterval(interval);
            
            // setTimeout으로 상태 업데이트 지연시켜 렌더 사이클 중단
            setTimeout(() => {
              onCompletedRef.current();
            }, 0);
          } else if (pollCount.current >= maxRetries) {
            toast.error(`"${keyword}" 데이터 수집이 너무 오래 걸립니다.`);
            clearInterval(interval);
          }
  
          pollCount.current += 1;
        } catch (error) {
          console.error("Error fetching keyword status:", error);
          toast.error("키워드 상태 확인 중 오류가 발생했습니다.");
          clearInterval(interval);
        }
      }, intervalMs);
  
      return () => clearInterval(interval);
    }, [keyword, intervalMs, maxRetries]); // onCompleted 의존성 제거
  
    return { status, pollCount: pollCount.current };
  };
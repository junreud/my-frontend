'use client';

import { useEffect, useState } from 'react';
import { getApiBaseUrl } from '@/lib/config';

export const useApiConnection = () => {
  const [apiUrl, setApiUrl] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setupConnection = async () => {
      try {
        setIsLoading(true);
        
        // API URL 가져오기
        const detectedUrl = getApiBaseUrl();
        setApiUrl(detectedUrl);
        
        // 간단한 연결 테스트 (선택적)
        try {
          const response = await fetch(`${detectedUrl}/health`);
          setIsConnected(response.ok);
          console.log(`✅ 백엔드 연결 성공: ${detectedUrl}`);
        } catch {
          // 백엔드가 실행되지 않았어도 URL은 설정
          setIsConnected(false);
          console.log(`⚠️ 백엔드 연결 실패하지만 URL 설정됨: ${detectedUrl}`);
        }
      } catch (error) {
        console.error('❌ API 설정 실패:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    setupConnection();
  }, []);

  return {
    apiUrl,
    isConnected,
    isLoading,
  };
};
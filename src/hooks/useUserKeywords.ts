import { useState, useEffect } from 'react';

// API base URL 정의 
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface UserKeyword {
  id: number;
  name: string;
  keyword_id: number;
  user_id: number;
  place_id: number;
  created_at?: string;
  updated_at?: string;
}

// 사용자의 업체별 키워드 목록을 가져오는 Hook
export function useUserKeywords(userId?: string | number, placeId?: string | number) {
  const [keywords, setKeywords] = useState<UserKeyword[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchKeywords() {
      if (!userId || !placeId) {
        setKeywords([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const url = `${API_BASE_URL}/user-keywords?userId=${userId}&placeId=${placeId}`;
        console.log(`키워드 요청 URL: ${url}`);
        
        // 인증 토큰 가져오기
        const token = localStorage.getItem('auth_token') || '';
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
          } else if (response.status === 403) {
            throw new Error('권한이 없습니다.');
          } else {
            throw new Error(`사용자 키워드 가져오기 실패: ${response.status} - ${response.statusText}`);
          }
        }
        
        const data = await response.json();
        console.log(`가져온 키워드 수: ${data.length}`);
        setKeywords(data);
      } catch (err: any) {
        setError(err);
        console.error("사용자 키워드 조회 중 오류:", err);
        console.error("User ID:", userId, "Place ID:", placeId);
      } finally {
        setLoading(false);
      }
    }

    fetchKeywords();
  }, [userId, placeId]);

  return { keywords, loading, error };
}

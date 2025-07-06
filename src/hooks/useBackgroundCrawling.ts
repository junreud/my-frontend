import { useEffect, useCallback, useRef } from 'react';
import apiClient from '@/lib/apiClient';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useBackgroundCrawling');

interface BackgroundCrawlingOptions {
  enabled?: boolean;
  debounceMs?: number;
  cooldownMs?: number;
}

/**
 * 사용자 활동을 감지하여 모든 등록된 업체의 리뷰를 백그라운드에서 크롤링하는 훅
 */
export function useBackgroundCrawling(options: BackgroundCrawlingOptions = {}) {
  const {
    enabled = true,
    debounceMs = 2000, // 2초 디바운스
    cooldownMs = 10 * 60 * 1000 // 10분 쿨다운
  } = options;

  const lastCrawlTime = useRef<number>(0);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isProcessing = useRef<boolean>(false);

  // 백그라운드 크롤링 실행
  const triggerBackgroundCrawling = useCallback(async () => {
    if (!enabled || isProcessing.current) {
      return;
    }

    const now = Date.now();
    const timeSinceLastCrawl = now - lastCrawlTime.current;

    // 쿨다운 체크
    if (timeSinceLastCrawl < cooldownMs) {
      logger.debug(`백그라운드 크롤링 쿨다운 중 (${Math.round((cooldownMs - timeSinceLastCrawl) / 1000)}초 남음)`);
      return;
    }

    try {
      isProcessing.current = true;
      lastCrawlTime.current = now;

      logger.info('백그라운드 크롤링 시작');
      
      const response = await apiClient.post('/api/reviews/admin/crawl-all-businesses');
      
      if (response.data?.success) {
        logger.info('백그라운드 크롤링 요청 성공:', response.data.data);
      } else {
        logger.warn('백그라운드 크롤링 요청 실패:', response.data?.message);
      }
    } catch (error) {
      logger.error('백그라운드 크롤링 요청 오류:', error);
    } finally {
      isProcessing.current = false;
    }
  }, [enabled, cooldownMs]);

  // 디바운스된 크롤링 실행
  const debouncedCrawling = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      triggerBackgroundCrawling();
    }, debounceMs);
  }, [triggerBackgroundCrawling, debounceMs]);

  // 사용자 활동 감지 이벤트 리스너들
  useEffect(() => {
    if (!enabled) return;

    const events = [
      'click',
      'keydown',
      'scroll',
      'mousemove',
      'touchstart'
    ];

    const activityHandler = () => {
      debouncedCrawling();
    };

    // 이벤트 리스너 등록
    events.forEach(event => {
      document.addEventListener(event, activityHandler, { passive: true });
    });

    // 페이지 가시성 변경 감지 (탭 전환)
    const visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        debouncedCrawling();
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);

    // 정리
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, activityHandler);
      });
      document.removeEventListener('visibilitychange', visibilityHandler);
      
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [enabled, debouncedCrawling]);

  // 수동 트리거 함수 (필요시 직접 호출)
  const manualTrigger = useCallback(() => {
    triggerBackgroundCrawling();
  }, [triggerBackgroundCrawling]);

  return {
    manualTrigger,
    isProcessing: isProcessing.current,
    lastCrawlTime: lastCrawlTime.current
  };
}

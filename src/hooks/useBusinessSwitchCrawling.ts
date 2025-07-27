import { useEffect, useCallback, useRef, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { createLogger } from '@/lib/logger';
import { Business } from '@/types';
import { AxiosError } from 'axios';

const logger = createLogger('useBusinessSwitchCrawling');

interface BusinessSwitchCrawlingOptions {
  activeBusiness?: Business | null;
  enabled?: boolean;
  onCrawlingStart?: (business: Business) => void;
  onCrawlingComplete?: (business: Business, result: unknown) => void;
  onCrawlingError?: (business: Business, error: unknown) => void;
}

export interface CrawlingStatus {
  isActive: boolean;
  business: Business | null;
  stage: 'preparing' | 'blog' | 'receipt' | 'completed' | 'error';
  progress: number;
  message: string;
  details?: string;
  error?: string;
}

/**
 * 업체 변경 시 자동으로 해당 업체의 리뷰를 크롤링하는 훅
 */
export function useBusinessSwitchCrawling(options: BusinessSwitchCrawlingOptions = {}) {
  const {
    activeBusiness,
    enabled = true,
    onCrawlingStart,
    onCrawlingComplete,
    onCrawlingError
  } = options;
  const previousBusinessId = useRef<string | null>(null);
  const isProcessing = useRef<boolean>(false);
  const isInitialLoad = useRef<boolean>(true);
  
  const [crawlingStatus, setCrawlingStatus] = useState<CrawlingStatus>({
    isActive: false,
    business: null,
    stage: 'preparing',
    progress: 0,
    message: ''
  });

  // 특정 업체의 리뷰 크롤링 실행
  const crawlBusinessReviews = useCallback(async (business: Business) => {
    if (!enabled || isProcessing.current || !business.place_id) {
      return;
    }

    try {
      isProcessing.current = true;
      
      // 먼저 크롤링이 필요한지 확인
      const crawlingCheckResponse = await apiClient.get(`/api/reviews/check-crawling-needed/${business.place_id}`);
      const { needsCrawl, hoursSinceLastCrawl } = crawlingCheckResponse.data.data;
      
      if (!needsCrawl) {
        logger.info('크롤링 불필요 - 6시간 미경과:', {
          businessName: business.place_name,
          hoursSinceLastCrawl
        });
        
        // 크롤링이 필요하지 않으면 즉시 완료 처리 (모달 표시 안함)
        isProcessing.current = false;
        return;
      }
      
      logger.info('업체 변경 감지, 리뷰 크롤링 시작:', business.place_name);
      
      // 크롤링 상태 초기화 (Socket.IO 이벤트에서 업데이트됨)
      setCrawlingStatus({
        isActive: true,
        business,
        stage: 'preparing',
        progress: 0,
        message: '업체 변경 중...',
        details: `${business.place_name}의 데이터를 준비하고 있습니다.`
      });

      onCrawlingStart?.(business);

      // 통합 크롤링 API 사용 (진행률은 Socket.IO 이벤트로 업데이트됨)
      const crawlResponse = await apiClient.post(`/api/reviews/crawl/${business.place_id}`, {
        sortType: 'recommend',
        maxPages: 2
      });

      // 완료 (Socket.IO 이벤트에서도 처리되지만 백업용)
      setCrawlingStatus(prev => ({
        ...prev,
        stage: 'completed',
        progress: 100,
        message: '업체 전환 완료!',
        details: `${business.place_name}의 최신 리뷰 데이터를 성공적으로 불러왔습니다.`
      }));

      const result = {
        crawl: crawlResponse.data
      };

      logger.info('업체 리뷰 크롤링 완료:', result);
      onCrawlingComplete?.(business, result);

      // 3초 후 상태 초기화
      setTimeout(() => {
        setCrawlingStatus(prev => ({
          ...prev,
          isActive: false
        }));
      }, 3000);

    } catch (error) {
      logger.error('업체 리뷰 크롤링 실패:', error);
      
      // 크롤링 필요 여부 확인 실패인 경우 조용히 처리
      if ((error as AxiosError)?.response?.config?.url?.includes('check-crawling-needed')) {
        logger.warn('크롤링 필요 여부 확인 실패 - 크롤링 스킵:', (error as Error)?.message || '알 수 없는 오류');
        isProcessing.current = false;
        return;
      }
      
      setCrawlingStatus(prev => ({
        ...prev,
        stage: 'error',
        progress: 0,
        message: '오류가 발생했습니다',
        error: '업체 전환 중 문제가 발생했습니다. 페이지를 새로고침해주세요.'
      }));

      onCrawlingError?.(business, error);

      // 5초 후 상태 초기화
      setTimeout(() => {
        setCrawlingStatus(prev => ({
          ...prev,
          isActive: false
        }));
      }, 5000);

    } finally {
      isProcessing.current = false;
    }
  }, [enabled, onCrawlingStart, onCrawlingComplete, onCrawlingError]);

  // 업체 변경 감지
  useEffect(() => {
    logger.info('useEffect 트리거됨:', {
      enabled,
      activeBusiness: activeBusiness ? {
        id: activeBusiness.place_id,
        name: activeBusiness.place_name
      } : null,
      hasPlaceId: activeBusiness?.place_id ? true : false,
      isInitialLoad: isInitialLoad.current,
      previousBusinessId: previousBusinessId.current
    });

    if (!enabled || !activeBusiness || !activeBusiness.place_id) {
      logger.info('크롤링 스킵:', { enabled, activeBusiness: !!activeBusiness, hasPlaceId: !!activeBusiness?.place_id });
      return;
    }

    const currentBusinessId = activeBusiness.place_id;
    
    // 초기 로드인 경우 크롤링 하지 않고 현재 업체 ID만 저장
    if (isInitialLoad.current) {
      previousBusinessId.current = currentBusinessId;
      isInitialLoad.current = false;
      logger.info('초기 업체 로드 - 크롤링 스킵:', {
        businessId: currentBusinessId,
        businessName: activeBusiness.place_name
      });
      return;
    }
    
    // 이전 업체와 다른 경우에만 크롤링 실행
    if (previousBusinessId.current !== null && 
        previousBusinessId.current !== currentBusinessId) {
      
      logger.info('업체 변경 감지 - 크롤링 실행:', {
        previous: previousBusinessId.current,
        current: currentBusinessId,
        businessName: activeBusiness.place_name
      });

      // 크롤링 실행
      crawlBusinessReviews(activeBusiness);
    } else {
      logger.info('업체 변경 없음 - 크롤링 스킵:', {
        previous: previousBusinessId.current,
        current: currentBusinessId,
        businessName: activeBusiness.place_name
      });
    }

    previousBusinessId.current = currentBusinessId || null;
  }, [activeBusiness, enabled, crawlBusinessReviews]);

  // 수동 크롤링 트리거
  const manualTrigger = useCallback((business?: Business) => {
    const targetBusiness = business || activeBusiness;
    if (targetBusiness && targetBusiness.place_id) {
      crawlBusinessReviews(targetBusiness);
    }
  }, [activeBusiness, crawlBusinessReviews]);

  // 크롤링 상태 닫기
  const closeCrawlingStatus = useCallback(() => {
    setCrawlingStatus(prev => ({
      ...prev,
      isActive: false
    }));
  }, []);

  return {
    crawlingStatus,
    manualTrigger,
    closeCrawlingStatus,
    isProcessing: isProcessing.current
  };
}

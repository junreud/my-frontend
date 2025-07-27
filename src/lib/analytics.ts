// lib/analytics.ts
import ReactGA from 'react-ga4';

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Google Analytics 초기화
export const initGA = () => {
  if (GA_TRACKING_ID) {
    ReactGA.initialize(GA_TRACKING_ID, {
      gtagOptions: {
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure',
      },
    });
  }
};

// 페이지 뷰 추적
export const trackPageView = (url: string) => {
  if (GA_TRACKING_ID) {
    ReactGA.send({
      hitType: 'pageview',
      page: url,
      title: document.title,
    });
  }
};

// 이벤트 추적
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (GA_TRACKING_ID) {
    ReactGA.event({
      action,
      category,
      label,
      value,
    });
  }
};

// 커스텀 이벤트들
export const trackEvents = {
  // 버튼 클릭 추적
  clickButton: (buttonName: string) => {
    trackEvent('click', 'button', buttonName);
  },
  
  // 폼 제출 추적
  submitForm: (formName: string) => {
    trackEvent('submit', 'form', formName);
  },
  
  // 페이지 스크롤 추적
  scrollPage: (percentage: number) => {
    trackEvent('scroll', 'page', `${percentage}%`, percentage);
  },
  
  // 검색 추적
  search: (query: string) => {
    trackEvent('search', 'site', query);
  },
  
  // 컨버전 추적
  conversion: (type: string, value?: number) => {
    trackEvent('conversion', type, undefined, value);
  },
  
  // 파일 다운로드 추적
  download: (fileName: string) => {
    trackEvent('download', 'file', fileName);
  },
  
  // 외부 링크 클릭 추적
  outboundLink: (url: string) => {
    trackEvent('click', 'outbound', url);
  },
  
  // 에러 추적
  error: (errorMessage: string, errorType: string) => {
    trackEvent('error', errorType, errorMessage);
  },
  
  // 성능 추적
  performance: (metric: string, value: number) => {
    trackEvent('performance', metric, undefined, value);
  },
};

// 사용자 정의 차원 설정
export const setUserProperties = (properties: Record<string, string | number | boolean>) => {
  if (GA_TRACKING_ID) {
    ReactGA.set(properties);
  }
};

// 사용자 ID 설정
export const setUserId = (userId: string) => {
  if (GA_TRACKING_ID) {
    ReactGA.set({ userId });
  }
};

// 향상된 전자상거래 추적
export const trackPurchase = (transactionId: string, items: Record<string, string | number>[], value: number) => {
  if (GA_TRACKING_ID) {
    ReactGA.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value,
      currency: 'KRW',
      items,
    });
  }
};

// 콘텐츠 그룹 설정
export const setContentGroup = (index: number, value: string) => {
  if (GA_TRACKING_ID) {
    ReactGA.set({ [`custom_map.content_group${index}`]: value });
  }
};

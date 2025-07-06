import React, { createContext, useContext, ReactNode } from 'react'
import { useBusinessSwitcher } from '@/hooks/useBusinessSwitcher'
import { useBusinessSwitchCrawling, CrawlingStatus } from '@/hooks/useBusinessSwitchCrawling'

// Context 타입 정의 - 크롤링 상태 추가
export type BusinessContextType = ReturnType<typeof useBusinessSwitcher> & {
  crawlingStatus: CrawlingStatus
  closeCrawlingStatus: ReturnType<typeof useBusinessSwitchCrawling>['closeCrawlingStatus']
  manualTriggerCrawling: ReturnType<typeof useBusinessSwitchCrawling>['manualTrigger']
}

// Context 생성
const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

// Provider 컴포넌트
export function BusinessProvider({ children }: { children: ReactNode }) {
  const businessSwitcher = useBusinessSwitcher()
  const crawling = useBusinessSwitchCrawling({
    activeBusiness: businessSwitcher.activeBusiness,
    enabled: false, // 자동 크롤링 비활성화 - 수동으로만 실행
    onCrawlingStart: (business) => {
      console.log('크롤링 시작:', business.place_name);
    },
    onCrawlingComplete: (business, result) => {
      console.log('크롤링 완료:', business.place_name, result);
    },
    onCrawlingError: (business, error) => {
      console.error('크롤링 오류:', business.place_name, error);
    }
  })
  
  const value = {
    ...businessSwitcher,
    crawlingStatus: crawling.crawlingStatus,
    closeCrawlingStatus: crawling.closeCrawlingStatus,
    manualTriggerCrawling: crawling.manualTrigger
  }
  
  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  )
}

// Context 사용 훅
export function useBusinessContext(): BusinessContextType {
  const context = useContext(BusinessContext)
  if (!context) {
    throw new Error('useBusinessContext must be used within BusinessProvider')
  }
  return context
}
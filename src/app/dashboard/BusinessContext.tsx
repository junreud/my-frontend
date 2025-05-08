import React, { createContext, useContext, ReactNode } from 'react'
import { useBusinessSwitcher } from '@/hooks/useBusinessSwitcher'

// Context 타입 정의
export type BusinessContextType = ReturnType<typeof useBusinessSwitcher>

// Context 생성
const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

// Provider 컴포넌트
export function BusinessProvider({ children }: { children: ReactNode }) {
  const value = useBusinessSwitcher()
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
// /lib/reactQueryProvider.tsx
"use client"

import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

// 1) QueryClient 인스턴스 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 원하는 기본 옵션 (캐싱, 리트라이, staleTime 등)
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
})

// 2) Provider 컴포넌트
interface ReactQueryProviderProps {
  children: React.ReactNode
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* (개발 편의) Devtools */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

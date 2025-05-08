"use client"

import React, { Suspense } from 'react'
import { ReactQueryProvider } from "@/lib/reactQueryProvider"
import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/Dashboard/app-sidebar"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Toaster } from "@/components/ui/sonner"
import { BusinessProvider } from './BusinessContext'

// 스켈레톤 컴포넌트 불러오기
import {
  CalendarSkeleton,
  TableSkeleton,
  TextSkeleton,
  AccordionSkeleton,
  StatCardSkeleton,
  ChartSkeleton,
} from "@/components/ui/skeletons"

// 현재 URL 경로에 따라 한글 이름 가져오기
function getKoreanName(segment: string): string {
  const pathMap: Record<string, string> = {
    dashboard: '대시보드',
    marketing_keywords: '키워드 순위',
    marketing_status: '작업 현황',
    review_receipt: '영수증리뷰',
    review_blog: '블로그리뷰',
    settings_shop: '업체정보',
    settings_notify: '알림설정',
    settings_business: '팀/권한',
    admin_stats: '전체 통계',
    admin_users: '유저 작업관리',
    admin_customer: '크롤링하기',
    admin_manage_customer: '영업하기',
  }

  return pathMap[segment] || segment
}

// 현재 경로에 따라 다른 스켈레톤 컴포넌트를 반환하는 함수
const getSkeletonForPath = (path: string) => {
  if (path.includes('marketing_status')) {
    return (
      <div className="space-y-6">
        <CalendarSkeleton />
        <TableSkeleton rows={8} columns={6} />
      </div>
    );
  } 
  
  if (path.includes('marketing_keywords')) {
    return (
      <div className="space-y-6">
        <StatCardSkeleton count={3} />
        <TableSkeleton rows={10} columns={5} />
      </div>
    );
  }
  
  if (path.includes('review_receipt') || path.includes('review_blog')) {
    return (
      <div className="space-y-6">
        <TextSkeleton lines={2} size="lg" />
        <TableSkeleton rows={5} columns={4} />
        <AccordionSkeleton items={3} />
      </div>
    );
  }

  if (path.includes('admin_stats')) {
    return (
      <div className="space-y-6">
        <StatCardSkeleton count={4} />
        <ChartSkeleton height={350} />
      </div>
    );
  }
  
  if (path.includes('admin_customer') || path.includes('admin_manage_customer')) {
    return (
      <div className="space-y-6">
        <TableSkeleton rows={10} columns={6} showHeader={true} />
      </div>
    );
  }
  
  // 기본 스켈레톤
  return (
    <div className="space-y-6">
      <StatCardSkeleton count={2} />
      <TableSkeleton rows={5} columns={4} />
    </div>
  );
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // (A) Breadcrumb을 위한 경로 분해 (optional)
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 [--header-height:calc(theme(spacing.14))]">
      <ReactQueryProvider>
        <BusinessProvider>
          <SidebarProvider className="flex flex-1">
            {/* (B) 사이드바 */}
            <AppSidebar />

            {/* (C) 메인 콘텐츠 영역 */}
            <SidebarInset className="flex flex-1 flex-col bg-white">
              {/* 상단 헤더 (Breadcrumb 등) */}
              <header className="flex h-16 shrink-0 items-center gap-2 border-b">
                <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />

                  {/* Breadcrumb */}
                  <Breadcrumb>
                    <BreadcrumbList>
                      {segments.map((seg, index) => {
                        const href = "/" + segments.slice(0, index + 1).join("/")
                        const isLast = index === segments.length - 1
                        // 한글 이름 가져오기
                        const title = getKoreanName(seg)

                        return (
                          <BreadcrumbItem key={href}>
                            {index > 0 && (
                              <BreadcrumbSeparator className="mx-1" />
                            )}

                            {isLast ? (
                              <BreadcrumbPage>{title}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                        )
                      })}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </header>

              <main className="flex-1 p-4">
                <Suspense fallback={getSkeletonForPath(pathname)}>
                  {children}
                </Suspense>
              </main>
            </SidebarInset>
          </SidebarProvider>

          {/* 
            (D) Toaster: 화면 우측 아래로 배치, 기본 4초 후 닫힘.
                closeButton(=X)도 자동 노출되도록 세팅 
          */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
            }}
          />
        </BusinessProvider>
      </ReactQueryProvider>
    </div>
  )
}

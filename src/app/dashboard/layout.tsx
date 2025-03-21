"use client"

import { ReactQueryProvider } from "@/lib/reactQueryProvider"
import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
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
import { BusinessSwitcherListener } from '@/components/ui/business-switcher-listener';

// ────────────────────────────────────────────────────────────
// 1) shadcn/ui Toast 불러오기
import { Toaster } from "@/components/ui/sonner"  
//  position, duration 등은 <Toaster />에 prop으로 넘길 수 있음
// ────────────────────────────────────────────────────────────

// 경로와 한국어 이름 간의 매핑 정의
const pathToKorean: Record<string, string> = {
  'dashboard': '대시보드',
  'marketing_keywords': '키워드 & 순위',
  'marketing_status': '작업 현황',
  'review_receipt': '영수증리뷰',
  'review_blog': '블로그리뷰',
  'payment_intro': 'Introduction',
  'payment_started': 'Get Started',
};

// 경로 세그먼트를 한국어 이름으로 변환하는 함수
const getKoreanName = (segment: string): string => {
  return pathToKorean[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
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
            <BusinessSwitcherListener />

            <main className="flex-1 p-4">{children}</main>
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
      </ReactQueryProvider>
    </div>
  )
}

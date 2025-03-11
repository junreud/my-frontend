// app/dashboard/layout.tsx

"use client"

import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/Dashboard/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ReactQueryProvider } from '@/lib/reactQueryProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // (1) 현재 경로 가져오기
  const pathname = usePathname() // 예: "/dashboard/data-fetching"

  // (2) 슬래시로 구분 → ["dashboard", "data-fetching"]
  //    - 여기서 "/dashboard" 라우트를 기준으로 나머지를 Breadcrumb으로 활용할 수도 있고,
  //      필요에 따라 "dashboard"도 표시할 수 있습니다.
  const segments = pathname
    .split("/")
    .filter(Boolean) // 빈 문자열 제거
    // .slice(1) // 필요하다면, "dashboard" 세그먼트를 제거하려면 이 부분 사용

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 [--header-height:calc(theme(spacing.14))]">
      <ReactQueryProvider>
      <SidebarProvider className="flex flex-1">
        {/* 사이드바 */}
        <AppSidebar />

        {/* 사이드바 옆에 있는 콘텐츠 영역 */}
        <SidebarInset className="flex flex-1 flex-col bg-white">
          {/* 상단 헤더 (Breadcrumb, SidebarTrigger 등) */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b">
            <div className="flex items-center gap-2 px-4">
              {/* (A) 사이드바 토글 버튼 */}
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />

              {/* (B) Breadcrumb */}
              <Breadcrumb>
                <BreadcrumbList>
                  {/* 첫 번째: 무조건 Home */}
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                  </BreadcrumbItem>

                  {/* 구분자 */}
                  {segments.length > 0 && (
                    <BreadcrumbSeparator className="mx-1" />
                  )}

                  {/* 동적으로 세그먼트 순회 */}
                  {segments.map((seg, index) => {
                    // 실제 라우트 경로 만들기
                    // e.g. seg="data-fetching" index=0 → path="/dashboard/data-fetching"
                    const href = "/" + segments.slice(0, index + 1).join("/")

                    const isLast = index === segments.length - 1
                    return (
                      <BreadcrumbItem key={href}>
                        {/* 세그먼트 간 구분자 */}
                        {index > 0 && (
                          <BreadcrumbSeparator className="mx-1" />
                        )}

                        {isLast ? (
                          // 마지막 세그먼트 → 현재 페이지
                          <BreadcrumbPage>{seg}</BreadcrumbPage>
                        ) : (
                          // 중간 세그먼트 → 링크
                          <BreadcrumbLink href={href}>{seg}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    )
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          {/* 자식 페이지가 렌더링되는 메인 영역 */}

            <main className="flex-1 p-4 ">{children}</main>

        </SidebarInset>
      </SidebarProvider>

    </ReactQueryProvider>
    </div>
  )
}

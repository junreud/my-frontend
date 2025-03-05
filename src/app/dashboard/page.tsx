// src/app/dashboard/page.tsx

"use client";

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
import MyCalendarPage from "@/components/ui/Calendar"
import { ChartTwoLines } from "@/components/Dashboard/twolinechart"
import { useRouter } from "next/navigation" // 클라이언트 라우팅 훅
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const router = useRouter();
  const [checkDone, setCheckDone] = useState(false);

  useEffect(() => {
    // 여기서는 더 이상 쿼리 파라미터 처리 안 해도 됨!
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
    } else {
      setCheckDone(true);
    }
  }, [router]);

  // (2) 로딩 스피너 표시
  if (!checkDone) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        {/* Tailwind 예시: 회전 애니메이션으로 로딩 원 만들기 */}
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-solid border-gray-300 border-t-transparent"></div>
      </div>
    );
  }

  // ---------------------------
  // (3) 여기부터 "로그인된 사용자"만 보게 될 내용
  // ---------------------------

  const lines = [
    {
      dataKey: "desktop" as const,
      label: "데스크톱",
      stroke: "hsl(var(--chart-1))",
    },
    {
      dataKey: "mobile" as const,
      label: "모바일",
      stroke: "hsl(var(--chart-2))",
    },
  ]

  const chartData = [
    { date: "12.04", desktop: 71, mobile: 80 },
    { date: "12.05", desktop: 71, mobile: 80 },
    { date: "12.06", desktop: 73, mobile: 80 },
    // ...
    { date: "12.31", desktop: 3, mobile: 1 },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">LAKABE</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Home</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* 1) 위쪽 그리드 (aspect-video) */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>

          {/* 2) 스크롤 스내핑 영역 */}
          <div className="fle flex-col snap-y snap-mandatory">
            {/* (1) 첫 번째 스크린 */}
            <div className="mb-4 h-[90vh] snap-start rounded-xl bg-muted/50">
              <MyCalendarPage />
            </div>

            {/* (2) 두 번째 스크린 */}
            <div className="h-[90vh] snap-start rounded-xl bg-muted/50">
              <ChartTwoLines
                title="부평 헬스장"
                description="2021년 1월 ~ 6월 매출"
                data={chartData}
                lines={lines}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

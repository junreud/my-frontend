"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Skeleton } from "@mui/material"
import { InstantLink } from "@/components/ui/instant-link"
import { Home, AlertCircle, RefreshCw } from "lucide-react"
import { useUser } from "@/hooks/useUser"  // Import useUser hook

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

import { NavCommon } from "@/components/Dashboard/nav-common"
import { NavSecondary } from "@/components/Dashboard/nav-secondary"
import { NavUser } from "@/components/Dashboard/nav-user"
import { BusinessSwitcher } from "@/components/Dashboard/business-switcher"

/** (A) 일반/관리자용 사이드바 섹션 구분 */
const STATIC_SIDEBAR_SECTIONS = [
  {
    label: "마케팅",
    items: [
      { title: "키워드 & 순위", url: "/dashboard/marketing-keywords", icon: "BarChart2" },
      { title: "작업 현황", url: "/dashboard/marketing-status", icon: "Activity" },
    ],
  },
  {
    label: "리뷰 관리",
    items: [
      { title: "방문자", url: "/dashboard/review-receipt", icon: "Receipt" },
      { title: "블로그", url: "/dashboard/blog-reviews", icon: "FileText" },
    ],
  },
  {
    label: "SEO 분석",
    items: [
      { title: "SEO 최적화", url: "/dashboard/seo-optimization", icon: "Search" },
    ],
  },
]

const ADMIN_SIDEBAR_SECTIONS = [
  {
    label: "관리자 대시보드",
    items: [
      { title: "전체 통계", url: "/dashboard/admin-stats", icon: "BarChart" },
      { title: "유저 작업관리", url: "/dashboard/admin-users", icon: "UserCheck" },
      { title: "키워드 분석", url: "/dashboard/analysis", icon: "ChartSpline" },
    ],
  },
  {
    label: "마케팅 (Admin)",
    items: [
      { title: "키워드 & 순위", url: "/dashboard/marketing-keywords", icon: "BarChart2" },
      { title: "작업 현황", url: "/dashboard/marketing-status", icon: "Activity" },
    ],
  },
  {
    label: "고객 영업 관리",
    items: [
      { title: "크롤링하기", url: "/dashboard/admin-customer", icon: "Computer" },
      { title: "영업하기", url: "/dashboard/admin-manage-customer", icon: "Mail" },
    ],
  },
]

/** (C) 메인 사이드바 컴포넌트 */
export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  // (1) 현재 경로 가져오기
  const pathname = usePathname()

  // (2) useUser hook을 사용해 유저 정보 가져오기
  const { data: user, isLoading, isError } = useUser()
  
  // 유저 역할에 따른 사이드바 섹션 선택
  const sections = React.useMemo(() => {
    if (user?.role === "admin") {
      // admin일 경우 모든 섹션을 표시 (기존 일반 사용자 메뉴 + admin 전용 메뉴)
      return [...STATIC_SIDEBAR_SECTIONS, ...ADMIN_SIDEBAR_SECTIONS];
    }
    return STATIC_SIDEBAR_SECTIONS;
  }, [user?.role]);

  // (3) 로딩시 skeleton
  if (isLoading) {
    return (
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          {/* Add the BusinessSwitcher for loading state */}
          <BusinessSwitcher />
        </SidebarHeader>
        <SidebarContent>
          {/* "대시보드 홈" 스켈레톤 */}
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <Skeleton variant="rounded" height={40} className="m-2" />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* 아래 각 섹션/메뉴도 스켈레톤으로 표시 */}
          <SidebarGroup>
            <Skeleton variant="text" width={100} className="ml-4 mt-4" />
            <SidebarMenu>
              {[1, 2, 3].map((i) => (
                <SidebarMenuItem key={i}>
                  <Skeleton variant="rounded" height={32} className="m-2" />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="mt-4">
            <Skeleton variant="text" width={100} className="ml-4 mt-2" />
            <SidebarMenu>
              {[1, 2].map((i) => (
                <SidebarMenuItem key={i}>
                  <Skeleton variant="rounded" height={32} className="m-2" />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Skeleton variant="rounded" height={40} className="m-2 w-[80%]" />
        </SidebarFooter>
      </Sidebar>
    )
  }

  // (4) 에러 or sections가 없으면
  if (isError || !sections) {
    return (
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          {/* Add the BusinessSwitcher for error state */}
          <BusinessSwitcher />
        </SidebarHeader>
        <SidebarContent className="flex flex-col items-center justify-center p-4">
          <div className="text-center p-6 bg-red-50 rounded-lg border border-red-100 w-[90%] shadow-sm">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <h3 className="font-medium text-lg mb-2">사이드바를 불러올 수 없습니다</h3>
            <p className="text-sm text-gray-500 mb-4">
              서버 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>새로고침</span>
            </button>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>
    )
  }

  // (5) 정상 케이스: 사이드바 렌더
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        {/* Add the new BusinessSwitcher component */}
        <BusinessSwitcher />
      </SidebarHeader>

      <SidebarContent>
        {/* (A) "대시보드 홈" 버튼 */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <InstantLink
                  href="/dashboard"
                  className={`flex items-center gap-3 px-4 py-3 text-base transition-colors rounded-md ${
                    pathname === "/dashboard"
                      ? "bg-gray-200 text-black font-medium"
                      : "text-gray-500 hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  <Home className={`shrink-0 h-5 w-5 ${pathname === "/dashboard" ? "stroke-[2px]" : ""}`} />
                  <span>대시보드 홈</span>
                </InstantLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* (B) 일반/관리자 섹션 목록, NavCommon에게 currentPath 전달 */}
        <NavCommon sections={sections} currentPath={pathname} />

        {/* (C) 하단부 NavSecondary */}
        <SidebarGroup className="mt-auto">
          <NavSecondary
            items={[
              // { title: "도움말/지원", url: "/help", icon: "LifeBuoy" },
              { title: "버그신고/고객센터", url: "/dashboard/support", icon: "Mail" },
            ]}
            currentPath={pathname}
          />
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}

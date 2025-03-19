"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { usePathname } from "next/navigation"
import { Skeleton } from "@mui/material"
import Link from "next/link"

import { Home } from "lucide-react"
import apiClient from "@/lib/apiClient"

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

import { NavCommon } from "@/components/dashboard/nav-common"
import { NavSecondary } from "@/components/dashboard/nav-secondary"
import { NavUser } from "@/components/dashboard/nav-user"
import { BusinessSwitcher } from "@/components/dashboard/business-switcher"

/** (A) 일반/관리자용 사이드바 섹션 구분 */
const STATIC_SIDEBAR_SECTIONS = [
  {
    label: "마케팅",
    items: [
      { title: "키워드 & 순위", url: "/dashboard/marketing_keywords", icon: "BarChart2" },
      { title: "작업 현황", url: "/dashboard/marketing_status", icon: "Activity" },
    ],
  },
  {
    label: "리뷰 관리",
    items: [
      { title: "영수증리뷰", url: "/dashboard/review_receipt", icon: "Receipt" },
      { title: "블로그리뷰", url: "/dashboard/review_blog", icon: "FileText" },
    ],
  },
  {
    label: "결제/요금",
    items: [
      { title: "Introduction", url: "/dashboard/payment_intro", icon: "BookOpen" },
      { title: "Get Started", url: "/dashboard/payment_started", icon: "PlayCircle" },
    ],
  },
  {
    label: "설정",
    items: [
      { title: "업체정보", url: "/dashboard/settings_shop", icon: "Building" },
      { title: "알림설정", url: "/dashboard/settings_notify", icon: "Bell" },
      { title: "팀/권한", url: "/dashboard/settings_business", icon: "Users" },
    ],
  },
]

const ADMIN_SIDEBAR_SECTIONS = [
  {
    label: "관리자 대시보드",
    items: [
      { title: "전체 통계", url: "/dashboard/admin_stats", icon: "BarChart" },
      { title: "사용자 관리", url: "/dashboard/admin_users", icon: "UserCheck" },
    ],
  },
  {
    label: "마케팅 (Admin)",
    items: [
      { title: "키워드 & 순위", url: "/dashboard/marketing_keywords", icon: "BarChart2" },
      { title: "작업 현황", url: "/dashboard/marketing_status", icon: "Activity" },
    ],
  },
]

/** (B) /api/user/me 응답 타입 */
interface UserMeResponse {
  id: number
  email: string
  role: string
}

// Remove the cn function - we'll use template literals directly

/** (C) 메인 사이드바 컴포넌트 */
export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  // (1) 현재 경로 가져오기
  const pathname = usePathname()

  // (2) 유저 role 불러오기 → 관리자면 admin 섹션, 아니면 일반 섹션
  const { data: sections, isLoading, isError } = useQuery({
    queryKey: ["sidebarSections"],
    queryFn: async () => {
      const userRes = await apiClient.get<UserMeResponse>("/api/user/me")
      const user = userRes.data
      if (user.role === "admin") {
        return ADMIN_SIDEBAR_SECTIONS
      }
      return STATIC_SIDEBAR_SECTIONS
    },
    staleTime: 24 * 60 * 60 * 1000,
  })

  // (3) 로딩시 skeleton
  if (isLoading) {
    return (
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
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
    return <Sidebar>에러 발생</Sidebar>
  }

  // (5) 정상 케이스: 사이드바 렌더
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <BusinessSwitcher />
      </SidebarHeader>

      <SidebarContent>
        {/* (A) "대시보드 홈" 버튼 */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-3 px-4 py-3 text-base transition-colors rounded-md ${
                    pathname === "/dashboard"
                      ? "bg-gray-200 text-black font-medium"
                      : "text-gray-500 hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  <Home className={`shrink-0 h-5 w-5 ${pathname === "/dashboard" ? "stroke-[2px]" : ""}`} />
                  <span>대시보드 홈</span>
                </Link>
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
              { title: "도움말/지원", url: "/help", icon: "LifeBuoy" },
              { title: "문의하기/고객센터", url: "/contact", icon: "Mail" },
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

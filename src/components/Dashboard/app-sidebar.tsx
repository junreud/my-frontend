"use client"

import * as React from "react"
import {
  // 새 아이콘을 lucide-react에서 필요에 맞게 불러옵니다.
  PieChart,       // Overview
  TrendingUp,     // Rank Tracker
  Megaphone,      // Marketing
  CreditCard,     // Billing & Payments
  Settings2,      // Settings
} from "lucide-react"

import { NavMain } from "@/components/Dashboard/nav-main"
import { NavProjects } from "@/components/Dashboard/nav-projects"
import { NavUser } from "@/components/Dashboard/nav-user"
import { TeamSwitcher } from "@/components/Dashboard/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// 예시 데이터 (샘플)
const data = {
  user: {
    name: "김준석",
    email: "cngkdkr@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  // 플랫폼(네이버, 구글, 인스타 등) 스위처 예시
  platform: [
    {
      name: "NAVER",
      logo: "/images/naver24.svg",
      plan: "사업자",
    },
    {
      name: "Instagram",
      logo: "/images/instagram48.svg",
      plan: "사업자",
    },
    {
      name: "Google",
      logo: "/images/google48.svg",
      plan: "사업자",
    },
  ],
  // 메인 사이드바 메뉴: 1번 구조에 맞게 수정
  navMain: [
    {
      title: "Overview",
      url: "/dashboard/overview",
      icon: PieChart,
      isActive: true,
      items: [
        { title: "Dashboard", url: "/dashboard/overview" },
        {
          title: "SEO",
          url: "/dashboard/overview/seo",
        },
        {
          title: "Social",
          url: "/dashboard/overview/social",
        },
        {
          title: "Ads",
          url: "/dashboard/overview/ads",
        },
      ]
    },
    {
      title: "Rank Tracker",
      url: "/dashboard/rank-tracker",
      icon: TrendingUp,
    },
    {
      title: "Marketing",
      url: "/dashboard/marketing",
      icon: Megaphone,
    },
    {
      title: "Billing & Payments",
      url: "/dashboard/billing",
      icon: CreditCard,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
    },
  ],
  // 프로젝트나 캠페인 등 (예: 마케팅 캠페인 목록, 추가 메뉴 등)
  projects: [
    {
      name: "캠페인 A",
      url: "/dashboard/campaign/a",
      icon: Megaphone,
    },
    {
      name: "캠페인 B",
      url: "/dashboard/campaign/b",
      icon: Megaphone,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* 플랫폼 스위처 (네이버/인스타/구글) 등 */}
        <TeamSwitcher teams={data.platform} />
      </SidebarHeader>

      <SidebarContent>
        {/* 메인 메뉴 (Overview, Rank Tracker, Marketing, Billing, Settings) */}
        <NavMain items={data.navMain} />

        {/* 추가로 보여줄 프로젝트/캠페인 메뉴 */}
        <NavProjects projects={data.projects} />
      </SidebarContent>

      <SidebarFooter>
        {/* 사용자 정보 (아바타, 이름, 메일 등) */}
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

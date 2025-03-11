// components/dashboard/app-sidebar.tsx (예시 수정)
"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
} from "@/components/ui/sidebar"
import { Rocket, MessagesSquare, CreditCard, Settings, Mail, LifeBuoy, GalleryVerticalEnd, AudioWaveform, Command } from "lucide-react"
import { TeamSwitcher } from "@/components/dashboard/team-switcher"
import { NavSecondary } from "@/components/dashboard/nav-secondary"
import { NavUser } from "@/components/dashboard/nav-user"
import { NavCommon } from "@/components/dashboard/nav-common" // 새로 만든 공통

// (A) 샘플: Platform 섹션
const platformSections = [
  {
    label: "마케팅",
    items: [
      {
        title: "키워드 & 순위",
        url: "/marketing/keywords",
        icon: Rocket,

      },
      {
        title: "작업 현황",
        url: "/marketing/status",
        icon: Rocket,
      },
    ],
  },
  {
    label: "리뷰 관리",
    items: [
      {
        title: "영수증리뷰",
        url: "/review/receipt",
        icon: MessagesSquare,

      },
      {
        title: "블로그리뷰",
        url: "/review/blog",
        icon: Rocket,
      },
    ],
  },
  {
    label: "Projects",
    items: [
      {
        title: "결제/요금",
        url: "/payment",
        icon: CreditCard,
        items: [
          { title: "Introduction", url: "/payment/intro" },
          { title: "Get Started", url: "/payment/started" },
        ],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        items: [
          { title: "업체정보", url: "/settings/shop" },
          { title: "알림설정", url: "/settings/notify" },
          { title: "팀/권한", url: "/settings/team" },
        ],
      },
    ],
  },
]

// (B) 하단 메뉴
const navSecondary = [
  {
    title: "도움말/지원",
    url: "/help",
    icon: LifeBuoy,
  },
  {
    title: "문의하기/고객센터",
    url: "/contact",
    icon: Mail,
  },
]

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      {/* 헤더 (ex: 팀 스위처) */}
      <SidebarHeader>
        <TeamSwitcher
          teams={[
            { name: "Acme Inc", logo: GalleryVerticalEnd, plan: "Enterprise" },
            { name: "Acme Corp.", logo: AudioWaveform, plan: "Startup" },
            { name: "Evil Corp.", logo: Command, plan: "Free" },
          ]}
        />
      </SidebarHeader>

      {/* 본문 */}
      <SidebarContent>
        {/* (C) 통합된 NavCommon을 사용 */}
        <NavCommon sections={platformSections} />

        {/* (D) 하단 메뉴 */}
        <SidebarGroup className="mt-auto">
          <NavSecondary items={navSecondary} />
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}

"use client"

import * as React from "react"
// 아이콘 전부 여기서 불러옴
import {
  Utensils,
  Coffee,
  Dumbbell,
  PieChart,
  TrendingUp,
  Megaphone,
  CreditCard,
  Settings2,
  Plus, // + 아이콘도 여기서 import
} from "lucide-react"

import { NavMain } from "@/components/Dashboard/nav-main"
// import { NavProjects } from "@/components/Dashboard/nav-projects"
import { NavUser } from "@/components/Dashboard/nav-user"
import { TeamSwitcher } from "@/components/Dashboard/team-switcher" // 위에서 만든 스위처
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"


// import {
//   UtensilsCrossed,
//   ShoppingCart,
//   Briefcase,
//   Stethoscope,
//   GraduationCap,
//   Film,
//   Bed,
//   Building,
//   Banknote,
//   Car,
//   Dumbbell,
//   MoreHorizontal
// } from "lucide-react";

// // 예시: 카테고리별 아이콘 매핑 객체
// const categoryIcons = {
//   "음식점/카페/주점": UtensilsCrossed,
//   "쇼핑/유통": ShoppingCart,
//   "서비스": Briefcase,
//   "의료/건강": Stethoscope,
//   "교육/학원": GraduationCap,
//   "문화/오락": Film,
//   "숙박/여행": Bed,
//   "공공기관": Building,
//   "금융/부동산": Banknote,
//   "자동차/교통": Car,
//   "레저/스포츠": Dumbbell,
//   "기타": MoreHorizontal,
// };
// 샘플 데이터
const data = {
  user: {
    name: "홍길동",
    email: "test@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  platform: [
    { name: "홍대가장맛있는고기집", logo: Utensils },
    { name: "사랑스러운카페", logo: Coffee },
    { name: "최고의강남헬스장", logo: Dumbbell },
  ],
  navMain: [
    {
      title: "마케팅",
      url: "/dashboard/",
      icon: PieChart,
      isActive: true,
      items: [
        { title: "플레이스", url: "/dashboard/place/overview" },
        { title: "블로그", url: "/dashboard/vlog/reports" },
        { title: "검색광고", url: "/dashboard/searchad" },
      ]
    },
    {
      title: "블로그",
      url: "/dashboard/blog",
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
  projects: [
    {
      name: "업체 A",
      url: "/dashboard/campaign/restaurant-a",
      icon: Megaphone,
    },
    {
      name: "업체 B",
      url: "/dashboard/campaign/restaurant-b",
      icon: Megaphone,
    },
  ],
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* 팀(플랫폼) 스위처 */}
        <TeamSwitcher
          teams={data.platform}
          plusIcon={Plus}              // + 아이콘을 여기서 전달
          onAddTeamClick={() => {
            // + 버튼 클릭 시 로직
            alert("새 업체 추가")
          }}
        />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

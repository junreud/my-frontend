"use client"

import { useQuery } from "@tanstack/react-query"

// 사이드바 고정 메뉴 구조 (문자열 아이콘)
export type SidebarItem = {
  title: string
  url: string
  icon: string
}

export type SidebarSection = {
  label: string
  items: SidebarItem[]
}

// (1) 하드코딩된 섹션
const STATIC_SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    label: "마케팅",
    items: [
      {
        title: "키워드 & 순위",
        url: "/marketing/keywords",
        icon: "BarChart2",
      },
      {
        title: "작업 현황",
        url: "/marketing/status",
        icon: "Activity",
      },
    ],
  },
  {
    label: "리뷰 관리",
    items: [
      {
        title: "영수증리뷰",
        url: "/review/receipt",
        icon: "Receipt",
      },
      {
        title: "블로그리뷰",
        url: "/review/blog",
        icon: "FileText",
      },
    ],
  },
  {
    label: "결제/요금",
    items: [
      {
        title: "Introduction",
        url: "/payment/intro",
        icon: "BookOpen",
      },
      {
        title: "Get Started",
        url: "/payment/started",
        icon: "PlayCircle",
      },
    ],
  },
  {
    label: "설정",
    items: [
      {
        title: "업체정보",
        url: "/settings/shop",
        icon: "Building",
      },
      {
        title: "알림설정",
        url: "/settings/notify",
        icon: "Bell",
      },
      {
        title: "팀/권한",
        url: "/settings/business",
        icon: "Users",
      },
    ],
  },
]

// (2) 하드코딩된 데이터를 React Query로 래핑 (API 호출 없음)
export function useSidebarSections() {
  return useQuery<SidebarSection[]>({
    queryKey: ["sidebarSections"],
    queryFn: async () => {
      return STATIC_SIDEBAR_SECTIONS
    },
    // 사용 환경에 맞춰 staleTime 설정
    staleTime: Infinity,
    // cacheTime: 1000 * 60 * 5, // 필요하다면 추가하되, TS 버전 호환 문제 시 제거
  })
}

// components/dashboard/nav-common.tsx
"use client"


import Link from "next/link"
import { ChevronRight, LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"

// (A) 타입 정의
interface SubItem {
  title: string
  url: string
}

interface ParentItem {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  items?: SubItem[]
}

interface NavSection {
  label: string
  items: ParentItem[]
}

interface NavCommonProps {
  sections: NavSection[]
  // (추가) 부모 레이블(또는 버튼)을 어떻게 표시할지 결정하는 옵션
  parentLabelAs?: "groupLabel" | "menuButton"
}

/**
 * NavCommon: (nav-main + nav-projects) 기능을 통합한 공통 컴포넌트
 * - 여러 섹션을 받고, 각각에 대해 Collapsible 형태의 메뉴를 만든다.
 * - 메인 클릭 시에도 서브 메뉴를 펼치도록 로직을 수정.
 */
export function NavCommon({
  sections,
//   parentLabelAs = "groupLabel",
}: NavCommonProps) {
  return (
    <>
      {sections.map((section) => (
        <SidebarGroup key={section.label}>
          <SidebarGroupLabel>{section.label}</SidebarGroupLabel>

          <SidebarMenu>
            {section.items.map((item) => {
              const hasSubItems = item.items && item.items.length > 0

              // (B) 개별 항목 렌더링
              return (
                <Collapsible
                  key={item.title}
                  asChild
                  // isActive면 기본 열림 상태
                  defaultOpen={!!item.isActive}
                >
                  <SidebarMenuItem>
                    {/* 
                      (C) '메인' 클릭 시에도 펼치기가 되게 하려면,
                      CollapsibleTrigger 범위를 "메인 항목 전체"로 잡으면 됩니다.
                      그리고 서브아이템이 없을 때만 이동하도록 분기 처리합니다.
                    */}
                    <CollapsibleTrigger asChild>
                      {/* 
                        만약 "메인 항목도 이동"을 원한다면
                        아래 <Link>에서 e.preventDefault()를 쓰거나 안 쓰는 방식으로 조절합니다.
                      */}
                      <Link
                        href={hasSubItems ? "#" : item.url} // 서브아이템이 있으면 이동 X
                        onClick={(e) => {
                          if (hasSubItems) {
                            // 서브아이템 존재 시 이동 막고 펼치기만
                            e.preventDefault()
                          }
                        }}
                        className="
                          flex
                          w-full
                          cursor-pointer
                          items-center
                          gap-2
                          px-2
                          py-1
                          text-sm
                          hover:bg-accent
                          hover:text-accent-foreground
                          transition-colors
                        "
                      >
                        <item.icon className="shrink-0" />
                        <span>{item.title}</span>
                        {hasSubItems && (
                          <SidebarMenuAction className="ml-auto data-[state=open]:rotate-90 transition-transform">
                            <ChevronRight />
                          </SidebarMenuAction>
                        )}
                      </Link>
                    </CollapsibleTrigger>

                    {/* (D) 서브 메뉴가 있으면 CollapsibleContent에 렌더링 */}
                    {hasSubItems && (
                      <CollapsibleContent>
                        <SidebarMenuSub className="mt-1">
                          {item.items!.map((sub) => (
                            <SidebarMenuSubItem key={sub.title}>
                              <SidebarMenuSubButton asChild>
                                <Link href={sub.url}>{sub.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}

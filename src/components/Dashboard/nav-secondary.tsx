"use client"
import * as React from "react"
import * as Icons from "lucide-react"
import { type LucideProps } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// 1) 우리가 사용할 아이콘 타입
export type MyLucideIcon = (props: LucideProps) => JSX.Element

// 2) IconObject 전체
type IconObject = typeof Icons

// 3) 아이콘만 골라내는 키
type ValidIconKeys = {
  [K in keyof IconObject]: IconObject[K] extends MyLucideIcon ? K : never
}[keyof IconObject]

// 4) 필터링된 아이콘
type FilteredIcons = {
  [K in ValidIconKeys]: IconObject[K]
}

// 5) iconsMap: 실제 lucide 아이콘 모음
const iconsMap = Icons as FilteredIcons

function getIconByName(iconName: string): MyLucideIcon {
  if (iconName in iconsMap) {
    return iconsMap[iconName as ValidIconKeys]
  }
  return iconsMap["HelpCircle"]
}

// NavSecondary 아이템 타입
interface NavSecondaryItem {
  title: string
  url: string
  icon: string // 문자열 (예: "Mail", "LifeBuoy", etc)
}

interface NavSecondaryProps
  extends React.ComponentPropsWithoutRef<typeof SidebarGroup> {
  items: NavSecondaryItem[]
}

// 컴포넌트
export function NavSecondary({ items, ...props }: NavSecondaryProps) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const IconComponent = getIconByName(item.icon)

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild size="sm">
                  <a href={item.url} className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

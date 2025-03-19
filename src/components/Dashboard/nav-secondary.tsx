"use client"

import * as React from "react"
import * as Icons from "lucide-react"
import { type LucideProps } from "lucide-react"
import Link from "next/link"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// 아이콘 필터링
export type MyLucideIcon = (props: LucideProps) => JSX.Element
type IconObject = typeof Icons
type ValidIconKeys = {
  [K in keyof IconObject]: IconObject[K] extends MyLucideIcon ? K : never
}[keyof IconObject]
type FilteredIcons = {
  [K in ValidIconKeys]: IconObject[K]
}
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
  icon: string
}

interface NavSecondaryProps
  extends React.ComponentPropsWithoutRef<typeof SidebarGroup> {
  items: NavSecondaryItem[]
  currentPath: string
}

export function NavSecondary({
  items,
  currentPath,
  ...props
}: NavSecondaryProps) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const IconComponent = getIconByName(item.icon)
            const isActive = currentPath.startsWith(item.url)

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild size="sm">
                  <Link
                    href={item.url}
                    className={`flex items-center gap-2 px-3 py-2 transition-colors rounded-md ${
                      isActive 
                        ? "bg-gray-200 text-black font-medium" 
                        : "text-gray-500 hover:bg-gray-100 hover:text-black"
                    }`}
                  >
                    <IconComponent className={`h-4 w-4 shrink-0 ${isActive ? "stroke-[1.5px]" : ""}`} />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

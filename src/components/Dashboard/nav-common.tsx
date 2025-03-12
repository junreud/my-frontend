"use client"

import Link from "next/link"
import * as Icons from "lucide-react"
import { LucideProps } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

/** 아이콘 타입 필터링 (에러 방지) */
type MyLucideIcon = (props: LucideProps) => JSX.Element
type IconObject = typeof Icons
type ValidIconKeys = {
  [K in keyof IconObject]: IconObject[K] extends MyLucideIcon ? K : never
}[keyof IconObject]
type FilteredIcons = { [K in ValidIconKeys]: IconObject[K] }
const iconsMap = Icons as FilteredIcons

function getIconByName(iconName: string): MyLucideIcon {
  if (iconName in iconsMap) {
    return iconsMap[iconName as ValidIconKeys]
  }
  return iconsMap["HelpCircle"]
}

// 타입들
interface SubItem {
  title: string
  url: string
}

interface ParentItem {
  title: string
  url: string
  icon: string
  items?: SubItem[]
}

interface NavSection {
  label: string
  items: ParentItem[]
}

interface NavCommonProps {
  sections: NavSection[]
}

export function NavCommon({ sections }: NavCommonProps) {
  return (
    <>
      {sections.map((section) => (
        <SidebarGroup key={section.label}>
          <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
          <SidebarMenu>
            {section.items.map((item) => {
              const IconComponent = getIconByName(item.icon)
              const hasSubItems = item.items && item.items.length > 0

              return (
                <div key={item.title}>
                  {/* (1) 부모 메뉴 */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className="
                          flex
                          items-center
                          gap-3
                          px-4
                          py-3
                          text-base
                          font-medium
                          transition-colors
                          rounded-md
                          hover:bg-accent
                          hover:text-accent-foreground
                        "
                      >
                        <IconComponent className="shrink-0 h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* (2) 서브 아이템 (항상 펼쳐서 표시) */}
                  {hasSubItems && (
                    <SidebarMenuSub className="ml-4 mt-1">
                      {item.items?.map((sub) => (
                        <SidebarMenuSubItem key={sub.title}>
                          <SidebarMenuSubButton asChild>
                            <Link
                              href={sub.url}
                              className="
                                block
                                px-3
                                py-2
                                text-sm
                                rounded-md
                                font-normal
                                transition-colors
                                hover:bg-accent
                                hover:text-accent-foreground
                              "
                            >
                              {sub.title}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </div>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}

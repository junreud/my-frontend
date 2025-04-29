"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"

import type { LucideProps } from "lucide-react"
import * as Icons from "lucide-react"

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

// 기본 아이콘 이름을 타입 안전하게 정의
const DEFAULT_ICON_NAME = "HelpCircle" as ValidIconKeys

function getIconByName(iconName: string): MyLucideIcon {
  if (iconName in iconsMap) {
    return iconsMap[iconName as ValidIconKeys]
  }
  return iconsMap[DEFAULT_ICON_NAME]
}

// NavCommon 타입
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
export interface NavSection {
  label: string
  items: ParentItem[]
}

interface NavCommonProps {
  sections: NavSection[]
  currentPath: string
}

export function NavCommon({ sections, currentPath }: NavCommonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  return (
    <>
      {sections.map((section) => (
        <SidebarGroup key={section.label}>
          <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
          <SidebarMenu>
            {section.items.map((item) => {
              // prefetch page code and data on hover
              const handleMouseEnter = () => {
                router.prefetch(item.url)
              }
              const IconComponent = getIconByName(item.icon)
              const hasSubItems = item.items && item.items.length > 0

              // 부모 메뉴 활성화 여부
              // 부분 매칭: currentPath.startsWith(item.url)
              // 정확 매칭: currentPath === item.url
              const isActiveParent = currentPath.startsWith(item.url)

              return (
                <div key={item.title}>
                  {/* (1) 부모 메뉴 */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        prefetch={true}
                        onMouseEnter={handleMouseEnter}
                        onClick={(e) => {
                          e.preventDefault()
                          startTransition(() => {
                            router.push(item.url)
                          })
                        }}
                        className={`flex items-center gap-3 px-4 py-3 text-base transition-colors rounded-md ${
                          isActiveParent
                            ? "bg-gray-200 text-black font-bold"
                            : "text-gray-500 hover:bg-gray-100 hover:text-black"
                        }`}
                      >
                        <IconComponent
                          className={`shrink-0 h-5 w-5 ${
                            isActiveParent ? "stroke-[2px]" : ""
                          }`}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* (2) 하위 메뉴 (항상 펼쳐서 보여주는 버전) */}
                  {hasSubItems && (
                    <SidebarMenuSub className="ml-4 mt-1">
                      {item.items?.map((sub) => {
                        const isActiveSub = currentPath.startsWith(sub.url)
                        return (
                          <SidebarMenuSubItem key={sub.title}>
                            <SidebarMenuSubButton asChild>
                              <Link
                                href={sub.url}
                                className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                                  isActiveSub
                                    ? "bg-gray-200 text-black font-medium"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-black font-normal"
                                }`}
                              >
                                {sub.title}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
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

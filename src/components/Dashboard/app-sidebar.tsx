"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
} from "@/components/ui/sidebar"
import { NavCommon } from "@/components/dashboard/nav-common"
import { NavSecondary } from "@/components/dashboard/nav-secondary"
import { NavUser } from "@/components/dashboard/nav-user"
import { BusinessSwitcher } from "@/components/dashboard/business-switcher"
import { useSidebarSections } from "@/hooks/useSidebarSections"

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { data: sections, isLoading, isError } = useSidebarSections()

  if (isLoading) {
    return <Sidebar>로딩중...</Sidebar>
  }
  if (isError || !sections) {
    return <Sidebar>에러 발생</Sidebar>
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <BusinessSwitcher />
      </SidebarHeader>

      <SidebarContent>
        {/* NavCommon: 위에서 수정한 컴포넌트 */}
        <NavCommon sections={sections} />

        <SidebarGroup className="mt-auto">
          <NavSecondary
            items={[
              {
                title: "도움말/지원",
                url: "/help",
                icon: "LifeBuoy",
              },
              {
                title: "문의하기/고객센터",
                url: "/contact",
                icon: "Mail",
              },
            ]}
          />
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}

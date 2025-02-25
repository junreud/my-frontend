"use client"

import * as React from "react"
// 예: ChevronsUpDown처럼 꼭 필요한 아이콘만 남기고,
// 'Plus' 는 import 하지 않습니다.
import { ChevronsUpDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
  onAddTeamClick,
  plusIcon: PlusIcon,
}: {
  teams: {
    name: string
    // 문자열이나 이미지 대신, 바로 React 아이콘 컴포넌트만 받도록 단순화
    logo: React.ElementType
  }[]
  // + 버튼 클릭 시 실행할 함수
  onAddTeamClick?: () => void
  // + 아이콘(Plus 아이콘)을 부모 컴포넌트에서 받아옴
  plusIcon?: React.ElementType
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {/* 현재 선택된 팀 아이콘 */}
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <activeTeam.logo />
              </div>
              {/* 현재 선택된 팀 이름 */}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeTeam.name}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              내 업체
            </DropdownMenuLabel>

            {/* 플랫폼 목록 */}
            {teams.map((team) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <team.logo className="size-4 shrink-0" />
                </div>
                {team.name}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            {/* + 버튼 (아이콘/클릭 로직 모두 상위에서 props로 받음) */}
            <DropdownMenuItem
              onClick={onAddTeamClick}
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-sm border">
                {PlusIcon && <PlusIcon className="size-4 shrink-0" />}
              </div>
              새 업체 추가하기
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

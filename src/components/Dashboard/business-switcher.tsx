// components/dashboard/BusinessSwitcher.tsx
"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronsUpDown, Plus } from "lucide-react"
import { Skeleton } from "@mui/material"

import { useSidebar } from "@/components/ui/sidebar"
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
} from "@/components/ui/sidebar"
import { getPlatformLogo } from "@/lib/getPlatformLogo"
import { useBusinessSwitcher } from "@/hooks/useBusinessSwitcher"
import { BusinessSheet } from "./BusinessSheet"

// 예: Business 모델 (실제 정의에 맞게 수정)
export type Business = {
  place_name: string
  platform: string
  category?: string
}

// user 구조 (간단히)
interface MyUser {
  businesses?: Business[]
}

// (A) LogoPart Props
interface LogoPartProps {
  isLoading: boolean
  isError: boolean
  activeBusiness: Business | null
}
function LogoPart({ isLoading, isError, activeBusiness }: LogoPartProps) {
  if (isLoading) {
      // MUI Skeleton for a circular shape
      return (
        <Skeleton variant="circular" width={32} height={32} />
      )
    }
    
  if (isError) {
    return (
      <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary overflow-hidden">
        <span className="text-xs">⚠️</span>
      </div>
    )
  }
  if (!activeBusiness) {
    return (
      <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary overflow-hidden">
        <span className="text-xs">🚫</span>
      </div>
    )
  }
  const logoPath = getPlatformLogo(activeBusiness.platform)
  return (
    <div className="flex aspect-square size-8 items-center justify-center rounded-md overflow-hidden">
      <Image
        src={logoPath}
        alt={activeBusiness.platform}
        width={32}
        height={32}
        className="object-contain"
      />
    </div>
  )
}

// (B) TextPart Props
interface TextPartProps {
  isLoading: boolean
  isError: boolean
  user?: MyUser
  activeBusiness: Business | null
}
function TextPart({ isLoading, isError, user, activeBusiness }: TextPartProps) {
  if (isLoading) {
    return (
      <div className="grid flex-1 text-left text-sm leading-tight ml-3 gap-1">
        <Skeleton variant="text" width={80} height={16} />
        <Skeleton variant="text" width={120} height={12} />
      </div>
    )
  }
  if (isError) {
    return (
      <div className="grid flex-1 text-left text-sm leading-tight ml-3">
        <span className="truncate font-semibold">오류 발생</span>
        <span className="truncate text-xs">업체 불러오기 실패</span>
      </div>
    )
  }
  if (!user?.businesses || user.businesses.length === 0) {
    return (
      <div className="grid flex-1 text-left text-sm leading-tight ml-3">
        <span className="truncate font-semibold">업체 없음</span>
        <span className="truncate text-xs">등록해주세요</span>
      </div>
    )
  }
  // NEW: Guard against activeBusiness being null.
  if (!activeBusiness) {
    return (
      <div className="grid flex-1 text-left text-sm leading-tight ml-3">
        <span className="truncate font-semibold">업체 선택 필요</span>
      </div>
    )
  }
  // 여기서 category도 추가
  return (
    <div className="grid flex-1 text-left text-sm leading-tight ml-3">
      <span className="truncate font-semibold">
        {activeBusiness.place_name}
      </span>
      <span className="truncate text-xs">
        {activeBusiness.category}
      </span>
    </div>
  )
}

// (C) DropdownInner Props
interface DropdownInnerProps {
  isLoading: boolean
  isError: boolean
  user?: MyUser
  activeBusiness: Business | null
  onSelectBusiness: (b: Business) => void
  onClickAdd: () => void
}

function DropdownInner({
  isLoading,
  isError,
  user,
  onSelectBusiness,
  onClickAdd,
}: DropdownInnerProps) {
  // 로딩/에러
  if (isLoading || isError) {
    return (
      <>
        <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-2">
          {isLoading ? "업체 목록 로딩중" : "오류로 가져올 수 없습니다"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 p-2" onSelect={(e) => e.preventDefault()}>
          <span>업체 추가 불가</span>
        </DropdownMenuItem>
      </>
    )
  }

  // 업체가 전혀 없는 경우
  if (!user?.businesses || user.businesses.length === 0) {
    return (
      <>
        <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-2">
          등록된 업체가 없습니다
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 p-2"
          onSelect={() => {
            onClickAdd()
          }}
        >
          <div className="flex size-6 items-center justify-center rounded-md border bg-background">
            <Plus className="size-4" />
          </div>
          <div className="font-medium text-muted-foreground">업체 추가하기</div>
        </DropdownMenuItem>
      </>
    )
  }

  // 정상 목록
  return (
    <>
      <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-2">
        업체 목록
      </DropdownMenuLabel>
      {user.businesses.map((biz: Business, idx: number) => (
        <DropdownMenuItem
          key={biz.place_name + idx}
          className="gap-2 p-2"
          onSelect={() => {
            onSelectBusiness(biz)
          }}
        >
          {biz.place_name}
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="gap-2 p-2"
        onSelect={() => {
          onClickAdd()
        }}
      >
        <div className="flex size-6 items-center justify-center rounded-md border bg-background">
          <Plus className="size-4" />
        </div>
        <div className="font-medium text-muted-foreground">업체 추가하기</div>
      </DropdownMenuItem>
    </>
  )
}

// 메인 컴포넌트
export function BusinessSwitcher() {
  const { isMobile } = useSidebar()
  const {
    user,
    isLoading,
    isError,
    activeBusiness,
    setActiveBusiness,
    sheetOpen,
    setSheetOpen,
  } = useBusinessSwitcher()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <LogoPart isLoading={isLoading} isError={isError} activeBusiness={activeBusiness} />
              <TextPart
                isLoading={isLoading}
                isError={isError}
                user={user as MyUser} // Cast to MyUser to satisfy type requirements
                activeBusiness={activeBusiness}
              />
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="z-50 w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-white text-foreground border border-border shadow-md"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownInner
              isLoading={isLoading}
              isError={isError}
              user={user as MyUser} // Cast here as well
              activeBusiness={activeBusiness}
              onSelectBusiness={setActiveBusiness}
              onClickAdd={() => setSheetOpen(true)}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      {/* Drawer */}
      <BusinessSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </SidebarMenu>
  )
}

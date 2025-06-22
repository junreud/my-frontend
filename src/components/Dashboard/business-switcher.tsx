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
import { useBusinessContext } from "@/app/dashboard/BusinessContext"
import { BusinessSheet } from "./BusinessSheet"

// Import the Business type from useBusinessSwitcher hook
import { Business } from "@/types/index"

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
        alt={`${activeBusiness.platform} 로고`}
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
  businesses?: Business[]
  activeBusiness: Business | null
}
function TextPart({ isLoading, isError, businesses, activeBusiness }: TextPartProps) {
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
  if (!businesses || businesses.length === 0) {
    return (
      <div className="grid flex-1 text-left text-sm leading-tight ml-3">
        <span className="truncate font-semibold">업체 없음</span>
        <span className="truncate text-xs">등록해주세요</span>
      </div>
    )
  }
  // Guard against activeBusiness being null.
  if (!activeBusiness) {
    return (
      <div className="grid flex-1 text-left text-sm leading-tight ml-3">
        <span className="truncate font-semibold">업체 선택 필요</span>
      </div>
    )
  }
  return (
    <div className="grid flex-1 text-left text-sm leading-tight ml-3">
      <span className="truncate font-semibold">
        {activeBusiness.place_name}
      </span>
      <span className="truncate text-xs">
        {activeBusiness.category || "카테고리 없음"}{Boolean(activeBusiness.isNewlyOpened) && " • 신규"}
      </span>
    </div>
  )
}

// (C) DropdownInner Props
interface DropdownInnerProps {
  isLoading: boolean
  isError: boolean
  businesses?: Business[]
  activeBusiness: Business | null
  onSelectBusiness: (b: Business) => void
  onClickAdd: () => void
  canAddMoreBusinesses: boolean
  userRole: string
}

function DropdownInner({
  isLoading,
  isError,
  businesses,
  activeBusiness,
  onSelectBusiness,
  onClickAdd,
  canAddMoreBusinesses,
  userRole,
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
  if (!businesses || businesses.length === 0) {
    return (
      <>
        <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-2">
          등록된 업체가 없습니다
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 p-2"
          onSelect={(e) => {
            if (!canAddMoreBusinesses) {
              e.preventDefault()
              return
            }
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
      {businesses.map((biz: Business, idx: number) => (
        <DropdownMenuItem
          key={biz.place_id || idx}
          className={`gap-2 p-2 ${activeBusiness?.place_id === biz.place_id ? 'bg-gray-100' : ''}`}
          onSelect={() => {
            console.log('업체 선택됨:', {
              name: biz.place_name,
              id: biz.place_id
            });
            onSelectBusiness(biz)
          }}
        >
          <div className="flex items-center gap-2">
            <div className="size-4">
              <Image
                width={16}
                height={16}
                src={getPlatformLogo(biz.platform)}
                alt={`${biz.platform} 로고`}
                className="absolute left-3 h-4 w-4"
              />
            </div>
            <div className="flex flex-col">
              <span>{biz.place_name}</span>
              <span className="text-xs text-gray-500">
                {biz.category || "카테고리 없음"}{Boolean(biz.isNewlyOpened) && " • 신규"}
              </span>
            </div>
          </div>
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      {canAddMoreBusinesses ? (
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
      ) : (
        <DropdownMenuItem
          className="gap-2 p-2 opacity-70 cursor-not-allowed"
          onSelect={(e) => e.preventDefault()}
        >
          <div className="flex size-6 items-center justify-center rounded-md border bg-background">
            <Plus className="size-4" />
          </div>
          <div className="font-medium text-muted-foreground">
            {userRole === 'user' ? "플랜 업그레이드 필요" : "업체 추가 불가"}
          </div>
        </DropdownMenuItem>
      )}
    </>
  )
}

// 메인 컴포넌트
export function BusinessSwitcher() {
  const { isMobile } = useSidebar()
  const {
    businesses,
    isLoading,
    isError,
    activeBusiness,
    setActiveBusiness,
    sheetOpen,
    setSheetOpen,
    canAddMoreBusinesses,
    userRole,
  } = useBusinessContext()

  // 컴포넌트가 마운트될 때와 activeBusiness가 변경될 때 로그 출력
  React.useEffect(() => {
    console.log('BusinessSwitcher 렌더링:', {
      activeBusiness: activeBusiness?.place_name,
      businessesCount: businesses?.length || 0,
      isLoading,
      isError
    });
  }, [activeBusiness, businesses, isLoading, isError]);

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
                businesses={businesses}
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
            aria-describedby="business-list-description"
          >
            <span id="business-list-description" className="sr-only">
              등록된 비즈니스 목록입니다. 원하는 비즈니스를 선택하거나 새 비즈니스를 추가할 수 있습니다.
            </span>
            <DropdownInner
              isLoading={isLoading}
              isError={isError}
              businesses={businesses}
              activeBusiness={activeBusiness}
              onSelectBusiness={setActiveBusiness}
              onClickAdd={() => setSheetOpen(true)}
              canAddMoreBusinesses={canAddMoreBusinesses}
              userRole={userRole}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      {/* Drawer */}
      <BusinessSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </SidebarMenu>
  )
}

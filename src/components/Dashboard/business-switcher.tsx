"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronsUpDown, Plus } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient" // axios 설정된 apiClient

// shadcn/ui components
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

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"

import { useUser, type Business } from "@/hooks/useUser"
import { getPlatformLogo } from "@/lib/getPlatformLogo"

// ------------------------------------
// (1) BusinessSwitcher Component
// ------------------------------------
export function BusinessSwitcher() {
  const { isMobile } = useSidebar()
  const { data: user, isLoading, isError } = useUser()

  // 현재 선택된 업체
  const [activeBusiness, setActiveBusiness] = React.useState<Business | null>(null)

  React.useEffect(() => {
    if (user?.businesses && user.businesses.length > 0) {
      setActiveBusiness(user.businesses[0])
    } else {
      setActiveBusiness(null)
    }
  }, [user])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {/* (2) 왼쪽 로고 */}
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
                {renderPlatformLogo({ isLoading, isError, activeBusiness })}
              </div>

              {/* (3) 텍스트 영역 */}
              <div className="grid flex-1 text-left text-sm leading-tight">
                {renderBusinessText({ isLoading, isError, activeBusiness, user })}
              </div>

              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="
              z-50
              w-[--radix-dropdown-menu-trigger-width]
              min-w-56
              rounded-lg
              bg-white
              text-foreground
              border
              border-border
              shadow-md
            "
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            {renderDropdownList({ user, activeBusiness, setActiveBusiness })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

// ------------------------------------
// (A) 로고 렌더링
// ------------------------------------
function renderPlatformLogo({
  isLoading,
  isError,
  activeBusiness,
}: {
  isLoading: boolean
  isError: boolean
  activeBusiness: Business | null
}) {
  if (isLoading) {
    return <span className="text-xs">⏳</span>
  }
  if (isError) {
    return <span className="text-xs">⚠️</span>
  }
  if (!activeBusiness) {
    return <span className="text-xs">🚫</span>
  }

  const logoPath = getPlatformLogo(activeBusiness.platform)
  return (
    <Image
      src={logoPath}
      alt={activeBusiness.platform}
      width={32}
      height={32}
      className="object-contain"
    />
  )
}

// ------------------------------------
// (B) 업체명 텍스트
// ------------------------------------
function renderBusinessText({
  isLoading,
  isError,
  activeBusiness,
  user,
}: {
  isLoading: boolean
  isError: boolean
  activeBusiness: Business | null
  user: { businesses?: Business[] } | undefined
}) {
  if (isLoading) {
    return (
      <>
        <span className="truncate font-semibold">로딩중...</span>
        <span className="truncate text-xs">잠시만 기다려주세요.</span>
      </>
    )
  }
  if (isError) {
    return (
      <>
        <span className="truncate font-semibold">오류 발생</span>
        <span className="truncate text-xs">업체 정보를 가져올 수 없습니다.</span>
      </>
    )
  }
  if (!user?.businesses || user.businesses.length === 0) {
    return (
      <>
        <span className="truncate font-semibold">업체가 없습니다</span>
        <span className="truncate text-xs">등록해주세요</span>
      </>
    )
  }

  // 정상 표시
  return (
    <>
      <span className="truncate font-semibold">{activeBusiness?.place_name}</span>
      <span className="truncate text-xs">{activeBusiness?.platform}</span>
    </>
  )
}

// ------------------------------------
// (C) 드롭다운 내용
// ------------------------------------
function renderDropdownList({
  user,
  setActiveBusiness,
}: {
  user?: { businesses?: Business[] }
  activeBusiness: Business | null
  setActiveBusiness: React.Dispatch<React.SetStateAction<Business | null>>
}) {
  // 1) 유저 정보가 없을 때
  if (!user?.businesses) {
    return (
      <>
        <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-2">
          업체 정보 없음
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Sheet>
          <SheetTrigger asChild>
            <DropdownMenuItem 
            onSelect={(e) => {
              e.preventDefault() // 메뉴 자동 닫힘을 막음
              // 여기에 Drawer를 여는 로직(예: setOpenSheet(true))을 직접 호출
            }} 
            className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                업체 추가하기
              </div>
            </DropdownMenuItem>
          </SheetTrigger>
          <AddBusinessSheet />
        </Sheet>
      </>
    )
  }
  const hasBusinesses = user.businesses.length > 0

  // 정상 목록
  return (
    <>
      {/* 비어있으면 안내 문구, 있으면 목록 렌더링 */}
      {hasBusinesses ? (
        <>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            업체 목록
          </DropdownMenuLabel>
          {user.businesses.map((business, index) => {
            // 실제 목록
            // ...
            return (
              <DropdownMenuItem
                key={business.place_name + index}
                onClick={() => setActiveBusiness(business)}
                className="gap-2 p-2"
              >
                {/* 로고 + place_name */}
              </DropdownMenuItem>
            )
          })}
        </>
      ) : (
        <>
          <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-2">
            등록된 업체가 없습니다
          </DropdownMenuLabel>
        </>
      )}

      {/* 항상 노출할 구분선 + '업체 추가하기' 버튼 */}
      <DropdownMenuSeparator />
      <Sheet>
        <SheetTrigger asChild>
          <DropdownMenuItem className="gap-2 p-2">
            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
              <Plus className="size-4" />
            </div>
            <div className="font-medium text-muted-foreground">
              업체 추가하기
            </div>
          </DropdownMenuItem>
        </SheetTrigger>
        <AddBusinessSheet />
      </Sheet>
    </>
  )
}

// ------------------------------------
// (D) <AddBusinessSheet /> : Drawer + 내부 폼 + Dialog 확인
// ------------------------------------
function AddBusinessSheet() {
  // 가능한 플랫폼 리스트 (샘플)
  const platforms = [
    { id: "naver", label: "네이버", logo: "/images/platform/naver24.svg" },
    // { id: "yogiyo", label: "요기요", logo: "/logos/yogiyo.png" },
    // { id: "coupang", label: "쿠팡이츠", logo: "/logos/coupang.png" },
  ]

  const [selectedPlatform, setSelectedPlatform] = React.useState<string>("")
  const [placeUrl, setPlaceUrl] = React.useState("")
  const [openDialog, setOpenDialog] = React.useState(false)

  // React Query mutation
  const createBusinessMutation = useMutation({
    mutationFn: async (data: { platform: string; url: string }) => {
      // 예: POST /api/business/create
      const res = await apiClient.post("/api/business/create", data)
      return res.data
    },
    onSuccess: () => {
      alert("생성 성공!")
      // TODO: 다시 유저 데이터 refetch, 또는 local state 업데이트
    },
    onError: (error) => {
      console.error(error)
      alert("생성 실패. 오류가 발생했습니다.")
    },
  })

  const handleConfirmCreate = () => {
    createBusinessMutation.mutate({
      platform: selectedPlatform,
      url: placeUrl,
    })
    setOpenDialog(false)
  }

  const isDisabled = !selectedPlatform || !placeUrl

  return (
    <SheetContent
      side="bottom"
      // 원하는 스타일에 따라 높이/오버플로우 조절
      className="p-4 rounded-t-lg border-t border-border max-h-[80%] overflow-y-auto"
    >
      <SheetHeader>
        <SheetTitle>업체 추가하기</SheetTitle>
        <SheetDescription className="text-sm text-muted-foreground">
          플랫폼을 선택하고 URL을 입력해 주세요.
        </SheetDescription>
      </SheetHeader>

      {/* (1) 플랫폼 토글 영역 */}
      <div className="flex gap-3 mt-4">
        {platforms.map((plat) => {
          const isActive = plat.id === selectedPlatform
          return (
            <button
              key={plat.id}
              onClick={() => setSelectedPlatform(plat.id)}
              className={`
                relative flex items-center justify-center
                w-14 h-14 p-2
                border rounded-md
                transition
                ${
                  isActive
                    ? "bg-accent border-accent-foreground"
                    : "border-border bg-background"
                }
              `}
            >
              <Image
                src={plat.logo}
                alt={plat.label}
                width={40}
                height={40}
                className="object-contain"
              />
              {isActive && (
                <span className="absolute inset-0 ring-2 ring-offset-2 ring-accent-foreground rounded-md" />
              )}
            </button>
          )
        })}
      </div>

      {/* (2) URL 입력칸 */}
      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium">업체 URL</label>
        <Input
          value={placeUrl}
          onChange={(e) => setPlaceUrl(e.target.value)}
          placeholder="업체 링크 URL을 입력해 주세요"
        />
      </div>

      {/* (3) 하단 버튼 영역 */}
      <SheetFooter className="mt-6 flex justify-end">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          {/* DialogTrigger가 "생성하기" 버튼이 됨 */}
          <DialogTrigger asChild>
            <Button disabled={isDisabled}>
              생성하기
            </Button>
          </DialogTrigger>

          {/* (4) Dialog 내용 */}
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>업체 생성 확인</DialogTitle>
              <DialogDescription>
                선택한 플랫폼으로 업체를 등록하면 이후 변경할 수 없습니다. 
                <br />
                정말 생성하시겠습니까?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">취소하기</Button>
              </DialogClose>
              <Button onClick={handleConfirmCreate}>
                생성하기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* SheetClose (닫기 버튼) */}
        <SheetClose asChild>
          <Button variant="ghost">닫기</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  )
}

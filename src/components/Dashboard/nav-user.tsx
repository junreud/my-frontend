"use client"

import React, { useState } from "react"
import { ChevronsUpDown, LogOut, Sparkles } from "lucide-react"

// ui/avatar
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// ui/dropdown-menu
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ui/sidebar
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

// 사용자 정보
import { useUser } from "@/hooks/useUser"

// Import PricingModal
import { PricingModal } from "./pricing-modal"; 

export function NavUser() {
  // (1) 사용자 정보 불러오기
  const { data: user, isLoading, isError } = useUser()
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false); // State for PricingModal

  // 로딩 중이거나 에러 또는 user 없으면 null
  if (isLoading || isError || !user) {
    return null
  }

  // (2) 실제 렌더링
  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar_url} alt={user.name} />
                  <AvatarFallback className="rounded-lg">U</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side="right"
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar_url} alt={user.name} />
                    <AvatarFallback className="rounded-lg">U</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem 
                  className="hover:bg-gray-100"
                  onSelect={() => setIsPricingModalOpen(true)} // Open PricingModal
                >
                  <Sparkles />
                  Upgrade to Pro
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  // 로그아웃 API 호출
                  try {
                    const response = await fetch('https://localhost:4000/auth/logout', { 
                      method: 'POST', 
                      credentials: 'include',
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    
                    if (!response.ok) {
                      console.warn('로그아웃 API 응답 오류:', response.status, response.statusText);
                    } else {
                      console.log('로그아웃 API 성공');
                    }
                  } catch (error) {
                    console.error('로그아웃 API 호출 중 오류:', error);
                  }
                  // 토큰 삭제 및 리다이렉션 (API 실패해도 클라이언트 측 정리는 수행)
                  localStorage.removeItem('accessToken');
                  // refreshToken 쿠키도 클라이언트에서 삭제 시도
                  document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=none';
                  window.location.href = '/login';
                }}
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      {/* Render PricingModal */}
      <PricingModal open={isPricingModalOpen} onOpenChange={setIsPricingModalOpen} />
    </>
  )
}

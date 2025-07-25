"use client"

import React, { useState, useEffect } from 'react'
import { ReactQueryProvider } from "@/lib/reactQueryProvider"
import { usePathname, useRouter } from "next/navigation"
import { AppSidebar } from "@/components/Dashboard/app-sidebar"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { InstantLink } from "@/components/ui/instant-link"
import { Toaster } from "@/components/ui/sonner"
import { Bell, Cog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationsModal } from '@/components/Dashboard/notifications-modal';
import { SettingsModal } from '@/components/Dashboard/settings-modal';
import { DashboardFooter } from '@/components/Dashboard/dashboard-footer';
import { useUser } from '@/hooks/useUser';
import { BusinessProvider } from '@/app/dashboard/BusinessContext';
import apiClient from '@/lib/apiClient'
import { CrawlingNotificationWrapper } from '@/components/Dashboard/CrawlingNotificationWrapper';
import { DashboardMainContent } from '@/components/Dashboard/DashboardMainContent';

// 스켈레톤 컴포넌트 불러오기 - DashboardMainContent로 이동됨
// import {
//   CalendarSkeleton,
//   TableSkeleton,
//   TextSkeleton,
//   AccordionSkeleton,
//   StatCardSkeleton,
//   ChartSkeleton,
// } from "@/components/ui/skeletons"

// 현재 URL 경로에 따라 한글 이름 가져오기
function getKoreanName(segment: string): string {
  const pathMap: Record<string, string> = {
    dashboard: '대시보드',
    'marketing-keywords': '키워드 순위',
    'marketing-status': '작업 현황',
    'review-receipt': '방문자',
    'blog-reviews': '블로그',
    'settings-shop': '업체정보',
    'settings-notify': '알림설정',
    'settings-business': '팀/권한',
    'admin-stats': '전체 통계',
    'admin-users': '유저 작업관리',
    'admin-customer': '크롤링하기',
    'admin-manage-customer': '영업하기',
    support: '버그신고/고객센터',
  }

  return pathMap[segment] || segment
}

// 새로운 라우트 변경 감지 컴포넌트
function NavigationEvents() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const router = useRouter();

  // 라우트 변경 이벤트 감지
  useEffect(() => {
    // 네비게이션이 완료되면 상태 초기화
    if (targetPath === pathname && isNavigating) {
      setTimeout(() => setIsNavigating(false), 100);
    }
  }, [pathname, targetPath, isNavigating]);

  // 전역 네비게이션 이벤트 핸들러 설정
  useEffect(() => {

    // 라우트 변경 시작 이벤트를 감지하기 위한 클릭 이벤트 핸들러
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.getAttribute('href')?.startsWith('/')) {
        const href = link.getAttribute('href') as string;
        if (href !== pathname) {
          setTargetPath(href);
          setIsNavigating(true);
        }
      }
    };

    // 클릭 이벤트 감지 설정
    document.addEventListener('click', handleLinkClick);
    
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, [pathname, router]);

  return isNavigating ? (
    <div 
      className="fixed top-0 left-0 w-full h-1 bg-primary z-50"
      style={{ 
        animation: 'progressAnimation 2s ease-in-out infinite',
      }}
    />
  ) : null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // notification/settings state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: user } = useUser();

  // Fetch unread notifications count
  useEffect(() => {
    if (!user) return;
    apiClient.get('/api/notifications', { params: { unread: true } })
      .then(res => Array.isArray(res.data) && setUnreadCount(res.data.length))
      .catch(err => console.error('Unread notifications fetch failed:', err));
  }, [user]);
  // (A) Breadcrumb을 위한 경로 분해 (optional)
  const pathname = usePathname()
  // 분할된 URL 경로 세그먼트
  const segments = pathname.split("/").filter(Boolean)
  const [isChangingRoute, setIsChangingRoute] = useState(false);
  
  // 이전 path 저장
  const [prevPathname, setPrevPathname] = useState<string | null>(null);

  // pathname이 바뀌면 라우트 변경 상태 감지
  useEffect(() => {
    if (prevPathname && prevPathname !== pathname) {
      setIsChangingRoute(true);
      // 라우트 변경 후 짧은 시간 뒤 상태 리셋
      const timeout = setTimeout(() => {
        setIsChangingRoute(false);
      }, 500); // 애니메이션 완료 시간에 맞춰 조정
      return () => clearTimeout(timeout);
    }
    setPrevPathname(pathname);
  }, [pathname, prevPathname]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 [--header-height:calc(theme(spacing.14))]">
      <ReactQueryProvider>
          {/* 네비게이션 로딩 인디케이터 추가 */}
          <NavigationEvents />
          {/* 글로벌 CSS 추가 */}
          <style jsx global>{`
            @keyframes progressAnimation {
              0% {
                width: 0%;
                opacity: 1;
              }
              50% {
                width: 70%;
                opacity: 1;
              }
              90% {
                width: 90%;
                opacity: 1;
              }
              100% {
                width: 100%;
                opacity: 0;
              }
            }
            .fade-in {
              animation: fadeIn 0.3s ease-in;
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
          <SidebarProvider className="flex flex-1">
            <BusinessProvider>
              {/* (B) 사이드바 */}
              <AppSidebar />
              {/* (C) 메인 콘텐츠 영역 */}
              <SidebarInset className="flex flex-1 flex-col bg-white">
              {/* 상단 헤더 (Breadcrumb 등) */}
              <header className="flex h-16 shrink-0 items-center border-b">
                <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  {/* Breadcrumb */}
                  <Breadcrumb>
                    <BreadcrumbList>
                      {segments.map((seg: string, index: number) => {
                        const href = "/" + segments.slice(0, index + 1).join("/")
                        const isLast = index === segments.length - 1
                        // 한글 이름 가져오기
                        const title = getKoreanName(seg)
                        return (
                          <BreadcrumbItem key={href}>
                            {index > 0 && <BreadcrumbSeparator className="mx-1" />}
                            {isLast ? (
                              <BreadcrumbPage>{title}</BreadcrumbPage>
                            ) : (
                              <InstantLink href={href}>{title}</InstantLink>
                            )}
                          </BreadcrumbItem>
                        )
                      })}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
                {/* Notification and Settings */}
                <div className="flex items-center ml-auto gap-2 px-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {setIsNotificationsOpen(true); setUnreadCount(0);}}
                    title="알림"
                    className="h-7 w-7 rounded-full hover:bg-gray-200 relative"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSettingsOpen(true)}
                    title="설정"
                    className="h-7 w-7 rounded-full hover:bg-gray-200"
                  >
                    <Cog className="h-4 w-4" />
                  </Button>
                </div>
              </header>
              <DashboardMainContent isChangingRoute={isChangingRoute}>
                {children}
              </DashboardMainContent>
              
              {/* 푸터 추가 */}
              <DashboardFooter />
            </SidebarInset>
            
            {/* 업체 변경 시 크롤링 상태 알림 - BusinessProvider 내부에서 렌더링 */}
            <CrawlingNotificationWrapper />
            </BusinessProvider>
          </SidebarProvider>
          {/* Modals */}
          <NotificationsModal open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen} />
          <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
          
          {/* (D) Toaster: 화면 우측 아래로 배치, 기본 4초 후 닫힘. closeButton(=X)도 자동 노출되도록 세팅 */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
            }}
          />
      </ReactQueryProvider>
    </div>
  )
 }

'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { useBusinessContext } from '@/app/dashboard/BusinessContext';
import {
  CalendarSkeleton,
  TableSkeleton,
  TextSkeleton,
  AccordionSkeleton,
  StatCardSkeleton,
  ChartSkeleton,
} from "@/components/ui/skeletons";

// 현재 경로에 따라 다른 스켈레톤 컴포넌트를 반환하는 함수
const getSkeletonForPath = (path: string) => {
  if (path.includes('marketing-status')) {
    return (
      <div className="space-y-6">
        <CalendarSkeleton />
        <TableSkeleton rows={8} columns={6} />
      </div>
    );
  } 
  
  if (path.includes('marketing-keywords')) {
    return (
      <div className="space-y-6">
        <StatCardSkeleton count={3} />
        <TableSkeleton rows={10} columns={5} />
      </div>
    );
  }

  if (path.includes('review-receipt') || path.includes('blog-reviews')) {
    return (
      <div className="space-y-6">
        <TextSkeleton lines={2} size="lg" />
        <TableSkeleton rows={5} columns={4} />
        <AccordionSkeleton items={3} />
      </div>
    );
  }

  if (path.includes('admin-stats')) {
    return (
      <div className="space-y-6">
        <StatCardSkeleton count={4} />
        <ChartSkeleton height={350} />
      </div>
    );
  }

  if (path.includes('admin-customer') || path.includes('admin-manage-customer')) {
    return (
      <div className="space-y-6">
        <TableSkeleton rows={10} columns={6} showHeader={true} />
      </div>
    );
  }
  
  // 기본 스켈레톤
  return (
    <div className="space-y-6">
      <StatCardSkeleton count={2} />
      <TableSkeleton rows={5} columns={4} />
    </div>
  );
};

interface DashboardMainContentProps {
  children: React.ReactNode;
  isChangingRoute: boolean;
}

export function DashboardMainContent({ children, isChangingRoute }: DashboardMainContentProps) {
  const pathname = usePathname();
  const { crawlingStatus } = useBusinessContext();

  // 크롤링 중일 때는 스켈레톤 대신 빈 화면 표시 (크롤링 알림이 전체 화면을 덮음)
  const shouldShowSkeleton = !crawlingStatus.isActive;

  return (
    <main className={`flex-1 ${isChangingRoute ? 'fade-in' : ''}`}>
      <Suspense 
        fallback={
          shouldShowSkeleton ? (
            <div className="p-4">{getSkeletonForPath(pathname)}</div>
          ) : null
        }
      >
        {children}
      </Suspense>
    </main>
  );
}

"use client";

import { cn } from "@/lib/utils";
import React from "react";

// 기본 스켈레톤 컴포넌트
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

// 텍스트 스켈레톤 (다양한 크기)
export function TextSkeleton({
  lines = 1,
  className,
  size = "md",
}: {
  lines?: number;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}) {
  const sizeClasses = {
    xs: "h-3",
    sm: "h-4",
    md: "h-5",
    lg: "h-6",
    xl: "h-8",
  };

  const widthClasses = {
    xs: "w-16",
    sm: "w-24", 
    md: "w-32",
    lg: "w-40",
    xl: "w-48",
  };

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            sizeClasses[size],
            i === lines - 1 && lines > 1 ? `${widthClasses[size]} w-3/4` : "w-full"
          )}
        />
      ))}
    </div>
  );
}

// 카드 스켈레톤
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border p-4 shadow", className)}>
      <div className="space-y-3">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

// 테이블 스켈레톤
export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}: {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("w-full overflow-hidden rounded-md", className)}>
      <div className="space-y-4">
        {showHeader && (
          <div className="flex items-center bg-gray-100 p-2 rounded-t-md">
            {Array.from({ length: columns }).map((_, i) => (
              <div key={`header-${i}`} className="flex-1 px-2">
                <Skeleton className="h-6 w-full max-w-[120px]" />
              </div>
            ))}
          </div>
        )}
        
        <div className="space-y-2">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className="flex items-center p-2 border-b border-gray-100"
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={`cell-${rowIndex}-${colIndex}`} className="flex-1 px-2">
                  <Skeleton
                    className={cn(
                      "h-4",
                      colIndex === 0 ? "w-1/2" : "w-full",
                      "max-w-[150px]"
                    )}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 달력 스켈레톤
export function CalendarSkeleton({ className }: { className?: string }) {
  // 달력 헤더 스켈레톤
  const CalendarHeaderSkeleton = () => (
    <div className="flex justify-between items-center p-4 bg-white rounded-t border border-gray-200">
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <Skeleton className="h-8 w-32 rounded-full" />
    </div>
  );

  // 달력 날짜 그리드 스켈레톤
  const CalendarGridSkeleton = () => {
    // 요일 헤더 (7개)
    const weekdays = Array.from({ length: 7 }).map((_, i) => (
      <div key={`weekday-${i}`} className="h-8 flex justify-center items-center">
        <Skeleton className="h-4 w-12 rounded" />
      </div>
    ));

    // 날짜 셀 5주 * 7일 = 35개
    const dayCells = Array.from({ length: 35 }).map((_, i) => {
      // 패턴에 따라 일부 셀에 이벤트 표시
      const showFirstEvent = i % 3 === 0;
      const showSecondEvent = i % 7 === 0;
      
      return (
        <div 
          key={`day-${i}`} 
          className="border p-2 h-24 relative"
        >
          <Skeleton className="h-5 w-5 mb-2 rounded-full" />
          
          {showFirstEvent && (
            <Skeleton className="h-5 w-full rounded mb-1" />
          )}
          {showSecondEvent && (
            <Skeleton className="h-5 w-3/4 rounded mb-1" />
          )}
        </div>
      );
    });

    return (
      <div className="bg-white rounded-b p-2 border border-gray-200 border-t-0">
        <div className="grid grid-cols-7 gap-2">
          {weekdays}
          {dayCells}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="w-full bg-white rounded shadow overflow-hidden">
        <CalendarHeaderSkeleton />
        <CalendarGridSkeleton />
      </div>
    </div>
  );
}

// 아코디언 스켈레톤
export function AccordionSkeleton({
  items = 3,
  className,
}: {
  items?: number;
  className?: string;
}) {
  return (
    <div className={cn("w-full space-y-2", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={`accordion-${i}`}
          className="rounded-md border p-3 shadow-sm"
        >
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          {i === 0 && (
            <div className="mt-3 pl-2 pt-2 border-t">
              <TextSkeleton lines={3} size="sm" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// 프로필 카드 스켈레톤
export function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-4", className)}>
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

// 대시보드 통계 카드 스켈레톤
export function StatCardSkeleton({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4", className, {
      "grid-cols-1": count === 1,
      "grid-cols-2": count === 2,
      "grid-cols-3": count === 3,
      "grid-cols-4": count === 4,
      "grid-cols-2 md:grid-cols-4": count > 4,
    })}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`stat-${i}`}
          className="rounded-lg border p-4 shadow-sm"
        >
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-8 w-3/4 mb-3" />
          <div className="flex items-center">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-3 ml-1 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 차트 스켈레톤
export function ChartSkeleton({
  height = 300,
  className,
}: {
  height?: number;
  className?: string;
}) {
  return (
    <div className={cn("w-full space-y-3", className)}>
      <Skeleton className="h-7 w-1/4" />
      <div className="rounded-md border p-4">
        <Skeleton style={{ height: `${height}px` }} className="w-full" />
      </div>
    </div>
  );
}

// 컨테이너 + 로딩 마스크 스켈레톤
export function LoadingMask({
  children,
  isLoading = true,
  className,
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
      </div>
      <div className="opacity-25 pointer-events-none">{children}</div>
    </div>
  );
}

// 검색 인터페이스 스켈레톤
export function SearchSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 flex-1 rounded-md" />
        <Skeleton className="h-10 w-20 rounded-md" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={`filter-${i}`} className="h-8 w-20 rounded-full" />
        ))}
      </div>
    </div>
  );
}
"use client";

import React from 'react';
import { useBusinessContext } from '@/app/dashboard/BusinessContext';

interface DashboardShellProps {
  children: React.ReactNode;
}

const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  const { 
    activeBusiness, 
    loading: businessLoading,
    containerRef,
    prevHeight,
    isHeightStabilized
  } = useBusinessContext();
  
  return (
    <div className="space-y-6">
      <div 
        ref={containerRef}
        className="flex justify-between transition-height duration-300 ease-in-out"
        style={isHeightStabilized && prevHeight ? { minHeight: `${prevHeight}px` } : {}}
      >
        <h1 className="text-2xl font-bold tracking-tight">
          {businessLoading 
            ? <div className="h-8 w-60 bg-gray-200 animate-pulse rounded"></div>
            : activeBusiness?.place_name 
              ? `${activeBusiness.place_name} 대시보드` 
              : '업체를 선택해주세요'
          }
        </h1>
      </div>
      {children}
    </div>
  );
};

export default DashboardShell;
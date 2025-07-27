// filepath: /Users/junseok/Projects/my-frontend/src/components/Dashboard/TodayUsersCard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useBusinessSwitcher } from "@/hooks/useBusinessSwitcher";

const TodayUsersCard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [changePercent, setChangePercent] = useState<number | null>(null);
  const { activeBusiness } = useBusinessSwitcher();

  useEffect(() => {
    if (!activeBusiness?.place_id) {
      setLoading(false);
      return;
    }
    
    // Simulate API call to get user statistics
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1300));
        
        // Set mock data
        setUserCount(245);
        setChangePercent(12.5); // Simulated percentage change from yesterday
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [activeBusiness?.place_id]);

  return (
    <Card className="rounded-lg overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold mb-2">오늘 방문자 수</h3>
          
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-5 w-32 bg-gray-200 rounded"></div>
            </div>
          ) : !activeBusiness?.place_id ? (
            <div className="text-gray-500">업체를 선택해주세요</div>
          ) : (
            <>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">
                  {userCount ? userCount.toLocaleString() : '-'}
                </span>
                <span className="text-gray-500 ml-1">명</span>
              </div>
              
              {changePercent !== null && (
                <div className="flex items-center text-sm mt-1">
                  {changePercent > 0 ? (
                    <>
                      <TrendingUp className="text-green-500 w-4 h-4 mr-1" />
                      <span className="text-green-500">+{changePercent}% 증가</span>
                    </>
                  ) : changePercent < 0 ? (
                    <>
                      <TrendingDown className="text-red-500 w-4 h-4 mr-1" />
                      <span className="text-red-500">{changePercent}% 감소</span>
                    </>
                  ) : (
                    <>
                      <Minus className="text-gray-500 w-4 h-4 mr-1" />
                      <span className="text-gray-500">변화 없음</span>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodayUsersCard;
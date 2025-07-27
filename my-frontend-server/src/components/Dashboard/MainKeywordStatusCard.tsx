// filepath: /Users/junseok/Projects/my-frontend/src/components/Dashboard/MainKeywordStatusCard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useBusinessSwitcher } from "@/hooks/useBusinessSwitcher";

const MainKeywordStatusCard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [mainKeyword, setMainKeyword] = useState<string>("");
  const [keywordRank, setKeywordRank] = useState<number | null>(null);
  const { activeBusiness } = useBusinessSwitcher();

  useEffect(() => {
    if (!activeBusiness?.place_id) {
      setLoading(false);
      return;
    }

    // Simulate API call to get main keyword data
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1800));
        
        // Set mock data
        setMainKeyword("신림헬스장");
        setKeywordRank(8); // Simulated rank
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
          <h3 className="text-lg font-semibold mb-2">주요 키워드 순위</h3>
          
          {loading ? (
            <div className="animate-pulse">
              <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          ) : !activeBusiness?.place_id ? (
            <div className="text-gray-500">업체를 선택해주세요</div>
          ) : (
            <>
              <span className="text-gray-500 mb-1">{mainKeyword}</span>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{keywordRank ? keywordRank : '-'}</span>
                <span className="text-gray-500 ml-1">위</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MainKeywordStatusCard;
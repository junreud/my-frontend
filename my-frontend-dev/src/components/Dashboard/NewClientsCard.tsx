// filepath: /Users/junseok/Projects/my-frontend/src/components/Dashboard/NewClientsCard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useBusinessSwitcher } from "@/hooks/useBusinessSwitcher";

const NewClientsCard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [clientCount, setClientCount] = useState<number | null>(null);
  const { activeBusiness } = useBusinessSwitcher();

  useEffect(() => {
    if (!activeBusiness?.place_id) {
      setLoading(false);
      return;
    }
    
    // Simulate API call to get client data
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1600));
        
        // Set mock data
        setClientCount(12); // Simulated new clients count
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
          <h3 className="text-lg font-semibold mb-2">이번 주 신규 고객</h3>
          
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
              <div className="h-5 w-24 bg-gray-200 rounded"></div>
            </div>
          ) : !activeBusiness?.place_id ? (
            <div className="text-gray-500">업체를 선택해주세요</div>
          ) : (
            <>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{clientCount !== null ? clientCount : '-'}</span>
                <span className="text-gray-500 ml-1">명</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                지난 7일 동안
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NewClientsCard;
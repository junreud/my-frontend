// filepath: /Users/junseok/Projects/my-frontend/src/components/Dashboard/KeywordRankingTable.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useBusinessSwitcher } from "@/hooks/useBusinessSwitcher";

const KeywordRankingTable: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [keywordData, setKeywordData] = useState<any[]>([]);
  const { activeBusiness } = useBusinessSwitcher();

  useEffect(() => {
    if (!activeBusiness?.place_id) {
      setLoading(false);
      return;
    }

    // Simulate API call to get keyword data
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock data for table
        const mockKeywords = [
          { id: 1, keyword: "신림헬스장", rank: 8, lastRank: 10, change: 2 },
          { id: 2, keyword: "신림PT", rank: 15, lastRank: 12, change: -3 },
          { id: 3, keyword: "신림피트니스", rank: 3, lastRank: 5, change: 2 },
          { id: 4, keyword: "강남헬스장", rank: 22, lastRank: 25, change: 3 },
          { id: 5, keyword: "서울헬스장", rank: 30, lastRank: 28, change: -2 },
        ];
        
        setKeywordData(mockKeywords);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [activeBusiness?.place_id]);

  // Show loading skeleton
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center p-3 rounded-md animate-pulse bg-gray-100">
            <div className="w-1/3 h-5 bg-gray-200 rounded mr-2"></div>
            <div className="w-16 h-5 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // Show placeholder if no business selected
  if (!activeBusiness?.place_id) {
    return (
      <div className="flex items-center justify-center h-[250px] border border-dashed border-gray-300 rounded-md">
        <div className="text-gray-500">먼저 업체를 선택해주세요</div>
      </div>
    );
  }

  // No data
  if (keywordData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] border border-dashed border-gray-300 rounded-md">
        <div className="text-gray-500">키워드 데이터가 없습니다</div>
      </div>
    );
  }

  // Show table with data
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">키워드</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">현재 순위</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">변화</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {keywordData.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap">{item.keyword}</td>
              <td className="px-4 py-3 whitespace-nowrap">{item.rank}위</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  item.change > 0 
                    ? 'bg-green-100 text-green-800' 
                    : item.change < 0 
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  {item.change > 0 ? `+${item.change}` : item.change}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KeywordRankingTable;
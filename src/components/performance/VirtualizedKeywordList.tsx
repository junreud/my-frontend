'use client';

import React, { useMemo, useCallback, memo } from 'react';
import { FixedSizeList as List, areEqual } from 'react-window';
import { Skeleton } from '@/components/ui/skeleton';
import KeywordRankingChart from '@/app/dashboard/marketing-keywords/KeywordRankingChart';
import { KeywordRankingDetail, KeywordHistoricalData, Business } from '@/types';
import { ChartDataItem } from '@/app/dashboard/marketing-keywords/KeywordRankingChart';

interface KeywordItemData {
  keywords: Array<{
    id: number;
    keyword: string;
    keywordId: string;
  }>;
  expandedIndex: number | null;
  onToggle: (index: number) => void;
  keywordRankingsMap: Map<string, { 
    details: KeywordRankingDetail[]; 
    historical: KeywordHistoricalData[] | ChartDataItem[] // Accept both types since they are structurally compatible
  }>;
  selectedBusiness: Business | null;
  historyData: KeywordHistoricalData[] | ChartDataItem[]; // Accept both types
  loadingHistory: boolean;
}

interface KeywordItemProps {
  index: number;
  style: React.CSSProperties;
  data: KeywordItemData;
}

/**
 * Individual keyword item component optimized for virtualization
 * Implements enterprise-level performance patterns used by Discord/Slack
 */
const KeywordItem = memo<KeywordItemProps>(({ index, style, data }) => {
  const {
    keywords,
    expandedIndex,
    onToggle,
    keywordRankingsMap,
    selectedBusiness,
    historyData,
    loadingHistory
  } = data;

  const keyword = keywords[index];
  const isExpanded = expandedIndex === index;

  // Memoize ranking data computation
  const rankingData = useMemo(() => {
    return keywordRankingsMap.get(keyword.keyword || "");
  }, [keywordRankingsMap, keyword.keyword]);

  const currentRanking = useMemo(() => {
    return rankingData?.historical && rankingData.historical.length > 0
      ? rankingData.historical[rankingData.historical.length - 1].ranking
      : null;
  }, [rankingData]);

  const handleToggle = useCallback(() => {
    onToggle(index);
  }, [onToggle, index]);

  return (
    <div style={style} className="px-2">
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <button
          onClick={handleToggle}
          className="w-full flex justify-between items-center p-4 text-left hover:bg-slate-50 transition-colors"
          aria-expanded={isExpanded}
          aria-controls={`keyword-content-${index}`}
        >
          <h3 className="text-md font-semibold text-slate-800">
            {keyword.keyword || "키워드 없음"} 
            <span className="text-sm font-normal text-slate-500 ml-2">
              (현재 {currentRanking !== null ? `${currentRanking}위` : '순위 정보 없음'})
            </span>
          </h3>
        </button>

        {isExpanded && (
          <div 
            id={`keyword-content-${index}`}
            className="p-4 border-t border-slate-200 bg-slate-50/70"
          >
            {loadingHistory ? (
              <div className="text-center py-8">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : historyData && historyData.length > 0 ? (
              <KeywordRankingChart
                chartData={historyData}
                activeBusiness={selectedBusiness}
              />
            ) : (
              <div className="text-center text-slate-500 py-8">
                <p className="text-lg">데이터 없음</p>
                <p className="text-sm">해당 키워드에 대한 차트 데이터가 없습니다.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}, areEqual);

KeywordItem.displayName = 'KeywordItem';

interface VirtualizedKeywordListProps {
  keywords: Array<{
    id: number;
    keyword: string;
    keywordId: string;
  }>;
  expandedIndex: number | null;
  onToggle: (index: number) => void;
  keywordRankingsMap: Map<string, { 
    details: KeywordRankingDetail[]; 
    historical: KeywordHistoricalData[] | ChartDataItem[] // Accept both types since they are structurally compatible
  }>;
  selectedBusiness: Business | null;
  historyData: KeywordHistoricalData[] | ChartDataItem[]; // Accept both types
  loadingHistory: boolean;
  height?: number;
  width?: string | number;
}

/**
 * Virtualized keyword list for handling thousands of keywords efficiently
 * Implements enterprise-level virtualization patterns
 */
export const VirtualizedKeywordList = memo<VirtualizedKeywordListProps>(({
  keywords,
  expandedIndex,
  onToggle,
  keywordRankingsMap,
  selectedBusiness,
  historyData,
  loadingHistory,
  height = 600,
  width = "100%"
}) => {
  // Use fixed item size for FixedSizeList
  const ITEM_SIZE = 120; // Fixed height for each item

  // Prepare data for virtualized list
  const itemData = useMemo<KeywordItemData>(() => ({
    keywords,
    expandedIndex,
    onToggle,
    keywordRankingsMap,
    selectedBusiness,
    historyData,
    loadingHistory
  }), [keywords, expandedIndex, onToggle, keywordRankingsMap, selectedBusiness, historyData, loadingHistory]);

  // Calculate total height for variable-sized list
  const totalHeight = useMemo(() => {
    return Math.min(height, keywords.length * 100); // Max height with fallback
  }, [height, keywords.length]);

  if (keywords.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <p className="text-lg">키워드가 없습니다.</p>
        <p className="text-sm">위에서 키워드를 추가하면 순위 변동 그래프를 볼 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Render virtualized list for performance */}
      {keywords.length > 20 ? (
        <List
          height={totalHeight}
          width={width}
          itemCount={keywords.length}
          itemSize={ITEM_SIZE}
          itemData={itemData}
          overscanCount={5} // Render extra items for smooth scrolling
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9'
          }}
        >
          {KeywordItem}
        </List>
      ) : (
        // For small lists, render normally to avoid virtualization overhead
        <div className="space-y-3">
          {keywords.map((keyword, index) => (
            <KeywordItem
              key={`${keyword.id}-${index}`}
              index={index}
              style={{}} // No positioning needed for non-virtualized
              data={itemData}
            />
          ))}
        </div>
      )}
    </div>
  );
});

VirtualizedKeywordList.displayName = 'VirtualizedKeywordList';

export default VirtualizedKeywordList;

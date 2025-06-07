import React, { useState } from 'react';
import { KeywordRankingTableProps, KeywordRankingDetail } from '@/types/index';
import VirtualizedTable from '@/components/VirtualizedTable';

const KeywordRankingTableVirtualized: React.FC<KeywordRankingTableProps> = ({
  isLoading,
  selectedKeyword,
  activeBusiness,
  isError,
  keywordData,
  historicalData,
  rangeValue,
}) => {
  const [usingFallbackData, setUsingFallbackData] = useState(false);

  // 최신 날짜의 데이터만 필터링하고 최대 순위까지만 순위 생성
  const latestData = React.useMemo(() => {
    if (!keywordData?.rankingDetails || keywordData.rankingDetails.length === 0) {
      return [];
    }
    
    // 날짜별로 그룹화
    const dateGroups: Record<string, KeywordRankingDetail[]> = keywordData.rankingDetails.reduce(
      (acc: Record<string, KeywordRankingDetail[]>, item: KeywordRankingDetail) => {
        const date = item.date_key || item.date;
        
        if (date) {
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(item);
        }
        return acc;
      },
      {} as Record<string, KeywordRankingDetail[]>
    );
    
    // 날짜를 기준으로 내림차순 정렬 (최신 날짜부터)
    const sortedDates = Object.keys(dateGroups).sort((a: string, b: string) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
    
    const todayDate = sortedDates[0];
    const yesterdayDate = sortedDates[1];
    
    const todayData = dateGroups[todayDate]?.sort(
      (a: KeywordRankingDetail, b: KeywordRankingDetail) => (a.ranking || 0) - (b.ranking || 0)
    ) || [];
    
    const yesterdayData = dateGroups[yesterdayDate]?.sort(
      (a: KeywordRankingDetail, b: KeywordRankingDetail) => (a.ranking || 0) - (b.ranking || 0)
    ) || [];
    
    // 데이터 불완전 여부 확인
    let dataToUse = todayData;
    let dateToUse = todayDate;
    
    if (yesterdayData.length > 0 && todayData.length < yesterdayData.length - 50) {
      dataToUse = yesterdayData;
      dateToUse = yesterdayDate;
      setUsingFallbackData(true);
    } else {
      setUsingFallbackData(false);
    }
    
    // 실제 데이터에 있는 최대 랭킹 찾기
    const actualMaxRank = dataToUse.length > 0
      ? Math.max(...dataToUse.map((item: KeywordRankingDetail) => item.ranking || 0))
      : 0;
    
    // 최대 300위까지만 표시하도록 제한
    const maxRankToShow = Math.min(actualMaxRank, 300);
    
    // 1부터 최대 순위까지 연속된 순위 배열 생성
    const rankingArray: number[] = maxRankToShow > 0
      ? Array.from({ length: maxRankToShow }, (_, i) => i + 1)
      : [];
    
    // 데이터의 순위 집합 생성
    const rankingDataMap = new Map<number, KeywordRankingDetail>();
    dataToUse.forEach((item: KeywordRankingDetail) => {
      if (item.ranking && item.ranking <= maxRankToShow) {
        rankingDataMap.set(item.ranking, item);
      }
    });

    // 각 순위에 데이터 매핑
    return rankingArray.map((rank: number) => {
      const dataForRank = rankingDataMap.get(rank);

      if (!dataForRank) {
        return { 
          id: `empty-${rank}`,
          keyword_id: 0,
          keyword: selectedKeyword || '',
          crawled_at: new Date().toISOString(),
          ranking: rank,
          place_id: `empty-${rank}`,
          date_key: dateToUse,
          place_name: '',
          category: '',
          blog_review_count: null,
          receipt_review_count: null,
          savedCount: null,
          keywordList: null
        } as KeywordRankingDetail;
      }

      return dataForRank;
    });
  }, [keywordData, selectedKeyword]);

  return (
    <div className="h-[500px]">
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <span className="loading loading-spinner loading-md"></span>
          <span className="ml-2">키워드 순위 데이터를 불러오는 중...</span>
        </div>
      ) : isError ? (
        <div className="flex justify-center items-center h-40 text-red-500">
          데이터를 불러오는 중 오류가 발생했습니다.
        </div>
      ) : latestData.length === 0 ? (
        <div className="flex justify-center items-center h-40 text-gray-500">
          데이터가 없습니다.
        </div>
      ) : (
        <div className="table-container">
          <div className="mb-2 text-sm font-medium text-gray-700">
            {rangeValue === 0 ? (
              <>
                {usingFallbackData ? '어제 기준 순위 (오늘 데이터 불완전)' : '오늘 기준 순위'}
              </>
            ) : (
              `오늘과 ${rangeValue}일 전 순위 비교`
            )}
            <span className="ml-2 text-xs text-gray-500">
              (총 {latestData.length}개 업체)
            </span>
            {usingFallbackData && (
              <span className="ml-2 px-2 py-0.5 text-xs text-red-600 bg-red-50 rounded-full">
                오늘 데이터 크롤링 문제로 어제 데이터를 표시합니다
              </span>
            )}
          </div>
          
          {/* 가상화된 테이블 */}
          <VirtualizedTable
            items={latestData}
            height={400}
            itemHeight={60}
            activeBusiness={activeBusiness as unknown as { place_id?: string | number; [key: string]: unknown } | undefined}
            historicalData={historicalData || undefined}
            keywordData={keywordData || undefined}
            rangeValue={rangeValue}
          />
        </div>
      )}
    </div>
  );
};

export default KeywordRankingTableVirtualized;

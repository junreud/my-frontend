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
  isRestaurantKeyword, // new prop
}) => {
  const [usingFallbackData, setUsingFallbackData] = useState(false);

  // 날짜 계산 함수
  const getTargetDateInfo = (rangeValue: number) => {
    if (rangeValue === 0) {
      return {
        displayText: "오늘 기준",
        fullDate: new Date().toLocaleDateString('ko-KR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      };
    }
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - rangeValue);
    
    return {
      displayText: `${rangeValue}일 전`,
      fullDate: targetDate.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };
  };

  // 최신 날짜의 데이터만 필터링하고 최대 순위까지만 순위 생성
  const latestData = React.useMemo(() => {
    console.log('[Debug] KeywordRankingTableVirtualized - Processing data:', {
      selectedKeyword,
      hasKeywordData: !!keywordData,
      rankingDetailsLength: keywordData?.rankingDetails?.length || 0
    });
    
    if (!keywordData?.rankingDetails || keywordData.rankingDetails.length === 0) {
      console.log('[Debug] No ranking details available');
      return [];
    }
    
    // 실제 데이터 구조 확인
    console.log('[Debug] First ranking detail item:', keywordData.rankingDetails[0]);
    console.log('[Debug] All ranking details fields:', Object.keys(keywordData.rankingDetails[0] || {}));
    
    // 날짜별로 그룹화
    const dateGroups: Record<string, KeywordRankingDetail[]> = keywordData.rankingDetails.reduce(
      (acc: Record<string, KeywordRankingDetail[]>, item: KeywordRankingDetail) => {
        // 여러 가능한 날짜 필드 시도
        const date = item.date_key || item.date || item.crawled_at?.split('T')[0];
        
        console.log('[Debug] Processing item for date grouping:', {
          item_keys: Object.keys(item),
          date_key: item.date_key,
          date: item.date,
          crawled_at: item.crawled_at,
          extracted_date: date
        });
        
        if (date) {
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(item);
        } else {
          console.warn('[Debug] No valid date found for item:', item);
        }
        return acc;
      },
      {} as Record<string, KeywordRankingDetail[]>
    );
    
    console.log('[Debug] Date groups created:', {
      totalGroups: Object.keys(dateGroups).length,
      dates: Object.keys(dateGroups),
      groupSizes: Object.keys(dateGroups).map(date => ({ date, count: dateGroups[date].length }))
    });
    
    // 날짜 그룹이 비어있으면 오늘 날짜로 fallback
    if (Object.keys(dateGroups).length === 0) {
      console.log('[Debug] No date groups found, using fallback with today date');
      const todayStr = new Date().toISOString().split('T')[0];
      dateGroups[todayStr] = keywordData.rankingDetails;
    }
    
    // 날짜를 기준으로 내림차순 정렬 (최신 날짜부터)
    const sortedDates = Object.keys(dateGroups).sort((a: string, b: string) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
    
    const todayDate = sortedDates[0];
    const yesterdayDate = sortedDates[1];
    
    console.log('[Debug] Date processing:', {
      sortedDates,
      todayDate,
      yesterdayDate
    });
    
    const todayData = dateGroups[todayDate]?.sort(
      (a: KeywordRankingDetail, b: KeywordRankingDetail) => (a.ranking || 0) - (b.ranking || 0)
    ) || [];
    
    const yesterdayData = dateGroups[yesterdayDate]?.sort(
      (a: KeywordRankingDetail, b: KeywordRankingDetail) => (a.ranking || 0) - (b.ranking || 0)
    ) || [];
    
    console.log('[Debug] Today/Yesterday data:', {
      todayDataLength: todayData.length,
      yesterdayDataLength: yesterdayData.length,
      todayDataSample: todayData.slice(0, 2).map(item => ({
        ranking: item.ranking,
        place_name: item.place_name,
        date_key: item.date_key
      }))
    });
    
    // 데이터 불완전 여부 확인
    let dataToUse = todayData;
    let dateToUse = todayDate;
    let isDataIncomplete = false;
    
    if (yesterdayData.length > 0 && todayData.length < yesterdayData.length - 50) {
      dataToUse = yesterdayData;
      dateToUse = yesterdayDate;
      isDataIncomplete = true;
      setUsingFallbackData(true);
    } else {
      setUsingFallbackData(false);
    }
    
    console.log('[Debug] Data selection:', {
      isDataIncomplete,
      dataToUseLength: dataToUse.length,
      dateToUse
    });
    
    // 실제 데이터에 있는 최대 랭킹 찾기
    const actualMaxRank = dataToUse.length > 0
      ? Math.max(...dataToUse.map((item: KeywordRankingDetail) => item.ranking || 0))
      : 0;
    
    console.log('[Debug] Ranking analysis:', {
      actualMaxRank,
      dataToUseLength: dataToUse.length,
      rankingsInData: dataToUse.map(item => item.ranking)
    });
    
    // 최대 300위까지만 표시하도록 제한
    const maxRankToShow = Math.min(actualMaxRank, 300);
    
    // 1부터 최대 순위까지 연속된 순위 배열 생성
    const rankingArray: number[] = maxRankToShow > 0
      ? Array.from({ length: maxRankToShow }, (_, i) => i + 1)
      : [];
    
    console.log('[Debug] Ranking array:', {
      maxRankToShow,
      rankingArrayLength: rankingArray.length,
      firstFewRanks: rankingArray.slice(0, 5)
    });
    
    // 데이터의 순위 집합 생성
    const rankingDataMap = new Map<number, KeywordRankingDetail>();
    dataToUse.forEach((item: KeywordRankingDetail) => {
      if (item.ranking && item.ranking <= maxRankToShow) {
        rankingDataMap.set(item.ranking, item);
      }
    });
    
    console.log('[Debug] Ranking data map:', {
      mapSize: rankingDataMap.size,
      mapKeys: Array.from(rankingDataMap.keys()),
      dataToUseItemsWithValidRanking: dataToUse.filter(item => item.ranking && item.ranking <= maxRankToShow).length
    });

    // 각 순위에 데이터 매핑
    const result = rankingArray.map((rank: number) => {
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

      // 같은 place_id를 가진 과거 데이터 찾기 (rangeValue 기반)
      let comparisonData = null;
      
      if (rangeValue > 0) {
        // rangeValue일 전의 날짜 계산
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - rangeValue);
        const targetDateString = targetDate.toISOString().split('T')[0];
        
        // 정확한 날짜부터 찾고, 없으면 가장 가까운 과거 데이터 찾기
        const candidateDates = keywordData.rankingDetails
          .filter((item: KeywordRankingDetail) => 
            item.place_id === dataForRank.place_id && 
            item.date_key && item.date_key <= targetDateString
          )
          .sort((a: KeywordRankingDetail, b: KeywordRankingDetail) => 
            new Date(b.date_key!).getTime() - new Date(a.date_key!).getTime()
          );
        
        comparisonData = candidateDates[0] || null;
      } else if (isDataIncomplete) {
        // rangeValue가 0이고 데이터가 불완전한 경우, 오늘 데이터와 비교
        comparisonData = todayData.find((item: KeywordRankingDetail) => 
          item.place_id === dataForRank.place_id
        );
      } else {
        // rangeValue가 0이면 비교 데이터 없음 (현재 데이터만 표시)
        comparisonData = null;
      }

      // 데이터에 비교 정보 추가
      return {
        ...dataForRank,
        comparisonData // 비교 데이터를 추가로 포함
      };
    });
    
    console.log('[Debug] KeywordRankingTableVirtualized - Final processed data:', {
      selectedKeyword,
      latestDataLength: result.length,
      firstFewItems: result.slice(0, 3).map(item => ({
        ranking: item.ranking,
        place_id: item.place_id,
        place_name: item.place_name
      }))
    });
    
    return result;
  }, [keywordData, selectedKeyword, rangeValue]);

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
                {usingFallbackData ? 
                  `어제 기준 순위 (${getTargetDateInfo(1).fullDate}) - 오늘 데이터 불완전` : 
                  `${getTargetDateInfo(0).displayText} 순위 (${getTargetDateInfo(0).fullDate})`
                }
              </>
            ) : (
              <>
                {`${getTargetDateInfo(rangeValue).displayText} 순위 (${getTargetDateInfo(rangeValue).fullDate})`}
              </>
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
            height={550}
            itemHeight={52}
            activeBusiness={activeBusiness as unknown as { place_id?: string | number; [key: string]: unknown } | undefined}
            historicalData={historicalData || undefined}
            keywordData={keywordData || undefined}
            rangeValue={rangeValue}
            isRestaurantKeyword={isRestaurantKeyword}
          />
        </div>
      )}
    </div>
  );
};

export default KeywordRankingTableVirtualized;

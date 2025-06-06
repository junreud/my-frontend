import React, { useState, useEffect, useRef } from 'react';
import { NumberChangeIndicator } from '@/components/ui/NumberChangeIndicator';
import { KeywordRankingTableProps, KeywordRankingDetail } from '@/types/index';

const KeywordRankingTable: React.FC<KeywordRankingTableProps> = ({
  isLoading,
  selectedKeyword,
  activeBusiness,
  isError,
  keywordData,
  historicalData,
  rangeValue,
}) => {
  const [visibleItems, setVisibleItems] = useState(100); // 처음에 100개 항목만 표시
  const loaderRef = useRef<HTMLDivElement>(null); // 로더 요소에 대한 참조
  const [usingFallbackData, setUsingFallbackData] = useState(false); // 어제 데이터 사용 여부

  // 최신 날짜의 데이터만 필터링하고 최대 순위까지만 순위 생성
  const latestData = React.useMemo(() => {
    if (!keywordData?.rankingDetails || keywordData.rankingDetails.length === 0) {
      return [];
    }
    
    // 날짜별로 그룹화
    const dateGroups: Record<string, KeywordRankingDetail[]> = keywordData.rankingDetails.reduce(
      (acc: Record<string, KeywordRankingDetail[]>, item: KeywordRankingDetail) => {
        // date_key가 undefined일 경우에 대한 처리 추가
        const date = item.date_key || item.date;
        
        // undefined나 null이 아닌 경우에만 처리
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
    
    // 최신 날짜(오늘)와 그 다음 최신 날짜(어제) 가져오기
    const todayDate = sortedDates[0];
    const yesterdayDate = sortedDates[1];
    
    console.log('오늘 날짜:', todayDate);
    console.log('어제 날짜:', yesterdayDate);
    
    // 오늘과 어제 데이터 각각 정렬
    const todayData = dateGroups[todayDate]?.sort(
      (a: KeywordRankingDetail, b: KeywordRankingDetail) => (a.ranking || 0) - (b.ranking || 0)
    ) || [];
    
    const yesterdayData = dateGroups[yesterdayDate]?.sort(
      (a: KeywordRankingDetail, b: KeywordRankingDetail) => (a.ranking || 0) - (b.ranking || 0)
    ) || [];
    
    console.log('오늘 데이터 개수:', todayData.length);
    console.log('어제 데이터 개수:', yesterdayData.length);
    
    // 데이터 불완전 여부 확인 (오늘 데이터가 어제보다 50개 이상 적으면 불완전으로 판단)
    let isDataIncomplete = false;
    let dataToUse = todayData;
    let dateToUse = todayDate;
    
    if (yesterdayData.length > 0 && todayData.length < yesterdayData.length - 50) {
      console.warn('데이터 불완전 감지: 오늘 데이터가 어제보다 50개 이상 적음', {
        today: todayData.length,
        yesterday: yesterdayData.length,
        diff: yesterdayData.length - todayData.length
      });
      isDataIncomplete = true;
      dataToUse = yesterdayData; // 어제 데이터 사용
      dateToUse = yesterdayDate;
      setUsingFallbackData(true); // 어제 데이터 사용 상태 설정
    } else {
      setUsingFallbackData(false);
    }
    
    // 실제 데이터에 있는 최대 랭킹 찾기
    const actualMaxRank = dataToUse.length > 0
      ? Math.max(...dataToUse.map((item: KeywordRankingDetail) => item.ranking || 0))
      : 0;
    
    console.log('실제 최대 순위:', actualMaxRank);
    
    // 최대 300위까지만 표시하도록 제한 (기본값은 데이터의 최대 순위)
    const maxRankToShow = Math.min(actualMaxRank, 300);
    
    // 1부터 최대 순위까지 연속된 순위 배열 생성
    const rankingArray: number[] = maxRankToShow > 0
      ? Array.from({ length: maxRankToShow }, (_, i) => i + 1)
      : [];
    
    // 데이터의 순위 집합 생성 (자료구조를 Map으로 변경하여 빠르게 데이터 lookup 가능)
    const rankingDataMap = new Map<number, KeywordRankingDetail>();
    dataToUse.forEach((item: KeywordRankingDetail) => {
      if (item.ranking && item.ranking <= maxRankToShow) {
        rankingDataMap.set(item.ranking, item);
      }
    });
    
    // 디버깅: 데이터 통계 확인
    console.log('데이터 최대 순위:', maxRankToShow);
    console.log('기존 데이터 수:', dataToUse.length);
    console.log('매핑된 순위 수:', rankingDataMap.size);
    
    // 비어있는 순위 개수
    const missingRanks = rankingArray.filter(rank => !rankingDataMap.has(rank));
    console.log('비어있는 순위 개수:', missingRanks.length);
    
    // 연속된 비어있는 순위 범위 찾기 (100개 이상 연속 누락 확인용)
    let missingRangeStart = -1;
    const significantMissingRanges = [];
    
    for (let rank = 1; rank <= maxRankToShow; rank++) {
      if (!rankingDataMap.has(rank)) {
        if (missingRangeStart === -1) {
          missingRangeStart = rank;
        }
      } else if (missingRangeStart !== -1) {
        const rangeSize = rank - missingRangeStart;
        if (rangeSize >= 20) { // 20위 이상 연속으로 비어있는 경우 기록
          significantMissingRanges.push({
            start: missingRangeStart,
            end: rank - 1,
            size: rangeSize
          });
        }
        missingRangeStart = -1;
      }
    }
    
    // 마지막 범위 확인
    if (missingRangeStart !== -1) {
      const rangeSize = maxRankToShow + 1 - missingRangeStart;
      if (rangeSize >= 20) {
        significantMissingRanges.push({
          start: missingRangeStart,
          end: maxRankToShow,
          size: rangeSize
        });
      }
    }
    
    console.log('큰 누락 범위:', significantMissingRanges);

    // 각 순위에 데이터 매핑
    return rankingArray.map((rank: number) => {
      // 현재 순위에 데이터가 있는지 확인 (이제 Map을 사용하여 O(1) 시간에 검색)
      const dataForRank = rankingDataMap.get(rank);

      // 순위에 데이터가 없는 경우
      if (!dataForRank) {
        return { 
          id: `empty-${rank}`, // 누락된 필수 속성 추가
          keyword_id: 0,       // 누락된 필수 속성 추가
          keyword: selectedKeyword || '', // 누락된 필수 속성 추가
          crawled_at: new Date().toISOString(), // 누락된 필수 속성 추가
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

      // 같은 place_id를 가진 과거 데이터 찾기
      // 만약 어제 데이터를 사용 중이라면, 오늘 데이터에서 비교 데이터 찾기
      let comparisonData = null;
      if (isDataIncomplete) {
        comparisonData = todayData.find((item: KeywordRankingDetail) => 
          item.place_id === dataForRank.place_id
        );
      } else {
        // 오늘 데이터를 사용 중이라면, 과거 데이터에서 비교 데이터 찾기
        comparisonData = keywordData.rankingDetails.filter((item: KeywordRankingDetail) => 
          item.place_id === dataForRank.place_id && 
          item.date_key !== todayDate
        ).sort((a: KeywordRankingDetail, b: KeywordRankingDetail) => 
          new Date(b.date_key).getTime() - new Date(a.date_key).getTime()
        )[0] || null;
      }

      // 데이터 조합
      return {
        ...dataForRank,
        blog_review_count: dataForRank.blog_review_count ?? comparisonData?.blog_review_count ?? null,
        receipt_review_count: dataForRank.receipt_review_count ?? comparisonData?.receipt_review_count ?? null,
        savedCount: dataForRank.savedCount ?? comparisonData?.savedCount ?? null,
      };
    });
  }, [keywordData, selectedKeyword]); // ✅ selectedKeyword 추가
  
  // 디버깅: 데이터 로드 후 로그 추가
  useEffect(() => {
    console.log('최신 데이터 총 개수:', latestData.length);
    console.log('어제 데이터 사용 여부:', usingFallbackData);
    
    const emptyRows = latestData.filter((item: KeywordRankingDetail) => 
      typeof item.place_id === 'string' && (item.place_id as string).startsWith('empty-')
    );
    console.log('빈 행 개수:', emptyRows.length);
    
    // 빈 구간 분석
    const emptyRanges: string[] = [];
    let startEmpty = -1;
    
    for (let i = 0; i < latestData.length; i++) {
      const isEmpty = typeof latestData[i].place_id === 'string' && 
                     (latestData[i].place_id as string).startsWith('empty-');
      
      if (isEmpty && startEmpty === -1) {
        startEmpty = i + 1; // 순위는 1부터 시작
      } else if (!isEmpty && startEmpty !== -1) {
        emptyRanges.push(`${startEmpty}-${i}`);
        startEmpty = -1;
      }
    }
    
    if (startEmpty !== -1) {
      emptyRanges.push(`${startEmpty}-${latestData.length}`);
    }
    
    console.log('빈 구간:', emptyRanges);
  }, [latestData, usingFallbackData]);

  // Intersection Observer 설정 (스크롤 감지용)
  useEffect(() => {
    const currentLoaderRef = loaderRef.current;
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        if (entries[0].isIntersecting && visibleItems < latestData.length) {
          // 더 많은 항목 로드 (최대 100개씩)
          setVisibleItems(prev => Math.min(prev + 100, latestData.length));
        }
      },
      { threshold: 0.1 }
    );
    
    if (currentLoaderRef) {
      observer.observe(currentLoaderRef);
    }
    
    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
    };
  }, [visibleItems, latestData]);

  // 추가된 useEffect
  useEffect(() => {
    console.log('KeywordRankingTable 상태:', {
      isLoading,
      isError,
      selectedKeyword,
      rangeValue,
      rowCount: latestData.length,
      usingFallbackData
    });
  }, [isLoading, isError, selectedKeyword, rangeValue, latestData, usingFallbackData]);

  useEffect(() => {
    console.log('[Debug] KeywordRankingTable:', {
      isLoading,
      isError,
      selectedKeyword,
      rangeValue,
      rowCount: latestData.length
    });
  }, [isLoading, isError, selectedKeyword, rangeValue, latestData]);

  // 보여줄 데이터
  const visibleData = latestData.slice(0, visibleItems);
  
  return (
    <div className="overflow-x-auto">
      {isLoading ? (
        <div className="loading">데이터를 불러오는 중...</div>
      ) : !selectedKeyword || !activeBusiness ? (
        <div className="select-message">키워드를 선택해주세요.</div>
      ) : isError ? (
        <div className="error-message">데이터를 가져오는 중 오류가 발생했습니다.</div>
      ) : latestData.length === 0 ? (
        <div className="empty-message">해당 키워드에 대한 데이터가 없습니다.</div>
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
          <table className="table table-xs w-full table-fixed">
            <thead className="sticky top-0 bg-white z-10">
              <tr>
                <th className="w-[8%]">순위</th>
                <th className="w-[30%]">업체명</th>
                <th className="w-[22%]">업종</th>
                <th className="w-[14%]">블로그리뷰</th>
                <th className="w-[14%]">영수증리뷰</th>
               </tr>
             </thead>
             <tbody>
               {visibleData.map((item: KeywordRankingDetail, index: number) => {
                // 빈 순위인지 확인 (타입 단언 추가)
                const isEmpty = typeof item.place_id === 'string' && 
                               (item.place_id as string).startsWith('empty-');

                // 과거 데이터에서 해당 업체 찾기
                const pastData = !isEmpty && historicalData && keywordData
                ? keywordData.rankingDetails.find((d: KeywordRankingDetail) => 
                    d.place_id === item.place_id && 
                    d.date_key === historicalData[0]?.date_key // 배열의 첫 번째 요소 사용
                  )
                : null;

                const normalizedUrl = `https://m.place.naver.com/place/${item.place_id}/home`;
                  
                return (
                    <tr
                    key={item.place_id || item.id || `${item.keyword_id}-${item.ranking}` || index}
                    className={`
                      hover:bg-gray-100
                      ${isEmpty ? "bg-gray-50 text-gray-300"
                        : String(item.place_id) === String(activeBusiness?.place_id) 
                          ? "bg-yellow-200 font-semibold"
                          : ""
                      }
                    `}>
                    <td className="w-[8%] text-center">
                      <div className="flex items-center">
                        {/* 순위는 항상 왼쪽에 고정 배치하고, 변화량은 오른쪽에 배치 */}
                        <div className="min-w-[24px] text-right pr-2">{item.ranking}</div>
                        <div className="flex-grow">
                          {rangeValue > 0 && !isEmpty && (
                            <NumberChangeIndicator 
                              current={item.ranking} 
                              past={pastData?.ranking}
                              invert={true}
                              formatter={(val: number | null | undefined) => {
                                if (val === null || val === undefined) return '';
                                return val.toString();
                              }}
                              hideWhenNoChange={true}
                            />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="w-[30%]">
                      {isEmpty ? '-' : (
                        <>
                          <a 
                            href={normalizedUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-black hover:underline"
                          >
                            {item.place_name}
                          </a>
                          {String(item.place_id) === String(activeBusiness?.place_id) && (
                            <span className="ml-2 px-3 py-0.5 text-xs bg-primary-500 text-red-500 rounded-sm">내 업체</span>
                          )}
                        </>
                      )}
                    </td>
                    <td className="w-[22%]">{isEmpty ? '-' : item.category}</td>
                    <td className="w-[14%]">
                      {isEmpty ? '-' : (
                        <div className="flex items-center">
                          <span className="min-w-[24px] text-center">{item.blog_review_count ?? '-'}</span>
                          <NumberChangeIndicator 
                            current={item.blog_review_count} 
                            past={pastData?.blog_review_count}
                            formatter={(val: number | null | undefined) => {
                              if (val === null || val === undefined) return '';
                              return val.toString(); // 리뷰 변화량 숫자 표시
                            }}
                            hideWhenNoChange={true} // 변화 없을 때 표시 안함
                          />
                        </div>
                      )}
                    </td>
                    <td className="w-[14%]">
                      {isEmpty ? '-' : (
                        <div className="flex items-center">
                          <span className="min-w-[24px] text-center">{item.receipt_review_count ?? '-'}</span>
                          <NumberChangeIndicator 
                            current={item.receipt_review_count} 
                            past={pastData?.receipt_review_count}
                            formatter={(val: number | null | undefined): string => {
                              if (val === null || val === undefined) return '';
                              return val.toString(); // 리뷰 변화량 숫자 표시
                            }}
                            hideWhenNoChange={true}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* 스크롤 로더 */}
          {visibleItems < latestData.length && (
            <div ref={loaderRef} className="py-4 text-center text-gray-500 text-sm">
              스크롤하여 더 보기...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KeywordRankingTable;
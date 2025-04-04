import React, { useState, useEffect, useRef } from 'react';
import { NumberChangeIndicator } from '@/components/NumberChangeIndicator';
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

  // 최신 날짜의 데이터만 필터링하고 최대 순위까지만 순위 생성
  const latestData = React.useMemo(() => {
    if (!keywordData?.rankingDetails || keywordData.rankingDetails.length === 0) {
      return [];
    }
    
    // 날짜별로 그룹화
    const dateGroups: Record<string, KeywordRankingDetail[]> = keywordData.rankingDetails.reduce(
      (acc: Record<string, KeywordRankingDetail[]>, item: KeywordRankingDetail) => {
        const date = item.date_key;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(item);
        return acc;
      },
      {} as Record<string, KeywordRankingDetail[]>
    );
    
    // 최신 날짜 찾기 (날짜 정렬 수정)
    const latestDate = Object.keys(dateGroups).sort((a: string, b: string) => {
      return new Date(b).getTime() - new Date(a).getTime(); // 최신 날짜가 첫 번째로 오도록 정렬
    })[0]; // 가장 최신 날짜를 가져옴

    // 디버깅: 최신 날짜와 해당 데이터 확인
    console.log('최신 날짜:', latestDate);
    console.log('해당 날짜의 데이터 개수:', dateGroups[latestDate]?.length || 0);

    // 최신 날짜의 데이터
    const latestDateData = dateGroups[latestDate]?.sort(
      (a: KeywordRankingDetail, b: KeywordRankingDetail) => (a.ranking || 0) - (b.ranking || 0)
    ) || [];
    
    // 실제 데이터에 있는 최대 랭킹 찾기 (300위 고정이 아니라 실제 데이터 기반)
    const actualMaxRank = latestDateData.length > 0
      ? Math.max(...latestDateData.map((item: KeywordRankingDetail) => item.ranking || 0))
      : 0;
    
    console.log('실제 최대 순위:', actualMaxRank);
    
    // 실제 데이터에 있는 최대 랭킹까지만 배열 생성 (300위 고정이 아님)
    const rankingArray: number[] = actualMaxRank > 0
      ? Array.from({ length: actualMaxRank }, (_, i) => i + 1)
      : [];
    
    // 최신 데이터의 순위 집합 생성
    const rankingsInLatestData = new Set(latestDateData.map((item: KeywordRankingDetail) => item.ranking));
    
    // 디버깅: 누락된 순위 확인
    const allRanks = new Set(rankingArray);
    const missingRanks = [...allRanks].filter((r: number) => !rankingsInLatestData.has(r));
    console.log('비어있는 순위 개수:', missingRanks.length);
    console.log('비어있는 순위 샘플:', missingRanks.slice(0, 10));

    // 각 순위에 데이터 매핑
    return rankingArray.map((rank: number) => {
      // 현재 순위에 데이터가 있는지 확인
      const todayDataForRank = latestDateData.find(
        (item: KeywordRankingDetail) => item.ranking === rank
      );

      // 순위에 데이터가 없는 경우
      if (!todayDataForRank) {
        return { 
          ranking: rank,
          place_id: `empty-${rank}`,
          date_key: latestDate,
          place_name: '',
          category: '',
          blog_review_count: null,
          receipt_review_count: null,
          savedCount: null,
          keywordList: null
        } as KeywordRankingDetail;
      }

      // 같은 place_id를 가진 과거 데이터 모두 찾기
      const pastDataItems = keywordData.rankingDetails.filter((item: KeywordRankingDetail) => 
        item.place_id === todayDataForRank.place_id && 
        item.date_key !== latestDate
      ).sort((a: KeywordRankingDetail, b: KeywordRankingDetail) => new Date(b.date_key).getTime() - new Date(a.date_key).getTime()); // 최신순 정렬

      // 최신 과거 데이터를 fallback으로 사용
      const recentPastData = pastDataItems[0] || null;

      // 오늘 basic + 어제 detail 데이터 조합
      return {
        ...todayDataForRank,
        blog_review_count: todayDataForRank.blog_review_count ?? recentPastData?.blog_review_count ?? null,
        receipt_review_count: todayDataForRank.receipt_review_count ?? recentPastData?.receipt_review_count ?? null,
        savedCount: todayDataForRank.savedCount ?? recentPastData?.savedCount ?? null,
      };
    });
  }, [keywordData]);

  // 디버깅: 데이터 로드 후 로그 추가
  useEffect(() => {
    console.log('최신 데이터 총 개수:', latestData.length);
    
    const emptyRows = latestData.filter((item: KeywordRankingDetail) => 
      typeof item.place_id === 'string' && item.place_id.startsWith('empty-')
    );
    console.log('빈 행 개수:', emptyRows.length);
    
    // 빈 구간 분석
    const emptyRanges: string[] = [];
    let startEmpty = -1;
    
    for (let i = 0; i < latestData.length; i++) {
      const isEmpty = typeof latestData[i].place_id === 'string' && 
                      latestData[i].place_id.startsWith('empty-');
      
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
  }, [latestData]);

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
      rowCount: latestData.length
    });
  }, [isLoading, isError, selectedKeyword, rangeValue, latestData]);

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
            {rangeValue === 0 ? '오늘 기준 순위' : `오늘과 ${rangeValue}일 전 순위 비교`}
            <span className="ml-2 text-xs text-gray-500">
              (총 {latestData.length}개 업체)
            </span>
          </div>
          <table className="table table-xs">
            <thead className="sticky top-0 bg-white z-10">
              <tr>
                <th>순위</th>
                <th>업체명</th>
                <th>업종</th>
                <th>블로그리뷰</th>
                <th>영수증리뷰</th>
                <th>저장수</th>
              </tr>
            </thead>
            <tbody>
              {visibleData.map((item: KeywordRankingDetail) => {
                // 빈 순위인지 확인
                const isEmpty = typeof item.place_id === 'string' && item.place_id.startsWith('empty-');

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
                    key={item.place_id}
                    className={`
                      hover:bg-gray-100
                      ${isEmpty ? "bg-gray-50 text-gray-300"
                        : String(item.place_id) === String(activeBusiness?.place_id) 
                          ? "bg-yellow-200 font-semibold"
                          : ""
                      }
                    `}>
                    <th>{item.ranking}</th>
                    <td>
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
                    <td>{isEmpty ? '-' : item.category}</td>
                    <td>
                      {isEmpty ? '-' : (
                        <NumberChangeIndicator 
                          current={item.blog_review_count} 
                          past={pastData?.blog_review_count}
                          formatter={(val: number | null | undefined) => {
                            if (val == null) return '-'; // null이면 '-' 표시
                            return val.toString();
                          }}
                        />
                      )}
                    </td>
                    <td>
                      {isEmpty ? '-' : (
                        <NumberChangeIndicator 
                          current={item.receipt_review_count} 
                          past={pastData?.receipt_review_count}
                          formatter={(val: number | null | undefined) => {
                            if (val == null) return '-'; // null이면 '-' 표시
                            return val.toString();
                          }}
                        />
                      )}
                    </td>
                    <td>
                      {isEmpty ? '-' : (
                        <NumberChangeIndicator 
                          current={item.savedCount} 
                          past={pastData?.savedCount}
                          formatter={(val: number | null | undefined) => {
                            if (val == null) return '-'; // null이면 '-' 표시
                            return val.toString();
                          }}
                        />
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
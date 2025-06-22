import React, { useMemo } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { NumberChangeIndicator } from '@/components/ui/NumberChangeIndicator';
import { KeywordRankingDetail, KeywordHistoricalData, KeywordRankingData } from '@/types/index';

interface VirtualizedTableProps {
  items: KeywordRankingDetail[];
  height: number;
  itemHeight: number;
  activeBusiness?: { place_id?: string | number; [key: string]: unknown };
  historicalData?: KeywordHistoricalData[] | null;
  keywordData?: KeywordRankingData;
  rangeValue: number;
  isRestaurantKeyword?: boolean;
}

interface RowData {
  items: KeywordRankingDetail[];
  activeBusiness?: { place_id?: string | number; [key: string]: unknown };
  historicalData?: KeywordHistoricalData[] | null;
  keywordData?: KeywordRankingData;
  rangeValue: number;
  isRestaurantKeyword?: boolean;
}

const TableRow: React.FC<ListChildComponentProps<RowData>> = ({ index, style, data }) => {
  const { items, activeBusiness, keywordData, rangeValue, isRestaurantKeyword } = data;
  const item = items[index];

  // 디버깅: 첫 번째 몇 개 항목의 데이터 확인
  if (index < 3) {
    console.log(`[Debug] TableRow ${index} 상세:`, {
      place_name: item.place_name,
      category: item.category,
      place_id: item.place_id,
      ranking: item.ranking,
      isEmpty: typeof item.place_id === 'string' && (item.place_id as string).startsWith('empty-'),
      전체_키들: Object.keys(item),
      place_name_타입: typeof item.place_name,
      place_name_길이: item.place_name ? item.place_name.length : 0,
      category_타입: typeof item.category,
      category_길이: item.category ? item.category.length : 0
    });
  }

  // 빈 순위인지 확인
  const isEmpty = typeof item.place_id === 'string' && 
                  (item.place_id as string).startsWith('empty-');

  // 과거 데이터에서 해당 업체 찾기 (rangeValue 기반)
  let pastData = null;
  
  if (!isEmpty && rangeValue > 0 && keywordData) {
    // rangeValue일 전의 날짜 계산
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - rangeValue);
    const targetDateString = targetDate.toISOString().split('T')[0];
    
    // 정확한 날짜부터 찾고, 없으면 가장 가까운 과거 데이터 찾기
    const candidateDates = keywordData.rankingDetails
      .filter((d: KeywordRankingDetail) => 
        d.place_id === item.place_id && 
        d.date_key <= targetDateString
      )
      .sort((a: KeywordRankingDetail, b: KeywordRankingDetail) => 
        new Date(b.date_key).getTime() - new Date(a.date_key).getTime()
      );
    
    pastData = candidateDates[0] || null;
  }

  const normalizedUrl = `https://m.place.naver.com/place/${item.place_id}/home`;

  return (
    <div style={style} className="flex border-b border-gray-200 hover:bg-gray-50 min-h-[48px]">
      <div 
        className={`flex w-full items-center ${
          isEmpty ? "bg-gray-50 text-gray-400"
            : String(item.place_id) === String(activeBusiness?.place_id) 
              ? "bg-yellow-100 font-medium"
              : "bg-white"
        }`}
      >
        {/* 순위 컬럼 */}
        <div className="w-[8%] px-2 py-2 text-center flex items-center justify-center">
          <div className="flex items-center">
            <span className="text-sm font-medium mr-1">{item.ranking}</span>
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

        {/* 업체명 컬럼 */}
        <div className="w-[32%] px-2 py-2 flex items-center relative overflow-hidden">
          {isEmpty ? (
            <span className="text-gray-400">-</span>
          ) : (
            <>
              <a 
                href={normalizedUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`text-blue-600 hover:text-blue-800 hover:underline text-sm block truncate flex-1 ${
                  String(item.place_id) === String(activeBusiness?.place_id) ? 'pr-14' : ''
                }`}
                title={item.place_name}
              >
                {item.place_name || `업체_${item.place_id}`}
              </a>
              {String(item.place_id) === String(activeBusiness?.place_id) && (
                <span 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-1.5 py-0.5 text-xs bg-yellow-200 text-yellow-800 rounded whitespace-nowrap font-medium z-10"
                  style={{
                    fontSize: '10px',
                    lineHeight: '1.2'
                  }}
                >
                  내 업체
                </span>
              )}
            </>
          )}
        </div>

        {/* 업종 컬럼 */}
        <div className="w-[18%] px-2 py-2 flex items-center">
          <span className="text-xs text-gray-600 truncate">
            {isEmpty ? '-' : (item.category || '미분류')}
          </span>
        </div>

        {/* 블로그리뷰 컬럼 */}
        <div className="w-[14%] px-2 py-2 flex items-center justify-center">
          {isEmpty ? (
            <span className="text-gray-400">-</span>
          ) : (
            <div className="flex items-center">
              <span className="text-sm mr-1">{item.blog_review_count ?? '-'}</span>
              {rangeValue > 0 && (
                <NumberChangeIndicator 
                  current={item.blog_review_count} 
                  past={pastData?.blog_review_count}
                  formatter={(val: number | null | undefined) => {
                    if (val === null || val === undefined) return '';
                    return val.toString();
                  }}
                  hideWhenNoChange={true}
                />
              )}
            </div>
          )}
        </div>

        {/* 영수증리뷰 컬럼 */}
        <div className="w-[14%] px-2 py-2 flex items-center justify-center">
          {isEmpty ? (
            <span className="text-gray-400">-</span>
          ) : (
            <div className="flex items-center">
              <span className="text-sm mr-1">{item.receipt_review_count ?? '-'}</span>
              {rangeValue > 0 && (
                <NumberChangeIndicator 
                  current={item.receipt_review_count} 
                  past={pastData?.receipt_review_count}
                  formatter={(val: number | null | undefined): string => {
                    if (val === null || val === undefined) return '';
                    return val.toString();
                  }}
                  hideWhenNoChange={true}
                />
              )}
            </div>
          )}
        </div>
        
        {/* 저장수 컬럼 (레스토랑 키워드용) */}
        {isRestaurantKeyword && (
          <div className="w-[14%] px-2 py-2 flex items-center justify-center">
            {isEmpty ? (
              <span className="text-gray-400">-</span>
            ) : (
              <div className="flex items-center">
                <span className="text-sm mr-1">
                  {item.savedCount ?? item.saved_count ?? item.saved ?? '-'}
                </span>
                {rangeValue > 0 && (
                  <NumberChangeIndicator
                    current={item.savedCount ?? item.saved_count ?? item.saved}
                    past={pastData?.savedCount ?? pastData?.saved_count ?? pastData?.saved}
                    formatter={(val: number | null | undefined) => val != null ? val.toString() : ''}
                    hideWhenNoChange={true}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const VirtualizedTable: React.FC<VirtualizedTableProps> = ({
  items,
  height = 500,
  itemHeight = 60,
  activeBusiness,
  historicalData,
  keywordData,
  rangeValue,
  isRestaurantKeyword
}) => {
  const itemData = useMemo(
    () => ({
      items,
      activeBusiness,
      historicalData,
      keywordData,
      rangeValue,
      isRestaurantKeyword
    }),
    [items, activeBusiness, historicalData, keywordData, rangeValue, isRestaurantKeyword]
  );

  return (
    <div className="virtualized-table">
      {/* 테이블 헤더 */}
      <div className="flex border-b-2 border-gray-300 bg-gray-50 sticky top-0 z-10 font-semibold text-sm min-h-[44px]">
        <div className="w-[8%] px-2 py-3 text-center flex items-center justify-center">순위</div>
        <div className="w-[32%] px-2 py-3 flex items-center">업체명</div>
        <div className="w-[18%] px-2 py-3 flex items-center">업종</div>
        <div className="w-[14%] px-2 py-3 text-center flex items-center justify-center">블로그리뷰</div>
        <div className="w-[14%] px-2 py-3 text-center flex items-center justify-center">영수증리뷰</div>
        {isRestaurantKeyword && <div className="w-[14%] px-2 py-3 text-center flex items-center justify-center">저장수</div>}
      </div>

      {/* 가상화된 테이블 본문 */}
      <List
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        itemData={itemData}
        width="100%"
      >
        {TableRow}
      </List>
    </div>
  );
};

export default VirtualizedTable;

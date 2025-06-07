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
}

interface RowData {
  items: KeywordRankingDetail[];
  activeBusiness?: { place_id?: string | number; [key: string]: unknown };
  historicalData?: KeywordHistoricalData[] | null;
  keywordData?: KeywordRankingData;
  rangeValue: number;
}

const TableRow: React.FC<ListChildComponentProps<RowData>> = ({ index, style, data }) => {
  const { items, activeBusiness, historicalData, keywordData, rangeValue } = data;
  const item = items[index];

  // 빈 순위인지 확인
  const isEmpty = typeof item.place_id === 'string' && 
                  (item.place_id as string).startsWith('empty-');

  // 과거 데이터에서 해당 업체 찾기
  const pastData = !isEmpty && historicalData && keywordData
    ? keywordData.rankingDetails.find((d: KeywordRankingDetail) => 
        d.place_id === item.place_id && 
        d.date_key === historicalData[0]?.date_key
      )
    : null;

  const normalizedUrl = `https://m.place.naver.com/place/${item.place_id}/home`;

  return (
    <div style={style} className="flex border-b border-gray-200 hover:bg-gray-100">
      <div 
        className={`flex w-full items-center ${
          isEmpty ? "bg-gray-50 text-gray-300"
            : String(item.place_id) === String(activeBusiness?.place_id) 
              ? "bg-yellow-200 font-semibold"
              : ""
        }`}
      >
        {/* 순위 컬럼 */}
        <div className="w-[8%] px-3 py-2 text-center">
          <div className="flex items-center">
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
        </div>

        <div className="w-[30%] px-3 py-2">
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
                <span className="ml-2 px-3 py-0.5 text-xs bg-primary-500 text-red-500 rounded-sm">
                  내 업체
                </span>
              )}
            </>
          )}
        </div>

        {/* 업종 컬럼 */}
        <div className="w-[22%] px-3 py-2">
          {isEmpty ? '-' : item.category}
        </div>

        {/* 블로그리뷰 컬럼 */}
        <div className="w-[14%] px-3 py-2">
          {isEmpty ? '-' : (
            <div className="flex items-center">
              <span className="min-w-[24px] text-center">{item.blog_review_count ?? '-'}</span>
              <NumberChangeIndicator 
                current={item.blog_review_count} 
                past={pastData?.blog_review_count}
                formatter={(val: number | null | undefined) => {
                  if (val === null || val === undefined) return '';
                  return val.toString();
                }}
                hideWhenNoChange={true}
              />
            </div>
          )}
        </div>

        {/* 영수증리뷰 컬럼 */}
        <div className="w-[14%] px-3 py-2">
          {isEmpty ? '-' : (
            <div className="flex items-center">
              <span className="min-w-[24px] text-center">{item.receipt_review_count ?? '-'}</span>
              <NumberChangeIndicator 
                current={item.receipt_review_count} 
                past={pastData?.receipt_review_count}
                formatter={(val: number | null | undefined): string => {
                  if (val === null || val === undefined) return '';
                  return val.toString();
                }}
                hideWhenNoChange={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const VirtualizedTable: React.FC<VirtualizedTableProps> = ({
  items,
  height = 400,
  itemHeight = 60,
  activeBusiness,
  historicalData,
  keywordData,
  rangeValue
}) => {
  const itemData = useMemo(
    () => ({
      items,
      activeBusiness,
      historicalData,
      keywordData,
      rangeValue
    }),
    [items, activeBusiness, historicalData, keywordData, rangeValue]
  );

  return (
    <div className="virtualized-table">
      {/* 테이블 헤더 */}
      <div className="flex border-b-2 border-gray-300 bg-white sticky top-0 z-10 font-semibold">
        <div className="w-[8%] px-3 py-3 text-center">순위</div>
        <div className="w-[30%] px-3 py-3">업체명</div>
        <div className="w-[22%] px-3 py-3">업종</div>
        <div className="w-[14%] px-3 py-3">블로그리뷰</div>
        <div className="w-[14%] px-3 py-3">영수증리뷰</div>
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

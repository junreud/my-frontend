"use client";

import React, { useState, useEffect } from "react";
// shadcn/ui components
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Combobox } from "@/components/ui/combobox";
// Hooks
import { useKeywordData } from "@/hooks/useKeywordData";
import { useUserKeywords } from "@/hooks/useUserKeywords";
import { useBusinessSwitcher } from "@/hooks/useBusinessSwitcher";
import { createLogger } from "@/lib/logger";
// Recharts components
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const logger = createLogger("MarketingKeywordsPage");

export default function Page() {
  // Replace the boolean accordionOpen with a string value to track which accordion item is open
  const [openAccordionItem, setOpenAccordionItem] = useState<string | undefined>(undefined);
  const [rangeValue, setRangeValue] = useState(25);
  const [isRangePressed, setIsRangePressed] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState("");

  // 비즈니스 정보 가져오기 (BusinessSwitcher에서 선택된 업체)
  const { activeBusiness, user } = useBusinessSwitcher();

  // 디버깅용 로그 추가
  useEffect(() => {
    if (activeBusiness) {
      logger.info("활성 업체 정보:", activeBusiness);
    }
  }, [activeBusiness]);

  // 사용자 키워드 목록 가져오기 (user_place_keywords 테이블에서)
  const { 
    keywords: userKeywordObjects, 
    loading: keywordsLoading,
    error: keywordsError
  } = useUserKeywords(user?.id, activeBusiness?.place_id);
  
  // 디버깅용: 키워드 데이터 로깅
  useEffect(() => {
    logger.info("가져온 사용자 키워드:", userKeywordObjects);
  }, [userKeywordObjects]);
  
  // 키워드 문자열 배열 추출 (ComboBox 옵션용)
  const userKeywords = userKeywordObjects.map(k => k.keyword);

  // 선택한 키워드의 순위 데이터 가져오기 (keyword_crawl_results 테이블에서)
  const { 
    data, 
    historicalData, 
    chartData,
    loading: keywordDataLoading,
    error: keywordDataError
  } = useKeywordData({
    placeId: activeBusiness?.place_id,
    keyword: selectedKeyword,
    historical: true
  });

  // 첫 번째 키워드 자동 선택
  useEffect(() => {
    if (userKeywords.length > 0 && !selectedKeyword) {
      setSelectedKeyword(userKeywords[0]);
    }
  }, [userKeywords, selectedKeyword]);

  // 업체명으로 페이지 제목 업데이트
  useEffect(() => {
    if (activeBusiness?.place_name) {
      document.title = `${activeBusiness.place_name} - 키워드 순위`;
    } else {
      document.title = "키워드 순위";
    }
  }, [activeBusiness]);

  // ComboBox 컴포넌트 타입 정의
  const ComboboxWithProps = Combobox as React.FC<{
    options: string[];
    value: string;
    onChange: React.Dispatch<React.SetStateAction<string>>;
    placeholder: string;
    renderOption: (option: string) => React.ReactElement;
    className: string;
  }>;

  // 로딩 중 여부
  const isLoading = keywordsLoading || keywordDataLoading;

  // 키워드 목록 준비 - 오류/로딩/빈 상태 처리 포함
  const prepareKeywordOptions = () => {
    // 로딩 중인 경우
    if (keywordsLoading) {
      return ["키워드 로딩 중..."];
    }
    
    // 오류가 발생한 경우
    if (keywordsError) {
      return ["키워드를 불러오는 중 오류가 발생했습니다"];
    }
    
    // 업체가 선택되지 않은 경우
    if (!activeBusiness) {
      return ["업체를 먼저 선택해주세요", "업체 선택이 필요합니다"];
    }
    
    // 키워드가 없는 경우
    if (userKeywords.length === 0) {
      return ["이 업체에 등록된 키워드가 없습니다", "키워드를 추가해주세요"];
    }
    
    // 정상적인 키워드 목록
    return userKeywords;
  };

  // 사용할 키워드 옵션 목록
  const keywordOptions = prepareKeywordOptions();
  
  // 특별 메시지 옵션인지 확인하는 함수
  const isMessageOption = (option: string) => {
    return option === "키워드 로딩 중..." || 
           option === "키워드를 불러오는 중 오류가 발생했습니다" || 
           option === "이 업체에 등록된 키워드가 없습니다" ||
           option === "업체를 먼저 선택해주세요" || 
           option === "업체 선택이 필요합니다" ||
           option === "키워드를 추가해주세요";
  };

  // 키워드로 userKeywordObject 찾기
  const findKeywordObject = (keywordText: string) => {
    return userKeywordObjects.find(k => k.keyword === keywordText);
  };

  return (
    <div className="p-6 space-y-8">      
      {/* 키워드 아코디언 */}
      <Accordion
        type="single"
        collapsible
        value={openAccordionItem}
        onValueChange={setOpenAccordionItem}
        className="border rounded"
      >
        {userKeywords.map((keyword, index) => {
          // 해당 키워드의 객체 찾기
          const keywordObject = findKeywordObject(keyword);
          const itemValue = `item-${index}`;
          
          return (
            <AccordionItem key={keywordObject?.id || index} value={itemValue}>
              <AccordionTrigger className="px-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  {/* 키워드 이름 */}
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{index + 1}.</span>
                    <span>{keyword}</span>
                  </div>

                  {/* 현재 순위 */}
                  <div className="text-right mr-2">
                    <span>현재 순위: {
                      chartData.length > 0 && keyword === selectedKeyword
                        ? chartData[chartData.length - 1].ranking
                        : '?'
                    }위</span>
                  </div>
                </div>
              </AccordionTrigger>

              {/* 상세 차트 */}
              <AccordionContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={keyword === selectedKeyword ? chartData : []}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 300]} reversed label={{ value: '순위', angle: -90, position: 'insideLeft' }} />
                      <Tooltip
                        formatter={(value, name) => [
                          name === 'uv' ? 300 - Number(value) : value, 
                          name === 'uv' ? '순위' : name
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="uv"
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* 키워드 선택 및 테이블 섹션 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {/* 키워드 선택 콤보박스 */}
          <div className="w-64 mb-4">          
            <ComboboxWithProps
              options={keywordOptions}
              value={selectedKeyword}
              onChange={(value) => {
                // 특별 액션 처리
                
                // 일반 키워드 선택은 기존 로직대로 처리
                if (!isMessageOption(value)) {
                  setSelectedKeyword(value);
                }
              }}
              placeholder="키워드 선택"
              renderOption={(option) => (
                <div 
                  className={`p-2 ${isMessageOption(option) 
                    ? option.includes('키워드를 추가') || option.includes('업체 선택') 
                      ? 'text-blue-500 font-medium cursor-pointer hover:bg-blue-50' 
                      : 'text-gray-500 italic cursor-default'
                    : 'cursor-pointer hover:bg-gray-100'}`}
                >
                  {option}
                </div>
              )}
              className="border p-2 rounded"
            />
          </div>
          
          {/* 타임머신 슬라이더 */}
          <div className="w-full max-w-xs relative">
            {isRangePressed && (
              <div
                style={{ left: `${rangeValue}%`, transform: "translateX(-50%)" }}
                className="absolute -top-8 px-2 py-1"
              >
                {rangeValue / 25 + 1}
              </div>
            )}
            <input
              type="range"
              min={0}
              max="100"
              value={rangeValue}
              className="range"
              step="25"
              onMouseDown={() => setIsRangePressed(true)}
              onMouseUp={() => setIsRangePressed(false)}
              onTouchStart={() => setIsRangePressed(true)}
              onTouchEnd={() => setIsRangePressed(false)}
              onChange={(e) => setRangeValue(Number(e.target.value))}
            />

            <div className="flex justify-between px-2.5 mt-0.5 text-xs">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>      
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="loading">데이터를 불러오는 중...</div>
          ) : !selectedKeyword || !activeBusiness ? (
            <div className="select-message">키워드를 선택해주세요.</div>
          ) : (
            <div className="table-container">
              <table className="table table-xs">
                <thead>
                  <tr>
                    <th>순위</th>
                    <th>업체명</th>
                    <th>업종</th>
                    <th>영수증리뷰</th>
                    <th>블로그리뷰</th>
                    <th>저장수</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 ? (
                    data.map((item) => (
                      <tr key={item.placeid || item.id || Math.random()} className="hover:bg-base-300">
                        <th>{item.ranking}</th>
                        <td>{item.place_name || item.name}</td>
                        <td>{item.category || item.businessType || item.framework}</td>
                        <td>{item.receipt_review_count || item.receiptReviews}</td>
                        <td>{item.blog_review_count || item.blogReviews}</td>
                        <td>{item.savedCount || 0}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="no-data">데이터가 없습니다</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from "react";
// shadcn/ui components – adjust import paths based on your project structure
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Combobox } from "@/components/ui/combobox";
// 테이블 컴포넌트 임포트 추가
import TableComponent from "@/components/TableComponent";
// BusinessSwitcher 다시 추가
import { BusinessSwitcher } from "@/components/dashboard/business-switcher";
import { useBusinessSwitcher } from "@/hooks/useBusinessSwitcher";

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

// Sample simplified and detailed chart data
const simpleChartData = [
  { name: "Day 1", uv: 30 },
  { name: "Day 2", uv: 60 },
  { name: "Day 3", uv: 45 },
  { name: "Day 4", uv: 80 },
];

const detailedChartData = [
  { name: "Day 1", uv: 30 },
  { name: "Day 2", uv: 60 },
  { name: "Day 3", uv: 45 },
  { name: "Day 4", uv: 80 },
  { name: "Day 5", uv: 55 },
  { name: "Day 6", uv: 95 },
  { name: "Day 7", uv: 75 },
  { name: "Day 8", uv: 110 },
];

// Generate 300 rows of sample data

export default function Page() {
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [rangeValue, setRangeValue] = useState(25); // added state for range
  const [isRangePressed, setIsRangePressed] = useState(false); // New state for press detection

  // Get business information from the hook
  const { activeBusiness } = useBusinessSwitcher();

  // For the combobox example (shadcn/ui)
  const keywords = ["사당맛집", "사당고기집", "사당삼겹살",];
  const [selectedKeyword, setSelectedKeyword] = useState("");

  // NEW: Create alias with proper props for Combobox
  const ComboboxWithProps = Combobox as React.FC<{
    options: string[];
    value: string;
    onChange: React.Dispatch<React.SetStateAction<string>>;
    placeholder: string;
    renderOption: (option: string) => React.ReactElement;
    className: string;
  }>;
  
  // Update title with active business name
  useEffect(() => {
    if (activeBusiness?.place_name) {
      document.title = `${activeBusiness.place_name} - 키워드 순위`;
    } else {
      document.title = "키워드 순위";
    }
  }, [activeBusiness]);

  return (
    <div className="p-6 space-y-8">
      {/* Add BusinessSwitcher at the top */}
      <div className="md:hidden mb-4">
        <BusinessSwitcher />
      </div>
      
      <Accordion
        type="single"
        collapsible
        onValueChange={(val) => setAccordionOpen(Boolean(val))}
        className="border rounded"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger className="px-4">
            <div className="grid grid-cols-3 items-center gap-4">
              {/* Left text */}
              <div className="flex items-center gap-2">
                <span className="font-semibold">1.</span>
                <span>사당 고기집</span>
              </div>

              {/* Center chart */}
              <div className="mx-auto w-80 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={simpleChartData}
                    margin={{ top: 2, right: 2, left: 2, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="uv"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Right text */}
              <div className="text-right">
                <span>현재 순위: ?위</span>
              </div>
            </div>
          </AccordionTrigger>

          {/* forceMount로 컴포넌트를 항상 DOM에 남도록 유지 */}
          <AccordionContent forceMount>
            {/* 아코디언이 열리고 닫힐 때, height를 0->300px으로 전환 */}
            <div
              className={`transition-all duration-300 overflow-hidden ${
                accordionOpen ? "h-[300px]" : "h-0"
              }`}
            >
              {/* ResponsiveContainer에 height="100%"로 주어야 트랜지션에 따라 동적으로 확대 */}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={detailedChartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
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
      </Accordion>

      {/* --- SECTION 2: Table (shadcn/ui + plain HTML) --- */}
      <div className="space-y-4">
        {/* Table header row with Time Machine button (left) and Combobox (right) */}
        <div className="flex items-center justify-between">
          {/* Combobox on the left for user keywords */}
          <div className="w-64 mb-4">
            <ComboboxWithProps
              options={keywords}
              value={selectedKeyword}
              onChange={setSelectedKeyword}
              placeholder="키워드 선택"
              renderOption={(option) => <div className="p-2">{option}</div>}
              className="border p-2 rounded"
            />
          </div>
          {/* Time machine button + popover on the right */}
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

        {/* 기존 테이블을 TableComponent로 교체 */}
        <div className="overflow-x-auto">
          <TableComponent 
            title={`${selectedKeyword || '키워드'} 순위 테이블`}
            selectedKeyword={selectedKeyword}
          />
        </div>
      </div>
    </div>
  );
}
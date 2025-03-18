"use client";

import React, { useState } from "react";
// shadcn/ui components – adjust import paths based on your project structure
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";

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
function createTableData() {
  const rows = [];
  for (let i = 1; i <= 300; i++) {
    rows.push({
      rank: i,
      name: `Business ${i}`,
      category: i % 2 === 0 ? "Restaurant" : "Cafe",
      receiptReviews: Math.floor(Math.random() * 1000),
      blogReviews: Math.floor(Math.random() * 2000),
    });
  }
  return rows;
}

const allTableData = createTableData();

export default function Page() {
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [visibleRows, setVisibleRows] = useState(150);

  // For the combobox example (shadcn/ui)
  const keywords = ["Pizza", "Burger", "Sushi", "Steak", "Pasta"];
  const [selectedKeyword, setSelectedKeyword] = useState("");

  // Data shown in the table
  const tableData = allTableData.slice(0, visibleRows);

  return (
    <div className="p-6 space-y-8">
      {/* --- SECTION 1: Accordion with Recharts --- */}
      <Accordion
        type="single"
        collapsible
        onValueChange={(val) => setAccordionOpen(Boolean(val))}
        className="border rounded"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger className="p-4 text-left">
            {/* Collapsed display: “1. 키워드명 & 간소화된 그래프” */}
            <div className="flex items-center gap-2">
              <span className="font-semibold">1.</span>
              <span>사당 고기집 (예시 키워드)</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-4">
            {/* Expanded display: a bit more detailed chart */}
            <div className="transition-all duration-300">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={accordionOpen ? detailedChartData : simpleChartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="uv" stroke="#8884d8" strokeWidth={2} />
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
          {/* Time machine button + popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">타임머신</Button>
            </PopoverTrigger>
            <PopoverContent className="p-4">
              <p className="text-sm">여기에 타임머신 관련 팝오버 내용을 넣을 수 있습니다.</p>
            </PopoverContent>
          </Popover>

          {/* Combobox on the right for user keywords */}
          <div className="w-64">
            <Combobox
              options={keywords}
              value={selectedKeyword}
              onChange={setSelectedKeyword}
              placeholder="키워드 선택"
              renderOption={(option) => <div className="p-2">{option}</div>}
              className="border p-2 rounded"
            />
          </div>
        </div>

        {/* Striped table (HTML + Tailwind) */}
        <div className="w-full overflow-auto border border-slate-200 rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-sm font-medium text-slate-600">
              <tr>
                <th className="px-2.5 py-2 text-start">순위</th>
                <th className="px-2.5 py-2 text-start">업체명</th>
                <th className="px-2.5 py-2 text-start">카테고리</th>
                <th className="px-2.5 py-2 text-start">영수증리뷰</th>
                <th className="px-2.5 py-2 text-start">블로그리뷰</th>
                <th className="px-2.5 py-2 text-start">저장하기</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="p-3">{item.rank}</td>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3">{item.receiptReviews}</td>
                  <td className="p-3">{item.blogReviews}</td>
                  <td className="p-3">
                    <Button variant="outline" size="sm">
                      저장
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* "Load more" button at bottom center */}
        <div className="flex justify-center mt-4">
          {visibleRows < 300 && (
            <Button onClick={() => setVisibleRows(300)}>
              더보기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
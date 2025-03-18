"use client";

import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import type { EventApi, ViewApi } from "@fullcalendar/core";

// --------------------------------------------------------------------
// 더미 데이터 + 인터페이스
// --------------------------------------------------------------------
interface RowData {
  no: number;
  작업명: string;
  시작일: string;
  종료일: string;
  금액: number;
  작업량: number;
}
function MyTableColumns() {
  // Example widths or percentages. Adjust as needed.
  return (
    <colgroup>
      <col style={{ width: "10%" }} />
      <col style={{ width: "20%" }} />
      <col style={{ width: "15%" }} />
      <col style={{ width: "15%" }} />
      <col style={{ width: "20%" }} />
      <col style={{ width: "20%" }} />
    </colgroup>
  );
}

const PAGE_SIZE = 15;
const allData: RowData[] = Array.from({ length: 30 }, (_, i) => ({
  no: i + 1,
  작업명: `작업 #${i + 1}`,
  시작일: `2025-01-${String(i + 1).padStart(2, "0")}`,
  종료일: `2025-01-${String(i + 2).padStart(2, "0")}`,
  금액: (i + 1) * 1000,
  작업량: (i + 1) * 5,
}));

// --------------------------------------------------------------------
// 달력 컴포넌트 (FullCalendar)
// --------------------------------------------------------------------
function MyCalendar({ events }: { events: { title: string; start: string; end?: string }[] }) {
  const handleDateClick = (info: DateClickArg) => {
    alert(`날짜 클릭: ${info.dateStr}`);
  };
  const handleEventClick = (info: {
    event: EventApi;
    el: HTMLElement;
    jsEvent: MouseEvent;
    view: ViewApi;
  }) => {
    alert(`이벤트 클릭: ${info.event.title}`);
  };

  return (
    <div className="w-full px-4 mb-4 bg-white p-4 rounded shadow">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "",
        }}
        selectable
        editable
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
      />
    </div>
  );
}

// --------------------------------------------------------------------
// 테이블 Row (단순화)
// --------------------------------------------------------------------
function TableRowUI({
  row,
  isHeader = false,
  isSelected = false,
  onClick,
}: {
  row: Partial<RowData>;
  isHeader?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const clsHeader = "bg-gray-200 font-bold";
  const clsSelected = "bg-blue-50";
  const clsHover = "hover:bg-gray-50";
  const combinedClass = isHeader ? clsHeader : isSelected ? clsSelected : clsHover;

  return (
    <tr
      id={isHeader ? "table-header" : `row-${row.no}`}
      className={`${combinedClass} cursor-pointer`}
      onClick={onClick}
    >
      <td style={{ border: "1px solid #ccc", padding: 8 }}>
        {isHeader ? "No." : row.no}
      </td>
      <td style={{ border: "1px solid #ccc", padding: 8 }}>
        {isHeader ? "작업명" : row.작업명}
      </td>
      <td style={{ border: "1px solid #ccc", padding: 8 }}>
        {isHeader ? "시작일" : row.시작일}
      </td>
      <td style={{ border: "1px solid #ccc", padding: 8 }}>
        {isHeader ? "종료일" : row.종료일}
      </td>
      <td style={{ border: "1px solid #ccc", padding: 8 }}>
        {isHeader ? "금액" : row.금액?.toLocaleString()}
      </td>
      <td style={{ border: "1px solid #ccc", padding: 8 }}>
        {isHeader ? "작업량" : row.작업량}
      </td>
    </tr>
  );
}

// --------------------------------------------------------------------
// DataTable with pagination
// --------------------------------------------------------------------
function DataTable({
  selectedRow,
  onRowClick,
}: {
  selectedRow?: RowData;
  onRowClick: (row: RowData) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const tableRef = useRef<HTMLDivElement>(null);

  // 페이지네이션
  const totalPages = Math.ceil(allData.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentData = allData.slice(startIndex, startIndex + PAGE_SIZE);

  const handleClickRow = (row: RowData) => {
    onRowClick(row);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // "selectedRow"가 바뀔 때 한 번만 스크롤
  const previousRowRef = useRef<number | null>(null);
  useEffect(() => {
    if (!selectedRow) return;
    if (previousRowRef.current === selectedRow.no) return;
    previousRowRef.current = selectedRow.no;

    const rowEl = document.getElementById(`row-${selectedRow.no}`);
    if (rowEl) {
      rowEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedRow]);

  return (
    <div ref={tableRef} className="w-full px-4 mt-4 mb-4 bg-white p-4 rounded shadow">
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <TableRowUI row={{}} isHeader />
        </thead>
        <tbody>
          {currentData.map((row) => {
            const isSelected = selectedRow?.no === row.no;
            return (
              <TableRowUI
                key={row.no}
                row={row}
                isSelected={isSelected}
                onClick={() => handleClickRow(row)}
              />
            );
          })}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-center mt-4 gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          &lt;
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-2 py-1 border rounded ${
              page === currentPage ? "bg-blue-500 text-white" : ""
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------
// 메인 페이지 (캘린더 + 테이블, Row 클릭 시 달력으로 스크롤)
// --------------------------------------------------------------------
export default function Page() {
  const [selectedRow, setSelectedRow] = useState<RowData | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Row 클릭 => 달력으로 스크롤
  const handleRowClick = (row: RowData) => {
    setSelectedRow(row);
    setTimeout(() => {
      calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  // 달력에 표시할 이벤트 (선택된 row만 예시)
  const calendarEvents = selectedRow
    ? [
        {
          title: selectedRow.작업명,
          start: selectedRow.시작일,
          end: selectedRow.종료일,
        },
      ]
    : [];

  return (
    <>
      <div ref={calendarRef}>
        <MyCalendar events={calendarEvents} />
      </div>
      <DataTable onRowClick={handleRowClick} selectedRow={selectedRow || undefined} />
    </>
  );
}
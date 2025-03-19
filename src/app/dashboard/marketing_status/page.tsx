"use client";

import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import type { EventApi, ViewApi } from "@fullcalendar/core";
import koLocale from "@fullcalendar/core/locales/ko";

interface RowData {
  no: number;
  작업명: string;
  시작일: string;
  종료일: string;
  금액: number;
  작업량: number;
}

// --------------------------------------------------------------------
// 원하는 4가지 작업명과 그에 대응되는 색상
// --------------------------------------------------------------------
const JOB_COLORS: Record<string, string> = {
  "영수증리뷰": "#ff9999", // 예시 색상
  "블로그배포": "#99ff99",
  "트래픽": "#9999ff",
  "저장하기": "#ffd699",
};

// --------------------------------------------------------------------
// 예시용 데이터 (총 30개). 여기서 i를 기준으로 4가지 작업명을 반복 부여
// --------------------------------------------------------------------
const PAGE_SIZE = 15;
const jobNames = ["영수증리뷰", "블로그배포", "트래픽", "저장하기"];

const allData: RowData[] = Array.from({ length: 30 }, (_, i) => {
  const jobName = jobNames[i % jobNames.length];
  return {
    no: i + 1,
    작업명: jobName,
    시작일: `2025-01-${String(i + 1).padStart(2, "0")}`,
    종료일: `2025-01-${String(i + 2).padStart(2, "0")}`, // 예시로 시작일+1일
    금액: (i + 1) * 1000,
    작업량: (i + 1) * 5,
  };
});

// --------------------------------------------------------------------
// 달력 컴포넌트
// --------------------------------------------------------------------
function MyCalendar({
  events,
  goToDate, // 선택된 row의 시작일 (캘린더 이동용)
}: {
  events: {
    title: string;
    start: string;
    end?: string;
    backgroundColor?: string;
  }[];
  goToDate?: string;
}) {
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    if (goToDate && calendarRef.current) {
      const api = calendarRef.current.getApi();
      api.gotoDate(goToDate);
    }
  }, [goToDate]);

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
    <>
      <style jsx global>{`
        .fc {
          font-size: clamp(1rem, 2vw, 1.2rem) !important;
        }
        .fc .fc-day-sun .fc-daygrid-day-number {
          color: red !important;
        }
        .fc .fc-button {
          background-color: #fff !important;
          border: 1px solid #ccc !important;
          color: black !important;
          border-radius: 3rem !important;
        }
        .fc .fc-button:hover {
          background-color: #eee !important;
        }
        .fc .fc-button .fc-icon {
          color: black !important;
        }
      `}</style>
      <div className="w-full px-4 mb-4 bg-white p-4 rounded">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "",
            right: "title",
          }}
          locales={[koLocale]}
          locale="ko"
          selectable
          editable
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          dayCellContent={(args) => {
            const dayText = args.dayNumberText.replace("일", "");
            return {
              html: `<span style="font-size: clamp(1rem, 2vw, 1.2rem);">${dayText}</span>`,
            };
          }}
        />
      </div>
    </>
  );
}

// --------------------------------------------------------------------
// 테이블
// --------------------------------------------------------------------
function DataTable({
  selectedRow,
  onRowClick,
}: {
  selectedRow?: RowData;
  onRowClick: (row: RowData) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(allData.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentData = allData.slice(startIndex, startIndex + PAGE_SIZE);

  const handleClickRow = (row: RowData) => {
    onRowClick(row);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 선택된 row가 바뀔 때, 해당 row 쪽으로 스크롤
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
    <div className="w-full px-4 mt-4 mb-4 bg-white p-4 rounded">
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>No.</th>
              <th>작업명</th>
              <th>시작일</th>
              <th>종료일</th>
              <th>금액</th>
              <th>작업량</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((row) => {
              const isSelected = selectedRow?.no === row.no;
              return (
                <tr
                  key={row.no}
                  id={`row-${row.no}`}
                  className={`cursor-pointer ${
                    isSelected ? "bg-[#F5F5DC]" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleClickRow(row)}
                >
                  <th className="px-1 py-2">{row.no}</th>
                  <td className="px-1 py-2">{row.작업명}</td>
                  <td className="px-1 py-2">{row.시작일}</td>
                  <td className="px-1 py-2">{row.종료일}</td>
                  <td className="px-1 py-2">{row.금액?.toLocaleString()}</td>
                  <td className="px-1 py-2">{row.작업량}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 페이징 */}
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
              page === currentPage ? "bg-[#F5F5DC] text-black" : ""
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
// 메인 페이지
// --------------------------------------------------------------------
export default function Page() {
  const [selectedRow, setSelectedRow] = useState<RowData | null>(null);
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  const handleRowClick = (row: RowData) => {
    setSelectedRow(row);

    // 달력이 위치한 부분으로 스크롤
    setTimeout(() => {
      calendarContainerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  // 달력에 표시할 전체 이벤트 (테이블 전체)
  // 작업명에 따라 색상을 설정
  const calendarEvents = allData.map((item) => ({
    title: item.작업명,
    start: item.시작일,
    end: item.종료일,
    backgroundColor: JOB_COLORS[item.작업명] || "#ccc",
  }));

  // 선택된 Row가 있으면 달력을 그 날짜로 이동
  return (
    <>
      <div ref={calendarContainerRef}>
        <MyCalendar
          events={calendarEvents}
          goToDate={selectedRow?.시작일}
        />
      </div>

      <DataTable onRowClick={handleRowClick} selectedRow={selectedRow || undefined} />
    </>
  );
}
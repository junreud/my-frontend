"use client";

import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import type { EventApi, ViewApi } from "@fullcalendar/core";
import koLocale from "@fullcalendar/core/locales/ko";
import { useUserWorkHistories } from "@/hooks/useUserWorkHistories";

// 캘린더 이벤트 타입 (id 추가)
type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
};

interface RowData {
  no: number;
  id: number; // 실제 데이터베이스 ID 추가
  작업명: string;
  시작일: string;
  종료일: string;
  금액: number | null;
  작업량: number | null;
  실행사: string;
}

// --------------------------------------------------------------------
// 작업명과 그에 대응되는 색상
// --------------------------------------------------------------------
const JOB_COLORS: Record<string, string> = {
  "영수증리뷰": "#ff9999",
  "블로그배포": "#99ff99",
  "트래픽": "#9999ff",
  "저장하기": "#ffd699",
};

const PAGE_SIZE = 15;

// --------------------------------------------------------------------
// 달력 컴포넌트
// --------------------------------------------------------------------
export function MyCalendar({
  events,
  goToDate,
  onDateSelect,
  selectedEventId,
}: {
  events: CalendarEvent[];
  goToDate?: string;
  onDateSelect?: (date: string) => void;
  selectedEventId?: string | number;
}) {
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    if (goToDate && calendarRef.current) {
      const api = calendarRef.current.getApi();
      api.gotoDate(goToDate);
    }
  }, [goToDate]);

  const handleDateClick = (info: DateClickArg) => {
    if (onDateSelect) onDateSelect(info.dateStr);
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
          max-width: 100%;
          font-size: clamp(0.9rem, 1.5vw, 1rem) !important;
        }
        .fc .fc-daygrid-day {
          border: 1px solid #e2e8f0;
          background-color: #f9fafb;
        }
        .fc .fc-col-header-cell-cushion {
          color: #4a5568;
          font-weight: 600;
        }
        .fc .fc-button {
          background-color: transparent !important;
          border: 1px solid #cbd5e0 !important;
          color: #4a5568 !important;
          border-radius: 0.375rem !important;
        }
        .fc .fc-button:hover {
          background-color: #edf2f7 !important;
        }
        .fc .fc-button .fc-icon {
          color: #4a5568 !important;
        }
        .fc .fc-daygrid-event {
          background-color: rgba(59, 130, 246, 0.1) !important;
          border: none !important;
          color: #000 !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
          padding: 2px 6px !important;
          font-size: 0.75rem !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
        /* 선택된 이벤트 강조 스타일 */
        .fc .selected-event {
          box-shadow: 0 0 0 3px #f59e0b !important;
        }
        /* 이벤트 텍스트 색상 강제 검은색 */
        .fc .fc-daygrid-event * {
          color: #000 !important;
        }
      `}</style>
      <div className="w-full p-4 bg-white rounded shadow" style={{ height: '85vh' }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: "prev,next today", center: "", right: "title" }}
          locales={[koLocale]}
          locale="ko"
          selectable
          editable={false}
          height="100%"
          eventClassNames={(args) =>
            args.event.id === selectedEventId?.toString() ? ['selected-event'] : []
          }
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          dayCellContent={(args) => ({ html: args.dayNumberText.replace("일", "") })}
        />
      </div>
    </>
  );
}

// --------------------------------------------------------------------
// 테이블
// --------------------------------------------------------------------
export function DataTable({
  selectedRow,
  onRowClick,
  data = []
}: {
  selectedRow?: RowData;
  onRowClick: (row: RowData) => void;
  data?: RowData[];
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentData = data.slice(startIndex, startIndex + PAGE_SIZE);

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
              <th>작업량</th>
              <th>실행사</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              currentData.map((row) => {
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
                    <td className="px-1 py-2">{row.작업량 || '-'}</td>
                    <td className="px-1 py-2">{row.실행사}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  작업 이력이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이징 - 데이터가 있을 때만 표시 */}
      {totalPages > 1 && (
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
      )}
    </div>
  );
}

// 달력 스켈레톤 컴포넌트
export function CalendarSkeleton() {
  // 달력 헤더 스켈레톤
  const CalendarHeaderSkeleton = () => (
    <div className="flex justify-between items-center p-4 bg-white rounded-t">
      <div className="flex gap-2">
        <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
      <div className="h-8 w-32 bg-gray-200 rounded-full animate-pulse"></div>
    </div>
  );

  // 달력 날짜 그리드 스켈레톤
  const CalendarGridSkeleton = () => {
    // 요일 헤더 (7개)
    const weekdays = Array.from({ length: 7 }, (_, i) => (
      <div key={`weekday-${i}`} className="h-8 flex justify-center items-center">
        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
      </div>
    ));

    // 날짜 셀 5주 * 7일 = 35개
    const dayCells = Array.from({ length: 35 }, (_, i) => {
      // 패턴에 따라 일부 셀에 이벤트 표시
      const showFirstEvent = i % 3 === 0;
      const showSecondEvent = i % 7 === 0;
      
      return (
        <div 
          key={`day-${i}`} 
          className="border p-2 h-24 hover:bg-gray-50 relative"
        >
          <div className="h-5 w-5 mb-2 bg-gray-200 rounded-full animate-pulse"></div>
          
          {showFirstEvent && (
            <div className="h-5 w-full bg-gray-200 rounded mb-1 animate-pulse"></div>
          )}
          {showSecondEvent && (
            <div className="h-5 w-3/4 bg-gray-200 rounded mb-1 animate-pulse"></div>
          )}
        </div>
      );
    });

    return (
      <div className="bg-white rounded-b p-2">
        <div className="grid grid-cols-7 gap-2">
          {weekdays}
          {dayCells}
        </div>
      </div>
    );
  };

  // 테이블 스켈레톤
  const TableSkeleton = () => {
    const rows = Array.from({ length: 8 }, (_, i) => (
      <tr key={`row-${i}`} className="border-b">
        <td className="p-2"><div className="h-5 w-8 bg-gray-200 rounded animate-pulse"></div></td>
        <td className="p-2"><div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div></td>
        <td className="p-2"><div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div></td>
        <td className="p-2"><div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div></td>
        <td className="p-2"><div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div></td>
        <td className="p-2"><div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div></td>
      </tr>
    ));

    return (
      <div className="w-full mt-4 mb-4 bg-white p-4 rounded">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="border-b">
                <th className="p-2"><div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div></th>
                <th className="p-2"><div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div></th>
                <th className="p-2"><div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div></th>
                <th className="p-2"><div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div></th>
                <th className="p-2"><div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div></th>
                <th className="p-2"><div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div></th>
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </table>
        </div>

        {/* 페이징 스켈레톤 */}
        <div className="flex items-center justify-center mt-4 gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4">
      <div className="w-full bg-white rounded shadow overflow-hidden">
        <CalendarHeaderSkeleton />
        <CalendarGridSkeleton />
      </div>
      
      <TableSkeleton />
    </div>
  );
}

// --------------------------------------------------------------------
// 마케팅 상태 페이지의 클라이언트 컴포넌트
// --------------------------------------------------------------------
export function MarketingStatusClient() {
  const [selectedRow, setSelectedRow] = useState<RowData | null>(null);
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  // 실제 작업 이력 데이터 로드
  const { data: workHistories, isLoading, error } = useUserWorkHistories();
  
  // 작업 이력 데이터를 테이블 데이터로 변환
  const tableData = React.useMemo(() => {
    if (!workHistories || !Array.isArray(workHistories) || workHistories.length === 0) {
      return [];
    }
    
    return workHistories.map((history, index) => {
      // prioritize user 작업기간 over actual 기간
      const startDate = history.user_start_date || history.actual_start_date;
      const endDate = history.user_end_date || history.actual_end_date;
      
      return {
        no: index + 1,
        id: history.id,
        작업명: history.work_type,
        시작일: startDate ? new Date(startDate).toISOString().split('T')[0] : '',
        종료일: endDate ? new Date(endDate).toISOString().split('T')[0] : '',
        금액: null, // 금액 정보가 없으므로 null로 설정
        작업량: history.char_count,
        실행사: history.executor
      };
    });
  }, [workHistories]);
  
  // 작업 이력 데이터를 캘린더 이벤트로 변환
  const calendarEvents = React.useMemo<CalendarEvent[]>(() => {
    if (!workHistories || !Array.isArray(workHistories) || workHistories.length === 0) {
      return [];
    }
    
    const events: CalendarEvent[] = [];
    for (const history of workHistories) {
      // prioritize user 작업기간 for calendar display
      const startDate = history.user_start_date || history.actual_start_date;
      if (!startDate) continue;
      const endDate = history.user_end_date || history.actual_end_date;
      events.push({
        id: history.id.toString(),
        title: history.work_type,
        start: new Date(startDate).toISOString().split('T')[0],
        end: endDate ? new Date(endDate).toISOString().split('T')[0] : undefined,
        backgroundColor: JOB_COLORS[history.work_type] || "#ccc",
      });
    }
    return events;
  }, [workHistories]);
  
  const handleRowClick = (row: RowData) => {
    const isSame = selectedRow?.id === row.id;
    if (isSame) {
      setSelectedRow(null);
    } else {
      setSelectedRow(row);
      // 달력이 위치한 부분으로 스크롤
      setTimeout(() => {
        calendarContainerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 0);
    }
  };

  // 로딩 중일 때 달력 스켈레톤 표시
  if (isLoading) {
    return <CalendarSkeleton />;
  }
  
  // 에러 발생 시 에러 메시지 표시
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded">
        <p>작업 이력을 불러오는 중 오류가 발생했습니다.</p>
        <p className="text-sm">{(error as Error).message}</p>
      </div>
    );
  }

  // 데이터가 없을 때 안내 메시지 표시
  if (!isLoading && (!workHistories || workHistories.length === 0)) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg">
        <p className="text-gray-600 mb-2">작업 이력이 없습니다.</p>
        <p className="text-sm text-gray-500">작업이 등록되면 여기에 표시됩니다.</p>
      </div>
    );
  }

  return (
    <>
      <div ref={calendarContainerRef}>
        <MyCalendar
          events={calendarEvents}
          goToDate={selectedRow?.시작일}
          selectedEventId={selectedRow?.id}
        />
      </div>

      <DataTable onRowClick={handleRowClick} selectedRow={selectedRow || undefined} data={tableData} />
    </>
  );
}

// 데이터 유틸리티 함수 - 테이블 RowData를 캘린더 이벤트로 변환
export function getCalendarEvents(data: RowData[]): CalendarEvent[] {
  return data.map((item: RowData) => ({
    id: item.id.toString(),
    title: item.작업명,
    start: item.시작일,
    end: item.종료일,
    backgroundColor: JOB_COLORS[item.작업명] || "#ccc",
  }));
}
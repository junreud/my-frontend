// components/ui/Calendar.tsx
"use client"; 
// App Router에서 React state, 이벤트 등을 사용하는 컴포넌트는 client 컴포넌트로 지정

import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";



const MyCalendarPage: React.FC = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6 pt-0">
      
      <div className="my-6 min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min relative">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          height="100%"
          contentHeight="auto"
        />
      </div>
    </div>
  );
};

export default MyCalendarPage;

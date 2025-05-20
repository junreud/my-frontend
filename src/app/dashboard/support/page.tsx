"use client";

import React, { useState } from "react";
import { Bug, LifeBuoy } from "lucide-react";
import BugReportModal from "@/components/Dashboard/BugReportModal";
import { Container } from "@/components/common/Container";

export default function DashboardSupportPage() {
  const [open, setOpen] = useState(false);
  return (
    <Container>
      <BugReportModal open={open} onClose={() => setOpen(false)} />
      <div className="h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
        <h1 className="text-3xl font-bold mb-2 text-center">도움말 및 고객센터</h1>
        <div className="flex flex-1 items-center justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex flex-col items-center justify-center w-80 h-80 bg-gray-100 rounded-lg shadow hover:bg-gray-200 transition cursor-pointer"
            >
              <Bug className="w-12 h-12 mb-2 text-gray-700" />
              <span className="text-lg font-medium">버그신고</span>
            </button>
            <a
              href="http://pf.kakao.com/_THCEn/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center w-80 h-80 bg-gray-100 rounded-lg shadow hover:bg-gray-200 transition cursor-pointer"
            >
              <LifeBuoy className="w-12 h-12 mb-2 text-gray-700" />
              <span className="text-lg font-medium">고객센터</span>
            </a>
          </div>
        </div>
      </div>
    </Container>
  );
}

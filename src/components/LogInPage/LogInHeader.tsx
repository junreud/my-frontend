// LogInHeader.tsx
"use client";

import React from "react";
import Link from "next/link";

export default function LogInHeader() {
  return (
    <header className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
        <Link href="/">
          {/* 
            클릭 시 메인으로 이동.
            Tailwind 스타일로 간단히 강조
          */}
          <span className="text-xl cursor-pointer">
            LAKABE
          </span>
        </Link>
      </div>
    </header>
  );
}

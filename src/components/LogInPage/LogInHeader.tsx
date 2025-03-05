// LogInHeader.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Container } from "@/components/common/Container"; // 경로 맞춰서 import

export default function LogInHeader() {
  return (
    // 고정(Fixed) 속성 추가
    <header className="w-full bg-white fixed top-0 left-0 z-50">
      <Container>
        <div className="py-4 flex items-center">
          <Link href="/">
            <span className="text-xl cursor-pointer">
              LAKABE
            </span>
          </Link>
        </div>
      </Container>
    </header>
  );
}

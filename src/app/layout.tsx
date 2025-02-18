// app/layout.tsx
import "./globals.css";

import { ReactNode } from "react";;
import CustomCursor from "@/components/animations/CustomCursor";

export const metadata = {
  title: "My dd",
  description: "tteete",
  openGraph: {
    title: "My dd - 라카비",
    description: "tteete - 라카비 소개",
    url: "https://lakabe.com",
    siteName: "MySite",
    images: [
      {
        url: "https://lakabe.com/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My dd",
    description: "tteete",
    images: ["https://lakabe.com/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* 전역 head 요소들 (폰트, 메타 태그 등) */}
      </head>
      <body>
        <CustomCursor />
        <main>{children}</main>
      </body>
    </html>
  );
}

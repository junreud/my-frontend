// app/layout.tsx
import "./globals.css";

import { ReactNode } from "react";;
import CustomCursor from "@/components/animations/CustomCursor";

export const metadata = {
  title: "라카비, 온라인 마케팅 솔루션과 관리를 한 번에",
  description: "tteete",
  openGraph: {
    title: "라카비, 온라인 마케팅 솔루션과 관리를 한 번에",
    description: "라카비, 온라인 마케팅 솔루션과 관리를 한 번에",
    url: "https://lakabe.com",
    siteName: "LAKABE",
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
    title: "라카비, 온라인 마케팅 솔루션과 관리를 한 번에",
    description: "라카비, 온라인 마케팅 솔루션과 관리를 한 번에",
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

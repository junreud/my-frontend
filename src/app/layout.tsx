// app/layout.tsx
import "./globals.css"

export const metadata = {
  title: "My App",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* 전역 head 요소들 (폰트, 메타 태그 등) */}
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
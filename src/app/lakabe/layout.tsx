//cloudflared tunnel run wiz25
// npm run dev
import "./globals.css";

import { ReactNode } from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Container } from "@/components/common/Container";
import CustomCursor from "@/components/animations/CustomCursor";

export const metadata = {
  title: "My dd",
  description: "tteete",
  openGraph: {
    title: "My dd - 라카비",
    description: "tteete - 라카비 소개",
    url: "https://m1mac.lakabe.com",
    siteName: "MySite",
    images: [
      {
        url: "https://m1mac.lakabe.com/og-image.jpg",
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
    images: ["https://m1mac.lakabe.com/og-image.jpg"],
  },
};

export default function RootLayout({ children }: {children: ReactNode }) {
  return (
    <html lang="ko">
      <head />
      <body>
        <CustomCursor />
        <Container>
          <Navbar />
          </Container>
        
          <main>{children}</main>
        
        <Footer />
        
      </body>
    </html>
  );
}
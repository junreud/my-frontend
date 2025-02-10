import "./globals.css";

import { ReactNode } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: "My dd",
  description: "tteete",
};

export default function RootLayout({ children }: {children: ReactNode }) {
  return (
    <html lang="ko">
      <head />
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
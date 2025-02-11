// components/Navbar.jsx
"use client";
import React from "react";
import Link from "next/link";

const HomepageHero = () => {
  return (
  <div
    className="hero min-h-screen"
    style={{
      backgroundImage: 'url("/images/HomepageHero-bg.jpg)',
    }}
  >
    <div className="hero-content text-black text-center flex-col items-start">
      <div className="max-w-3xl">
        <h1 className="mb-5 text-6xl font-bold leading-snug max-w-3xl pb-28">
          광고의 모든 것,<br />
          라카비에서 쉽고 간편하게
        </h1>
        <Link href="/estimate">
          <span className="btn custom-btn px-8 cursor-pointer rounded-full">
            견적받기
          </span>
        </Link>
      </div>
    </div>
  </div>
  )}
export default HomepageHero;

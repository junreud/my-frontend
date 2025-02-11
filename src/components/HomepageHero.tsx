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
    <div className="hero-overlay bg-opacity-60"></div>
    <div className="hero-content text-black text-center">
      <div className="max-w-3xl">
        <h1 className="mb-5 text-6xl font-bold leading-snug max-w-3xl">
          광고의 모든 것,<br />
          라카비에서 쉽고 간편하게
        </h1>
        <Link href="/estimate">
          <span className="btn custom-btn cursor-pointer mt-36">
            견적받기
          </span>
        </Link>
      </div>
    </div>
  </div>
  )}
export default HomepageHero;

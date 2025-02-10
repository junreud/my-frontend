// components/Navbar.jsx
"use client";
import React from "react";
import Link from "next/link";

const HomepageHero = () => {
  return (
  <div
    className="hero min-h-screen"
    style={{
      backgroundImage: "url(https://img.daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.webp)",
    }}
  >
    <div className="hero-overlay bg-opacity-60"></div>
    <div className="hero-content text-neutral-content text-center">
      <div className="max-w-md">
        <h1 className="mb-5 text-5xl font-bold">Here</h1>
        <p className="mb-5">
          Provident cupiditate vol
          quasi. In deleniti eaque aut repudiandae et a id nisi.
        </p>
        <Link href="/estimate">
          <span className="btn custom-btn cursor-pointer">견적받기</span>
        </Link>
      </div>
    </div>
  </div>
  )}
export default HomepageHero;

// components/Navbar.jsx (or wherever you keep the Hero)
"use client";
import React from "react";
import ServiceMenuOptions from "@/components/ServicePage/ServiceMenuOptions";

const PlaceHero = () => {
  return (
    <section
      // min-h-screen: 화면 높이 전체 (원하면 py-36만 사용할 수도 있음)
      className="hero h-[70vh] bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url(https://img.daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.webp)",
      }}
    >
      {/* hero-overlay: 부모 .hero 영역 전체를 덮음 */}
      <div className="hero-overlay bg-opacity-60 bg-black"></div>

      {/* hero-content: 내용 정렬 */}
      <div className="hero-content text-center text-neutral-content relative">
        <div className="max-w-md mx-auto">
          <h1 className="mb-5 text-align-center text-5xl font-bold whitespace-nowrap">네이버 플레이스 상위노출로<br/>우리 가게를 지역 1등으로!</h1>
          {/* 여기서 Combobox 표시 */}
          <div className="mt-8">
          <ServiceMenuOptions />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlaceHero;

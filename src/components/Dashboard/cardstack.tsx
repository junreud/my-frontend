"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide, } from "swiper/react";
import {
  EffectCards } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-cards";

/** 카드 정보 타입 정의 */
interface Card {
  id: number;
  text: string;
  bgColor: string; // 배경색을 위한 필드
}

export default function CardSwiper() {
  // 스택(섹션) 자체가 표시되는지 여부를 관리하는 State
  const [showStack, setShowStack] = useState(true);

  // 카드 목록 (고정된 배열), 각 카드마다 다른 배경색 지정
  const cards: Card[] = [
    { id: 1, text: "첫 번째 카드", bgColor: "bg-red-100" },
    { id: 2, text: "두 번째 카드", bgColor: "bg-green-100" },
    { id: 3, text: "세 번째 카드", bgColor: "bg-blue-100" },
    { id: 4, text: "네 번째 카드", bgColor: "bg-yellow-100" },
  ];

  // X 버튼 클릭 시: 전체 섹션 자체를 숨김
  const handleClose = () => {
    setShowStack(false);
  };

  // showStack이 false면 컴포넌트를 아예 렌더링하지 않음
  if (!showStack) return null;

  return (
    <div className="w-full max-w-sm mx-auto mb-4">
      {/* 헤더 영역: 카드 개수 및 X 버튼 */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={handleClose}
          className="text-gray-500 hover:text-black"
        >
          ✕
        </button>
      </div>

      {/* Swiper 영역 */}
      <Swiper
        effect="cards"
        modules={[EffectCards]}
        grabCursor={true}
        className="h-[350px]" // 필요에 따라 높이 조정
      >
        {cards.map((card) => (
          <SwiperSlide key={card.id}>
            <div
              className={`relative flex h-full w-full items-center justify-center rounded-xl shadow-lg ${card.bgColor}`}
            >
              <p className="text-lg font-semibold">{card.text}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

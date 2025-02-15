"use client";

import { useState, useEffect, useRef } from "react";

export default function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState("up");
  const lastScrollY = useRef(0);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const diff = scrollY - lastScrollY.current;

      // 스크롤 변화가 10px 이상일 때만 업데이트 (작은 움직임 무시)
      if (Math.abs(diff) < 10) return;

      if (diff > 0 && scrollDirection !== "down") {
        setScrollDirection("down");
      } else if (diff < 0 && scrollDirection !== "up") {
        setScrollDirection("up");
      }
      lastScrollY.current = scrollY > 0 ? scrollY : 0;
    };

    window.addEventListener("scroll", updateScrollDirection);
    return () => window.removeEventListener("scroll", updateScrollDirection);
  }, [scrollDirection]);

  return scrollDirection;
}

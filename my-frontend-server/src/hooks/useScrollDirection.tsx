"use client";

import { useState, useEffect, useRef } from "react";

export default function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>("up");
  const scrollDirectionRef = useRef<'up' | 'down'>("up");
  const lastScrollY = useRef<number>(0);
  const ticking = useRef<boolean>(false);

  // 초기 스크롤 위치 설정
  useEffect(() => {
    lastScrollY.current = window.pageYOffset;
  }, []);
  
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.pageYOffset;
      const diff = scrollY - lastScrollY.current;
      if (Math.abs(diff) < 10) return;
      if (diff > 0 && scrollDirectionRef.current !== 'down') {
        scrollDirectionRef.current = 'down';
        setScrollDirection('down');
      } else if (diff < 0 && scrollDirectionRef.current !== 'up') {
        scrollDirectionRef.current = 'up';
        setScrollDirection('up');
      }
      lastScrollY.current = scrollY > 0 ? scrollY : 0;
    };
    const handle = () => {
      if (!ticking.current) {
        ticking.current = true;
        window.requestAnimationFrame(() => {
          onScroll();
          ticking.current = false;
        });
      }
    };
    window.addEventListener('scroll', handle);
    return () => window.removeEventListener('scroll', handle);
  }, []);

  return scrollDirection;
}

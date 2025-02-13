"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

interface FadeSlideUpProps {
  children: React.ReactNode;
  /** 화면에 들어온 뒤 페이드+슬라이드로 보여주기까지 걸리는 시간(초) */
  fadeInDuration?: number;
  /** 화면에 들어온 뒤 유지되는 시간(초). 이 시간이 지나면 사라짐(페이드아웃) */
  visibleDuration?: number;
  /** 사라질 때 걸리는 시간(초) */
  fadeOutDuration?: number;
  /** 진입 애니메이션 시작 전에 지연할 시간(초) */
  delay?: number;
  /** 슬라이드 높이(px). 기본 50px만큼 아래서 위로 올라옴 */
  slideDistance?: number;
  /** 한번만 애니메이션 할지(false면 뷰포트 재진입 시 반복) */
  once?: boolean;
}

/**
 * 화면에 들어오면 FadeIn + SlideUp 되고,
 * 일정 시간 후 FadeOut + SlideDown 처리하는 컴포넌트.
 */
export default function FadeSlideUp({
  children,
  fadeInDuration = 1.0,
  fadeOutDuration = 0,
  visibleDuration = 0,
  delay = 1,
  slideDistance = 50,
  once = false,
}: FadeSlideUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once });

  // "지금 보여지는 상태"를 추적하기 위한 State
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 뷰포트에 들어온 순간(inView=true) → "보이도록" 상태 변경
    if (inView) {
      setIsVisible(true);

      // visibleDuration 초 뒤에 자동으로 다시 안 보이게 처리
      // (만약 visibleDuration <= 0 이면 타이머 세팅 안 함)
      if (visibleDuration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, (delay + fadeInDuration + visibleDuration) * 1000);

        return () => clearTimeout(timer);
      }
    } else if (!once) {
      // once=false 인 경우, 뷰포트에서 벗어날 때 다시 감춤
      setIsVisible(false);
    }
  }, [inView, fadeInDuration, fadeOutDuration, visibleDuration, delay, once]);

  return (
    <motion.div
      ref={ref}
      // 처음엔 투명 + 살짝 아래 위치
      initial={{ opacity: 0, y: slideDistance }}
      // isVisible=true → 페이드인+슬라이드업
      // isVisible=false → 다시 페이드아웃+슬라이드다운
      animate={
        isVisible
          ? {
              opacity: 1,
              y: 0,
              transition: {
                duration: fadeInDuration,
                ease: "easeOut",
                delay,
              },
            }
          : {
              opacity: 0,
              y: slideDistance,
              transition: {
                duration: fadeOutDuration,
                ease: "easeIn",
              },
            }
      }
    >
      {children}
    </motion.div>
  );
}

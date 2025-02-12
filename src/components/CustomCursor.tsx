"use client";
import React, { useEffect, useRef, useState } from "react";

const CustomCursor = () => {
  // === 추가: 모바일 환경 판별 로직 ===
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileRegex = /iphone|ipad|ipod|android|blackberry|webos|opera mini|iemobile|windows phone/i;
    setIsMobile(mobileRegex.test(userAgent));
  }, []);
  // =================================

  // PC 환경에서만 필요한 Ref와 상태
  const cursorParentRef = useRef<HTMLDivElement>(null);
  const cursorChildRef = useRef<HTMLDivElement>(null);
  const [isHover, setIsHover] = useState(false);

  const HOVER_SCALE = 1.7;

  useEffect(() => {
    // 모바일이면 이벤트 등록하지 않음
    if (isMobile) return;

    let mouseX = -9999;
    let mouseY = -9999;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const clickableEls = document.querySelectorAll("a, button, [role='button']");
    clickableEls.forEach((el) => {
      el.addEventListener("mouseenter", () => setIsHover(true));
      el.addEventListener("mouseleave", () => setIsHover(false));
    });

    const updateCursor = () => {
      if (cursorParentRef.current) {
        cursorParentRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
      if (cursorChildRef.current) {
        const scaleVal = isHover ? HOVER_SCALE : 1;
        cursorChildRef.current.style.transform = `
          translate(-50%, -50%) 
          scale(${scaleVal})
        `;
      }
      requestAnimationFrame(updateCursor);
    };

    document.addEventListener("mousemove", handleMouseMove);
    requestAnimationFrame(updateCursor);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      clickableEls.forEach((el) => {
        el.removeEventListener("mouseenter", () => setIsHover(true));
        el.removeEventListener("mouseleave", () => setIsHover(false));
      });
    };
  }, [isMobile, isHover]);

  // === PC가 아니면 컴포넌트 렌더링 자체를 안 함 ===
  if (isMobile) return null;

  return (
    <div
      ref={cursorParentRef}
      className="fixed pointer-events-none z-50"
      style={{
        transform: "translate3d(-9999px, -9999px, 0)",
      }}
    >
      <div
        ref={cursorChildRef}
        className="
          w-4 h-4 rounded-full
          origin-center
          transition-transform duration-150 ease-out
          bg-blue-500
        "
        style={{
          transformOrigin: "center center",
          mixBlendMode: "difference",
          transform: "translate(-50%, -50%) scale(1)",
        }}
      />
    </div>
  );
};

export default CustomCursor;

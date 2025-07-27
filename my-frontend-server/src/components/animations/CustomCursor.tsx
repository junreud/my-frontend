"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";

const CustomCursor = () => {
  const [isMobile, setIsMobile] = useState(false);
  const cursorParentRef = useRef<HTMLDivElement>(null);
  const cursorChildRef = useRef<HTMLDivElement>(null);
  const [isHover, setIsHover] = useState(false);

  const HOVER_SCALE = 1.7;

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileRegex = /iphone|ipad|ipod|android|blackberry|webos|opera mini|iemobile|windows phone/i;
    setIsMobile(mobileRegex.test(userAgent));
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (cursorParentRef.current) {
      cursorParentRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    }
  }, []);

  const handleMouseEnter = useCallback(() => setIsHover(true), []);
  const handleMouseLeave = useCallback(() => setIsHover(false), []);

  useEffect(() => {
    if (isMobile) return;

    const clickableEls = document.querySelectorAll("a, button, [role='button']");
    clickableEls.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      clickableEls.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, [isMobile, handleMouseMove, handleMouseEnter, handleMouseLeave]);

  useEffect(() => {
    if (isMobile) return;

    const updateCursor = () => {
      if (cursorChildRef.current) {
        const scaleVal = isHover ? HOVER_SCALE : 1;
        cursorChildRef.current.style.transform = `
          translate(-50%, -50%) 
          scale(${scaleVal})
        `;
      }
      requestAnimationFrame(updateCursor);
    };

    requestAnimationFrame(updateCursor);
  }, [isMobile, isHover]);

  if (isMobile) return null;

  return (
    <div
      ref={cursorParentRef}
      className="fixed pointer-events-none z-[9999]"
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
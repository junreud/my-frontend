"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";

const CustomCursor = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isHover, setIsHover] = useState(false); // 클릭 가능 요소 hover
  const [cursorVariant, setCursorVariant] = useState("default"); // default 또는 text
  const cursorParentRef = useRef<HTMLDivElement>(null);
  const cursorChildRef = useRef<HTMLDivElement>(null);

  const HOVER_SCALE = 1.7;

  // 모바일 여부 체크
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileRegex = /iphone|ipad|ipod|android|blackberry|webos|opera mini|iemobile|windows phone/i;
    setIsMobile(mobileRegex.test(userAgent));
  }, []);

  // 마우스 이동시 커서 위치 업데이트
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (cursorParentRef.current) {
      cursorParentRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    }
  }, []);

  // 클릭 가능한 요소에 대한 이벤트 핸들러
  const handleMouseEnter = useCallback(() => setIsHover(true), []);
  const handleMouseLeave = useCallback(() => setIsHover(false), []);

  // 텍스트 요소에 대한 이벤트 핸들러 (예: data-cursor="text"가 붙은 요소)
  const handleTextEnter = useCallback(() => setCursorVariant("text"), []);
  const handleTextLeave = useCallback(() => setCursorVariant("default"), []);

  useEffect(() => {
    if (isMobile) return;

    // 클릭 가능한 요소 이벤트 등록
    const clickableEls = document.querySelectorAll("a, button, [role='button']");
    clickableEls.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    // 텍스트 요소 이벤트 등록 (필요한 요소에 data-cursor="text"를 추가하세요)
    const textEls = document.querySelectorAll("[data-cursor='text']");
    textEls.forEach((el) => {
      el.addEventListener("mouseenter", handleTextEnter);
      el.addEventListener("mouseleave", handleTextLeave);
    });

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      clickableEls.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
      textEls.forEach((el) => {
        el.removeEventListener("mouseenter", handleTextEnter);
        el.removeEventListener("mouseleave", handleTextLeave);
      });
    };
  }, [
    isMobile,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    handleTextEnter,
    handleTextLeave,
  ]);

  // 커서 스타일 업데이트: isHover (클릭 가능한 요소 hover)와 cursorVariant (텍스트 hover)에 따라 다르게 스타일링
  useEffect(() => {
    if (isMobile) return;

    const updateCursor = () => {
      if (cursorChildRef.current) {
        const scaleVal = isHover ? HOVER_SCALE : 1;

        if (cursorVariant === "text") {
          // 텍스트 hover시 I 모양: width를 얇게, height를 길게, borderRadius 제거
          cursorChildRef.current.style.width = "2px";
          cursorChildRef.current.style.height = "24px";
          cursorChildRef.current.style.borderRadius = "0";
          cursorChildRef.current.style.backgroundColor = "black"; // 예시: I 모양일 때 색상 변경
        } else {
          // 기본 커서: 원 모양
          cursorChildRef.current.style.width = "16px";
          cursorChildRef.current.style.height = "16px";
          cursorChildRef.current.style.borderRadius = "50%";
          cursorChildRef.current.style.backgroundColor = "blue"; // 원래 색상
        }

        cursorChildRef.current.style.transform = `translate(-50%, -50%) scale(${scaleVal})`;
      }
      requestAnimationFrame(updateCursor);
    };

    requestAnimationFrame(updateCursor);
  }, [isMobile, isHover, cursorVariant]);

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
        // 기존 Tailwind 클래스(w-4, h-4 등)는 내부에서 inline 스타일로 덮어씌워집니다.
        className="origin-center transition-transform duration-150 ease-out mix-blend-difference"
        style={{
          transformOrigin: "center center",
          transform: "translate(-50%, -50%) scale(1)",
        }}
      />
    </div>
  );
};

export default CustomCursor;

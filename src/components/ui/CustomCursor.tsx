"use client";
import { useEffect, useState, useRef } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cursorType, setCursorType] = useState("");
  const [isActive, setIsActive] = useState(false);

  // 현재 마우스 좌표를 보관하는 ref
  const coordsRef = useRef({ x: 0, y: 0 });
  // requestAnimationFrame 아이디 ref
  const animRef = useRef<number | null>(null);

  // if (isMobile) {
  //   return null;
  // }

  useEffect(() => {
    // (1) pointermove: 최신 좌표 기록
    const handlePointerMove = (e: PointerEvent) => {
      if (!isActive) setIsActive(true);
      coordsRef.current.x = e.clientX;
      coordsRef.current.y = e.clientY;
    };

    // (2) pointerover: 호버 대상에 따라 커서 유형 결정
    const handlePointerOver = (e: PointerEvent) => {
      const computed = window.getComputedStyle(e.target as Element).cursor;
      if (computed === "pointer") {
        setCursorType("pointer");
      } else if (computed === "text") {
        setCursorType("text");
      } else {
        setCursorType("");
      }
    };

    // (3) rAF 루프 → setPosition
    const updatePosition = () => {
      setPosition({
        x: coordsRef.current.x,
        y: coordsRef.current.y,
      });
      animRef.current = requestAnimationFrame(updatePosition);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerover", handlePointerOver);
    animRef.current = requestAnimationFrame(updatePosition);

    // 정리(cleanup)
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerover", handlePointerOver);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isActive]);

  // 커서 위치 transform
  const cursorStyle = {
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
  };

  return (
    <div
      className={`
        fixed top-0 left-0 pointer-events-none z-[9999]
        rounded-full transition-all duration-150 ease-out
        ${isActive ? "block" : "hidden"}
        ${
          cursorType === "pointer"
            ? "w-7 h-7 bg-orange-500" // 버튼 hover 시 크기 크게
            : "w-4 h-4 bg-pink-500"  // 기본 (ex: 4x4)
        }
        ${
          cursorType === "text"
            ? "w-2 h-6 bg-blue-500"
            : ""
        }
      `}
      style={cursorStyle}
    />
  );
}

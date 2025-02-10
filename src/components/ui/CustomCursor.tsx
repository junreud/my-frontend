"use client";
import { useEffect, useState, useRef } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cursorType, setCursorType] = useState("");
  const [isActive, setIsActive] = useState(false);

  // 현재 마우스 좌표를 보관하는 ref (state가 아님!)
  const coordsRef = useRef({ x: 0, y: 0 });
  // requestAnimationFrame 아이디 저장 ref
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    // (1) pointermove 이벤트 → coordsRef에 최신 좌표 저장
    const handlePointerMove = (e: PointerEvent) => {
      if (!isActive) setIsActive(true); // 처음 움직일 때 커서 표시
      coordsRef.current.x = e.clientX;
      coordsRef.current.y = e.clientY;
    };

    // (2) pointerover → 커서 유형 결정
    const handlePointerOver = (e: PointerEvent) => {
      const computed = window.getComputedStyle(e.target as Element).cursor;
      if (computed === "pointer") setCursorType("pointer");
      else if (computed === "text") setCursorType("text");
      else setCursorType("");
    };

    // (3) rAF 루프: coordsRef 값을 읽어와 setPosition
    const updatePosition = () => {
      setPosition({
        x: coordsRef.current.x,
        y: coordsRef.current.y,
      });
      animRef.current = requestAnimationFrame(updatePosition);
    };

    // 이벤트 등록
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerover", handlePointerOver);

    // rAF 시작
    animRef.current = requestAnimationFrame(updatePosition);

    // 정리(cleanup)
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerover", handlePointerOver);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isActive]);

  // 커서 위치 반영 (translate3d)
  const cursorStyle = {
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
  };

  return (
    <div
      className={`
        fixed top-0 left-0 pointer-events-none z-[9999]
        rounded-full bg-pink-500
        transition-all duration-150 ease-out
        ${isActive ? "block" : "hidden"}
        ${cursorType === "pointer" ? "w-5 h-5 bg-orange-500" : "w-4 h-4"}
        ${cursorType === "text" ? "w-1 h-6 bg-blue-500" : ""}
      `}
      style={cursorStyle}
    />
  );
}

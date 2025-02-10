"use client";
import { useEffect, useState } from "react";

export default function CustomCursor() {
  // (1) 마우스 좌표와 현재 커서 유형(state)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cursorType, setCursorType] = useState(""); 
  // cursorType = '', 'pointer', 'text' 등

  useEffect(() => {
    // 마우스 이동 시 position 업데이트
    const handlePointerMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    // 호버 대상에 따라 커서 유형 결정
    // (버튼, 링크 → pointer, 텍스트영역(input, textarea) → text 등)
    const handlePointerOver = (e) => {
      // getComputedStyle()로 cursor 속성을 확인
      const computed = window.getComputedStyle(e.target).cursor;
      if (computed === "pointer") {
        setCursorType("pointer");
      } else if (computed === "text") {
        setCursorType("text");
      } else {
        setCursorType("");
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerover", handlePointerOver);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerover", handlePointerOver);
    };
  }, []);

  // (2) 스타일 계산
  // - translate3d를 이용해 커서 위치 이동
  // - Tailwind 클래스 조합으로 색/모양 변경
  // - transition-all로 전환 애니메이션 주기
  const cursorStyle = {
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
  };

  return (
    <div
      // Base style: 원 모양, 작고 분홍색
      className={`
        fixed top-0 left-0 pointer-events-none z-[9999]
        h-4 w-4 rounded-full bg-pink-500
        transition-all duration-150 ease-out
        ${cursorType === "pointer" ? "w-5 h-5 bg-orange-500" : ""}
        ${cursorType === "text" ? "w-1 h-6 bg-blue-500" : ""}
      `}
      style={cursorStyle}
    />
  );
}

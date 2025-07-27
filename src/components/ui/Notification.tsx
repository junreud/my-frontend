"use client";
import React, { useEffect, useState } from "react";

/**
 * 알림 유형: success | error | warning | info
 * 각각 다른 아이콘/색상으로 표시
 */
type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationProps {
  /** 열려 있는지 여부 */
  isOpen: boolean;
  /** 알림 타입(아이콘/색 등 변경) */
  type?: NotificationType;
  /** 제목 텍스트 */
  title?: string;
  /** 내용(설명) 텍스트 */
  description?: string;
  /** 닫기 버튼 등으로 알림을 닫을 때 실행할 함수 */
  onClose: () => void;
}

/**
 * Tailwind-기반 Notification 컴포넌트
 * - 등장/퇴장 애니메이션 포함
 * - type에 따라 아이콘/색상 다르게 표시
 */
const Notification: React.FC<NotificationProps> = ({
  isOpen,
  type = "info",
  title = "알림",
  description = "",
  onClose,
}) => {
  // 내부적으로 "화면에 표시할지" 여부. 퇴장 애니메이션을 위해 따로 관리
  const [show, setShow] = useState<boolean>(isOpen);

  // 각 타입별 아이콘/색상 정의
  const typeConfig: Record<
    NotificationType,
    { iconPath: string; colorClass: string }
  > = {
    success: {
      iconPath:
        "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z", // 체크표시
      colorClass: "text-green-400",
    },
    error: {
      iconPath:
        "M10 9v2m0 4h.01m9-2a9 9 0 11-18 0 9 9 0 0118 0z", // 느낌표
      colorClass: "text-red-400",
    },
    warning: {
      iconPath:
        "M9.401 13.277a.75.75 0 101.198.89l-.058-.078-.058-.075.058.075 1.056-1.057c.31-.309.352-.796.077-1.13a.75.75 0 00-1.157-.04l-.293.292-.293-.292a.75.75 0 10-1.115.997l1.085 1.118zM11.999 7a.75.75 0 01.75.75v1.916a.75.75 0 11-1.5 0V7.75A.75.75 0 0112 7z", // 물음표 등
      colorClass: "text-yellow-400",
    },
    info: {
      iconPath:
        "M11.25 9.75h.008v.008h-.008V9.75zm0 3.75h.008v3.75h-.008v-3.75zM21 12a9 9 0 11-18 0 9 9 0 0118 0z", // i
      colorClass: "text-blue-400",
    },
  };

  const { iconPath, colorClass } = typeConfig[type];

  /**
   * isOpen 값이 바뀔 때마다 show를 변경.
   * - 열릴 때: show를 true로 만든 후, 컴포넌트가 마운트된 상태에서 등장 애니메이션.
   * - 닫힐 때: 우선 애니메이션으로 opacity-0 → 약간의 시간 후 show = false
   */
  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      // 퇴장 애니메이션 후 DOM에서 제거
      const timer = setTimeout(() => {
        setShow(false);
      }, 300); // Tailwind transition 시간과 맞춤 (duration-300 등)
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // show가 false라면 완전히 DOM에서 제거
  if (!show) return null;

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 flex items-end justify-center p-4 sm:items-end sm:justify-end"
    >
      {/* 여기서 isOpen 여부에 따라 들어가는 Tailwind 클래스 변경 */}
      <div
        className={`
          transform transition-all duration-300 
          w-full max-w-sm flex-col space-y-4 
          ${isOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}
        `}
      >
        <div className="pointer-events-auto w-full overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className={`h-6 w-6 ${colorClass}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                </svg>
              </div>
              <div className="ml-3 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              </div>
              <div className="ml-4 flex flex-shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 
                      10l-3.72 3.72a.75.75 0 101.06 
                      1.06L10 11.06l3.72 3.72a.75.75 
                      0 101.06-1.06L11.06 
                      10l3.72-3.72a.75.75 
                      0 00-1.06-1.06L10 
                      8.94 6.28 5.22z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;

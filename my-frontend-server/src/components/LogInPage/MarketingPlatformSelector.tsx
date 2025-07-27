"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

// 플랫폼 목록
const PLATFORMS = [
  { id: "naver", label: "네이버", icon: "N" },
  { id: "youtube", label: "유튜브", icon: "Y" },
  { id: "instagram", label: "인스타", icon: "I" },
  { id: "google", label: "구글", icon: "G" },
  { id: "kakao", label: "카카오", icon: "K" },
  { id: "etc", label: "기타", icon: "?" },
];

interface MarketingPlatformSelectorProps {
  selectedPlatforms: string[];
  onTogglePlatform: (platformId: string) => void;
}

export default function MarketingPlatformSelector({
  selectedPlatforms,
  onTogglePlatform,
}: MarketingPlatformSelectorProps) {
  return (
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        관심있는 마케팅 플랫폼
      </label>
      {/* grid-cols-6 으로 한 줄에 버튼 6개 가로 배치.
          부모가 줄면 버튼 자동 축소 */}
      <div className="grid grid-cols-6 gap-2">
        {PLATFORMS.map((pf) => {
          const isSelected = selectedPlatforms.includes(pf.id);
          return (
            <motion.button
              key={pf.id}
              type="button"
              onClick={() => onTogglePlatform(pf.id)}
              className="relative bg-gray-100 rounded-md flex items-center justify-center overflow-hidden
                         aspect-square" // 정사각형 비율
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* 상태별 교차 표시: 선택 전 / 선택 후 */}
              <AnimatePresence mode="wait">
                {!isSelected ? (
                  <motion.div
                    key={`logo-${pf.id}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center justify-center"
                  >
                    <span className="text-2xl text-gray-600">{pf.icon}</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`selected-${pf.id}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center justify-center text-green-600"
                  >
                    <span className="text-xl">✔</span>
                    <span className="text-sm mt-1">{pf.label}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

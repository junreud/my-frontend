"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface FadeInProps {
  children: ReactNode;
  /** 페이드인 애니메이션 지속 시간(초) */
  duration?: number;
  /** 페이드인 시작 전 지연(딜레이) 시간(초) */
  delay?: number;
  /** 한 번만 애니메이션을 실행할지 여부 */
  once?: boolean;
}

export default function FadeInSection({
  children,
  duration = 1.5,
  delay = 0,
  once = false,
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{
        opacity: 1,
        transition: {
          duration, // 페이드인에 걸리는 시간
          delay,    // 몇 초 후에 시작할지
          ease: "easeOut"
        },
      }}
      viewport={{ once }}
    >
      {children}
    </motion.div>
  );
}

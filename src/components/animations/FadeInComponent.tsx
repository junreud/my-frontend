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
  /** 즉시 애니메이션을 시작할지 여부 (스크롤 감지 안함) */
  immediate?: boolean;
}

export default function FadeInSection({
  children,
  duration = 0.3,
  delay = 0,
  once = true,
  immediate = false,
}: FadeInProps) {
  if (immediate) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          transition: {
            duration,
            delay,
            ease: "easeOut"
          }
        }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{
        opacity: 1,
        transition: {
          duration,
          delay,
          ease: "easeOut"
        },
      }}
      viewport={{ 
        once,
        margin: "0px 0px -200px 0px"
      }}
    >
      {children}
    </motion.div>
  );
}

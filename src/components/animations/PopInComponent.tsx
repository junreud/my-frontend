"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";

const popInVariants = {
  hidden: {
    opacity: 0,
    scale: 0.5,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: [0, -5, 5, -2, 0], // 흔들림 효과
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

interface PopInProps {
  children: ReactNode;
}

export default function PopInComponent({ children }: PopInProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      variants={popInVariants}
      viewport={{ once: false }} // 뷰포트 진입할 때마다 재실행
    >
      {children}
    </motion.div>
  );
}

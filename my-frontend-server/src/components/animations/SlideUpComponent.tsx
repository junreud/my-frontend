"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface SlideUpProps {
  children: ReactNode;
}

export default function SlideUpComponent({ children }: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" },
      }}
      viewport={{ once: false }}
    >
      {children}
    </motion.div>
  );
}

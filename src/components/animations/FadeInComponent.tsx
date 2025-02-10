"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface FadeInProps {
  children: ReactNode;
}

export default function FadeInSection({ children }: FadeInProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{
        opacity: 1,
        transition: { duration: 0.6, ease: "easeOut" },
      }}
      viewport={{ once: false }}
    >
      {children}
    </motion.section>
  );
}

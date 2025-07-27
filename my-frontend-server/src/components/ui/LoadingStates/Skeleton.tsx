"use client";
import { motion } from "framer-motion";

interface SkeletonProps {
  variant?: "text" | "title" | "card" | "avatar" | "button";
  className?: string;
  lines?: number;
}

const Skeleton = ({ variant = "text", className = "", lines = 1 }: SkeletonProps) => {
  const baseClasses = "bg-gray-200 animate-pulse rounded";
  
  const variants = {
    text: "h-4 w-full",
    title: "h-6 w-3/4",
    card: "h-48 w-full",
    avatar: "h-12 w-12 rounded-full",
    button: "h-10 w-24"
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              delay: index * 0.1 
            }}
            className={`${baseClasses} ${variants[variant]} ${
              index === lines - 1 ? 'w-2/3' : 'w-full'
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 0.8, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    />
  );
};

export default Skeleton;

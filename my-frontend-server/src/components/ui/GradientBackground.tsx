"use client";
import { motion } from "framer-motion";

interface GradientBackgroundProps {
  variant?: "blue" | "purple" | "green" | "orange";
  children: React.ReactNode;
  className?: string;
}

const GradientBackground = ({ 
  variant = "blue", 
  children, 
  className = "" 
}: GradientBackgroundProps) => {
  const gradients = {
    blue: "from-blue-600 via-blue-700 to-indigo-800",
    purple: "from-purple-600 via-purple-700 to-indigo-800",
    green: "from-green-600 via-emerald-700 to-teal-800",
    orange: "from-orange-600 via-red-600 to-pink-700"
  };

  return (
    <div className={`relative bg-gradient-to-br ${gradients[variant]} overflow-hidden ${className}`}>
      {/* 애니메이션 배경 패턴 */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.1) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0"
        />
        
        {/* 플로팅 요소들 */}
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full"
        />
        
        <motion.div
          animate={{ 
            x: [0, -40, 0],
            y: [0, 30, 0],
            rotate: [0, -180, -360]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 right-20 w-16 h-16 bg-white/10 rounded-full"
        />
        
        <motion.div
          animate={{ 
            x: [0, 20, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/5 rounded-full"
        />
      </div>
      
      {/* 콘텐츠 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GradientBackground;

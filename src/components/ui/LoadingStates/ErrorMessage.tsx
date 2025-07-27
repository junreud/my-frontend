"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ErrorBoundaryProps {
  title?: string;
  message?: string;
  action?: ReactNode;
  variant?: "simple" | "detailed" | "404";
}

const ErrorMessage = ({ 
  title = "오류가 발생했습니다",
  message = "잠시 후 다시 시도해주세요.",
  action,
  variant = "simple"
}: ErrorBoundaryProps) => {
  
  if (variant === "404") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="text-9xl mb-4"
            >
              🤔
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              페이지를 찾을 수 없습니다
            </h2>
            <p className="text-gray-600 mb-8">
              요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              홈으로 돌아가기
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-red-50 border border-red-200 rounded-lg p-6"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="text-2xl"
            >
              ⚠️
            </motion.div>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              {title}
            </h3>
            <p className="text-sm text-red-700 mb-4">
              {message}
            </p>
            {action && (
              <div className="flex space-x-3">
                {action}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-8"
    >
      <div className="text-4xl mb-4">😵</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-4">
        {message}
      </p>
      {action}
    </motion.div>
  );
};

export default ErrorMessage;

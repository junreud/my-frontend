'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface CrawlingProgressModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  progress?: number; // 0-100
  showProgress?: boolean;
  onCancel?: () => void;
  allowCancel?: boolean;
}

export default function CrawlingProgressModal({
  isOpen,
  title,
  message,
  progress = 0,
  showProgress = true,
  onCancel,
  allowCancel = false
}: CrawlingProgressModalProps) {
  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.pointerEvents = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ pointerEvents: 'all' }}>
      {/* 배경 오버레이 - 모든 클릭 차단 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        style={{ pointerEvents: 'all' }}
      />
      
      {/* 모달 컨텐츠 */}
      <div 
        className="relative bg-white rounded-lg shadow-xl p-6 w-96 max-w-md mx-4 z-10"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        style={{ pointerEvents: 'all' }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          {allowCancel && onCancel && (
            <button
              onClick={onCancel}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* 메시지 */}
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {/* 진행률 바 */}
        {showProgress && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">진행률</span>
              <span className="text-sm font-medium text-blue-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* 로딩 애니메이션 */}
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">
            처리 중입니다...
          </span>
        </div>

        {/* 취소 버튼 */}
        {allowCancel && onCancel && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              취소
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

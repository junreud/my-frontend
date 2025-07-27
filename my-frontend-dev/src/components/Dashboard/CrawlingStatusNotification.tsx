'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Business } from '@/types';

interface CrawlingStatusNotificationProps {
  business: Business | null;
  isVisible: boolean;
  onClose: () => void;
  // 실제 크롤링 상태를 외부에서 제어할 수 있도록 props 추가
  stage?: 'preparing' | 'blog' | 'receipt' | 'completed' | 'error';
  progress?: number;
  message?: string;
  details?: string;
  error?: string;
}

interface CrawlingStatus {
  stage: 'preparing' | 'blog' | 'receipt' | 'completed' | 'error';
  message: string;
  progress: number;
  details?: string;
  error?: string;
}

export function CrawlingStatusNotification({ 
  business, 
  isVisible, 
  onClose,
  stage: externalStage,
  progress: externalProgress,
  message: externalMessage,
  details: externalDetails,
  error: externalError
}: CrawlingStatusNotificationProps) {
  const [status, setStatus] = useState<CrawlingStatus>({
    stage: 'preparing',
    message: '업체 변경 중...',
    progress: 0
  });

  // 외부 상태가 있으면 사용, 없으면 내부 시뮬레이션 사용
  useEffect(() => {
    if (externalStage !== undefined) {
      setStatus({
        stage: externalStage,
        message: externalMessage || '처리 중...',
        progress: externalProgress || 0,
        details: externalDetails,
        error: externalError
      });
      return;
    }

    // 외부 상태가 없으면 기존 시뮬레이션 로직 사용
    if (!isVisible || !business) return;

    let timeoutId: NodeJS.Timeout;
    
    const runCrawlingSimulation = async () => {
      // 1단계: 준비
      setStatus({
        stage: 'preparing',
        message: '새 업체로 전환 중...',
        progress: 10,
        details: `${business.place_name}의 데이터를 준비하고 있습니다.`
      });

      await new Promise(resolve => {
        timeoutId = setTimeout(resolve, 1000);
      });

      // 2단계: 블로그 리뷰 크롤링
      setStatus({
        stage: 'blog',
        message: '블로그 리뷰 수집 중...',
        progress: 40,
        details: '네이버 블로그에서 최신 리뷰를 수집하고 있습니다.'
      });

      await new Promise(resolve => {
        timeoutId = setTimeout(resolve, 2000);
      });

      // 3단계: 영수증 리뷰 크롤링
      setStatus({
        stage: 'receipt',
        message: '방문자 리뷰 수집 중...',
        progress: 70,
        details: '네이버 플레이스에서 방문자 리뷰를 수집하고 있습니다.'
      });

      await new Promise(resolve => {
        timeoutId = setTimeout(resolve, 2000);
      });

      // 4단계: 완료
      setStatus({
        stage: 'completed',
        message: '업체 전환 완료!',
        progress: 100,
        details: `${business.place_name}의 최신 리뷰 데이터를 성공적으로 불러왔습니다.`
      });

      // 완료 후 3초 뒤에 자동으로 닫기
      timeoutId = setTimeout(() => {
        onClose();
      }, 3000);
    };

    runCrawlingSimulation().catch(() => {
      setStatus({
        stage: 'error',
        message: '오류가 발생했습니다',
        progress: 0,
        error: '업체 전환 중 문제가 발생했습니다. 페이지를 새로고침해주세요.'
      });
    });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isVisible, business, onClose, externalStage, externalMessage, externalProgress, externalDetails, externalError]);

  if (!isVisible || !business) return null;

  const getStageIcon = () => {
    switch (status.stage) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getProgressColor = () => {
    switch (status.stage) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <>
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 bg-black bg-opacity-20 z-40" />
      
      {/* 알림 카드 */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-96 bg-white border border-gray-200 rounded-lg shadow-xl p-6 animate-in zoom-in-95 duration-300">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getStageIcon()}
            <h3 className="text-lg font-semibold text-gray-900">
              {status.message}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 업체 정보 */}
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600 mb-1">업체</p>
          <p className="font-medium text-gray-900">{business.place_name}</p>
          {business.category && (
            <p className="text-xs text-gray-500 mt-1">{business.category}</p>
          )}
        </div>

        {/* 진행률 바 */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">진행률</span>
            <span className="text-sm font-semibold text-gray-900">{status.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={cn(
                "h-3 rounded-full transition-all duration-500 ease-out",
                getProgressColor()
              )}
              style={{ width: `${status.progress}%` }}
            />
          </div>
        </div>

        {/* 상세 정보 */}
        {status.details && (
          <p className="text-sm text-gray-600 mb-3 p-2 bg-blue-50 rounded-md">
            {status.details}
          </p>
        )}

        {/* 에러 메시지 */}
        {status.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-3">
            <p className="text-sm text-red-700">{status.error}</p>
          </div>
        )}

        {/* 단계별 정보 */}
        <div className="mt-4 space-y-2">
          <div className={cn(
            "flex items-center space-x-3 text-sm p-2 rounded-md",
            ['preparing', 'blog', 'receipt', 'completed'].includes(status.stage) 
              ? "text-green-700 bg-green-50" 
              : "text-gray-500 bg-gray-50"
          )}>
            <div className={cn(
              "w-3 h-3 rounded-full",
              ['preparing', 'blog', 'receipt', 'completed'].includes(status.stage) 
                ? "bg-green-500" 
                : "bg-gray-300"
            )} />
            <span>업체 데이터 준비</span>
          </div>
          
          <div className={cn(
            "flex items-center space-x-3 text-sm p-2 rounded-md",
            ['blog', 'receipt', 'completed'].includes(status.stage) 
              ? "text-green-700 bg-green-50" 
              : status.stage === 'preparing' 
                ? "text-gray-500 bg-gray-50" 
                : "text-gray-500 bg-gray-50"
          )}>
            <div className={cn(
              "w-3 h-3 rounded-full",
              ['blog', 'receipt', 'completed'].includes(status.stage) 
                ? "bg-green-500" 
                : "bg-gray-300"
            )} />
            <span>블로그 리뷰 수집</span>
          </div>
          
          <div className={cn(
            "flex items-center space-x-3 text-sm p-2 rounded-md",
            ['receipt', 'completed'].includes(status.stage) 
              ? "text-green-700 bg-green-50" 
              : "text-gray-500 bg-gray-50"
          )}>
            <div className={cn(
              "w-3 h-3 rounded-full",
              ['receipt', 'completed'].includes(status.stage) 
                ? "bg-green-500" 
                : "bg-gray-300"
            )} />
            <span>방문자 리뷰 수집</span>
          </div>
        </div>

        {/* 완료 시 안내 메시지 */}
        {status.stage === 'completed' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">
              ✨ 업체 전환이 완료되었습니다. 대시보드에서 최신 데이터를 확인하세요.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

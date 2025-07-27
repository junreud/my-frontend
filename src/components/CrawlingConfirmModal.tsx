"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RefreshCw, Clock } from 'lucide-react';

interface CrawlingConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reviewType: 'blog' | 'receipt';
  lastCrawledAt?: string | null;
}

export default function CrawlingConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  reviewType,
  lastCrawledAt
}: CrawlingConfirmModalProps) {
  const [dontShowFor12Hours, setDontShowFor12Hours] = useState(false);

  const handleConfirm = () => {
    if (dontShowFor12Hours) {
      // 12시간 동안 보지 않기 설정
      const hideUntil = new Date();
      hideUntil.setHours(hideUntil.getHours() + 12);
      localStorage.setItem(`crawlingModalHidden_${reviewType}`, hideUntil.toISOString());
    }
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (dontShowFor12Hours) {
      // 12시간 동안 보지 않기 설정
      const hideUntil = new Date();
      hideUntil.setHours(hideUntil.getHours() + 12);
      localStorage.setItem(`crawlingModalHidden_${reviewType}`, hideUntil.toISOString());
    }
    onClose();
  };

  const reviewTypeText = reviewType === 'blog' ? '블로그' : '영수증';
  const lastCrawledText = lastCrawledAt 
    ? new Date(lastCrawledAt).toLocaleString('ko-KR')
    : '없음';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <RefreshCw className="h-6 w-6 text-blue-600" />
          </div>
          <DialogTitle className="text-lg font-semibold">
            {reviewTypeText} 리뷰를 크롤링할 시간입니다
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="text-center text-gray-600">
            <p>6시간 이상 경과한 데이터입니다.</p>
            <p>최신 리뷰 데이터를 가져오시겠습니까?</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>마지막 업데이트: {lastCrawledText}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="dontShow12Hours" 
              checked={dontShowFor12Hours}
              onCheckedChange={(checked) => setDontShowFor12Hours(checked === true)}
            />
            <label 
              htmlFor="dontShow12Hours" 
              className="text-sm text-gray-600 cursor-pointer"
            >
              12시간 동안 보지 않기
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="flex-1"
          >
            아니요
          </Button>
          <Button 
            onClick={handleConfirm}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            네, 업데이트하겠습니다
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

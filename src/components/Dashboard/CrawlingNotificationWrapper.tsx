'use client';

import React from 'react';
import { useBusinessContext } from '@/app/dashboard/BusinessContext';
import { CrawlingStatusNotification } from './CrawlingStatusNotification';

export function CrawlingNotificationWrapper() {
  const { crawlingStatus, closeCrawlingStatus } = useBusinessContext();

  // 크롤링이 진행 중일 때만 알림을 표시
  if (!crawlingStatus.isActive) {
    return null;
  }

  return (
    <CrawlingStatusNotification
      business={crawlingStatus.business}
      isVisible={crawlingStatus.isActive}
      onClose={closeCrawlingStatus}
      stage={crawlingStatus.stage}
      progress={crawlingStatus.progress}
      message={crawlingStatus.message}
      details={crawlingStatus.details}
      error={crawlingStatus.error}
    />
  );
}

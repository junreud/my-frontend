"use client";

import { useEffect } from 'react';
import { useBusinessSwitcher } from '@/hooks/useBusinessSwitcher';

/**
 * 전역 이벤트를 통해 업체 선택기를 열 수 있도록 하는 컴포넌트
 * 레이아웃에 포함시켜 사용
 */
export const BusinessSwitcherListener = () => {
  const { openBusinessSheet } = useBusinessSwitcher();
  
  useEffect(() => {
    // 전역 이벤트 리스너 등록
    const handleOpenBusinessSwitcher = () => {
      openBusinessSheet();
    };
    
    window.addEventListener('open-business-switcher', handleOpenBusinessSwitcher);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('open-business-switcher', handleOpenBusinessSwitcher);
    };
  }, [openBusinessSheet]);
  
  // 렌더링할 UI 없음 (이벤트 리스너만 등록)
  return null;
};

export default BusinessSwitcherListener;

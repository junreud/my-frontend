'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface InstantLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
}

// 즉시 반응하는 링크 컴포넌트
export function InstantLink({ href, children, className, prefetch = true }: InstantLinkProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // 외부 링크이거나 다른 방식을 사용하는 링크인 경우 처리
    if (
      href.startsWith('http') ||
      href.startsWith('#') ||
      href.startsWith('tel:') ||
      href.startsWith('mailto:')
    ) {
      return; // 기본 동작 사용
    }

    e.preventDefault();
    setIsNavigating(true);

    // 즉시 페이지 전환 효과 적용
    document.body.classList.add('page-transitioning');
    
    // 다음 틱에서 라우트 변경 (더 빠른 UI 반응성을 위해)
    setTimeout(() => {
      router.push(href);
    }, 10);
  };

  return (
    <Link 
      href={href}
      className={`${className} ${isNavigating ? 'cursor-progress' : ''}`}
      onClick={handleClick}
      prefetch={prefetch}
    >
      {children}
    </Link>
  );
}

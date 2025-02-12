// hooks/useIsDesktop.ts

import { useEffect, useState } from 'react';

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // (hover: hover) and (pointer: fine) 가 매칭되는지 확인
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setIsDesktop(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };

    // MediaQueryListListener 등록
    mediaQuery.addEventListener('change', handler);

    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, []);

  return isDesktop;
}

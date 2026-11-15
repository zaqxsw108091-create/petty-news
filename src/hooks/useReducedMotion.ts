import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/** 시스템의 "동작 줄이기" 설정을 따른다 (RN의 AccessibilityInfo.isReduceMotionEnabled 대응) */
export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(() => window.matchMedia(QUERY).matches);
  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = (e: MediaQueryListEvent) => setReduce(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return reduce;
}

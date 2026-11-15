import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Article } from 'data/news';

export type Screen =
  | { name: 'home' }
  | { name: 'article'; article: Article }
  | { name: 'archive' }
  | { name: 'report' };

interface Navigation {
  navigate: (screen: Screen) => void;
  goBack: () => void;
  /** 쌓인 화면을 모두 걷어내고 홈으로 돌아간다 */
  goHome: () => void;
}

const NavigationContext = createContext<Navigation | null>(null);

export function useNavigation(): Navigation {
  const nav = useContext(NavigationContext);
  if (!nav) throw new Error('useNavigation must be used inside <Router>');
  return nav;
}

interface HistoryState {
  idx: number;
}

function readIdx(state: unknown): number {
  const idx = (state as HistoryState | null)?.idx;
  return typeof idx === 'number' ? idx : 0;
}

/**
 * 아주 작은 화면 스택 라우터. 브라우저 history에 화면마다 항목을 쌓아,
 * 토스 상단 뒤로가기 버튼/제스처가 곧 이전 화면으로 이동하게 한다.
 * stack[0]은 항상 홈이다.
 */
export function Router({ children }: { children: (screen: Screen) => ReactNode }) {
  const [stack, setStack] = useState<Screen[]>([{ name: 'home' }]);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  indexRef.current = index;

  const stackLengthRef = useRef(1);
  stackLengthRef.current = stack.length;

  useEffect(() => {
    window.history.replaceState({ idx: 0 } satisfies HistoryState, '');
    const onPopState = (e: PopStateEvent) => {
      setIndex(Math.min(readIdx(e.state), stackLengthRef.current - 1));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((screen: Screen) => {
    const nextIdx = indexRef.current + 1;
    setStack((prev) => [...prev.slice(0, nextIdx), screen]);
    setIndex(nextIdx);
    window.history.pushState({ idx: nextIdx } satisfies HistoryState, '');
  }, []);

  const goBack = useCallback(() => {
    if (indexRef.current > 0) window.history.back();
  }, []);

  const goHome = useCallback(() => {
    if (indexRef.current > 0) window.history.go(-indexRef.current);
  }, []);

  const nav = useMemo(() => ({ navigate, goBack, goHome }), [navigate, goBack, goHome]);
  const screen = stack[index] ?? stack[0] ?? { name: 'home' as const };

  return <NavigationContext.Provider value={nav}>{children(screen)}</NavigationContext.Provider>;
}

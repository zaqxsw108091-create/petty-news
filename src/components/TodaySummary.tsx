import { useEffect, useRef, useState } from 'react';
import { fetchTodayCounts, MAX_DISPLAYABLE_COUNT, type CategoryCount } from 'data/reports';
import { SUMMARY_LIST_LABEL, type Category } from 'data/news';
import { useReducedMotion } from 'hooks/useReducedMotion';

function formatCount(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const COUNT_UP_MS = 900;

/**
 * 홈 화면 상단 오늘의 집계. 카테고리별 건수를 많은 순으로 나열하고 숫자는
 * 카운트업 애니메이션으로 보여준다. 데이터가 없거나 검증에 실패하거나
 * 최댓값이 1억을 넘으면 아무것도 렌더링하지 않는다. 건수가 0인 카테고리는 표시하지 않는다.
 */
export function TodaySummary() {
  const reduceMotion = useReducedMotion();
  const [rows, setRows] = useState<CategoryCount[] | null>(null);
  const [displayN, setDisplayN] = useState<Partial<Record<Category, number>>>({});
  const shownRef = useRef<Partial<Record<Category, number>>>({});

  useEffect(() => {
    let cancelled = false;
    fetchTodayCounts().then((counts) => {
      if (cancelled || !counts) return;
      const max = counts.reduce((m, c) => Math.max(m, c.n), 0);
      if (max > MAX_DISPLAYABLE_COUNT) return;
      setRows(counts.filter((c) => c.n > 0).sort((a, b) => b.n - a.n));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!rows) return;
    if (reduceMotion) {
      const done: Partial<Record<Category, number>> = {};
      rows.forEach(({ category, n }) => (done[category] = n));
      shownRef.current = done;
      setDisplayN(done);
      return;
    }
    const from: Partial<Record<Category, number>> = { ...shownRef.current };
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_UP_MS);
      const next: Partial<Record<Category, number>> = {};
      rows.forEach(({ category, n }) => {
        const a = from[category] ?? 0;
        next[category] = a + (n - a) * t;
      });
      shownRef.current = next;
      setDisplayN(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [rows, reduceMotion]);

  if (!rows || rows.length === 0) return null;

  return (
    <div className="today-summary">
      <div className="today-summary-title">오늘의 집계</div>
      {rows.map(({ category }) => (
        <div key={category} className="today-summary-row">
          <span>{SUMMARY_LIST_LABEL[category]}</span>
          <span className="today-summary-count">{formatCount(displayN[category] ?? 0)}명</span>
        </div>
      ))}
    </div>
  );
}

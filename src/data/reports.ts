/**
 * Supabase 연동 — 전국 제보 전송/수신.
 *
 * 원칙: 이 파일의 함수는 절대 throw하지 않는다. 실패하면 null/undefined를 돌려주고
 * 조용히 끝난다. 재시도도 하지 않는다. 로컬 속보 로직(data/news.ts, data/archive.ts)은
 * 이 파일을 몰라도 정상 동작해야 한다.
 */
import { SUPABASE_ANON_KEY, SUPABASE_FETCH_TIMEOUT_MS, SUPABASE_URL } from 'config/supabase';
import { CATEGORIES, type Category } from './news';

/**
 * 서버가 받는 카테고리 타입. DB의 insert 정책(with_check)이 CUSTOM까지 7개를
 * 허용하도록 갱신되어, 홈 버튼 6개(Exclude<Category, 'CUSTOM'>)와 달리 CUSTOM도 포함한다.
 * 단, CUSTOM이어도 카테고리 코드만 보내며 사용자가 입력한 텍스트는 절대 보내지 않는다.
 */
export type ReportCategory = Category;

/** 서버로 보내거나 서버에서 받아도 되는 카테고리 화이트리스트 */
const CATEGORY_WHITELIST: readonly ReportCategory[] = [...CATEGORIES, 'CUSTOM', 'WEEKDAY'];

function isReportCategory(value: unknown): value is ReportCategory {
  return typeof value === 'string' && (CATEGORY_WHITELIST as readonly string[]).includes(value);
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUPABASE_FETCH_TIMEOUT_MS);
  try {
    // @apps-in-toss/plugin-compat가 react-native를 중첩 설치해 AbortSignal 전역 타입이
    // 두 벌 존재한다. 런타임에는 동일한 표준 AbortSignal이라 문제 없어 signal만 캐스팅한다.
    const response = await fetch(url, { ...init, signal: controller.signal as RequestInit['signal'] });
    return response;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 제보 카테고리를 서버에 기록한다. 카테고리 코드 외에는 아무것도 보내지 않는다
 * (시각은 DB의 created_at 기본값으로 기록됨). CUSTOM(직접 제보)도 코드만 보내며,
 * 사용자가 입력한 텍스트는 호출부에서부터 이 함수에 전달되지 않는다. 실패해도 호출부는 신경 쓰지 않는다.
 */
export async function submitReport(category: ReportCategory): Promise<void> {
  if (!isReportCategory(category)) return;
  await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ category }),
  });
}

/** 최근 제보 카테고리 코드 목록(최신순). 검증에 실패하면 null */
export async function fetchRecentCategories(): Promise<ReportCategory[] | null> {
  const response = await fetchWithTimeout(
    `${SUPABASE_URL}/rest/v1/reports?select=category&order=created_at.desc&limit=30`,
    {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );
  if (!response || !response.ok) return null;

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return null;
  }
  if (!Array.isArray(json)) return null;

  const categories: ReportCategory[] = [];
  for (const row of json) {
    if (row === null || typeof row !== 'object') continue;
    const category = (row as Record<string, unknown>).category;
    if (isReportCategory(category)) categories.push(category);
  }
  return categories.length > 0 ? categories : null;
}

export interface CategoryCount {
  category: ReportCategory;
  n: number;
}

/** 카테고리별 집계 숫자가 이 값을 넘으면 표시하지 않는다(비현실적인 값으로 간주) */
export const MAX_DISPLAYABLE_COUNT = 100_000_000; // 1억

/** 오늘 카테고리별 집계. 검증에 실패하면 null. 표시 가능 여부(1억 상한)는 호출부에서 판단한다 */
export async function fetchTodayCounts(): Promise<CategoryCount[] | null> {
  const response = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/rpc/today_counts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({}),
  });
  if (!response || !response.ok) return null;

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return null;
  }
  if (!Array.isArray(json)) return null;

  const counts: CategoryCount[] = [];
  for (const row of json) {
    if (row === null || typeof row !== 'object') continue;
    const record = row as Record<string, unknown>;
    const category = record.category;
    const rawN = record.n;
    const n = typeof rawN === 'number' ? rawN : typeof rawN === 'string' ? Number(rawN) : NaN;
    if (!isReportCategory(category)) continue;
    if (!Number.isFinite(n) || n < 0) continue;
    counts.push({ category, n });
  }
  return counts.length > 0 ? counts : null;
}

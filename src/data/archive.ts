import { Storage } from '@apps-in-toss/native-modules';
import type { Article } from './news';

// SPEC 7.1
const ARCHIVE_KEY = 'pettynews:archive';
const MAX_ARCHIVE_SIZE = 100;

function isArticle(value: unknown): value is Article {
  if (typeof value !== 'object' || value === null) return false;
  const a = value as Record<string, unknown>;
  return (
    typeof a.id === 'string' &&
    typeof a.date === 'string' &&
    typeof a.category === 'string' &&
    typeof a.headline === 'string' &&
    typeof a.subtitle === 'string' &&
    typeof a.anchor === 'string' &&
    typeof a.expertName === 'string' &&
    typeof a.expertOrg === 'string' &&
    typeof a.expertLine === 'string' &&
    typeof a.ticker === 'string'
  );
}

/** 로컬 보관함을 읽는다. 저장소 접근/파싱에 실패하면 빈 배열로 폴백해 앱은 정상 동작한다 */
export async function loadArchive(): Promise<Article[]> {
  try {
    const raw = await Storage.getItem(ARCHIVE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isArticle);
  } catch {
    return [];
  }
}

async function saveArchive(articles: Article[]): Promise<void> {
  try {
    await Storage.setItem(ARCHIVE_KEY, JSON.stringify(articles.slice(0, MAX_ARCHIVE_SIZE)));
  } catch {
    // 저장 실패해도 화면은 정상 동작해야 한다 (SPEC 8.3과 동일한 원칙)
  }
}

/** 새 속보를 맨 앞에 추가하고 최대 100건으로 잘라 저장한 뒤, 갱신된 목록을 돌려준다 */
export async function publishToArchive(articles: Article[], article: Article): Promise<Article[]> {
  const next = [article, ...articles].slice(0, MAX_ARCHIVE_SIZE);
  await saveArchive(next);
  return next;
}

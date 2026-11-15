import { useEffect, useMemo, useRef, useState } from 'react';
import { loadArchive, publishToArchive } from 'data/archive';
import { submitReport } from 'data/reports';
import { NationalTicker } from 'components/NationalTicker';
import { TodaySummary } from 'components/TodaySummary';
import {
  CATEGORIES,
  CATEGORY_LABEL,
  CHANNEL_NAME,
  CHANNEL_SLOGAN,
  CLOSING,
  DAILY_PUBLISH_LIMIT,
  PRIVACY_NOTE,
  countPublishedOn,
  createArticle,
  createFollowup,
  today,
  yesterday,
  type Article,
  type Category,
  type LastPicks,
} from 'data/news';
import { useNavigation } from '../router';

type ReportCategory = Exclude<Category, 'CUSTOM'>;

/** 6개 제보 버튼을 2열로 배치하기 위한 행 단위 그룹 */
const CATEGORY_ROWS: ReportCategory[][] = [];
for (let i = 0; i < CATEGORIES.length; i += 2) {
  CATEGORY_ROWS.push(CATEGORIES.slice(i, i + 2));
}

/** 자정을 넘기면 오늘 날짜 문자열을 다시 계산해, 화면을 켜둔 채로 있어도 잠금이 자동으로 풀리게 한다 */
function useTodayDate(): string {
  const [todayStr, setTodayStr] = useState(() => today());

  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    const timer = setTimeout(() => setTodayStr(today()), nextMidnight.getTime() - now.getTime());
    return () => clearTimeout(timer);
  }, [todayStr]);

  return todayStr;
}

interface HomePageProps {
  lastPicks: LastPicks;
  setLastPicks: (picks: LastPicks) => void;
}

export function HomePage({ lastPicks, setLastPicks }: HomePageProps) {
  const navigation = useNavigation();
  const [archive, setArchive] = useState<Article[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const isPublishingRef = useRef(false);
  const todayStr = useTodayDate();

  useEffect(() => {
    let cancelled = false;
    loadArchive().then((items) => {
      if (!cancelled) setArchive(items);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // archive는 항상 최신이 앞에 오도록 저장되므로(publishToArchive), 오늘 날짜 중
  // 첫 매치가 곧 오늘 가장 최근에 발행한 기사다.
  const todayArticle = archive.find((a) => a.date === todayStr);
  const todayCount = countPublishedOn(archive, todayStr);
  const remainingCount = DAILY_PUBLISH_LIMIT - todayCount;
  const isLimitReached = remainingCount <= 0;

  // SPEC 6.4: 어제 기록이 여러 건이면 가장 최근 것 기준
  const yesterdayArticle = archive.find((a) => a.date === yesterday());
  const followupText = useMemo(
    () => (yesterdayArticle ? createFollowup(yesterdayArticle) : null),
    [yesterdayArticle?.id]
  );

  const latestArticle = archive[0];
  const latestLabel = latestArticle?.date === todayStr ? '오늘의 속보' : '어제의 속보';

  const handleReport = async (category: ReportCategory) => {
    // ref로 동기 잠금을 걸어야 한다: state는 배치되어 연타 시 두 번째 탭도 통과할 수 있다
    if (isPublishingRef.current) return;
    if (countPublishedOn(archive, today()) >= DAILY_PUBLISH_LIMIT) return;

    isPublishingRef.current = true;
    setIsPublishing(true);
    // 서버 전송은 로컬 속보 표시와 무관하게 조용히 실패해야 하므로 await하지 않는다
    void submitReport(category);
    try {
      const { article, picks } = createArticle(category, lastPicks);
      const nextArchive = await publishToArchive(archive, article);
      setArchive(nextArchive);
      setLastPicks(picks);
      navigation.navigate({ name: 'article', article });
    } finally {
      isPublishingRef.current = false;
      setIsPublishing(false);
    }
  };

  return (
    <main className="page home">
      <h1 className="channel-name">{CHANNEL_NAME}</h1>
      <p className="channel-slogan">{CHANNEL_SLOGAN}</p>

      <NationalTicker />
      <TodaySummary />

      {followupText && (
        <section className="followup">
          <div className="followup-label">어제의 후속 보도</div>
          <p className="followup-text">{followupText}</p>
        </section>
      )}

      {latestArticle && (
        <button
          type="button"
          className="latest-row"
          onClick={() => navigation.navigate({ name: 'article', article: latestArticle })}
        >
          {`${latestLabel} · "${latestArticle.headline}"`}
        </button>
      )}

      {isLimitReached ? (
        <section className="closing">
          <p>{CLOSING.line1}</p>
          <p>{CLOSING.line2}</p>
          {todayArticle && (
            <button
              type="button"
              className="outline-button review-button"
              onClick={() => navigation.navigate({ name: 'article', article: todayArticle })}
            >
              오늘의 속보 다시 보기
            </button>
          )}
        </section>
      ) : (
        <>
          <p className="prompt">오늘의 제보를 기다립니다</p>
          <p className="remaining-notice">오늘 {remainingCount}번 더 제보할 수 있습니다</p>
          <div className="grid">
            {CATEGORY_ROWS.map((row, rowIndex) => (
              <div className="grid-row" key={rowIndex}>
                {row.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className="outline-button report-button"
                    onClick={() => handleReport(category)}
                    disabled={isPublishing}
                  >
                    {CATEGORY_LABEL[category]}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="outline-button custom-button"
            onClick={() => navigation.navigate({ name: 'report' })}
            disabled={isPublishing}
          >
            ✎ 직접 제보하기
          </button>
        </>
      )}

      <button type="button" className="text-link archive-link" onClick={() => navigation.navigate({ name: 'archive' })}>
        지난 속보 보관함
      </button>

      <p className="privacy-note">{PRIVACY_NOTE}</p>
    </main>
  );
}

import { useEffect, useRef, useState } from 'react';
import { loadArchive, publishToArchive } from 'data/archive';
import { submitReport } from 'data/reports';
import {
  CHANNEL_NAME,
  CLOSING,
  DAILY_PUBLISH_LIMIT,
  countPublishedOn,
  createArticle,
  today,
  type Article,
  type LastPicks,
} from 'data/news';
import { useNavigation } from '../router';

const MAX_LENGTH = 40;

export function ReportPage({ lastPicks }: { lastPicks: LastPicks }) {
  const navigation = useNavigation();
  const [text, setText] = useState('');
  const [archive, setArchive] = useState<Article[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const isPublishingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadArchive().then((items) => {
      if (!cancelled) setArchive(items);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // SPEC 5.5/7.1: 직접 제보(CUSTOM)도 하루 발행 횟수 제한에 함께 집계된다
  const remainingCount = DAILY_PUBLISH_LIMIT - countPublishedOn(archive, today());
  const isLimitReached = remainingCount <= 0;
  const trimmed = text.trim();
  const canPublish = trimmed.length > 0 && !isLimitReached && !isPublishing;

  const handlePublish = async () => {
    // ref로 동기 잠금을 걸어야 한다: state는 배치되어 연타 시 두 번째 탭도 통과할 수 있다
    if (isPublishingRef.current) return;
    if (trimmed.length === 0) return;
    if (countPublishedOn(archive, today()) >= DAILY_PUBLISH_LIMIT) return;

    isPublishingRef.current = true;
    setIsPublishing(true);
    // 서버에는 카테고리 코드 'CUSTOM'만 보낸다. 사용자가 입력한 텍스트는 절대 넘기지 않는다
    void submitReport('CUSTOM');
    try {
      const { article } = createArticle('CUSTOM', lastPicks, trimmed);
      const nextArchive = await publishToArchive(archive, article);
      setArchive(nextArchive);
      navigation.navigate({ name: 'article', article });
    } finally {
      isPublishingRef.current = false;
      setIsPublishing(false);
    }
  };

  return (
    <main className="page report">
      <header className="top-bar">
        <button type="button" className="back-button" onClick={navigation.goBack}>
          ‹ 뒤로
        </button>
        <span className="top-bar-channel">{CHANNEL_NAME}</span>
        <span className="back-spacer" />
      </header>

      <div className="report-content">
        <label className="report-label" htmlFor="custom-text">
          오늘 있었던 일을 직접 적어주세요
        </label>

        {isLimitReached ? (
          <div className="closing">
            <p>{CLOSING.line1}</p>
            <p>{CLOSING.line2}</p>
          </div>
        ) : (
          <>
            <p className="remaining-notice">오늘 {remainingCount}번 더 제보할 수 있습니다</p>
            <textarea
              id="custom-text"
              className="report-input"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
              placeholder="예) 미루던 설거지를 끝냈다"
              maxLength={MAX_LENGTH}
              rows={4}
              autoFocus
              enterKeyHint="done"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
            />
            <p className="report-counter">
              {text.length}/{MAX_LENGTH}
            </p>
          </>
        )}

        <button type="button" className="publish-button" onClick={handlePublish} disabled={!canPublish}>
          제보하기
        </button>
      </div>
    </main>
  );
}

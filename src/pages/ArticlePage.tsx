import { useEffect, useState } from 'react';
import { saveBase64Data, share } from '@apps-in-toss/web-framework';
import { Marquee } from 'components/Marquee';
import { renderShareCard } from 'components/shareCard';
import { ANCHOR_NAME, ANCHOR_TITLE, CHANNEL_NAME, type Article, type Category } from 'data/news';
import { ANCHOR_IMAGE, EXPERT_IMAGE, type ImageSource } from 'data/characterImages';
import { useReducedMotion } from 'hooks/useReducedMotion';
import { useNavigation } from '../router';

/** 캐릭터 이미지 로딩 실패 시 대체로 쓰는 이모지 */
const EXPERT_ICON: Record<Category, string> = {
  WAKE: '🐨',
  EAT: '🐹',
  NOTHING: '🦥',
  ENDURE: '🐙',
  WASH: '🐱',
  OUTING: '🐚',
  CUSTOM: '🐭',
};

const ANCHOR_ICON = '🕊️';

function CharacterAvatar({ source, fallbackEmoji }: { source: ImageSource; fallbackEmoji: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="avatar-box">
      {failed ? (
        <span className="avatar-fallback">{fallbackEmoji}</span>
      ) : (
        <img className="avatar-image" src={source.uri} alt="" onError={() => setFailed(true)} />
      )}
    </div>
  );
}

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function ArticlePage({ article }: { article: Article }) {
  const navigation = useNavigation();
  const reduceMotion = useReducedMotion();
  const publishedAt = formatTime(new Date(Number(article.id)));
  const [typedLength, setTypedLength] = useState(reduceMotion ? article.headline.length : 0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const handleSaveAndShare = async () => {
    if (saveStatus === 'saving') return;
    setSaveStatus('saving');
    try {
      const base64 = await renderShareCard(article);
      await saveBase64Data({ data: base64, fileName: `pettynews-${article.id}.png`, mimeType: 'image/png' });
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
      return;
    }
    // 공유 시트는 곁들이는 기능이라, 사용자가 취소해도 이미지 저장 자체는 이미 끝났으므로 조용히 무시한다
    try {
      await share({ message: `${article.headline} — ${CHANNEL_NAME}` });
    } catch {
      // ignore
    }
  };

  // 헤드라인 한 글자씩 타이핑
  useEffect(() => {
    const total = article.headline.length;
    if (reduceMotion) {
      setTypedLength(total);
      return;
    }
    setTypedLength(0);
    const charInterval = Math.min(40, Math.max(15, 900 / Math.max(total, 1)));
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setTypedLength(i);
      if (i >= total) clearInterval(timer);
    }, charInterval);
    return () => clearInterval(timer);
  }, [reduceMotion, article.headline]);

  return (
    <main className="page article">
      {/* 1. 화면 붉게 번쩍 */}
      <div className="flash-overlay" aria-hidden="true" />

      <header className="top-bar">
        <div className="top-bar-left">
          {/* 2. 속보 배지 오버슛 슬라이드인 */}
          <span className="badge">속보</span>
          <span className="top-bar-channel">{CHANNEL_NAME}</span>
        </div>
        <span className="time">{publishedAt}</span>
      </header>

      {/* 헤드라인 길이는 CUSTOM(직접 제보) 40자 입력에 따라 크게 달라질 수 있어
          스크롤 영역으로 감싸, 하단 티커·버튼이 화면 밖으로 밀려나지 않게 한다 */}
      <div className="article-scroll">
        <section className="headline-block">
          <h1 className="headline" aria-label={article.headline}>
            {article.headline.slice(0, typedLength)}
          </h1>
          <p className="subtitle">― {article.subtitle} ―</p>
        </section>

        <section className="comment-row">
          <div className="comment-author-row">
            <CharacterAvatar source={ANCHOR_IMAGE} fallbackEmoji={ANCHOR_ICON} />
            <span className="comment-author">
              {ANCHOR_TITLE} {ANCHOR_NAME}
            </span>
          </div>
          <p className="comment-line">{article.anchor}</p>
        </section>

        <section className="comment-row">
          <div className="comment-author-row">
            <CharacterAvatar source={EXPERT_IMAGE[article.category]} fallbackEmoji={EXPERT_ICON[article.category]} />
            <span className="comment-author">
              {article.expertOrg} {article.expertName}
            </span>
          </div>
          <p className="comment-line">{article.expertLine}</p>
        </section>
      </div>

      {/* 4. 하단 티커 */}
      <div className="ticker-row">
        <span className="ticker-arrow">◀</span>
        <Marquee text={article.ticker} className="ticker-clip" />
        <span className="ticker-arrow">◀</span>
      </div>

      {saveStatus === 'saved' && <p className="save-notice">이미지를 저장했어요.</p>}
      {saveStatus === 'error' && <p className="save-notice">저장에 실패했어요. 다시 시도해주세요.</p>}

      <div className="action-row">
        <button type="button" className="outline-button action-button" onClick={handleSaveAndShare} disabled={saveStatus === 'saving'}>
          {saveStatus === 'saving' ? '저장 중…' : '저장하고 공유하기'}
        </button>
        <button type="button" className="outline-button action-button" onClick={() => navigation.navigate({ name: 'archive' })}>
          보관함
        </button>
      </div>

      <div className="home-link-row">
        <button type="button" className="text-link home-link" onClick={navigation.goHome}>
          보도국으로
        </button>
      </div>
    </main>
  );
}

import { useEffect, useState } from 'react';
import { fetchRecentCategories } from 'data/reports';
import { NATION_TICKER_LABEL } from 'data/news';
import { Marquee } from './Marquee';

const SEPARATOR = '     ·     ';

/**
 * 홈 화면 상단 전국 티커. Supabase에서 최근 제보 카테고리 코드만 받아
 * NATION_TICKER_LABEL로 로컬 문장 매핑해서 흘려보낸다.
 * 데이터가 없거나(오프라인 포함) 검증에 실패하면 아무것도 렌더링하지 않는다.
 * 홈이 마운트될 때마다(화면 복귀 포함) 재조회한다.
 */
export function NationalTicker() {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchRecentCategories().then((categories) => {
      if (cancelled || !categories) return;
      setText(categories.map((c) => NATION_TICKER_LABEL[c]).join(SEPARATOR));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!text) return null;
  return (
    <div className="national-ticker">
      <Marquee text={text} />
    </div>
  );
}

import React, { forwardRef } from 'react';
import Svg, { Line, Rect, Text as SvgText, TSpan } from '@granite-js/native/react-native-svg';
import { ANCHOR_NAME, ANCHOR_TITLE, CHANNEL_NAME, type Article } from 'data/news';

const CARD_WIDTH = 720;
const PADDING = 40;
const CONTENT_WIDTH = CARD_WIDTH - PADDING * 2;
const RED = '#F04452';
const BLACK = '#000000';

/** 폭에 맞춰 대략적인 글자 수 기준으로 줄바꿈한다. 공백이 없는 긴 구간(예: CUSTOM의 『...』)은 강제로 자른다 */
function wrapText(text: string, fontSize: number, maxWidth: number = CONTENT_WIDTH): string[] {
  const maxChars = Math.max(1, Math.floor(maxWidth / (fontSize * 1.05)));
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  const flush = () => {
    if (current) {
      lines.push(current);
      current = '';
    }
  };
  for (let word of words) {
    while (word.length > maxChars) {
      flush();
      lines.push(word.slice(0, maxChars));
      word = word.slice(maxChars);
    }
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars) {
      flush();
      current = word;
    } else {
      current = candidate;
    }
  }
  flush();
  return lines.length > 0 ? lines : [''];
}

/** 헤드라인 글자 수(CUSTOM은 최대 약 59자)에 따라 폰트 크기를 단계별로 낮춰 줄바꿈 계산을 단순하게 유지한다 */
function headlineFontSize(length: number): number {
  if (length <= 14) return 44;
  if (length <= 26) return 36;
  if (length <= 40) return 30;
  return 24;
}

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

interface ShareCardProps {
  article: Article;
}

export type ShareCardHandle = React.ElementRef<typeof Svg>;

/**
 * 속보를 공유용 이미지로 저장하기 위한 캡처 전용 카드.
 *
 * 앱인토스에는 View를 이미지로 캡처하는 API가 없고(react-native-view-shot 같은
 * 서드파티 네이티브 모듈도 지원 범위 밖), 공식 번들된 react-native-svg의
 * Svg.toDataURL()만 이 환경에서 쓸 수 있다. 그래서 화면과 픽셀 단위로 맞추지 않고
 * 세로로 긴 카드 한 장으로 별도 설계했다.
 */
export const ShareCard = forwardRef<ShareCardHandle, ShareCardProps>(function ShareCard({ article }, ref) {
  const publishedAt = formatTime(new Date(Number(article.id)));
  const elements: React.ReactNode[] = [];

  const topY = 40;
  elements.push(
    <Rect key="badge-bg" x={PADDING} y={topY} width={84} height={40} fill={RED} />,
    <SvgText key="badge-text" x={PADDING + 42} y={topY + 27} fontSize={20} fontWeight="bold" fill="#FFFFFF" textAnchor="middle">
      속보
    </SvgText>,
    <SvgText key="channel" x={PADDING + 100} y={topY + 28} fontSize={22} fontWeight="bold" fill={BLACK}>
      {CHANNEL_NAME}
    </SvgText>,
    <SvgText key="time" x={CARD_WIDTH - PADDING} y={topY + 28} fontSize={18} fill="#666666" textAnchor="end">
      {publishedAt}
    </SvgText>
  );

  let cursorY = topY + 40 + 30;
  elements.push(<Line key="div-top" x1={PADDING} y1={cursorY} x2={CARD_WIDTH - PADDING} y2={cursorY} stroke={BLACK} strokeWidth={2} />);

  cursorY += 56;
  const headlineFont = headlineFontSize(article.headline.length);
  const headlineLineHeight = Math.round(headlineFont * 1.32);
  const headlineLines = wrapText(article.headline, headlineFont);
  elements.push(
    <SvgText key="headline" x={PADDING} y={cursorY} fontSize={headlineFont} fontWeight="bold" fill={BLACK}>
      {headlineLines.map((line, i) => (
        <TSpan key={i} x={PADDING} dy={i === 0 ? 0 : headlineLineHeight}>
          {line}
        </TSpan>
      ))}
    </SvgText>
  );
  cursorY += (headlineLines.length - 1) * headlineLineHeight;

  cursorY += 44;
  const subtitleLines = wrapText(`― ${article.subtitle} ―`, 22);
  elements.push(
    <SvgText key="subtitle" x={PADDING} y={cursorY} fontSize={22} fill="#333333">
      {subtitleLines.map((line, i) => (
        <TSpan key={i} x={PADDING} dy={i === 0 ? 0 : 30}>
          {line}
        </TSpan>
      ))}
    </SvgText>
  );
  cursorY += (subtitleLines.length - 1) * 30;

  cursorY += 40;
  elements.push(<Line key="div-headline" x1={PADDING} y1={cursorY} x2={CARD_WIDTH - PADDING} y2={cursorY} stroke={BLACK} strokeWidth={2} />);

  function drawCommentRow(key: string, author: string, line: string) {
    cursorY += 48;
    elements.push(
      <SvgText key={`${key}-author`} x={PADDING} y={cursorY} fontSize={22} fontWeight="bold" fill={BLACK}>
        {author}
      </SvgText>
    );
    cursorY += 38;
    const lines = wrapText(line, 24);
    elements.push(
      <SvgText key={`${key}-line`} x={PADDING} y={cursorY} fontSize={24} fill={BLACK}>
        {lines.map((l, i) => (
          <TSpan key={i} x={PADDING} dy={i === 0 ? 0 : 32}>
            {l}
          </TSpan>
        ))}
      </SvgText>
    );
    cursorY += (lines.length - 1) * 32;
    cursorY += 36;
    elements.push(<Line key={`${key}-div`} x1={PADDING} y1={cursorY} x2={CARD_WIDTH - PADDING} y2={cursorY} stroke={BLACK} strokeWidth={2} />);
  }

  drawCommentRow('anchor', `${ANCHOR_TITLE} ${ANCHOR_NAME}`, article.anchor);
  drawCommentRow('expert', `${article.expertOrg} ${article.expertName}`, article.expertLine);

  cursorY += 30;
  const tickerHeight = 56;
  elements.push(
    <Rect key="ticker-bg" x={0} y={cursorY} width={CARD_WIDTH} height={tickerHeight} fill={RED} />,
    <SvgText key="ticker-text" x={CARD_WIDTH / 2} y={cursorY + tickerHeight / 2 + 8} fontSize={20} fill="#FFFFFF" textAnchor="middle">
      {`속보 · ${article.ticker}`}
    </SvgText>
  );
  cursorY += tickerHeight;

  cursorY += 60;
  elements.push(
    <SvgText key="watermark" x={CARD_WIDTH / 2} y={cursorY} fontSize={18} fill="#999999" textAnchor="middle">
      보도블록 · 하찮은 속보
    </SvgText>
  );
  cursorY += 40;

  const cardHeight = cursorY;

  return (
    <Svg ref={ref} width={CARD_WIDTH} height={cardHeight} viewBox={`0 0 ${CARD_WIDTH} ${cardHeight}`}>
      <Rect x={0} y={0} width={CARD_WIDTH} height={cardHeight} fill="#FFFFFF" />
      {elements}
    </Svg>
  );
});

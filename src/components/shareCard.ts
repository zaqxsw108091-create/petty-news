import { ANCHOR_NAME, ANCHOR_TITLE, CHANNEL_NAME, type Article } from 'data/news';
import { ANCHOR_IMAGE, EXPERT_IMAGE } from 'data/characterImages';

const CARD_WIDTH = 720;
const PADDING = 40;
const CONTENT_WIDTH = CARD_WIDTH - PADDING * 2;
const RED = '#F04452';
const BLACK = '#000000';
const AVATAR_SIZE = 72;
const AVATAR_GAP = 20;
const COMMENT_TEXT_X = PADDING + AVATAR_SIZE + AVATAR_GAP;
const FONT_FAMILY = `-apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif`;

/** 헤드라인 글자 수(CUSTOM은 최대 약 59자)에 따라 폰트 크기를 단계별로 낮춘다 */
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

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** 실제 글자 폭(measureText)으로 줄바꿈한다. 공백이 없는 긴 구간(예: CUSTOM의 『...』)은 글자 단위로 자른다 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = '';
  const push = () => {
    if (current) lines.push(current);
    current = '';
  };
  for (const word of text.split(' ')) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
      continue;
    }
    push();
    if (ctx.measureText(word).width <= maxWidth) {
      current = word;
      continue;
    }
    for (const ch of word) {
      if (current && ctx.measureText(current + ch).width > maxWidth) push();
      current += ch;
    }
  }
  push();
  return lines.length > 0 ? lines : [''];
}

interface Assets {
  anchor: HTMLImageElement | null;
  expert: HTMLImageElement | null;
}

/** 카드를 그리고 최종 높이를 돌려준다. 높이 계산용(1차)과 실제 그리기(2차)에 같은 코드를 쓴다 */
function draw(ctx: CanvasRenderingContext2D, article: Article, assets: Assets, height: number): number {
  const publishedAt = formatTime(new Date(Number(article.id)));
  const font = (size: number, bold = false) => `${bold ? 'bold ' : ''}${size}px ${FONT_FAMILY}`;
  const text = (value: string, x: number, y: number, size: number, color: string, opts: { bold?: boolean; align?: CanvasTextAlign } = {}) => {
    ctx.font = font(size, opts.bold);
    ctx.fillStyle = color;
    ctx.textAlign = opts.align ?? 'left';
    ctx.fillText(value, x, y);
  };
  const line = (y: number) => {
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PADDING, y);
    ctx.lineTo(CARD_WIDTH - PADDING, y);
    ctx.stroke();
  };
  const measure = (size: number, bold = false) => {
    ctx.font = font(size, bold);
  };

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, CARD_WIDTH, height);
  ctx.textBaseline = 'alphabetic';

  const topY = 40;
  ctx.fillStyle = RED;
  ctx.fillRect(PADDING, topY, 84, 40);
  text('속보', PADDING + 42, topY + 27, 20, '#FFFFFF', { bold: true, align: 'center' });
  text(CHANNEL_NAME, PADDING + 100, topY + 28, 22, BLACK, { bold: true });
  text(publishedAt, CARD_WIDTH - PADDING, topY + 28, 18, '#666666', { align: 'right' });

  let y = topY + 40 + 30;
  line(y);

  y += 56;
  const headlineFont = headlineFontSize(article.headline.length);
  const headlineLineHeight = Math.round(headlineFont * 1.32);
  measure(headlineFont, true);
  const headlineLines = wrapText(ctx, article.headline, CONTENT_WIDTH);
  headlineLines.forEach((l, i) => text(l, PADDING, y + i * headlineLineHeight, headlineFont, BLACK, { bold: true }));
  y += (headlineLines.length - 1) * headlineLineHeight;

  y += 44;
  measure(22);
  const subtitleLines = wrapText(ctx, `― ${article.subtitle} ―`, CONTENT_WIDTH);
  subtitleLines.forEach((l, i) => text(l, PADDING, y + i * 30, 22, '#333333'));
  y += (subtitleLines.length - 1) * 30;

  y += 40;
  line(y);

  const commentRow = (author: string, body: string, avatar: HTMLImageElement | null) => {
    const avatarY = y + 12;
    if (avatar) ctx.drawImage(avatar, PADDING, avatarY, AVATAR_SIZE, AVATAR_SIZE);
    y += 48;
    text(author, COMMENT_TEXT_X, y, 22, BLACK, { bold: true });
    y += 38;
    measure(24);
    const lines = wrapText(ctx, body, CONTENT_WIDTH - (AVATAR_SIZE + AVATAR_GAP));
    lines.forEach((l, i) => text(l, COMMENT_TEXT_X, y + i * 32, 24, BLACK));
    y += (lines.length - 1) * 32;
    y += 36;
    // 코멘트가 짧아 아바타보다 낮게 끝나면, 구분선이 아바타를 가로지르지 않도록 아래로 밀어준다
    y = Math.max(y, avatarY + AVATAR_SIZE + 16);
    line(y);
  };

  commentRow(`${ANCHOR_TITLE} ${ANCHOR_NAME}`, article.anchor, assets.anchor);
  commentRow(`${article.expertOrg} ${article.expertName}`, article.expertLine, assets.expert);

  y += 30;
  const tickerHeight = 56;
  ctx.fillStyle = RED;
  ctx.fillRect(0, y, CARD_WIDTH, tickerHeight);
  text(`속보 · ${article.ticker}`, CARD_WIDTH / 2, y + tickerHeight / 2 + 8, 20, '#FFFFFF', { align: 'center' });
  y += tickerHeight;

  y += 60;
  text('보도블록 · 하찮은 속보', CARD_WIDTH / 2, y, 18, '#999999', { align: 'center' });
  y += 28;
  text(`토스 앱에서 '하찮은 속보' 검색`, CARD_WIDTH / 2, y, 14, '#999999', { align: 'center' });
  y += 34;

  return y;
}

/**
 * 속보를 공유용 이미지(PNG)로 만들어 순수 base64 문자열(data: 접두어 없음)로 돌려준다.
 * 화면과 픽셀 단위로 맞추지 않고 세로로 긴 카드 한 장으로 별도 설계했다.
 */
export async function renderShareCard(article: Article): Promise<string> {
  const [anchor, expert] = await Promise.all([
    loadImage(ANCHOR_IMAGE.uri),
    loadImage(EXPERT_IMAGE[article.category].uri),
  ]);
  const assets: Assets = { anchor, expert };

  const probe = document.createElement('canvas');
  probe.width = CARD_WIDTH;
  probe.height = 10;
  const probeCtx = probe.getContext('2d');
  if (!probeCtx) throw new Error('canvas unsupported');
  const height = draw(probeCtx, article, assets, 10);

  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unsupported');
  draw(ctx, article, assets, height);

  return canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
}

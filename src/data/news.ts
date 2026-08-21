/**
 * 하찮은 속보 — 문장 데이터
 *
 * 톤 규칙 (수정 시 반드시 지킬 것)
 * - 실제 뉴스 리포트 문체. 격식체, 건조체
 * - 이모지, ㅋㅋ, ㅎㅎ 금지
 * - 앵커가 웃기려 한다는 티를 내지 않는다
 * - 사용자를 절대 비웃지 않는다. 앵커는 항상 사용자 편이다
 * - 금지어: 겨우, 고작, 그것밖에, 불과
 * - 권장어: 마침내, 끝내, 기어이, 이례적으로
 * - 나이·성별·외모·소득 추측 금지. "한 시민", "익명의 제보자"만 사용
 */

export type Category =
  | 'WAKE'
  | 'EAT'
  | 'NOTHING'
  | 'ENDURE'
  | 'WASH'
  | 'OUTING'
  | 'CUSTOM';

export const CATEGORIES: Exclude<Category, 'CUSTOM'>[] = [
  'WAKE',
  'EAT',
  'NOTHING',
  'ENDURE',
  'WASH',
  'OUTING',
];

export const CATEGORY_LABEL: Record<Exclude<Category, 'CUSTOM'>, string> = {
  WAKE: '일어남',
  EAT: '밥 먹음',
  NOTHING: '아무것도 안 함',
  ENDURE: '참았음',
  WASH: '씻었음',
  OUTING: '나갔다옴',
};

export interface Expert {
  name: string;
  org: string;
  animal: string;
  lines: string[];
}

export interface CategoryBank {
  headline: string[];
  subtitle: string[];
  expert: Expert;
}

export const CHANNEL_NAME = '보도블록';
export const CHANNEL_SLOGAN = '별 소식은 없습니다';
export const ANCHOR_NAME = '구본새';
export const ANCHOR_TITLE = '앵커';

export const ONBOARDING = {
  line1: '세상을 바꾸는 일만',
  line2: '뉴스가 아닙니다.',
  line3: '오늘 당신이 해낸 일도',
  line4: '소식입니다.',
};

export const CLOSING = {
  line1: '오늘 소식은 여기까지입니다.',
  line2: '내일도 하찮은 하루 되시길 바랍니다.',
};

export const EMPTY_ARCHIVE = '아직 보도된 소식이 없습니다. 오늘의 제보를 기다립니다.';
export const PRIVACY_NOTE = '이 앱은 어떤 개인정보도 수집하지 않습니다';

/* ────────────────────────────────────────── */

export const BANK: Record<Exclude<Category, 'CUSTOM'>, CategoryBank> = {
  WAKE: {
    headline: [
      '한 시민, 오늘 아침 기어이 일어나',
      '익명의 제보자, 알람 네 번 만에 몸 일으켜',
      '오늘 아침 한 시민이 눈을 떴습니다',
      '이불 밖 진출 성공… 관계자들 "이례적"',
      '한 시민, 일어나지 않을 뻔했으나 끝내 일어나',
      '새벽부터 이어진 사투 끝에 기상 확인돼',
      '한 시민, 오늘도 세상에 복귀',
      '제보에 따르면 오늘 아침 침대에서 이탈 확인',
      '눈을 뜬 뒤 다시 감지 않은 것으로 전해져',
      '한 시민, 어제의 자신과 한 약속 지켜',
    ],
    subtitle: [
      '본인도 놀란 것으로 전해져',
      '관계자들 "쉽지 않았을 것"',
      '5년 만의 쾌거',
      '현장은 비교적 차분한 분위기',
      '주변에서는 "충분하다"는 반응',
      '후속 조치는 아직 없어',
    ],
    expert: {
      name: '고자몽',
      org: '기상연구원',
      animal: '코알라',
      lines: [
        '"일어난다는 건 그 자체로 결단입니다."',
        '"저는 하루 스무 시간을 잡니다. 그래서 이 성취를 압니다."',
        '"알람을 네 번 껐다면 네 번 고민했다는 뜻입니다."',
        '"쉽지 않은 결정이었을 겁니다. 저라면 못 했습니다."',
        '"일어난 이상 오늘은 이미 절반을 해낸 셈입니다."',
        '"기상 시각보다 기상 여부가 중요합니다."',
        '"이불의 저항이 강한 계절이었습니다."',
        '"내일도 일어난다면 그건 기록입니다."',
      ],
    },
  },

  EAT: {
    headline: [
      '한 시민, 오늘 끼니 챙긴 것으로 확인',
      '익명의 제보자, 무언가를 먹는 데 성공',
      '오늘 한 시민이 밥을 먹었습니다',
      '굶지 않기로 한 결정, 조용히 전해져',
      '냉장고 앞 15분 고민 끝에 식사 확인',
      '제보에 따르면 오늘 한 끼 이상 섭취',
      '편의점에서 목격된 한 시민, 식사로 판단돼',
      '한 시민, 배달 앱을 열었고 결국 눌렀다',
      '오늘의 식사, 특별한 사고 없이 마무리',
      '한 시민, 대충이지만 먹었다',
    ],
    subtitle: [
      '관계자들 "잘한 일"',
      '메뉴는 끝내 밝혀지지 않아',
      '몸이 먼저 알았다는 분석',
      '내부에서는 "충분하다"는 평가',
      '후속 식사 여부는 미정',
      '현장에는 그릇만 남아',
    ],
    expert: {
      name: '함미숙',
      org: '식사문화원',
      animal: '햄스터',
      lines: [
        '"먹었다면 그걸로 오늘은 성립합니다."',
        '"무엇을 먹었는지는 중요하지 않습니다."',
        '"굶지 않은 것만으로 상위권입니다."',
        '"저희 연구원은 이를 자기 돌봄으로 분류합니다."',
        '"식사는 가장 조용한 형태의 자기 보호입니다."',
        '"라면도 식사입니다. 논쟁의 여지가 없습니다."',
        '"제때는 아니었지만 결국 먹었습니다."',
        '"다음 끼니도 기대해볼 만합니다."',
      ],
    },
  },

  NOTHING: {
    headline: [
      '익명의 제보자, 오늘 하루 아무것도 하지 않아',
      '한 시민, 오늘 아무 일도 벌이지 않기로',
      '오늘도 조용히 지나간 하루… 관계자들 안도',
      '한 시민, 하루 종일 특별한 움직임 없어',
      '아무 일도 일어나지 않은 것으로 확인',
      '한 시민, 계획을 세웠으나 실행하지 않아',
      '오늘의 성과 없음… 사고도 없음',
      '제보에 따르면 오늘 하루 무사히 흘러가',
      '한 시민, 누워 있었고 그것이 전부였다',
      '사건 없는 하루, 이례적으로 평온',
    ],
    subtitle: [
      '관계자들 "충분히 잘한 일"',
      '아무 일도 없었다는 것이 핵심',
      '내부에서는 "휴식"으로 분류',
      '별다른 피해 보고되지 않아',
      '이 또한 하루로 인정돼',
      '후속 일정 역시 없음',
    ],
    expert: {
      name: '나태호',
      org: '무위연구소',
      animal: '나무늘보',
      lines: [
        '"가만히 있는 것도 능력입니다."',
        '"아무것도 하지 않으면 아무 일도 생기지 않습니다. 좋은 일입니다."',
        '"쉬는 데에도 용기가 필요합니다."',
        '"저희 연구소는 이를 정상 범주로 봅니다."',
        '"하루쯤 비워두는 건 낭비가 아닙니다."',
        '"움직이지 않은 덕분에 부러지지도 않았습니다."',
        '"성과가 없다는 건 사고도 없었다는 뜻입니다."',
        '"내일은 내일이 알아서 할 겁니다."',
      ],
    },
  },

  ENDURE: {
    headline: [
      '한 시민, 하고 싶은 말 끝내 참아',
      '익명의 제보자, 보내려던 메시지 삭제',
      '오늘 한 시민이 화를 삼켰습니다',
      '참을 수 없었으나 결국 참은 것으로 전해져',
      '한 시민, 하지 않아도 될 말을 하지 않아',
      '제보에 따르면 오늘 큰 충돌 없이 마무리',
      '한 시민, 열 셀 때까지 기다렸다',
      '손가락은 움직였으나 전송은 없었다',
      '오늘의 인내, 아무도 모르게 지나가',
      '한 시민, 울지 않기로 결정',
    ],
    subtitle: [
      '내부에서는 "대단하다"는 평가',
      '아무도 모르는 승리',
      '관계자들 "박수받을 일"',
      '대가는 본인만 알고 있어',
      '후폭풍은 없는 것으로 확인',
      '참은 이유는 밝혀지지 않아',
    ],
    expert: {
      name: '문인내',
      org: '인내학회',
      animal: '문어',
      lines: [
        '"참는 자에게 복이 옵니다. 아마도요."',
        '"말하지 않은 말은 되돌릴 필요가 없습니다."',
        '"저희 학회 기준으로는 최상위 등급입니다."',
        '"저는 참으면 얼굴색이 먼저 말합니다. 부럽습니다."',
        '"오늘 참은 것은 내일의 평화입니다."',
        '"삼킨 말은 언젠가 소화되기 마련입니다."',
        '"이런 일은 기록에 남지 않아 더 값집니다."',
        '"다만 너무 오래 참지는 마십시오."',
      ],
    },
  },

  WASH: {
    headline: [
      '한 시민, 오늘 씻은 것으로 확인',
      '익명의 제보자, 미루던 샤워 끝내 수행',
      '오늘 한 시민이 물과 마주했습니다',
      '30분간의 망설임 끝에 욕실 진입',
      '한 시민, 머리까지 감은 것으로 전해져',
      '제보에 따르면 오늘 청결 상태 개선',
      '씻고 나온 뒤 기분이 나아졌다는 증언',
      '한 시민, 결국 일어나서 씻었다',
      '오늘의 샤워, 예정보다 늦었으나 완료',
      '한 시민, 어제의 자신보다 깨끗해져',
    ],
    subtitle: [
      '본인은 "개운하다"고 밝혀',
      '관계자들 "쉬운 일이 아니다"',
      '소요 시간은 공개되지 않아',
      '머리 말리기는 생략된 것으로 보여',
      '현장에는 수증기만 남아',
      '내일도 이어질지는 미지수',
    ],
    expert: {
      name: '모수진',
      org: '목욕과학회',
      animal: '고양이',
      lines: [
        '"씻는다는 것은 하루를 정리하는 행위입니다. 저는 안 합니다만."',
        '"물에 닿는 순간 대부분은 나아집니다. 닿기까지가 어렵습니다."',
        '"미뤘다가 했다면 그건 미룬 게 아닙니다."',
        '"저희 학회는 이를 회복의 신호로 봅니다."',
        '"머리를 감았다면 상당한 결심이 있었을 겁니다."',
        '"저 역시 물을 좋아하지 않기에 이 성취를 압니다."',
        '"개운함은 과학적으로도 설명됩니다. 인정하기는 싫습니다."',
        '"다음 샤워도 무리 없이 가능할 전망입니다. 아마도요."',
      ],
    },
  },

  OUTING: {
    headline: [
      '한 시민, 오늘 집 밖으로 나가',
      '익명의 제보자, 현관문 통과 확인',
      '오늘 한 시민이 바깥 공기를 마셨습니다',
      '나가기 싫었으나 결국 나간 것으로 전해져',
      '한 시민, 편의점까지 왕복 성공',
      '제보에 따르면 오늘 외출 기록 확인',
      '신발을 신은 것이 결정적이었다는 분석',
      '한 시민, 햇빛과 짧게 마주쳐',
      '오늘의 외출, 무사히 귀가로 마무리',
      '한 시민, 나갔다 왔고 그것으로 충분했다',
    ],
    subtitle: [
      '이동 거리는 중요하지 않다는 평가',
      '관계자들 "큰 결심"',
      '귀가 시각은 이르렀던 것으로 보여',
      '외출 목적은 끝내 밝혀지지 않아',
      '현관에는 신발만 남아',
      '내일 외출 여부는 미정',
    ],
    expert: {
      name: '소집사',
      org: '외출연구소',
      animal: '소라게',
      lines: [
        '"거리는 중요하지 않습니다. 나갔다는 사실이 중요합니다."',
        '"저희 연구소 기준 현관 통과는 외출입니다."',
        '"저는 집을 두고 나가본 적이 없습니다. 대단한 일입니다."',
        '"집 밖은 생각보다 위험하지 않았을 겁니다."',
        '"햇빛을 봤다면 오늘은 성공입니다."',
        '"돌아왔다는 것이 무엇보다 중요합니다."',
        '"왕복 성공률은 생각보다 높지 않습니다."',
        '"다음 외출은 조금 더 쉬울 겁니다."',
      ],
    },
  },
};

/* ────────────────────────────────────────── */

/** 앵커 구본새 멘트 — 전 카테고리 공용 */
export const ANCHOR_LINES: string[] = [
  '"네, 방금 들어온 소식입니다."',
  '"현장 분위기는 비교적 차분합니다."',
  '"이 소식은 조용히 전해졌습니다."',
  '"관계자들은 말을 잇지 못하고 있습니다."',
  '"일각에서는 이를 당연한 일로 보는 시각도 있습니다."',
  '"저희 취재진이 확인한 바에 따르면 사실인 것으로 보입니다."',
  '"예상치 못한 소식에 스튜디오도 잠시 조용해졌습니다."',
  '"많은 분들이 공감할 만한 소식입니다."',
  '"속보로 전해드릴 일인지 논의가 있었습니다만, 전해드립니다."',
  '"본인은 별일 아니라고 밝혔습니다."',
  '"이런 소식이 더 많아지기를 바랍니다."',
  '"오늘 하루 중 가장 반가운 소식입니다."',
  '"후속 보도는 내일 이어가겠습니다."',
  '"저희는 이 소식을 끝까지 지켜보겠습니다."',
  '"작지만 분명한 진전입니다."',
  '"누군가에게는 대단한 일일 수 있습니다."',
  '"특별한 피해는 보고되지 않았습니다."',
  '"그동안 보도되지 않았을 뿐, 늘 있어온 일입니다."',
  '"이 소식을 전하게 되어 다행입니다."',
  '"오늘은 여기까지가 좋겠습니다."',
  '"보도블록에서 전해드립니다."',
  '"보도블록 취재진이 현장에서 확인했습니다."',
  '"이상 보도블록이었습니다."',
];

/** 하단 티커 문구 */
export const TICKER_LINES: string[] = [
  '오늘도 무사히 지나가는 중',
  '전국 각지에서 비슷한 소식 이어져',
  '이 소식은 계속 업데이트됩니다',
  '대단하지 않아도 소식은 소식입니다',
  '제보를 기다립니다',
  '오늘 하루도 보도할 만했습니다',
  '작은 일도 저희는 다룹니다',
  '뉴스가 될 만한 하루였습니다',
  '지금 이 순간에도 누군가는 해내는 중',
  '하찮은 소식만 전해드립니다',
];

/** 직접 제보(CUSTOM) 헤드라인 틀. {text} 자리에 입력을 넣는다 */
export const CUSTOM_HEADLINE_TEMPLATES: string[] = [
  '한 시민, 오늘 『{text}』에 성공',
  '제보에 따르면 『{text}』',
  '『{text}』… 관계자들 침묵',
  '익명의 제보자, 『{text}』한 것으로 확인',
  '오늘 한 시민이 『{text}』했습니다',
];

/** CUSTOM용 부제 및 전문가 */
export const CUSTOM_SUBTITLES: string[] = [
  '자세한 경위는 밝혀지지 않아',
  '관계자들 "충분히 의미 있는 일"',
  '본인만 아는 성취로 기록돼',
  '내부에서는 "잘한 일"이라는 평가',
  '현장은 조용했던 것으로 전해져',
  '후속 소식은 전해지지 않아',
];

export const CUSTOM_EXPERT: Expert = {
  name: '제갈하찮',
  org: '일상연구소',
  animal: '두더지',
  lines: [
    '"기록되지 않았을 뿐, 분명한 일입니다."',
    '"본인이 해냈다고 하면 해낸 겁니다."',
    '"저희 연구소는 모든 제보를 신뢰합니다."',
    '"작은 일이 쌓여 하루가 됩니다."',
    '"이런 일은 보도되어야 마땅합니다."',
    '"오늘의 성취로 인정하기에 충분합니다."',
    '"다른 누구도 아닌 본인이 해냈습니다."',
    '"내일도 비슷한 소식을 기대합니다."',
  ],
};

/** 후속 보도 문구 */
export const FOLLOWUP_LINES: string[] = [
  '어제 그 소식, 오늘은 아직 속보가 없습니다',
  '어제의 그 일 이후, 관계자들은 침묵을 지키고 있습니다',
  '해당 사안은 조용히 마무리된 것으로 보입니다',
  '어제 그 시민, 오늘도 무사한 것으로 전해집니다',
  '후속 취재 결과 특별한 변화는 없었습니다',
  '어제의 소식은 여전히 유효합니다',
];

/* ────────────────────────────────────────── */

export interface Article {
  id: string;
  date: string;
  category: Category;
  headline: string;
  subtitle: string;
  anchor: string;
  expertName: string;
  expertOrg: string;
  expertLine: string;
  ticker: string;
  customText?: string;
}

export interface LastPicks {
  headline?: number;
  subtitle?: number;
  anchor?: number;
  expert?: number;
  ticker?: number;
}

/** 직전 인덱스를 피해서 무작위로 하나 고른다 */
function pick<T>(list: T[], avoid?: number): { value: T; index: number } {
  if (list.length === 0) throw new Error('empty list');
  if (list.length === 1) return { value: list[0]!, index: 0 };
  let i = Math.floor(Math.random() * list.length);
  if (i === avoid) i = (i + 1 + Math.floor(Math.random() * (list.length - 1))) % list.length;
  return { value: list[i]!, index: i };
}

/** 로컬 자정 기준 오늘 날짜. 오늘 발행 여부 판정 등에서 이 함수 하나만 사용해 기준을 통일한다 */
export function today(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** 로컬 자정 기준 어제 날짜. 후속 보도(6.4) 판정에서 today()와 같은 기준으로 사용한다 */
export function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * 속보 한 건을 조립한다.
 * @param category 카테고리
 * @param last 직전에 뽑은 인덱스 (연속 중복 방지용)
 * @param customText CUSTOM일 때 사용자 입력 (최대 40자)
 */
export function createArticle(
  category: Category,
  last: LastPicks = {},
  customText?: string
): { article: Article; picks: LastPicks } {
  const isCustom = category === 'CUSTOM';

  const headlinePool = isCustom
    ? CUSTOM_HEADLINE_TEMPLATES
    : BANK[category].headline;
  const subtitlePool = isCustom ? CUSTOM_SUBTITLES : BANK[category].subtitle;
  const expert = isCustom ? CUSTOM_EXPERT : BANK[category].expert;

  const h = pick(headlinePool, last.headline);
  const s = pick(subtitlePool, last.subtitle);
  const a = pick(ANCHOR_LINES, last.anchor);
  const e = pick(expert.lines, last.expert);
  const t = pick(TICKER_LINES, last.ticker);

  const text = (customText ?? '').trim().slice(0, 40);
  const headline = isCustom ? h.value.replace('{text}', text) : h.value;

  const article: Article = {
    id: `${Date.now()}`,
    date: today(),
    category,
    headline,
    subtitle: s.value,
    anchor: a.value,
    expertName: expert.name,
    expertOrg: expert.org,
    expertLine: e.value,
    ticker: t.value,
    ...(isCustom ? { customText: text } : {}),
  };

  return {
    article,
    picks: {
      headline: h.index,
      subtitle: s.index,
      anchor: a.index,
      expert: e.index,
      ticker: t.index,
    },
  };
}

/** 어제 기사로 후속 보도 문구를 만든다 */
export function createFollowup(_yesterday: Article, avoid?: number): string {
  return pick(FOLLOWUP_LINES, avoid).value;
}

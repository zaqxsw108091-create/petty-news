// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const raw = require.context('./pages');

// pages/ 스캔 순서(readdirSync, 파일시스템 의존/비결정적)에서 홈이 우연히 뒤로
// 밀리면 초기 스크린이 홈이 아닌 다른 화면이 되는 문제가 있었다 (routeNames[0]
// 을 초기 화면으로 쓰는 StackRouter 기본 동작). HOME_KEY를 항상 맨 앞으로 옮겨
// 이 순서 의존성을 없앤다.
const HOME_KEY = './index.tsx';

function keys(): string[] {
  const all: string[] = raw.keys();
  const home = all.filter((key: string) => key === HOME_KEY);
  const rest = all.filter((key: string) => key !== HOME_KEY);

  if (__DEV__ && home.length === 0) {
    console.warn(
      `[require.context] HOME_KEY(${HOME_KEY})가 pages/ 스캔 결과에 없습니다. 홈 우선 정렬 패치가 무력화된 상태입니다.`
    );
  }

  return [...home, ...rest];
}

// @granite-js/react-native의 getRouteScreens(router/utils/screen.tsx)가 실제로
// 호출하는 건 context.keys()와 context(key) 두 가지뿐이다 (grep으로 확인,
// resolve/id는 라우터 어디서도 호출되지 않음). 다만 RequireContext 타입 계약을
// 그대로 만족시키기 위해 resolve/id도 raw로 위임해 둔다.
export const context = Object.assign((id: string) => raw(id), {
  keys,
  resolve: (id: string) => raw.resolve(id),
  id: raw.id,
});

import React, { type PropsWithChildren } from 'react';
import { Granite, type InitialProps } from '@granite-js/react-native';
import { context } from '../require.context';

function AppContainer({ children }: PropsWithChildren<InitialProps>) {
  return <>{children}</>;
}

export default Granite.registerApp(AppContainer, {
  appName: 'pettynews',
  context,
  router: {
    // require.context가 pages/ 디렉토리를 readdirSync 순서 그대로 스캔해 스크린을 등록하기 때문에
    // (정렬 로직 없음), 딥링크 매칭이 실패하는 순간 등록 순서상 우연히 앞선 화면이 초기 화면으로
    // 노출될 수 있다. initialState로 '/'를 명시해 그 폴백을 없앤다.
    initialState: { index: 0, routes: [{ name: '/' }] },
  },
});

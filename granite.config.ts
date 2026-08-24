import { router } from '@granite-js/plugin-router';
import { hermes } from '@granite-js/plugin-hermes';
import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  appName: 'pettynews',
  scheme: 'granite',
  plugins: [
    router(),
    hermes(),
    appsInToss({
      // target 미지정 시 기본값 0.72.6 호환 레이어가 켜지는데, 그 코드도 Windows에서
      // 백슬래시 경로를 이스케이프 없이 require()에 꽂아 빌드가 깨진다. 실제 설치된
      // react-native 버전(0.84.0)을 명시해 그 호환 레이어 자체를 건너뛴다.
      target: '0.84.0',
      brand: {
        displayName: '보도블록',
        primaryColor: '#F04452',
        icon: 'https://static.toss.im/appsintoss/79633/c70216da-85d8-435e-95ab-616d71f33108.png',
      },
      permissions: [],
    }),
  ],
});
import { defineConfig } from '@apps-in-toss/web-framework/config';

// SDK 3.x (WebView) 설정. brand(표시 이름·아이콘)는 3.x에서 설정 파일이 아니라 콘솔에서 관리한다.
export default defineConfig({
  appName: 'pettynews',
  webView: {},
  permissions: [],
  webBundleDir: 'dist',
});

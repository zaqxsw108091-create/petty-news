import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import aitDevtools from '@apps-in-toss/devtools/unplugin';

export default defineConfig({
  // 기존 import 경로('data/news', 'config/supabase' 등)를 그대로 유지한다
  resolve: { alias: { data: '/src/data', config: '/src/config', components: '/src/components', hooks: '/src/hooks' } },
  plugins: [aitDevtools.vite(), react()],
  build: { outDir: 'dist' },
});

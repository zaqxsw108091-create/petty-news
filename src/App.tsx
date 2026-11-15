import { useState } from 'react';
import type { LastPicks } from 'data/news';
import { Router } from './router';
import { HomePage } from './pages/HomePage';
import { ArticlePage } from './pages/ArticlePage';
import { ArchivePage } from './pages/ArchivePage';
import { ReportPage } from './pages/ReportPage';

export function App() {
  // 직전에 뽑은 문장(중복 방지용)은 화면이 바뀌어도 유지되어야 해서 앱 최상단에서 들고 있는다
  const [lastPicks, setLastPicks] = useState<LastPicks>({});

  return (
    <Router>
      {(screen) => {
        switch (screen.name) {
          case 'home':
            return <HomePage lastPicks={lastPicks} setLastPicks={setLastPicks} />;
          case 'article':
            return <ArticlePage key={screen.article.id} article={screen.article} />;
          case 'archive':
            return <ArchivePage />;
          case 'report':
            return <ReportPage lastPicks={lastPicks} />;
        }
      }}
    </Router>
  );
}

import { useEffect, useState } from 'react';
import { loadArchive } from 'data/archive';
import { CATEGORY_LABEL, EMPTY_ARCHIVE, type Article, type Category } from 'data/news';
import { useNavigation } from '../router';

function categoryLabel(article: Article): string {
  if (article.category === 'CUSTOM') return '직접 제보';
  return CATEGORY_LABEL[article.category as Exclude<Category, 'CUSTOM'>];
}

export function ArchivePage() {
  const navigation = useNavigation();
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadArchive().then((items) => {
      if (cancelled) return;
      setArticles([...items].sort((a, b) => b.date.localeCompare(a.date)));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="page archive">
      <header className="archive-header">
        <button type="button" className="text-link home-link" onClick={navigation.goHome}>
          보도국으로
        </button>
        {articles.length > 0 && <p className="archive-count">지금까지 {articles.length}건 보도</p>}
      </header>

      {articles.length === 0 ? (
        <div className="empty">{EMPTY_ARCHIVE}</div>
      ) : (
        <ul className="archive-list">
          {articles.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="archive-row"
                onClick={() => navigation.navigate({ name: 'article', article: item })}
              >
                <span className="archive-date">{item.date}</span>
                <span className="archive-headline">{item.headline}</span>
                <span className="archive-category">{categoryLabel(item)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

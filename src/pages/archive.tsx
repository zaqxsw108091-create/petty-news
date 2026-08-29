import { createRoute } from '@granite-js/react-native';
import { CommonActions, useFocusEffect } from '@granite-js/native/@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { loadArchive } from 'data/archive';
import { CATEGORY_LABEL, EMPTY_ARCHIVE, type Article, type Category } from 'data/news';

export const Route = createRoute('/archive', {
  component: Page,
});

function categoryLabel(article: Article): string {
  if (article.category === 'CUSTOM') return '직접 제보';
  return CATEGORY_LABEL[article.category as Exclude<Category, 'CUSTOM'>];
}

function Page() {
  const navigation = Route.useNavigation();
  const [articles, setArticles] = useState<Article[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      loadArchive().then((items) => {
        if (cancelled) return;
        const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));
        setArticles(sorted);
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const handleGoHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: '/' }],
      })
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.homeLinkRow}>
        <TouchableOpacity onPress={handleGoHome} activeOpacity={0.7}>
          <Text style={styles.homeLinkText}>보도국으로</Text>
        </TouchableOpacity>
        {articles.length > 0 && (
          <Text style={styles.countText}>지금까지 {articles.length}건 보도</Text>
        )}
      </View>

      {articles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{EMPTY_ARCHIVE}</Text>
        </View>
      ) : (
        <FlatList
          style={styles.container}
          contentContainerStyle={styles.listContent}
          data={articles}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('/article', item)}
            >
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.headline} numberOfLines={2}>
                {item.headline}
              </Text>
              <Text style={styles.category}>{categoryLabel(item)}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  homeLinkRow: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  homeLinkText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
  },
  countText: {
    marginTop: 8,
    fontSize: 13,
    color: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    padding: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#000000',
  },
  row: {
    paddingVertical: 16,
  },
  date: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  headline: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 22,
  },
  category: {
    marginTop: 6,
    fontSize: 12,
    color: '#F04452',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

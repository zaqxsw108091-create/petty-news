import { createRoute } from '@granite-js/react-native';
import { useFocusEffect } from '@granite-js/native/@react-navigation/native';
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

  if (articles.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{EMPTY_ARCHIVE}</Text>
      </View>
    );
  }

  return (
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
  );
}

const styles = StyleSheet.create({
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

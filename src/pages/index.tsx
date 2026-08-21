import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  CATEGORIES,
  CATEGORY_LABEL,
  CHANNEL_NAME,
  CHANNEL_SLOGAN,
  PRIVACY_NOTE,
  createArticle,
  type Category,
  type LastPicks,
} from 'data/news';

type ReportCategory = Exclude<Category, 'CUSTOM'>;

export const Route = createRoute('/', {
  component: Page,
});

/** 6개 제보 버튼을 2열로 배치하기 위한 행 단위 그룹 */
const CATEGORY_ROWS: ReportCategory[][] = [];
for (let i = 0; i < CATEGORIES.length; i += 2) {
  CATEGORY_ROWS.push(CATEGORIES.slice(i, i + 2));
}

function Page() {
  const navigation = Route.useNavigation();
  const [lastPicks, setLastPicks] = useState<LastPicks>({});

  const handleReport = (category: ReportCategory) => {
    const { article, picks } = createArticle(category, lastPicks);
    setLastPicks(picks);
    navigation.navigate('/article', article);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.channelName}>{CHANNEL_NAME}</Text>
      <Text style={styles.channelSlogan}>{CHANNEL_SLOGAN}</Text>

      <Text style={styles.prompt}>오늘의 제보를 기다립니다</Text>

      <View style={styles.grid}>
        {CATEGORY_ROWS.map((row, rowIndex) => (
          <View style={styles.row} key={rowIndex}>
            {row.map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.reportButton}
                onPress={() => handleReport(category)}
                activeOpacity={0.7}
              >
                <Text style={styles.reportButtonText}>{CATEGORY_LABEL[category]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <Text style={styles.privacyNote}>{PRIVACY_NOTE}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  channelName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  channelSlogan: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 32,
  },
  prompt: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  grid: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  reportButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000000',
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  privacyNote: {
    marginTop: 32,
    fontSize: 11,
    color: '#999999',
    textAlign: 'center',
  },
});

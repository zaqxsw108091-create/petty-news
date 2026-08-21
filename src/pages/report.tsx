import { createRoute } from '@granite-js/react-native';
import { useFocusEffect } from '@granite-js/native/@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { loadArchive, publishToArchive } from 'data/archive';
import { CHANNEL_NAME, createArticle, today, type Article, type LastPicks } from 'data/news';

const MAX_LENGTH = 40;

interface ReportParams {
  lastPicks?: LastPicks;
}

export const Route = createRoute('/report', {
  validateParams: (params) => params as ReportParams,
  component: Page,
});

function Page() {
  const navigation = Route.useNavigation();
  const params = Route.useParams();
  const lastPicks = params.lastPicks ?? {};

  const [text, setText] = useState('');
  const [archive, setArchive] = useState<Article[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const isPublishingRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      loadArchive().then((items) => {
        if (!cancelled) setArchive(items);
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  // SPEC 5.5/7.1: 직접 제보(CUSTOM)도 하루 1회 제한에 포함된다
  const alreadyPublishedToday = archive.some((a) => a.date === today());
  const trimmed = text.trim();
  const canPublish = trimmed.length > 0 && !alreadyPublishedToday && !isPublishing;

  const handlePublish = async () => {
    // ref로 동기 잠금을 걸어야 한다: state는 배치되어 연타 시 두 번째 탭도 통과할 수 있다
    if (isPublishingRef.current) return;
    if (trimmed.length === 0) return;
    if (archive.some((a) => a.date === today())) return;

    isPublishingRef.current = true;
    setIsPublishing(true);
    try {
      const { article } = createArticle('CUSTOM', lastPicks, trimmed);
      const nextArchive = await publishToArchive(archive, article);
      setArchive(nextArchive);
      navigation.navigate('/article', article);
    } finally {
      isPublishingRef.current = false;
      setIsPublishing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Text style={styles.back}>‹ 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.channelName}>{CHANNEL_NAME}</Text>
        <View style={styles.backSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>오늘 있었던 일을 직접 적어주세요</Text>

        {alreadyPublishedToday ? (
          <Text style={styles.limitNotice}>오늘 소식은 이미 발행되었습니다. 내일 다시 제보해주세요.</Text>
        ) : (
          <>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={(value) => setText(value.slice(0, MAX_LENGTH))}
              placeholder="예) 미루던 설거지를 끝냈다"
              placeholderTextColor="#999999"
              maxLength={MAX_LENGTH}
              multiline
              autoFocus
            />
            <Text style={styles.counter}>
              {text.length}/{MAX_LENGTH}
            </Text>
          </>
        )}

        <TouchableOpacity
          style={[styles.publishButton, !canPublish && styles.publishButtonDisabled]}
          onPress={handlePublish}
          disabled={!canPublish}
          activeOpacity={0.7}
        >
          <Text style={styles.publishButtonText}>제보하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  back: {
    fontSize: 15,
    color: '#000000',
  },
  channelName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000000',
  },
  backSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000000',
    padding: 16,
    fontSize: 16,
    color: '#000000',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  counter: {
    marginTop: 8,
    fontSize: 12,
    color: '#666666',
    textAlign: 'right',
  },
  limitNotice: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  publishButton: {
    marginTop: 'auto',
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#000000',
    paddingVertical: 16,
    alignItems: 'center',
  },
  publishButtonDisabled: {
    opacity: 0.3,
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

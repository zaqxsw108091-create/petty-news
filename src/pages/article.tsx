import { createRoute } from '@granite-js/react-native';
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { ANCHOR_NAME, ANCHOR_TITLE, CHANNEL_NAME, type Article, type Category } from 'data/news';

export const Route = createRoute('/article', {
  validateParams: (params) => params as Article,
  component: Page,
});

/** 전문가 캐릭터 아이콘 (실제 선화 에셋이 준비되기 전 임시 표시) */
const EXPERT_ICON: Record<Category, string> = {
  WAKE: '🐨',
  EAT: '🐹',
  NOTHING: '🦥',
  ENDURE: '🐙',
  WASH: '🐱',
  OUTING: '🐚',
  CUSTOM: '🐭',
};

const ANCHOR_ICON = '🕊️';

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function Page() {
  const article = Route.useParams();
  const publishedAt = formatTime(new Date(Number(article.id)));

  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const [typedLength, setTypedLength] = useState(0);

  const flashOpacity = useRef(new Animated.Value(0)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeTranslateX = useRef(new Animated.Value(-120)).current;
  const tickerTranslateX = useRef(new Animated.Value(0)).current;
  const [tickerContainerWidth, setTickerContainerWidth] = useState(0);
  const [tickerContentWidth, setTickerContentWidth] = useState(0);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      setReduceMotion(enabled);
    });
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  // 1. 화면 붉게 번쩍 + 2. 속보 배지 오버슛 슬라이드인
  useEffect(() => {
    if (reduceMotion === null) return;
    if (reduceMotion) {
      flashOpacity.setValue(0);
      badgeOpacity.setValue(1);
      badgeTranslateX.setValue(0);
      return;
    }
    flashOpacity.setValue(0);
    badgeOpacity.setValue(0);
    badgeTranslateX.setValue(-120);
    Animated.sequence([
      Animated.sequence([
        Animated.timing(flashOpacity, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(flashOpacity, { toValue: 0, duration: 120, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(badgeOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(badgeTranslateX, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.back(1.8)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [reduceMotion, flashOpacity, badgeOpacity, badgeTranslateX]);

  // 3. 헤드라인 한 글자씩 타이핑
  useEffect(() => {
    if (reduceMotion === null) return;
    const headline = article.headline;
    if (reduceMotion) {
      setTypedLength(headline.length);
      return;
    }
    setTypedLength(0);
    const totalChars = headline.length;
    const charInterval = Math.min(40, Math.max(15, 900 / Math.max(totalChars, 1)));
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setTypedLength(i);
      if (i >= totalChars) clearInterval(timer);
    }, charInterval);
    return () => clearInterval(timer);
  }, [reduceMotion, article.headline]);

  // 4. 하단 티커 흐르기 시작
  useEffect(() => {
    if (reduceMotion === null || reduceMotion) return;
    if (tickerContainerWidth === 0 || tickerContentWidth === 0) return;
    tickerTranslateX.setValue(tickerContainerWidth);
    const distance = tickerContainerWidth + tickerContentWidth;
    const loop = Animated.loop(
      Animated.timing(tickerTranslateX, {
        toValue: -tickerContentWidth,
        duration: distance * 12,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, tickerContainerWidth, tickerContentWidth, tickerTranslateX]);

  const headline = article.headline.slice(0, typedLength);
  const expertIcon = EXPERT_ICON[article.category];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View pointerEvents="none" style={[styles.flashOverlay, { opacity: flashOpacity }]} />

      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Animated.View
            style={[styles.badge, { opacity: badgeOpacity, transform: [{ translateX: badgeTranslateX }] }]}
          >
            <Text style={styles.badgeText}>속보</Text>
          </Animated.View>
          <Text style={styles.channelName}>{CHANNEL_NAME}</Text>
        </View>
        <Text style={styles.time}>{publishedAt}</Text>
      </View>

      <View style={styles.headlineBlock}>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.subtitle}>― {article.subtitle} ―</Text>
      </View>

      <View style={styles.commentRow}>
        <Text style={styles.commentAuthor}>
          {ANCHOR_ICON} {ANCHOR_TITLE} {ANCHOR_NAME}
        </Text>
        <Text style={styles.commentLine}>{article.anchor}</Text>
      </View>

      <View style={styles.commentRow}>
        <Text style={styles.commentAuthor}>
          {expertIcon} {article.expertOrg} {article.expertName}
        </Text>
        <Text style={styles.commentLine}>{article.expertLine}</Text>
      </View>

      <View
        style={styles.tickerRow}
        onLayout={(e) => setTickerContainerWidth(e.nativeEvent.layout.width)}
      >
        <Text style={styles.tickerArrow}>◀</Text>
        <View style={styles.tickerClip}>
          <Animated.Text
            style={[styles.tickerText, { transform: [{ translateX: tickerTranslateX }] }]}
            numberOfLines={1}
            onLayout={(e) => setTickerContentWidth(e.nativeEvent.layout.width)}
          >
            {article.ticker}
          </Animated.Text>
        </View>
        <Text style={styles.tickerArrow}>◀</Text>
      </View>

      <View style={styles.actionRow}>
        {/* 이미지 저장/보관함은 5.5, 이미지 저장 기능 구현 시 연결한다 */}
        <View style={[styles.actionButton, styles.actionButtonDisabled]}>
          <Text style={styles.actionButtonText}>이미지로 저장</Text>
        </View>
        <View style={[styles.actionButton, styles.actionButtonDisabled]}>
          <Text style={styles.actionButtonText}>보관함</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F04452',
    zIndex: 10,
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
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#F04452',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  channelName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000000',
  },
  time: {
    fontSize: 13,
    color: '#666666',
  },
  headlineBlock: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    minHeight: 140,
  },
  headline: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 34,
  },
  subtitle: {
    marginTop: 16,
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
  },
  commentRow: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  commentAuthor: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000000',
    marginBottom: 6,
  },
  commentLine: {
    fontSize: 15,
    color: '#000000',
    lineHeight: 22,
  },
  tickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F04452',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
    marginTop: 'auto',
  },
  tickerArrow: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tickerClip: {
    flex: 1,
    overflow: 'hidden',
  },
  tickerText: {
    color: '#FFFFFF',
    fontSize: 13,
    alignSelf: 'flex-start',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
  },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000000',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.35,
  },
  actionButtonText: {
    fontWeight: 'bold',
    color: '#000000',
  },
});

import { createRoute } from '@granite-js/react-native';
import { CommonActions } from '@granite-js/native/@react-navigation/native';
import { saveBase64Data, share } from '@apps-in-toss/native-modules';
import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ShareCard, type ShareCardHandle } from 'components/ShareCard';
import { ANCHOR_NAME, ANCHOR_TITLE, CHANNEL_NAME, type Article, type Category } from 'data/news';
import { ANCHOR_IMAGE, EXPERT_IMAGE, type ImageSource } from 'data/characterImages';

export const Route = createRoute('/article', {
  validateParams: (params) => params as Article,
  component: Page,
});

/** 캐릭터 이미지 로딩 실패 시 대체로 쓰는 이모지 */
const EXPERT_ICON: Record<Category, string> = {
  WAKE: '🐨',
  EAT: '🐹',
  NOTHING: '🦥',
  ENDURE: '🐙',
  WASH: '🐱',
  OUTING: '🐚',
  CUSTOM: '🐭',
  WEEKDAY: '🐭',
};

const ANCHOR_ICON = '🕊️';

const AVATAR_SIZE = 56;

function CharacterAvatar({ source, fallbackEmoji }: { source: ImageSource; fallbackEmoji: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <View style={styles.avatarBox}>
        <Text style={styles.avatarFallbackText}>{fallbackEmoji}</Text>
      </View>
    );
  }

  return (
    <View style={styles.avatarBox}>
      <Image
        source={source}
        style={styles.avatarImage}
        resizeMode="contain"
        onError={() => setFailed(true)}
      />
    </View>
  );
}

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function Page() {
  const navigation = Route.useNavigation();
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

  const shareCardRef = useRef<ShareCardHandle>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const handleSaveAndShare = () => {
    const svg = shareCardRef.current;
    if (!svg || saveStatus === 'saving') return;

    setSaveStatus('saving');
    svg.toDataURL(async (base64) => {
      try {
        await saveBase64Data({
          data: base64,
          fileName: `pettynews-${article.id}.png`,
          mimeType: 'image/png',
        });
        setSaveStatus('saved');
        // 공유 시트는 곁들이는 기능이라, 사용자가 취소하거나 네트워크가 없어도
        // 이미지 저장 자체는 이미 끝났으므로 조용히 무시한다 (SPEC 8.3과 같은 원칙)
        try {
          await share({ message: `${article.headline} — ${CHANNEL_NAME}` });
        } catch {
          // ignore
        }
      } catch {
        setSaveStatus('error');
      }
    });
  };

  const handleOpenArchive = () => {
    navigation.navigate('/archive');
  };

  const handleGoHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: '/' }],
      })
    );
  };

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

      <View style={styles.topHomeLinkRow}>
        <TouchableOpacity onPress={handleGoHome} activeOpacity={0.7}>
          <Text style={styles.topHomeLinkText}>보도국으로</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Animated.View
            style={[styles.badge, { opacity: badgeOpacity, transform: [{ translateX: badgeTranslateX }] }]}
          >
            <Text style={styles.badgeText}>속보</Text>
          </Animated.View>
        </View>
        <Text style={styles.time}>{publishedAt}</Text>
      </View>

      {/* 헤드라인 길이는 CUSTOM(직접 제보) 40자 입력에 따라 크게 달라질 수 있어
          스크롤 영역으로 감싸, 하단 티커·버튼이 화면 밖으로 밀려나지 않게 한다 */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headlineBlock}>
          <Text style={styles.headline}>{headline}</Text>
          <Text style={styles.subtitle}>― {article.subtitle} ―</Text>
        </View>

        <View style={styles.commentRow}>
          <View style={styles.commentAuthorRow}>
            <CharacterAvatar source={ANCHOR_IMAGE} fallbackEmoji={ANCHOR_ICON} />
            <Text style={styles.commentAuthor}>
              {ANCHOR_TITLE} {ANCHOR_NAME}
            </Text>
          </View>
          <Text style={styles.commentLine}>{article.anchor}</Text>
        </View>

        <View style={styles.commentRow}>
          <View style={styles.commentAuthorRow}>
            <CharacterAvatar source={EXPERT_IMAGE[article.category]} fallbackEmoji={expertIcon} />
            <Text style={styles.commentAuthor}>
              {article.expertOrg} {article.expertName}
            </Text>
          </View>
          <Text style={styles.commentLine}>{article.expertLine}</Text>
        </View>
      </ScrollView>

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

      {saveStatus === 'saved' && <Text style={styles.saveNotice}>이미지를 저장했어요.</Text>}
      {saveStatus === 'error' && <Text style={styles.saveNotice}>저장에 실패했어요. 다시 시도해주세요.</Text>}

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, saveStatus === 'saving' && styles.actionButtonDisabled]}
          onPress={handleSaveAndShare}
          disabled={saveStatus === 'saving'}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>{saveStatus === 'saving' ? '저장 중…' : '저장하고 공유하기'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleOpenArchive} activeOpacity={0.7}>
          <Text style={styles.actionButtonText}>보관함</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.homeLinkRow}>
        <TouchableOpacity onPress={handleGoHome} activeOpacity={0.7}>
          <Text style={styles.homeLinkText}>보도국으로</Text>
        </TouchableOpacity>
      </View>

      {/* 화면 캡처 API가 없어 react-native-svg의 Svg.toDataURL()로 별도 카드 이미지를 만든다.
          화면 밖에 그려두고 저장 시점에만 참조한다 */}
      <View style={styles.hiddenCapture} pointerEvents="none">
        <ShareCard ref={shareCardRef} article={article} />
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
  topHomeLinkRow: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  topHomeLinkText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
    textDecorationLine: 'underline',
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
  time: {
    fontSize: 13,
    color: '#666666',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  commentAuthor: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000000',
  },
  avatarBox: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatarFallbackText: {
    fontSize: 32,
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
  saveNotice: {
    marginTop: 12,
    marginHorizontal: 20,
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
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
  homeLinkRow: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  homeLinkText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
  },
  hiddenCapture: {
    position: 'absolute',
    top: -100000,
    left: 0,
    opacity: 0,
  },
});

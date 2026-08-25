import { useFocusEffect } from '@granite-js/native/@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import { fetchRecentCategories } from 'data/reports';
import { NATION_TICKER_LABEL } from 'data/news';

const SEPARATOR = '     ·     ';

/**
 * 홈 화면 상단 전국 티커. Supabase에서 최근 제보 카테고리 코드만 받아
 * NATION_TICKER_LABEL로 로컬 문장 매핑해서 흘려보낸다.
 * 데이터가 없거나(오프라인 포함) 검증에 실패하면 아무것도 렌더링하지 않는다.
 */
export function NationalTicker() {
  const [text, setText] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const translateX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  // 홈 화면이 포커스될 때마다(최초 진입 포함) 재조회한다. 실패하면 이전에 표시 중이던
  // text를 그대로 두고 조용히 넘어가 — 빈 화면이나 깜빡임이 생기지 않는다.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      fetchRecentCategories().then((categories) => {
        if (cancelled || !categories) return;
        setText(categories.map((c) => NATION_TICKER_LABEL[c]).join(SEPARATOR));
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

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

  useEffect(() => {
    if (!text || reduceMotion === null || reduceMotion) return;
    if (containerWidth === 0 || contentWidth === 0) return;
    translateX.setValue(containerWidth);
    const distance = containerWidth + contentWidth;
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: -contentWidth,
        duration: distance * 12,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [text, reduceMotion, containerWidth, contentWidth, translateX]);

  if (!text) return null;

  return (
    <View style={styles.row} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <View style={styles.clip}>
        <Animated.Text
          style={[styles.text, { transform: [{ translateX }] }]}
          numberOfLines={1}
          onLayout={(e) => setContentWidth(e.nativeEvent.layout.width)}
        >
          {text}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: '#000000',
    paddingVertical: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  clip: {
    overflow: 'hidden',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    alignSelf: 'flex-start',
  },
});

import { useFocusEffect } from '@granite-js/native/@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { fetchTodayCounts, MAX_DISPLAYABLE_COUNT, type CategoryCount } from 'data/reports';
import { NATION_SUMMARY_LABEL } from 'data/news';

function formatCount(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 홈 화면 상단 오늘의 집계. "오늘 전국에서 N명이 …" 문구를 가장 많은 카테고리
 * 기준으로 만들고 숫자는 카운트업 애니메이션으로 보여준다.
 * 데이터가 없거나 검증에 실패하거나(배열 아님 등) 1억을 넘으면 아무것도 렌더링하지 않는다.
 */
export function TodaySummary() {
  const [top, setTop] = useState<CategoryCount | null>(null);
  const [displayN, setDisplayN] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;

  // 홈 화면이 포커스될 때마다(최초 진입 포함) 재조회한다. 실패하면 이전에 표시 중이던
  // top을 그대로 두고 조용히 넘어가 — 빈 화면이나 깜빡임이 생기지 않는다.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      fetchTodayCounts().then((counts) => {
        if (cancelled || !counts) return;
        const best = counts.reduce((a, b) => (b.n > a.n ? b : a));
        if (best.n > MAX_DISPLAYABLE_COUNT) return;
        setTop(best);
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  useEffect(() => {
    if (!top) return;
    // 최초 표시가 아니라면(재포커스로 값이 갱신된 경우) 0으로 되돌리지 않고 현재
    // 값에서 새 값으로 이어서 움직인다 — 그래야 리셋되는 깜빡임 없이 자연스럽다.
    const id = anim.addListener(({ value }) => setDisplayN(value));
    Animated.timing(anim, {
      toValue: top.n,
      duration: 900,
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(id);
  }, [top, anim]);

  if (!top) return null;

  return (
    <Text style={styles.text}>
      오늘 전국에서 {formatCount(displayN)}명이 {NATION_SUMMARY_LABEL[top.category]}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
});

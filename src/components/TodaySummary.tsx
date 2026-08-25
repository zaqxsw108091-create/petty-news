import { useFocusEffect } from '@granite-js/native/@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { fetchTodayCounts, MAX_DISPLAYABLE_COUNT, type CategoryCount } from 'data/reports';
import { SUMMARY_LIST_LABEL, type Category } from 'data/news';

function formatCount(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 홈 화면 상단 오늘의 집계. 카테고리별 건수를 많은 순으로 나열하고 숫자는
 * 카운트업 애니메이션으로 보여준다. 데이터가 없거나 검증에 실패하거나(배열 아님 등)
 * 최댓값이 1억을 넘으면 아무것도 렌더링하지 않는다. 건수가 0인 카테고리는 표시하지 않는다.
 */
export function TodaySummary() {
  const [rows, setRows] = useState<CategoryCount[] | null>(null);
  const [displayN, setDisplayN] = useState<Partial<Record<Category, number>>>({});
  const animsRef = useRef(new Map<Category, Animated.Value>());

  // 홈 화면이 포커스될 때마다(최초 진입 포함) 재조회한다. 실패하면 이전에 표시 중이던
  // rows를 그대로 두고 조용히 넘어가 — 빈 화면이나 깜빡임이 생기지 않는다.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      fetchTodayCounts().then((counts) => {
        if (cancelled || !counts) return;
        const max = counts.reduce((m, c) => Math.max(m, c.n), 0);
        if (max > MAX_DISPLAYABLE_COUNT) return;
        const sorted = counts.filter((c) => c.n > 0).sort((a, b) => b.n - a.n);
        setRows(sorted);
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  useEffect(() => {
    if (!rows) return;
    const removers: Array<() => void> = [];
    rows.forEach(({ category, n }) => {
      let anim = animsRef.current.get(category);
      if (!anim) {
        anim = new Animated.Value(0);
        animsRef.current.set(category, anim);
      }
      // 최초 표시가 아니라면(재포커스로 값이 갱신된 경우) 0으로 되돌리지 않고 현재
      // 값에서 새 값으로 이어서 움직인다 — 그래야 리셋되는 깜빡임 없이 자연스럽다.
      const id = anim.addListener(({ value }) => {
        setDisplayN((prev) => ({ ...prev, [category]: value }));
      });
      removers.push(() => anim!.removeListener(id));
      Animated.timing(anim, {
        toValue: n,
        duration: 900,
        useNativeDriver: false,
      }).start();
    });
    return () => removers.forEach((remove) => remove());
  }, [rows]);

  if (!rows || rows.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>오늘의 집계</Text>
      {rows.map(({ category }) => (
        <View key={category} style={styles.row}>
          <Text style={styles.label}>{SUMMARY_LIST_LABEL[category]}</Text>
          <Text style={styles.count}>{formatCount(displayN[category] ?? 0)}명</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  label: {
    fontSize: 13,
    color: '#000000',
  },
  count: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#E01B1B',
  },
});

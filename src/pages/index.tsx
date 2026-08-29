import { createRoute } from '@granite-js/react-native';
import { useFocusEffect } from '@granite-js/native/@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { loadArchive, publishToArchive } from 'data/archive';
import { submitReport } from 'data/reports';
import { NationalTicker } from 'components/NationalTicker';
import { TodaySummary } from 'components/TodaySummary';
import {
  CATEGORIES,
  CATEGORY_LABEL,
  CHANNEL_NAME,
  CHANNEL_SLOGAN,
  CLOSING,
  DAILY_PUBLISH_LIMIT,
  PRIVACY_NOTE,
  countPublishedOn,
  createArticle,
  createFollowup,
  today,
  yesterday,
  type Article,
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

/** 자정을 넘기면 오늘 날짜 문자열을 다시 계산해, 화면을 켜둔 채로 있어도 잠금이 자동으로 풀리게 한다 */
function useTodayDate(): string {
  const [todayStr, setTodayStr] = useState(() => today());

  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    const timer = setTimeout(() => setTodayStr(today()), nextMidnight.getTime() - now.getTime());
    return () => clearTimeout(timer);
  }, [todayStr]);

  return todayStr;
}

function Page() {
  const navigation = Route.useNavigation();
  const [lastPicks, setLastPicks] = useState<LastPicks>({});
  const [archive, setArchive] = useState<Article[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const isPublishingRef = useRef(false);
  const todayStr = useTodayDate();

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

  // archive는 항상 최신이 앞에 오도록 저장되므로(publishToArchive), 오늘 날짜 중
  // 첫 매치가 곧 오늘 가장 최근에 발행한 기사다.
  const todayArticle = archive.find((a) => a.date === todayStr);
  const todayCount = countPublishedOn(archive, todayStr);
  const remainingCount = DAILY_PUBLISH_LIMIT - todayCount;
  const isLimitReached = remainingCount <= 0;

  // SPEC 6.4: 어제 기록이 여러 건이면 가장 최근 것 기준. archive는 항상 최신이 앞에 오도록
  // 저장되므로(publishToArchive), 어제 날짜 중 첫 매치가 곧 가장 최근 기록이다.
  const yesterdayArticle = archive.find((a) => a.date === yesterday());
  const followupText = useMemo(
    () => (yesterdayArticle ? createFollowup(yesterdayArticle) : null),
    [yesterdayArticle?.id]
  );

  // archive는 항상 최신이 앞에 오도록 저장되므로, 첫 항목이 곧 가장 최근 발행 속보다.
  const latestArticle = archive[0];
  const latestLabel = latestArticle?.date === todayStr ? '오늘의 속보' : '어제의 속보';

  const handleReport = async (category: ReportCategory) => {
    // ref로 동기 잠금을 걸어야 한다: state는 배치되어 연타 시 두 번째 탭도 통과할 수 있다
    if (isPublishingRef.current) return;
    if (countPublishedOn(archive, today()) >= DAILY_PUBLISH_LIMIT) return;

    isPublishingRef.current = true;
    setIsPublishing(true);
    // 서버 전송은 로컬 속보 표시와 무관하게 조용히 실패해야 하므로 await하지 않는다
    void submitReport(category);
    try {
      const { article, picks } = createArticle(category, lastPicks);
      const nextArchive = await publishToArchive(archive, article);
      setArchive(nextArchive);
      setLastPicks(picks);
      navigation.navigate('/article', article);
    } finally {
      isPublishingRef.current = false;
      setIsPublishing(false);
    }
  };

  const handleReview = () => {
    if (todayArticle) navigation.navigate('/article', todayArticle);
  };

  const handleOpenArchive = () => {
    navigation.navigate('/archive');
  };

  const handleOpenReport = () => {
    navigation.navigate('/report', { lastPicks });
  };

  const handleOpenLatest = () => {
    if (latestArticle) navigation.navigate('/article', latestArticle);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.channelName}>{CHANNEL_NAME}</Text>
      <Text style={styles.channelSlogan}>{CHANNEL_SLOGAN}</Text>

      <NationalTicker />
      <TodaySummary />

      {followupText && (
        <View style={styles.followup}>
          <Text style={styles.followupLabel}>어제의 후속 보도</Text>
          <Text style={styles.followupText}>{followupText}</Text>
        </View>
      )}

      {latestArticle && (
        <TouchableOpacity style={styles.latestRow} onPress={handleOpenLatest} activeOpacity={0.7}>
          <Text style={styles.latestText} numberOfLines={1}>
            {`${latestLabel} · "${latestArticle.headline}"`}
          </Text>
        </TouchableOpacity>
      )}

      {isLimitReached ? (
        <View style={styles.closing}>
          <Text style={styles.closingLine}>{CLOSING.line1}</Text>
          <Text style={styles.closingLine}>{CLOSING.line2}</Text>
          <TouchableOpacity style={styles.reviewButton} onPress={handleReview} activeOpacity={0.7}>
            <Text style={styles.reviewButtonText}>오늘의 속보 다시 보기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.prompt}>오늘의 제보를 기다립니다</Text>
          <Text style={styles.remainingNotice}>오늘 {remainingCount}번 더 제보할 수 있습니다</Text>
          <View style={styles.grid}>
            {CATEGORY_ROWS.map((row, rowIndex) => (
              <View style={styles.row} key={rowIndex}>
                {row.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={styles.reportButton}
                    onPress={() => handleReport(category)}
                    disabled={isPublishing}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.reportButtonText}>{CATEGORY_LABEL[category]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.customButton}
            onPress={handleOpenReport}
            disabled={isPublishing}
            activeOpacity={0.7}
          >
            <Text style={styles.customButtonText}>✎ 직접 제보하기</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.archiveLink} onPress={handleOpenArchive} activeOpacity={0.7}>
        <Text style={styles.archiveLinkText}>지난 속보 보관함</Text>
      </TouchableOpacity>

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
  followup: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000000',
    paddingVertical: 14,
    marginBottom: 24,
  },
  followupLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F04452',
    marginBottom: 6,
  },
  followupText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  latestRow: {
    borderTopWidth: 1,
    borderColor: '#000000',
    paddingVertical: 14,
    marginBottom: 24,
  },
  latestText: {
    fontSize: 14,
    color: '#000000',
  },
  prompt: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  remainingNotice: {
    fontSize: 13,
    color: '#666666',
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
  customButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#000000',
    paddingVertical: 16,
    alignItems: 'center',
  },
  customButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000000',
  },
  closing: {
    borderWidth: 1,
    borderColor: '#000000',
    padding: 24,
    alignItems: 'center',
  },
  closingLine: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
  },
  reviewButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  archiveLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  archiveLinkText: {
    fontSize: 14,
    color: '#333333',
    textDecorationLine: 'underline',
  },
  privacyNote: {
    marginTop: 24,
    fontSize: 11,
    color: '#999999',
    textAlign: 'center',
  },
});

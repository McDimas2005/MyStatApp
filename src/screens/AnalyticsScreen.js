import React, { useMemo } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useStats } from '../context/StatContext';
import { getCoreStreakSummary } from '../utils/coreStreaks';
import { formatNumber } from '../utils/numberFormat';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen({ navigation }) {
  const { cores, skills, habits, events, averageScoreTarget, compactNumbers } = useStats();
  const totalScore = useMemo(
    () => cores.reduce((sum, core) => sum + (core.totalScore || 0), 0),
    [cores],
  );
  const averageScore = useMemo(
    () => (cores.length ? totalScore / cores.length : 0),
    [cores.length, totalScore],
  );

  const coreData = useMemo(() => {
    const labels = cores.map((core) => {
      const words = core.name.split(' ').filter(Boolean);
      if (words.length === 1) return words[0].slice(0, 6);
      return words.map((word) => word[0]).join('').slice(0, 3).toUpperCase();
    });
    const data = cores.map((core) =>
      averageScoreTarget > 0 ? Math.round(((core.totalScore || 0) / averageScoreTarget) * 100) : 0,
    );
    return { labels, data };
  }, [averageScoreTarget, cores]);

  const totalScoreChartData = useMemo(
    () => ({
      labels: coreData.labels,
      data: cores.map((core) => Math.round(core.totalScore || 0)),
    }),
    [coreData.labels, cores],
  );

  const coreStreakCards = useMemo(
    () =>
      cores.map((core) => ({
        ...core,
        ...getCoreStreakSummary(events, core.id),
      })),
    [cores, events],
  );

  const summaryMetrics = [
    { key: 'cores', label: 'Total Cores', value: cores.length, accent: '#22a6f2' },
    { key: 'skills', label: 'Total Skills', value: skills.length, accent: '#7c3aed' },
    { key: 'habits', label: 'Total Habits', value: habits.length, accent: '#f59e0b' },
  ];

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(11, 61, 145, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(36, 59, 83, ${opacity})`,
    barPercentage: 0.6,
    propsForBackgroundLines: {
      stroke: '#e5edf9',
    },
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Analytics Overview</Text>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroScoreNumber}>{formatNumber(totalScore, { compact: compactNumbers })}</Text>
            <Text style={styles.heroScoreLabel}>Total Score</Text>
          </View>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroScoreNumber}>{formatNumber(averageScore, { compact: compactNumbers })}</Text>
            <Text style={styles.heroScoreLabel}>Average Score</Text>
          </View>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        {summaryMetrics.map((metric) => (
          <View key={metric.key} style={styles.metricCard}>
            <View style={[styles.metricAccent, { backgroundColor: metric.accent }]} />
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Core Score Distribution</Text>
      {cores.length === 0 ? (
        <Text style={styles.empty}>No cores found.</Text>
      ) : (
        <View style={styles.chartWrapper}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Core Score Distribution</Text>
            <Text style={styles.chartSubtitle}>
              Each bar shows % of the average score target {formatNumber(averageScoreTarget, { compact: compactNumbers })}.
            </Text>
          </View>
          <BarChart
            data={{
              labels: coreData.labels,
              datasets: [{ data: coreData.data }],
            }}
            width={screenWidth - 48}
            height={260}
            chartConfig={chartConfig}
            fromZero
            showValuesOnTopOfBars
            yAxisSuffix="%"
            style={styles.chart}
          />

          <View style={styles.secondaryChartHeader}>
            <Text style={styles.chartTitle}>Core Total Scores</Text>
            <Text style={styles.chartSubtitle}>Each bar shows the current total score of each core.</Text>
          </View>
          <BarChart
            data={{
              labels: totalScoreChartData.labels,
              datasets: [{ data: totalScoreChartData.data }],
            }}
            width={screenWidth - 48}
            height={260}
            chartConfig={chartConfig}
            fromZero
            showValuesOnTopOfBars
            style={styles.chart}
          />
        </View>
      )}

      <Text style={styles.sectionTitle}>Core Streaks</Text>
      {coreStreakCards.length === 0 ? (
        <Text style={styles.empty}>No cores found.</Text>
      ) : (
        coreStreakCards.map((core) => (
          <TouchableOpacity
            key={core.id}
            style={[styles.streakCard, { borderColor: core.color || '#0b3d91' }]}
            onPress={() => navigation.navigate('CoreStreakCalendar', { coreId: core.id })}
          >
            <View style={styles.streakHeader}>
              <View>
                <Text style={styles.streakTitle}>{core.name}</Text>
                <Text style={styles.streakSubtitle}>Tap to open monthly streak calendar</Text>
              </View>
              <View style={[styles.streakBadge, { backgroundColor: core.color || '#0b3d91' }]}>
                <Text style={styles.streakBadgeNumber}>{core.currentStreak}</Text>
                <Text style={styles.streakBadgeLabel}>days</Text>
              </View>
            </View>

            <View style={styles.streakMetaRow}>
              <Text style={styles.streakMeta}>Best streak {core.bestStreak}</Text>
              <Text style={styles.streakMeta}>Completed days {core.totalCompletedDays}</Text>
            </View>

            <View style={styles.recentTrackRow}>
              {core.recentDays.map((day) => (
                <View
                  key={day.key}
                  style={[
                    styles.recentTrackDot,
                    day.completed ? styles.recentTrackDotDone : styles.recentTrackDotMissed,
                    day.isToday ? styles.recentTrackDotToday : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.recentTrackLabel,
                      day.completed ? styles.recentTrackLabelDone : null,
                    ]}
                  >
                    {day.label}
                  </Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))
      )}

      <Text style={styles.sectionTitle}>Coming Soon</Text>
      <Text style={styles.placeholder}>
        • Radar-style hero chart for your 5 cores{'\n'}
        • 7-day trend per core & skill using Events{'\n'}
        • Skill-level streak comparisons
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fd' },
  content: { padding: 16, paddingBottom: 24 },
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: '#dbe7fb',
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  heroEyebrow: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef4ff',
    color: '#0b3d91',
    borderRadius: 999,
    overflow: 'hidden',
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  heroStatCard: {
    width: '48%',
    backgroundColor: '#f8fbff',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#edf2fb',
  },
  heroScoreNumber: { color: '#0b3d91', fontSize: 28, fontWeight: '800' },
  heroScoreLabel: { marginTop: 4, color: '#52637a', fontSize: 12, fontWeight: '700' },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metricCard: {
    width: '31%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e6eefb',
  },
  metricAccent: { width: 34, height: 6, borderRadius: 999, marginBottom: 12 },
  metricValue: { fontSize: 28, fontWeight: '800', color: '#102a43' },
  metricLabel: { marginTop: 6, fontSize: 13, fontWeight: '700', color: '#52637a' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#102a43', marginTop: 12 },
  empty: { marginTop: 8, fontSize: 13, color: '#6b7a90' },
  chartWrapper: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6eefb',
  },
  chartHeader: { width: '100%', paddingHorizontal: 6, paddingTop: 8, marginBottom: 8 },
  secondaryChartHeader: { width: '100%', paddingHorizontal: 6, paddingTop: 16, marginBottom: 8 },
  chartTitle: { fontSize: 16, fontWeight: '700', color: '#102a43' },
  chartSubtitle: { marginTop: 4, fontSize: 12, color: '#6b7a90' },
  chart: { borderRadius: 12 },
  streakCard: {
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakTitle: { color: '#102a43', fontSize: 18, fontWeight: '700' },
  streakSubtitle: { marginTop: 4, color: '#7b8794', fontSize: 12 },
  streakBadge: {
    minWidth: 74,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  streakBadgeNumber: { color: '#fff', fontSize: 22, fontWeight: '800' },
  streakBadgeLabel: { color: '#fff', fontSize: 11, fontWeight: '700' },
  streakMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 14,
  },
  streakMeta: { color: '#52637a', fontSize: 12 },
  recentTrackRow: { flexDirection: 'row', justifyContent: 'space-between' },
  recentTrackDot: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentTrackDotDone: { backgroundColor: '#ffd166' },
  recentTrackDotMissed: { backgroundColor: '#dbe7fb' },
  recentTrackDotToday: { borderWidth: 2, borderColor: '#7fd0ff' },
  recentTrackLabel: { color: '#52637a', fontSize: 12, fontWeight: '700' },
  recentTrackLabelDone: { color: '#7a3e00' },
  placeholder: { marginTop: 8, fontSize: 13, color: '#4a5568' },
});

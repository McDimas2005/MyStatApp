import React, { useLayoutEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useStats } from '../context/StatContext';
import { formatNumber, formatPercent } from '../utils/numberFormat';
import {
  addMonthsUtc,
  formatMonthLabel,
  getCoreStreakSummary,
  getMonthCalendar,
  startOfMonthUtc,
} from '../utils/coreStreaks';

function getSegmentStyle(cell, week, index) {
  if (!cell.completed) return null;

  const previous = week[index - 1];
  const next = week[index + 1];
  const hasPrevious = previous?.completed;
  const hasNext = next?.completed;

  return {
    borderTopLeftRadius: hasPrevious ? 10 : 18,
    borderBottomLeftRadius: hasPrevious ? 10 : 18,
    borderTopRightRadius: hasNext ? 10 : 18,
    borderBottomRightRadius: hasNext ? 10 : 18,
  };
}

export default function CoreStreakCalendarScreen({ navigation, route }) {
  const { coreId } = route.params;
  const { cores, events, compactNumbers } = useStats();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonthUtc(new Date()));

  const core = cores.find((entry) => entry.id === coreId);
  const summary = useMemo(
    () => (core ? getCoreStreakSummary(events, core.id) : null),
    [core, events],
  );
  const monthCalendar = useMemo(
    () => (summary ? getMonthCalendar(visibleMonth, summary.daySet) : null),
    [summary, visibleMonth],
  );

  useLayoutEffect(() => {
    if (!core) return;
    navigation.setOptions({
      title: `${core.name} Streak Calendar`,
    });
  }, [core, navigation]);

  if (!core || !summary || !monthCalendar) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Core not found</Text>
        <Text style={styles.emptyText}>This streak calendar is no longer available.</Text>
      </View>
    );
  }

  const monthCompletionRate = monthCalendar.daysInMonth
    ? (monthCalendar.completedCount / monthCalendar.daysInMonth) * 100
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.heroCard, { borderColor: core.color || '#0b3d91' }]}>
        <View style={styles.heroCopy}>
          <Text style={[styles.badge, { color: core.color || '#0b3d91' }]}>
            {`${core.name} Core Streak`.toUpperCase()}
          </Text>
          <Text style={styles.heroNumber}>{formatNumber(summary.currentStreak, { compact: compactNumbers })}</Text>
          <Text style={styles.heroLabel}>day streak</Text>
          <Text style={styles.heroSubtext}>
            {core.name} has {formatNumber(summary.totalCompletedDays, { compact: compactNumbers })} completed day{summary.totalCompletedDays === 1 ? '' : 's'} overall.
          </Text>
        </View>
        <View style={[styles.heroGlow, { backgroundColor: core.color || '#0b3d91' }]}>
          <Text style={styles.heroGlowText}>BEST {formatNumber(summary.bestStreak, { compact: compactNumbers })}</Text>
        </View>
      </View>

      <View style={styles.insightCard}>
        <Text style={styles.insightHeadline}>
          {formatPercent(monthCompletionRate)} monthly consistency
        </Text>
        <Text style={styles.insightText}>
          {formatNumber(monthCalendar.completedCount, { compact: compactNumbers })} completed day{monthCalendar.completedCount === 1 ? '' : 's'} in {formatMonthLabel(visibleMonth)}.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>{core.name} Streak Calendar</Text>
      <View style={styles.calendarCard}>
        <View style={styles.monthHeader}>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => setVisibleMonth((current) => addMonthsUtc(current, -1))}
          >
            <Text style={styles.monthButtonText}>{'<'}</Text>
          </TouchableOpacity>

          <Text style={styles.monthTitle}>{formatMonthLabel(visibleMonth)}</Text>

          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => setVisibleMonth((current) => addMonthsUtc(current, 1))}
          >
            <Text style={styles.monthButtonText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekdayRow}>
          {monthCalendar.weekdayLabels.map((label) => (
            <Text key={label} style={styles.weekdayLabel}>
              {label}
            </Text>
          ))}
        </View>

        {monthCalendar.weeks.map((week, rowIndex) => (
          <View key={`week-${rowIndex}`} style={styles.weekRow}>
            {week.map((cell, cellIndex) => (
              <View
                key={cell.key}
                style={[
                  styles.dayCell,
                  cell.inMonth ? styles.dayCellInMonth : styles.dayCellOutside,
                  cell.completed ? styles.dayCellCompleted : null,
                  cell.completed ? getSegmentStyle(cell, week, cellIndex) : null,
                  cell.isToday ? styles.dayCellToday : null,
                ]}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    !cell.inMonth ? styles.dayLabelOutside : null,
                    cell.completed ? styles.dayLabelCompleted : null,
                    cell.isToday ? styles.dayLabelToday : null,
                  ]}
                >
                  {cell.label}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, styles.legendCompleted]} />
            <Text style={styles.legendText}>Completed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, styles.legendMissed]} />
            <Text style={styles.legendText}>Uncompleted</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, styles.legendToday]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fd' },
  content: { padding: 16, paddingBottom: 36 },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  heroCopy: { maxWidth: '72%' },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef4ff',
    borderRadius: 999,
    overflow: 'hidden',
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  heroNumber: { marginTop: 14, fontSize: 54, fontWeight: '800', color: '#0b3d91' },
  heroLabel: { marginTop: -4, fontSize: 28, fontWeight: '700', color: '#f59e0b' },
  heroSubtext: { marginTop: 10, fontSize: 13, color: '#52637a', lineHeight: 19 },
  heroGlow: {
    position: 'absolute',
    top: 24,
    right: 20,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 12,
    opacity: 0.92,
  },
  heroGlowText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbe7fb',
  },
  insightHeadline: { fontSize: 18, fontWeight: '700', color: '#0b3d91' },
  insightText: { marginTop: 6, fontSize: 13, color: '#52637a', lineHeight: 19 },
  sectionTitle: { marginTop: 18, marginBottom: 10, fontSize: 17, fontWeight: '700', color: '#102a43' },
  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbe7fb',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: '#eef4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonText: { color: '#0b3d91', fontSize: 20, fontWeight: '700' },
  monthTitle: { color: '#102a43', fontSize: 18, fontWeight: '700' },
  weekdayRow: { flexDirection: 'row', marginBottom: 8 },
  weekdayLabel: { flex: 1, textAlign: 'center', color: '#7b8794', fontWeight: '700', fontSize: 12 },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  dayCell: {
    flex: 1,
    minHeight: 42,
    marginHorizontal: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellInMonth: { backgroundColor: '#f4f7fb' },
  dayCellOutside: { backgroundColor: 'transparent' },
  dayCellCompleted: { backgroundColor: '#ffd166', borderWidth: 1, borderColor: '#f59e0b' },
  dayCellToday: { borderWidth: 2, borderColor: '#7fd0ff' },
  dayLabel: { color: '#52637a', fontSize: 14, fontWeight: '700' },
  dayLabelOutside: { color: 'transparent' },
  dayLabelCompleted: { color: '#7a3e00' },
  dayLabelToday: { color: '#0b3d91' },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12, marginBottom: 8 },
  legendSwatch: { width: 14, height: 14, borderRadius: 999, marginRight: 6 },
  legendCompleted: { backgroundColor: '#ffd166' },
  legendMissed: { backgroundColor: '#dbe7fb' },
  legendToday: { backgroundColor: '#7fd0ff' },
  legendText: { color: '#52637a', fontSize: 12 },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#f7f9fd',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#0b3d91' },
  emptyText: { marginTop: 8, fontSize: 14, color: '#4a5568', textAlign: 'center' },
});

// src/screens/AnalyticsScreen.js
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useStats } from '../context/StatContext';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const { cores, habits } = useStats();

  const coreData = useMemo(() => {
    const labels = cores.map((c) => c.name.split('-')[0]); // short labels
    const data = cores.map((c) => c.totalScore || 0);
    return { labels, data };
  }, [cores]);

  const totalHabits = habits.length;
  const totalScore = cores.reduce((sum, c) => sum + (c.totalScore || 0), 0);

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(11, 61, 145, ${opacity})`,        // bar + axis color
    labelColor: (opacity = 1) => `rgba(36, 59, 83, ${opacity})`,     // label color
    barPercentage: 0.6,
    propsForBackgroundLines: {
      stroke: '#e5edf9',
    },
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Analytics Overview</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLine}>Total Score: {totalScore}</Text>
        <Text style={styles.summaryLine}>Total Habits: {totalHabits}</Text>
      </View>

      <Text style={styles.sectionTitle}>Core Score Distribution</Text>
      {cores.length === 0 ? (
        <Text style={styles.empty}>No cores found.</Text>
      ) : (
        <View style={styles.chartWrapper}>
          <BarChart
            data={{
              labels: coreData.labels,
              datasets: [{ data: coreData.data }],
            }}
            width={screenWidth - 32}     // screen width minus padding
            height={260}
            chartConfig={chartConfig}
            fromZero
            showValuesOnTopOfBars
            style={{
              borderRadius: 12,
            }}
          />
        </View>
      )}

      <Text style={styles.sectionTitle}>Coming Soon</Text>
      <Text style={styles.placeholder}>
        • Radar-style hero chart for your 5 cores{'\n'}
        • 7-day trend per core & skill using Events{'\n'}
        • Streak visualizations for each habit
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fd' },
  content: { padding: 16, paddingBottom: 24 },
  title: { fontSize: 20, fontWeight: '700', color: '#0b3d91', marginBottom: 12 },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e6eefb',
    marginBottom: 16,
  },
  summaryLine: { fontSize: 14, color: '#243b53' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#0b3d91', marginTop: 12 },
  empty: { marginTop: 8, fontSize: 13, color: '#6b7a90' },
  chartWrapper: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  placeholder: { marginTop: 8, fontSize: 13, color: '#4a5568' },
});

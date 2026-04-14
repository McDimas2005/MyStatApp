import React from 'react';
import { View, Button, Alert, StyleSheet, Text, Switch } from 'react-native';
import { useStats } from '../context/StatContext';

export default function SettingsScreen() {
  const {
    resetAll,
    resetProgress,
    hasSampleBackup,
    applyAnalyticsSampleData,
    restoreRealData,
    compactNumbers,
    updateSettings,
  } = useStats();

  const handleApplySample = async () => {
    try {
      const summary = await applyAnalyticsSampleData();
      Alert.alert(
        'Sample data applied',
        `Loaded ${summary.coreCount} cores, ${summary.skillCount} skills, ${summary.habitCount} habits, and ${summary.eventCount} events across the last 21 days.`,
      );
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleRestoreRealData = async () => {
    try {
      await restoreRealData();
      Alert.alert('Real data restored', 'Your original local data snapshot has been restored.');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Number Display</Text>
        <Text style={styles.description}>
          Toggle compact formatting for large values like K, M, and B across the app.
        </Text>
        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.switchTitle}>Compact numbers</Text>
            <Text style={styles.switchHint}>
              {compactNumbers ? 'Using 10K, 1.2M, 2.5B' : 'Using exact values like 10000'}
            </Text>
          </View>
          <Switch
            value={compactNumbers}
            onValueChange={(value) => updateSettings({ compactNumbers: value })}
            trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
            thumbColor={compactNumbers ? '#0b3d91' : '#f8fafc'}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Analytics Sample Mode</Text>
        <Text style={styles.description}>
          Apply a generated 21-day dataset across every core and skill to test charts, then restore your real data when you are done.
        </Text>
        <Button
          title={hasSampleBackup ? 'Regenerate Sample Data' : 'Load 21-Day Sample Data'}
          onPress={handleApplySample}
        />
        <View style={styles.spacer} />
        <Button
          title="Restore Real Data"
          onPress={handleRestoreRealData}
          disabled={!hasSampleBackup}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Data Reset</Text>
        <Text style={styles.description}>
          Reset only progress or wipe everything from this device.
        </Text>
        <Button
          title="Reset Progress Only"
          color="#d97706"
          onPress={() => {
            resetProgress();
            Alert.alert(
              'Progress reset',
              'All scores, streaks, and tracked events were cleared, but your cores, skills, and habits were kept.',
            );
          }}
        />
        <View style={styles.spacer} />
        <Button
          title="Reset All Data"
          color="#b00020"
          onPress={() => {
            resetAll();
            Alert.alert('Reset', 'All statistics cleared');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f7f9fd' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dbe7fb',
    padding: 16,
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#0b3d91', marginBottom: 8 },
  description: { fontSize: 14, color: '#243b53', marginBottom: 16, lineHeight: 20 },
  spacer: { height: 12 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fbff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e6eefb',
  },
  switchCopy: { flex: 1, paddingRight: 12 },
  switchTitle: { fontSize: 15, fontWeight: '700', color: '#102a43' },
  switchHint: { marginTop: 4, fontSize: 12, color: '#52637a' },
});

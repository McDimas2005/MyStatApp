// src/screens/HabitDetailScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useStats } from '../context/StatContext';
import { formatNumber } from '../utils/numberFormat';

export default function HabitDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { habits, skills, cores, logHabit, removeHabit, compactNumbers } = useStats();
  const [amount, setAmount] = useState('');

  const habit = habits.find((h) => h.id === id);
  if (!habit) {
    return (
      <View style={styles.container}>
        <Text>Habit not found.</Text>
      </View>
    );
  }

  const skill = skills.find((s) => s.id === habit.skillId);
  const core = skill ? cores.find((c) => c.id === skill.coreId) : null;

  const handleDeleteHabit = () => {
    Alert.alert(
      'Delete habit',
      `Delete "${habit.name}" and all logged events for it?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeHabit(habit.id);
            navigation.navigate('SkillDetail', { id: habit.skillId });
          },
        },
      ],
    );
  };

  const handleLog = () => {
    try {
      if (!amount.trim()) {
        return Alert.alert('Error', 'Please enter how much you did today.');
      }
      const { points } = logHabit(habit.id, Number(amount));
      Alert.alert(
        'Logged',
        `You gained ${points} point(s) for ${skill?.name ?? 'Skill'} (${core?.name ?? 'Core'}) today.`,
      );
      setAmount('');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Habit Detail</Text>
            <Text style={styles.title}>{habit.name}</Text>
            {habit.description ? <Text style={styles.description}>{habit.description}</Text> : null}
          </View>

          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeNumber}>{formatNumber(habit.totalScore, { compact: compactNumbers })}</Text>
            <Text style={styles.scoreBadgeLabel}>score</Text>
          </View>
        </View>

        <View style={styles.tagRow}>
          <View style={[styles.tag, styles.coreTag]}>
            <Text style={styles.tagLabel}>Core</Text>
            <Text style={styles.tagValue}>{core?.name ?? 'Unknown'}</Text>
          </View>
          <View style={[styles.tag, styles.skillTag]}>
            <Text style={styles.tagLabel}>Skill</Text>
            <Text style={styles.tagValue}>{skill?.name ?? 'Unknown'}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => navigation.navigate('EditHabit', { habitId: habit.id })}
          >
            <Text style={styles.secondaryActionText}>Edit Habit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dangerAction} onPress={handleDeleteHabit}>
            <Text style={styles.dangerActionText}>Delete Habit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.metaCard}>
        <Text style={styles.sectionTitle}>Tracking Setup</Text>
        <View style={styles.metaGrid}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Metric</Text>
            <Text style={styles.metaValue}>{habit.metric}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Scale</Text>
            <Text style={styles.metaValue}>{habit.scale}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress Snapshot</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{formatNumber(habit.streak, { compact: compactNumbers })}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{formatNumber(habit.bestStreak, { compact: compactNumbers })}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{formatNumber(habit.countDays, { compact: compactNumbers })}</Text>
            <Text style={styles.statLabel}>Days Done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{formatNumber(habit.totalScore, { compact: compactNumbers })}</Text>
            <Text style={styles.statLabel}>Total Score</Text>
          </View>
        </View>
      </View>

      <View style={styles.logCard}>
        <Text style={styles.sectionTitle}>Log Today</Text>
        <Text style={styles.logHelper}>
          Enter how many {habit.metric} you completed today. The app will update the score and streak automatically.
        </Text>
        <TextInput
          style={styles.input}
          placeholder={`How many ${habit.metric} today?`}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleLog}>
          <Text style={styles.primaryButtonText}>Log Progress</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fd' },
  content: { padding: 16, paddingBottom: 32 },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#dbe7fb',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroCopy: { flex: 1, paddingRight: 12 },
  eyebrow: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '700',
    color: '#0b3d91',
    backgroundColor: '#eef4ff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    overflow: 'hidden',
    letterSpacing: 0.6,
  },
  title: { marginTop: 14, fontSize: 28, fontWeight: '800', color: '#102a43' },
  description: { marginTop: 8, fontSize: 14, color: '#52637a', lineHeight: 20 },
  scoreBadge: {
    minWidth: 86,
    backgroundColor: '#0b3d91',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  scoreBadgeNumber: { color: '#ffffff', fontSize: 26, fontWeight: '800' },
  scoreBadgeLabel: { color: '#dbeafe', fontSize: 12, fontWeight: '700' },
  tagRow: { flexDirection: 'row', marginTop: 16, flexWrap: 'wrap' },
  tag: {
    flex: 1,
    minWidth: 140,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginRight: 10,
    marginBottom: 10,
  },
  coreTag: { backgroundColor: '#eef4ff' },
  skillTag: { backgroundColor: '#f3efff' },
  tagLabel: { fontSize: 11, fontWeight: '700', color: '#7b8794', textTransform: 'uppercase' },
  tagValue: { marginTop: 4, fontSize: 15, fontWeight: '700', color: '#102a43' },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  secondaryAction: {
    backgroundColor: '#e6eefb',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  secondaryActionText: { color: '#0b3d91', fontWeight: '700', fontSize: 12 },
  dangerAction: {
    backgroundColor: '#fee2e2',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  dangerActionText: { color: '#b91c1c', fontWeight: '700', fontSize: 12 },
  metaCard: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e6eefb',
  },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#102a43', marginBottom: 10 },
  metaGrid: { flexDirection: 'row' },
  metaBlock: {
    flex: 1,
    backgroundColor: '#f8fbff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#edf2fb',
  },
  metaLabel: { fontSize: 11, fontWeight: '700', color: '#7b8794', textTransform: 'uppercase' },
  metaValue: { marginTop: 6, fontSize: 18, fontWeight: '700', color: '#0b3d91' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e6eefb',
  },
  statNumber: { fontSize: 28, fontWeight: '800', color: '#0b3d91' },
  statLabel: { marginTop: 6, fontSize: 13, fontWeight: '600', color: '#52637a' },
  logCard: {
    marginTop: 4,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#dbe7fb',
  },
  logHelper: { marginBottom: 12, fontSize: 13, color: '#52637a', lineHeight: 19 },
  input: {
    borderWidth: 1,
    borderColor: '#c8d6f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#0b3d91',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 14,
  },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

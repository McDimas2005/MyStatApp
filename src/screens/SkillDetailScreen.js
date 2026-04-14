import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useStats } from '../context/StatContext';
import { formatNumber } from '../utils/numberFormat';

export default function SkillDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { skills, cores, habits, removeSkill, compactNumbers } = useStats();

  const skill = skills.find((s) => s.id === id);
  if (!skill) {
    return (
      <View style={styles.container}>
        <Text>Skill not found.</Text>
      </View>
    );
  }

  const core = cores.find((c) => c.id === skill.coreId);
  const skillHabits = habits.filter((h) => h.skillId === skill.id);

  const handleDeleteSkill = () => {
    Alert.alert(
      'Delete skill',
      `Delete "${skill.name}" and all habits/events under it?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeSkill(skill.id);
            navigation.navigate('CoreDetail', { id: skill.coreId });
          },
        },
      ],
    );
  };

  const renderHabit = ({ item }) => (
    <TouchableOpacity
      style={styles.habitCard}
      onPress={() => navigation.navigate('HabitDetail', { id: item.id })}
    >
      <Text style={styles.habitName}>{item.name}</Text>
      <Text style={styles.habitMeta}>
        Metric: {item.metric} · Scale: {item.scale}
      </Text>
      <Text style={styles.habitStats}>
        Score: {formatNumber(item.totalScore, { compact: compactNumbers })} · Streak: {formatNumber(item.streak, { compact: compactNumbers })} (Best {formatNumber(item.bestStreak, { compact: compactNumbers })}) · Days: {formatNumber(item.countDays, { compact: compactNumbers })}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.skillCard}>
        <Text style={styles.skillName}>{skill.name}</Text>
        <Text style={styles.skillCore}>Core: {core?.name ?? 'Unknown'}</Text>
        <Text style={styles.skillScore}>Total Score: {formatNumber(skill.totalScore || 0, { compact: compactNumbers })}</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryAction} onPress={() => navigation.navigate('AddHabit', { skillId: skill.id })}>
            <Text style={styles.primaryActionText}>Add Habit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} onPress={() => navigation.navigate('EditSkill', { skillId: skill.id })}>
            <Text style={styles.secondaryActionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dangerAction} onPress={handleDeleteSkill}>
            <Text style={styles.dangerActionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Habits for this Skill</Text>
      <FlatList
        data={skillHabits}
        keyExtractor={(item) => item.id}
        renderItem={renderHabit}
        ListEmptyComponent={
          <Text style={styles.empty}>No habits yet for this skill.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f7f9fd' },
  skillCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e6eefb',
    marginBottom: 16,
  },
  skillName: { fontSize: 20, fontWeight: '700', color: '#0b3d91' },
  skillCore: { marginTop: 6, fontSize: 14, color: '#6b7a90' },
  skillScore: { marginTop: 4, fontSize: 14, color: '#243b53' },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  primaryAction: {
    backgroundColor: '#0b3d91',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  primaryActionText: { color: '#fff', fontWeight: '700', fontSize: 12 },
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
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#0b3d91', marginBottom: 8 },
  habitCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e6eefb',
  },
  habitName: { fontSize: 15, fontWeight: '600', color: '#243b53' },
  habitMeta: { marginTop: 4, fontSize: 12, color: '#6b7a90' },
  habitStats: { marginTop: 4, fontSize: 12, color: '#243b53' },
  empty: { fontSize: 13, color: '#6b7a90', marginTop: 8 },
});

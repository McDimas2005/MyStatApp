import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useStats } from '../context/StatContext';
import { formatNumber } from '../utils/numberFormat';

export default function QuickLogScreen({ navigation }) {
  const { habits, skills, cores, logHabit, compactNumbers } = useStats();
  const [amounts, setAmounts] = useState({});

  const groupedSections = useMemo(() => {
    const habitsBySkill = habits.reduce((acc, habit) => {
      if (!acc[habit.skillId]) acc[habit.skillId] = [];
      acc[habit.skillId].push(habit);
      return acc;
    }, {});

    return cores
      .map((core) => {
        const skillGroups = skills
          .filter((skill) => skill.coreId === core.id)
          .map((skill) => ({
            ...skill,
            habits: (habitsBySkill[skill.id] ?? []).sort((left, right) => {
              const leftDate = left.updatedAt || left.createdAt || '';
              const rightDate = right.updatedAt || right.createdAt || '';
              return rightDate.localeCompare(leftDate);
            }),
          }))
          .filter((skill) => skill.habits.length > 0);

        return {
          ...core,
          data: skillGroups,
        };
      })
      .filter((core) => core.data.length > 0);
  }, [cores, skills, habits]);

  const handleChangeAmount = (habitId, value) => {
    setAmounts((prev) => ({ ...prev, [habitId]: value }));
  };

  const handleLog = (habit) => {
    try {
      const value = amounts[habit.id] ?? '';
      if (!value.trim()) {
        return Alert.alert('Error', `Enter how many ${habit.metric} you completed.`);
      }

      const { points } = logHabit(habit.id, Number(value));
      setAmounts((prev) => ({ ...prev, [habit.id]: '' }));
      Alert.alert('Logged', `${habit.name} gained ${points} point(s).`);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  if (!groupedSections.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No habits to log yet</Text>
        <Text style={styles.emptyText}>
          Create at least one habit first, then use Quick Log from Home for faster daily tracking.
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('AddHabit')}
        >
          <Text style={styles.emptyButtonText}>Create Habit</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Log</Text>
      <Text style={styles.subtitle}>
        Log any habit directly from one screen without opening the detail pages.
      </Text>

      <SectionList
        sections={groupedSections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={[styles.coreHeader, { borderLeftColor: section.color || '#0b3d91' }]}>
            <Text style={styles.coreTitle}>{section.name}</Text>
            <Text style={styles.coreScore}>Core Score {formatNumber(section.totalScore || 0, { compact: compactNumbers })}</Text>
          </View>
        )}
        renderItem={({ item: skill }) => (
          <View style={styles.skillCard}>
            <View style={styles.skillHeader}>
              <Text style={styles.skillTitle}>{skill.name}</Text>
              <Text style={styles.skillScore}>Skill Score {formatNumber(skill.totalScore || 0, { compact: compactNumbers })}</Text>
            </View>

            {skill.habits.map((habit) => (
              <View key={habit.id} style={styles.habitCard}>
                <Text style={styles.name}>{habit.name}</Text>
                <Text style={styles.meta}>
                  Metric {habit.metric} · Scale {habit.scale}
                </Text>
                <Text style={styles.stats}>
                  Score {formatNumber(habit.totalScore, { compact: compactNumbers })} · Streak {formatNumber(habit.streak, { compact: compactNumbers })} · Days {formatNumber(habit.countDays, { compact: compactNumbers })}
                </Text>

                <View style={styles.row}>
                  <TextInput
                    style={styles.input}
                    placeholder={`How many ${habit.metric}?`}
                    keyboardType="decimal-pad"
                    value={amounts[habit.id] ?? ''}
                    onChangeText={(value) => handleChangeAmount(habit.id, value)}
                  />
                  <TouchableOpacity style={styles.button} onPress={() => handleLog(habit)}>
                    <Text style={styles.buttonText}>Log</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fd', paddingTop: 16 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0b3d91',
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 13,
    color: '#4a5568',
    marginTop: 6,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  coreHeader: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#d8e4fb',
    borderLeftWidth: 5,
  },
  coreTitle: { fontSize: 18, fontWeight: '700', color: '#0b3d91' },
  coreScore: { marginTop: 4, fontSize: 12, color: '#52637a' },
  skillCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e6eefb',
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillTitle: { fontSize: 15, fontWeight: '700', color: '#243b53' },
  skillScore: { fontSize: 12, color: '#52637a' },
  habitCard: {
    borderTopWidth: 1,
    borderTopColor: '#edf2fb',
    paddingTop: 12,
    marginTop: 2,
  },
  name: { fontSize: 15, fontWeight: '700', color: '#243b53' },
  meta: { marginTop: 4, fontSize: 12, color: '#6b7a90' },
  stats: { marginTop: 6, fontSize: 12, color: '#243b53' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#c8d6f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  button: {
    backgroundColor: '#0b3d91',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 18,
  },
  buttonText: { color: '#fff', fontWeight: '700' },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#f7f9fd',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#0b3d91' },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: '#4a5568',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 16,
    backgroundColor: '#0b3d91',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  emptyButtonText: { color: '#fff', fontWeight: '700' },
});

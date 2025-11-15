// src/screens/HabitDetailScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { useStats } from '../context/StatContext';

export default function HabitDetailScreen({ route }) {
  const { id } = route.params;
  const { habits, skills, cores, logHabit } = useStats();
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
    <View style={styles.container}>
      <Text style={styles.title}>{habit.name}</Text>
      {habit.description ? <Text style={styles.description}>{habit.description}</Text> : null}
      <Text style={styles.label}>
        Core: <Text style={styles.value}>{core?.name ?? 'Unknown'}</Text>
      </Text>
      <Text style={styles.label}>
        Skill: <Text style={styles.value}>{skill?.name ?? 'Unknown'}</Text>
      </Text>
      <Text style={styles.label}>
        Metric: <Text style={styles.value}>{habit.metric}</Text>
      </Text>
      <Text style={styles.label}>
        Scale: <Text style={styles.value}>{habit.scale}</Text>
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress</Text>
        <Text style={styles.value}>Total Score: {habit.totalScore}</Text>
        <Text style={styles.value}>Streak: {habit.streak}</Text>
        <Text style={styles.value}>Best Streak: {habit.bestStreak}</Text>
        <Text style={styles.value}>Days Done: {habit.countDays}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Log Today</Text>
        <TextInput
          style={styles.input}
          placeholder={`How many ${habit.metric} today?`}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <Button title="Log" onPress={handleLog} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f7f9fd' },
  title: { fontSize: 20, fontWeight: '700', color: '#0b3d91' },
  description: { marginTop: 4, fontSize: 14, color: '#4a5568' },
  label: { marginTop: 8, fontSize: 13, color: '#6b7a90' },
  value: { fontWeight: '600', color: '#243b53' },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#0b3d91', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#c8d6f0',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
});

// src/screens/HabitsScreen.js
import React from 'react';
import { View, FlatList, Button, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useStats } from '../context/StatContext';

export default function HabitsScreen({ navigation }) {
  const { habits, skills } = useStats();

  const renderItem = ({ item }) => {
    const skill = skills.find((s) => s.id === item.skillId);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('HabitDetail', { id: item.id })}
      >
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>
          Skill: {skill?.name ?? 'Unknown'} · Metric: {item.metric}
        </Text>
        <Text style={styles.stats}>
          Total Score: {item.totalScore} · Streak: {item.streak} (Best {item.bestStreak}) · Days: {item.countDays}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Button title="Add Habit" onPress={() => navigation.navigate('AddHabit')} />
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f7f9fd' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderColor: '#e6eefb',
    borderWidth: 1,
  },
  name: { fontSize: 16, fontWeight: '600', color: '#0b3d91' },
  meta: { fontSize: 12, color: '#6b7a90', marginTop: 4 },
  stats: { fontSize: 12, color: '#243b53', marginTop: 6 },
});

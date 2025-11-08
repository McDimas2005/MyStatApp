import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatCard({ name, progress, goal, unit, category }) {
  const percentage = goal
    ? Math.min(100, (progress / goal) * 100).toFixed(1)
    : '—';
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.meta}>
        {category} · Goal: {goal ?? '—'} {unit}
      </Text>
      <Text style={styles.data}>
        {progress} {unit} {goal ? `(${percentage}%)` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e6eefb',
  },
  name: { fontSize: 18, fontWeight: '700', color: '#0b3d91' }, // blue-accented title
  meta: { fontSize: 12, color: '#6b7a90', marginTop: 2 },
  data: { fontSize: 14, color: '#243b53', marginTop: 6 },
});

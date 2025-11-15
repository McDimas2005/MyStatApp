import React, { useMemo } from 'react';
import { View, Button, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { useStats } from '../context/StatContext';

export default function HomeScreen({ navigation }) {
  const { cores, loading } = useStats();

  const maxScore = useMemo(
    () => cores.reduce((max, c) => Math.max(max, c.totalScore || 0), 0),
    [cores],
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const renderCore = ({ item }) => {
    const total = item.totalScore || 0;
    const ratio = maxScore > 0 ? total / maxScore : 0;
    const barWidth = `${Math.max(8, ratio * 100)}%`; // min bar width so 0 isn't invisible

    return (
      <TouchableOpacity
        style={styles.coreCard}
        onPress={() => navigation.navigate('CoreDetail', { id: item.id })}
      >
        <View style={styles.coreHeader}>
          <Text style={styles.coreName}>{item.name}</Text>
          <Text style={styles.coreScore}>{total}</Text>
        </View>
        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width: barWidth, backgroundColor: item.color || '#3b82f6' }]} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Button title="Manage Habits" onPress={() => navigation.navigate('Habits')} />
      <View style={{ height: 8 }} />
      <Button title="View Skills" onPress={() => navigation.navigate('Skills')} />

      <Text style={styles.sectionTitle}>Core Stats (Your Hero Attributes)</Text>
      <FlatList
        data={cores}
        keyExtractor={(item) => item.id}
        renderItem={renderCore}
        contentContainerStyle={{ paddingVertical: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f7f9fd' },
  sectionTitle: { marginTop: 16, fontSize: 16, fontWeight: '600', color: '#0b3d91' },
  coreCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e6eefb',
  },
  coreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  coreName: { fontSize: 15, fontWeight: '600', color: '#243b53' },
  coreScore: { fontSize: 15, fontWeight: '700', color: '#0b3d91' },
  barBackground: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#e5edf9',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
});

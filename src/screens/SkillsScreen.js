import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useStats } from '../context/StatContext';
import { formatNumber } from '../utils/numberFormat';

export default function SkillsScreen({ navigation }) {
  const { skills, cores, compactNumbers } = useStats();

  const renderSkill = ({ item }) => {
    const core = cores.find((c) => c.id === item.coreId);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('SkillDetail', { id: item.id })}
      >
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>Core: {core?.name ?? 'Unknown'}</Text>
        <Text style={styles.score}>Total Score: {formatNumber(item.totalScore || 0, { compact: compactNumbers })}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('AddSkill')}>
        <Text style={styles.primaryButtonText}>Create Skill</Text>
      </TouchableOpacity>
      <Text style={styles.title}>All Skills</Text>
      <FlatList
        data={skills}
        keyExtractor={(item) => item.id}
        renderItem={renderSkill}
        contentContainerStyle={{ paddingVertical: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f7f9fd' },
  primaryButton: {
    backgroundColor: '#0b3d91',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  title: { marginTop: 12, fontSize: 18, fontWeight: '700', color: '#0b3d91' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e6eefb',
  },
  name: { fontSize: 15, fontWeight: '600', color: '#243b53' },
  meta: { marginTop: 4, fontSize: 12, color: '#6b7a90' },
  score: { marginTop: 4, fontSize: 13, color: '#243b53' },
});

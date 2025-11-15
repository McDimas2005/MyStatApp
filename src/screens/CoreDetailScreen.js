import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useStats } from '../context/StatContext';

export default function CoreDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { cores, skills } = useStats();

  const core = cores.find((c) => c.id === id);
  if (!core) {
    return (
      <View style={styles.container}>
        <Text>Core not found.</Text>
      </View>
    );
  }

  const coreSkills = skills.filter((s) => s.coreId === core.id);
  const total = core.totalScore || 0;
  const renderSkill = ({ item }) => {
    const score = item.totalScore || 0;
    const percent = total > 0 ? ((score / total) * 100).toFixed(1) : '0.0';

    return (
      <TouchableOpacity
        style={styles.skillCard}
        onPress={() => navigation.navigate('SkillDetail', { id: item.id })}
      >
        <Text style={styles.skillName}>{item.name}</Text>
        <Text style={styles.skillScore}>
          Score: {score} ({percent}% of {core.name})
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.coreCard, { borderLeftColor: core.color || '#0b3d91' }]}>
        <Text style={styles.coreName}>{core.name}</Text>
        <Text style={styles.coreScore}>Total Score: {total}</Text>
      </View>

      <Text style={styles.sectionTitle}>Skills in {core.name}</Text>
      <FlatList
        data={coreSkills}
        keyExtractor={(item) => item.id}
        renderItem={renderSkill}
        ListEmptyComponent={
          <Text style={styles.empty}>No skills yet under this core.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f7f9fd' },
  coreCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e6eefb',
    borderLeftWidth: 5,
    marginBottom: 16,
  },
  coreName: { fontSize: 20, fontWeight: '700', color: '#0b3d91' },
  coreScore: { marginTop: 6, fontSize: 14, color: '#243b53' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#0b3d91', marginBottom: 8 },
  skillCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e6eefb',
    marginBottom: 10,
  },
  skillName: { fontSize: 15, fontWeight: '600', color: '#243b53' },
  skillScore: { marginTop: 4, fontSize: 13, color: '#6b7a90' },
  empty: { fontSize: 13, color: '#6b7a90', marginTop: 8 },
});
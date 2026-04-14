import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useStats } from '../context/StatContext';
import { formatNumber, formatPercent } from '../utils/numberFormat';

export default function CoreDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { cores, skills, removeCore, compactNumbers } = useStats();

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

  const handleDeleteCore = () => {
    Alert.alert(
      'Delete core',
      `Delete "${core.name}" and all related skills, habits, and events?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeCore(core.id);
            navigation.navigate('HomeMain');
          },
        },
      ],
    );
  };

  const renderSkill = ({ item }) => {
    const score = item.totalScore || 0;
    const percent = total > 0 ? formatPercent((score / total) * 100) : '0%';

    return (
      <TouchableOpacity
        style={styles.skillCard}
        onPress={() => navigation.navigate('SkillDetail', { id: item.id })}
      >
        <Text style={styles.skillName}>{item.name}</Text>
        <Text style={styles.skillScore}>
          Score: {formatNumber(score, { compact: compactNumbers })} ({percent} of {core.name})
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.coreCard, { borderLeftColor: core.color || '#0b3d91' }]}>
        <Text style={styles.coreName}>{core.name}</Text>
        <Text style={styles.coreScore}>Total Score: {formatNumber(total, { compact: compactNumbers })}</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryAction} onPress={() => navigation.navigate('AddSkill', { coreId: core.id })}>
            <Text style={styles.primaryActionText}>Add Skill</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} onPress={() => navigation.navigate('EditCore', { coreId: core.id })}>
            <Text style={styles.secondaryActionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dangerAction} onPress={handleDeleteCore}>
            <Text style={styles.dangerActionText}>Delete</Text>
          </TouchableOpacity>
        </View>
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

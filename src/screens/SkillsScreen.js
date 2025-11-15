import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button } from 'react-native';
import { useStats } from '../context/StatContext';

export default function SkillsScreen({ navigation }) {
  const { skills, cores } = useStats();

  const renderSkill = ({ item }) => {
    const core = cores.find((c) => c.id === item.coreId);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('SkillDetail', { id: item.id })}
      >
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>Core: {core?.name ?? 'Unknown'}</Text>
        <Text style={styles.score}>Total Score: {item.totalScore || 0}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Later we can add Add Skill button here */}
      <Button title="Back to Home" onPress={() => navigation.navigate('Home')} />
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

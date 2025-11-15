// src/screens/HomeScreen.js
import React from 'react';
import { View, Button, StyleSheet, FlatList, Text } from 'react-native';
import { useStats } from '../context/StatContext';

export default function HomeScreen({ navigation }) {
  const { cores, loading } = useStats();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const renderCore = ({ item }) => (
    <View style={[styles.coreCard, { borderLeftColor: item.color || '#0b3d91' }]}>
      <Text style={styles.coreName}>{item.name}</Text>
      <Text style={styles.coreScore}>Total Score: {item.totalScore}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button title="Manage Habits" onPress={() => navigation.navigate('Habits')} />
      <Text style={styles.sectionTitle}>Your Cores</Text>
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
    marginBottom: 10,
    borderColor: '#e6eefb',
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  coreName: { fontSize: 15, fontWeight: '600', color: '#243b53' },
  coreScore: { fontSize: 13, color: '#6b7a90', marginTop: 4 },
});

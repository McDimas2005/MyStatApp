import React from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import StatInput from '../components/StatInput';
import { useStats } from '../context/StatContext';

function newId(name) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
}

function AddStatScreen({ navigation }) {
  const { addStat } = useStats();

  const handleSubmit = ({ name, category, unit, goal }) => {
    const stat = {
      id: newId(name),
      name,
      category,
      unit,
      total: 0,
      progress: 0,
      goal: goal ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addStat(stat);
    Alert.alert('Added', `${name} created`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatInput onSubmit={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f7f9fd' },
});

export default AddStatScreen;

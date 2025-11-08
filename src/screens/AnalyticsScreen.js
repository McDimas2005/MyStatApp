import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useStats } from '../context/StatContext';

// Placeholder: will integrate charts in Phase 2.
export default function AnalyticsScreen() {
  const { stats } = useStats();
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fd' },
});

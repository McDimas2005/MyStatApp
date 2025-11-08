import React from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import { useStats } from '../context/StatContext';

export default function SettingsScreen() {
  const { resetAll } = useStats();
  return (
    <View style={styles.container}>
      <Button
        title="Reset All Data"
        color="#b00020"
        onPress={() => {
          resetAll();
          Alert.alert('Reset', 'All statistics cleared');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f7f9fd' },
});

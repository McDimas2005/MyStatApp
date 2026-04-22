import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text } from 'react-native';

function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>MyStatApp is running 🎉</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#e5e7eb',
    fontSize: 24,
    fontWeight: '600',
  },
});

export default App;

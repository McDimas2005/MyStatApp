import React from 'react';
import { SafeAreaView, StatusBar, Text } from 'react-native';

function App() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#0f172a', // dark navy
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <StatusBar barStyle="light-content" />
      <Text
        style={{
          color: '#e5e7eb',
          fontSize: 24,
          fontWeight: '600',
        }}
      >
        MyStatApp is running 🎉
      </Text>
    </SafeAreaView>
  );
}

export default App;

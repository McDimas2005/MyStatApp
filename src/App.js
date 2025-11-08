import React from 'react';
import { StatProvider } from './context/StatContext';
import RootNavigator from './navigation';

export default function App() {
  return (
    <StatProvider>
      <RootNavigator />
    </StatProvider>
  );
}

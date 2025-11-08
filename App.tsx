// App.tsx (root file at project root)

import React from 'react';
import { StatusBar } from 'react-native';

import { StatProvider } from './src/context/StatContext';
import RootNavigator from './src/navigation';

function App(): JSX.Element {
  return (
    <StatProvider>
      {/* Optional: tweak bar style later */}
      <StatusBar barStyle="dark-content" backgroundColor="#f7f9fd" />
      <RootNavigator />
    </StatProvider>
  );
}

export default App;

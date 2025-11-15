// src/navigation.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import SettingsScreen from './screens/SettingsScreen';
import HabitsScreen from './screens/HabitsScreen';
import HabitDetailScreen from './screens/HabitDetailScreen';
import AddHabitScreen from './screens/AddHabitScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Habits" component={HabitsScreen} />
        <Stack.Screen name="AddHabit" component={AddHabitScreen} options={{ title: 'Add Habit' }} />
        <Stack.Screen name="HabitDetail" component={HabitDetailScreen} options={{ title: 'Habit Detail' }} />
        <Stack.Screen name="Analytics" component={AnalyticsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

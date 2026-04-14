// src/navigation.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import HabitsScreen from './screens/HabitsScreen';
import AddHabitScreen from './screens/AddHabitScreen';
import HabitDetailScreen from './screens/HabitDetailScreen';
import CoreDetailScreen from './screens/CoreDetailScreen';
import SkillsScreen from './screens/SkillsScreen';
import SkillDetailScreen from './screens/SkillDetailScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import SettingsScreen from './screens/SettingsScreen';
import QuickLogScreen from './screens/QuickLogScreen';
import CoreFormScreen from './screens/CoreFormScreen';
import SkillFormScreen from './screens/SkillFormScreen';
import CoreStreakCalendarScreen from './screens/CoreStreakCalendarScreen';

const HomeStackNav = createNativeStackNavigator();
const AnalyticsStackNav = createNativeStackNavigator();
const SettingsStackNav = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Stacks ---

function HomeStack() {
  return (
    <HomeStackNav.Navigator>
      <HomeStackNav.Screen name="HomeMain" component={HomeScreen} options={{ title: 'Home' }} />
      <HomeStackNav.Screen name="AddCore" component={CoreFormScreen} options={{ title: 'Create Core' }} />
      <HomeStackNav.Screen name="EditCore" component={CoreFormScreen} options={{ title: 'Edit Core' }} />
      <HomeStackNav.Screen name="AddSkill" component={SkillFormScreen} options={{ title: 'Create Skill' }} />
      <HomeStackNav.Screen name="EditSkill" component={SkillFormScreen} options={{ title: 'Edit Skill' }} />
      <HomeStackNav.Screen name="Habits" component={HabitsScreen} />
      <HomeStackNav.Screen name="AddHabit" component={AddHabitScreen} options={{ title: 'Add Habit' }} />
      <HomeStackNav.Screen name="EditHabit" component={AddHabitScreen} options={{ title: 'Edit Habit' }} />
      <HomeStackNav.Screen name="QuickLog" component={QuickLogScreen} options={{ title: 'Quick Log' }} />
      <HomeStackNav.Screen name="HabitDetail" component={HabitDetailScreen} options={{ title: 'Habit Detail' }} />
      <HomeStackNav.Screen name="CoreDetail" component={CoreDetailScreen} options={{ title: 'Core Detail' }} />
      <HomeStackNav.Screen name="Skills" component={SkillsScreen} />
      <HomeStackNav.Screen name="SkillDetail" component={SkillDetailScreen} options={{ title: 'Skill Detail' }} />
    </HomeStackNav.Navigator>
  );
}

function AnalyticsStack() {
  return (
    <AnalyticsStackNav.Navigator>
      <AnalyticsStackNav.Screen name="AnalyticsMain" component={AnalyticsScreen} options={{ title: 'Analytics' }} />
      <AnalyticsStackNav.Screen
        name="CoreStreakCalendar"
        component={CoreStreakCalendarScreen}
        options={{ title: 'Core Streak Calendar' }}
      />
    </AnalyticsStackNav.Navigator>
  );
}

function SettingsStack() {
  return (
    <SettingsStackNav.Navigator>
      <SettingsStackNav.Screen name="SettingsMain" component={SettingsScreen} options={{ title: 'Settings' }} />
    </SettingsStackNav.Navigator>
  );
}

// --- Tab Navigator ---

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarLabel: ({ color }) => {
            let label = route.name;
            if (route.name === 'HomeTab') label = 'Home';
            if (route.name === 'AnalyticsTab') label = 'Analytics';
            if (route.name === 'SettingsTab') label = 'Settings';
            return <Text style={{ color, fontSize: 11 }}>{label}</Text>;
          },
          tabBarIcon: ({ color, size }) => {
            let icon = '⬤';
            if (route.name === 'HomeTab') icon = '🏠';
            if (route.name === 'AnalyticsTab') icon = '📊';
            if (route.name === 'SettingsTab') icon = '⚙️';
            return <Text style={{ color, fontSize: size }}>{icon}</Text>;
          },
          tabBarActiveTintColor: '#0b3d91',
          tabBarInactiveTintColor: '#6b7a90',
        })}
      >
        <Tab.Screen name="HomeTab" component={HomeStack} />
        <Tab.Screen name="AnalyticsTab" component={AnalyticsStack} />
        <Tab.Screen name="SettingsTab" component={SettingsStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

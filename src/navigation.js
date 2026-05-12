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

const linking = {
  prefixes: ['mystat://'],
  config: {
    screens: {
      HomeTab: {
        screens: {
          HomeMain: 'home',
          QuickLog: 'app/quick-log',
        },
      },
      AnalyticsTab: {
        screens: {
          AnalyticsMain: 'analytics',
        },
      },
      SettingsTab: {
        screens: {
          SettingsMain: 'settings',
        },
      },
    },
  },
};

function getTabLabel(routeName) {
  if (routeName === 'HomeTab') return 'Home';
  if (routeName === 'AnalyticsTab') return 'Analytics';
  if (routeName === 'SettingsTab') return 'Settings';
  return routeName;
}

function getTabIcon(routeName) {
  if (routeName === 'HomeTab') return '🏠';
  if (routeName === 'AnalyticsTab') return '📊';
  if (routeName === 'SettingsTab') return '⚙️';
  return '⬤';
}

function renderTabLabel({ color }, routeName) {
  const tabLabelStyle = [styles.tabLabel, { color }];
  return <Text style={tabLabelStyle}>{getTabLabel(routeName)}</Text>;
}

function renderTabIcon({ color, size }, routeName) {
  const tabIconStyle = [styles.tabIcon, { color, fontSize: size }];
  return <Text style={tabIconStyle}>{getTabIcon(routeName)}</Text>;
}

function getTabScreenOptions({ route }) {
  return {
    headerShown: false,
    tabBarLabel: (props) => renderTabLabel(props, route.name),
    tabBarIcon: (props) => renderTabIcon(props, route.name),
    tabBarActiveTintColor: '#0b3d91',
    tabBarInactiveTintColor: '#6b7a90',
  };
}

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
    <NavigationContainer linking={linking}>
      <Tab.Navigator screenOptions={getTabScreenOptions}>
        <Tab.Screen name="HomeTab" component={HomeStack} />
        <Tab.Screen name="AnalyticsTab" component={AnalyticsStack} />
        <Tab.Screen name="SettingsTab" component={SettingsStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = {
  tabLabel: {
    fontSize: 11,
  },
  tabIcon: {},
};

import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = '@MyStatApp_stats';
const SETTINGS_KEY = '@MyStatApp_settings';

export async function loadStats() {
  const raw = await AsyncStorage.getItem(STATS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveStats(stats) {
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export async function loadSettings() {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  return raw ? JSON.parse(raw) : { theme: 'light' };
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

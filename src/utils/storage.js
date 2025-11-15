// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  cores: '@MyStatApp_cores',
  skills: '@MyStatApp_skills',
  habits: '@MyStatApp_habits',
  events: '@MyStatApp_events',
  settings: '@MyStatApp_settings',
};

export async function loadList(key) {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

export async function saveList(key, list) {
  await AsyncStorage.setItem(key, JSON.stringify(list));
}

// You can keep settings helpers if you already had them:
export async function loadSettings() {
  const raw = await AsyncStorage.getItem(KEYS.settings);
  return raw ? JSON.parse(raw) : { theme: 'light' };
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

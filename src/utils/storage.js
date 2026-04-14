// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  cores: '@MyStatApp_cores',
  skills: '@MyStatApp_skills',
  habits: '@MyStatApp_habits',
  events: '@MyStatApp_events',
  settings: '@MyStatApp_settings',
  sampleBackup: '@MyStatApp_sample_backup',
};

export async function loadValue(key, fallback = null) {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}

export async function saveValue(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeValue(key) {
  await AsyncStorage.removeItem(key);
}

export async function loadList(key) {
  return loadValue(key, []);
}

export async function saveList(key, list) {
  await saveValue(key, list);
}

export async function loadSettings() {
  return loadValue(KEYS.settings, { theme: 'light', compactNumbers: true });
}

export async function saveSettings(settings) {
  await saveValue(KEYS.settings, settings);
}

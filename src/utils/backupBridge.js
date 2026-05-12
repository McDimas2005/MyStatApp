import { NativeModules, Platform } from 'react-native';

const { MyStatBackupModule } = NativeModules;

export async function exportBackupFile(json, fileName) {
  if (Platform.OS !== 'android' || !MyStatBackupModule?.exportBackup) {
    throw new Error('Backup export is only available on Android in this build.');
  }

  return MyStatBackupModule.exportBackup(json, fileName);
}

export async function importBackupFile() {
  if (Platform.OS !== 'android' || !MyStatBackupModule?.importBackup) {
    throw new Error('Backup import is only available on Android in this build.');
  }

  return MyStatBackupModule.importBackup();
}

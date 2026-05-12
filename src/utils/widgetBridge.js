import { NativeModules, Platform } from 'react-native';

const { MyStatWidgetModule } = NativeModules;

export async function syncMyStatWidget(payload) {
  if (Platform.OS !== 'android' || !MyStatWidgetModule?.syncWidgetData) {
    return false;
  }

  await MyStatWidgetModule.syncWidgetData(JSON.stringify(payload));
  return true;
}
